// PHASE7: [D3] Eliminated 4 hardcoded hex colors — replaced with CSS variable-based Tailwind classes
// PHASE3: Replaced hardcoded dark colors with theme-aware Tailwind classes
import Link from "next/link";

export default function NotFound() {
  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow)
    <div className="min-h-dvh flex items-center justify-center px-4 bg-bg-base">
      <div className="text-center animate-fade-up">
        <h1 className="text-[7rem] font-semibold bg-gradient-to-br from-accent to-accent-hover bg-clip-text text-transparent leading-none mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Page not found</h2>
        <p className="text-text-secondary text-sm mb-6">This page doesn&apos;t exist or has been moved.</p>
        <Link href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover active:scale-[0.97] transition-all duration-150">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
