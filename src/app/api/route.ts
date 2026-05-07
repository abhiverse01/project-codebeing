// PHASE4: Fixed health check to include ok field — docs-generator was always falling back to regex
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, message: "CodeBeing API is running" });
}
