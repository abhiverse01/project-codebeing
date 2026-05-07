// ── Session Compression ──
// LZ-string URL encoding + replay for sharing full sessions

import LZString from "lz-string";

interface Message {
  role: "user" | "assistant";
  content: string;
  lang?: string;
}

/**
 * Compress an array of messages into a URL-safe base64 string using LZ-string.
 */
export function compressSession(messages: Message[]): string {
  const json = JSON.stringify(messages);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
}

/**
 * Decompress a URL-safe base64 string back into a Message array.
 */
export function decompressSession(compressed: string): Message[] | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return null;
    // Validate structure
    const valid = parsed.every(
      (m: unknown) =>
        typeof m === "object" &&
        m !== null &&
        (m as Message).role &&
        typeof (m as Message).content === "string" &&
        ["user", "assistant"].includes((m as Message).role)
    );
    return valid ? parsed as Message[] : null;
  } catch {
    return null;
  }
}

/**
 * Build a full share URL with the compressed session.
 */
export function buildShareUrl(messages: Message[]): string {
  const compressed = compressSession(messages);
  const url = `${window.location.origin}/codeground?session=${compressed}`;
  return url;
}

/**
 * Parse a share URL's search params and return messages or null.
 */
export function parseShareUrl(searchParams: URLSearchParams): Message[] | null {
  const session = searchParams.get("session");
  if (!session) return null;
  return decompressSession(session);
}
