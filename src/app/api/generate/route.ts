import { NextRequest, NextResponse } from "next/server";

/**
 * Chat backend for CodeBeing's chat interface.
 *
 * Uses Hugging Face's OpenAI-compatible "Inference Providers" router
 * (https://router.huggingface.co/v1/chat/completions), NOT the old
 * api-inference.huggingface.co serverless endpoint — that endpoint no
 * longer serves arbitrary/custom models for free.
 *
 * Swappable later: point BASE_URL / API_KEY at Groq, Together, or your
 * own HF Space running a fine-tuned model — the request/response shape
 * (OpenAI chat-completions) stays the same either way.
 */
const BASE_URL = process.env.CHAT_API_BASE_URL || "https://router.huggingface.co/v1/chat/completions";
const API_KEY = process.env.HF_API_KEY || "";
const MODEL_ID = process.env.HF_MODEL_ID || "Qwen/Qwen2.5-7B-Instruct-1M:cheapest";

const SYSTEM_PROMPT =
  "You are CodeBeing, a concise, helpful programming assistant embedded in a code playground. " +
  "When the user asks for code, respond with a single fenced code block in the correct language. " +
  "Keep explanations short unless asked for more detail.";

const MAX_RETRIES = 2;
const RETRY_MS = 1500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ── In-memory rate limiter (unchanged) ── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now >= entry.resetAt) rateLimitMap.delete(key);
  }
}, 60_000);
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
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, retryAfter } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limited", retryAfter, code: "RATE_LIMITED" },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter), "X-RateLimit-Reset": String(retryAfter) },
        }
      );
    }

    if (!API_KEY) {
      return NextResponse.json({ error: "API key not configured. Set HF_API_KEY.", code: "NO_KEY" }, { status: 503 });
    }

    const { input } = await req.json();
    if (!input?.trim()) return NextResponse.json({ error: "Input cannot be empty.", code: "EMPTY" }, { status: 400 });
    if (input.length > 2000) return NextResponse.json({ error: "Input too long (max 2000 chars).", code: "TOO_LONG" }, { status: 400 });

    const body = JSON.stringify({
      model: MODEL_ID,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: input.trim() },
      ],
      max_tokens: 700,
      temperature: 0.7,
      stream: false,
    });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(BASE_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
          body,
        });

        if (!res.ok) {
          // 503/502 = upstream provider briefly unavailable — worth a retry
          if ((res.status === 503 || res.status === 502) && attempt < MAX_RETRIES) {
            await sleep(RETRY_MS * (attempt + 1));
            continue;
          }
          if (res.status === 401 || res.status === 403)
            return NextResponse.json({ error: "Invalid API key. Update HF_API_KEY.", code: "AUTH" }, { status: 502 });
          if (res.status === 429)
            return NextResponse.json({ error: "Upstream rate limited. Try again in a moment.", code: "RATE" }, { status: 429 });
          if (res.status === 404)
            return NextResponse.json(
              { error: "Model not available via Inference Providers. Check HF_MODEL_ID.", code: "MODEL_UNAVAILABLE" },
              { status: 502 }
            );
          return NextResponse.json({ error: `API error (${res.status}). Try again.`, code: "API" }, { status: 502 });
        }

        const data = await res.json();
        const text: string | undefined = data?.choices?.[0]?.message?.content;

        if (text) return NextResponse.json({ generated_text: text });
        return NextResponse.json({ error: "Unexpected response. Try a different prompt.", code: "FORMAT" }, { status: 502 });
      } catch {
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_MS * (attempt + 1));
          continue;
        }
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
