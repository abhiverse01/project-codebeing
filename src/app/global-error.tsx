// PHASE7: [D3] Eliminated 5 hardcoded hex colors — replaced with CSS variable-based Tailwind classes
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring (production-safe, no console.error)
    if (typeof window !== 'undefined' && window.navigator.sendBeacon) {
      try {
        window.navigator.sendBeacon('/api/log', JSON.stringify({
          error: error.message,
          digest: error.digest,
          timestamp: Date.now(),
        }));
      } catch {
        // Silently fail - don't expose logging errors to user
      }
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-bg-base text-text-primary min-h-dvh flex items-center justify-center antialiased">
        <div className="text-center max-w-md px-4 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-error-muted border border-error-muted flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-7 h-7 text-error" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-text-secondary text-sm mb-8 leading-relaxed">
            An unexpected error occurred. Our team has been notified.
            Please try again or return to the home page.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover btn-press transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-bg-hover border border-border text-text-secondary hover:text-text-primary hover:border-border-hover btn-press transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Go Home
            </button>
          </div>
          {error.digest && (
            <p className="mt-6 text-[10px] text-text-tertiary font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
