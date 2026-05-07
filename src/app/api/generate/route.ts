import { NextRequest, NextResponse } from "next/server";

const MODEL_URL = process.env.HF_MODEL_URL || "https://api-inference.huggingface.co/models/bigcode/starcoderbase";
const API_KEY = process.env.HF_API_KEY || "";
const MAX_RETRIES = 2;
const RETRY_MS = 1500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ── In-memory rate limiter ── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

// Clean up expired entries every 60 seconds
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60_000);

// Ensure the interval doesn't prevent the process from exiting in tests
if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
  (cleanupInterval as unknown as NodeJS.Timeout).unref();
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const ip = getClientIp(req);
    const { allowed, retryAfter } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limited", retryAfter, code: "RATE_LIMITED" },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Reset": String(retryAfter),
          },
        }
      );
    }

    if (!API_KEY) {
      return NextResponse.json({ error: "API key not configured. Set HF_API_KEY.", code: "NO_KEY" }, { status: 503 });
    }
    const { input } = await req.json();
    if (!input?.trim()) return NextResponse.json({ error: "Input cannot be empty.", code: "EMPTY" }, { status: 400 });
    if (input.length > 2000) return NextResponse.json({ error: "Input too long (max 2000 chars).", code: "TOO_LONG" }, { status: 400 });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(MODEL_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: input.trim() }),
        });
        if (!res.ok) {
          if (res.status === 503 && attempt < MAX_RETRIES) { await sleep(RETRY_MS * (attempt + 1)); continue; }
          if (res.status === 401 || res.status === 403)
            return NextResponse.json({ error: "Invalid API key. Update HF_API_KEY.", code: "AUTH" }, { status: 502 });
          if (res.status === 429)
            return NextResponse.json({ error: "Rate limited. Try again in a moment.", code: "RATE" }, { status: 429 });
          return NextResponse.json({ error: `API error (${res.status}). Try again.`, code: "API" }, { status: 502 });
        }
        const data = await res.json();
        const text = Array.isArray(data) && data[0]?.generated_text
          ? data[0].generated_text
          : data?.generated_text;
        if (text) return NextResponse.json({ generated_text: text });
        return NextResponse.json({ error: "Unexpected response. Try a different prompt.", code: "FORMAT" }, { status: 502 });
      } catch (e) {
        if (attempt < MAX_RETRIES) { await sleep(RETRY_MS * (attempt + 1)); continue; }
        break;
      }
    }
    return NextResponse.json({ error: "Network error. Check connection.", code: "NET" }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "Internal error.", code: "INTERNAL" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, configured: Boolean(API_KEY) });
}
