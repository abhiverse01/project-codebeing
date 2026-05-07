// PHASE7: [D3] Eliminated 5 hardcoded hex colors — replaced with CSS variable-based Tailwind classes
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring (production-safe)
    if (typeof window !== 'undefined' && window.navigator.sendBeacon) {
      try {
        window.navigator.sendBeacon('/api/log', JSON.stringify({
          error: error.message,
          digest: error.digest,
          timestamp: Date.now(),
        }));
      } catch {
        // Silently fail
      }
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-bg-base">
      <div className="text-center max-w-md animate-fade-up">
        <div className="w-14 h-14 rounded-2xl bg-error-muted border border-error-muted flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-error" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2 tracking-tight">
          Something went wrong
        </h2>
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          An unexpected error occurred while loading this page. This has been logged.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover btn-press transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-bg-hover border border-border text-text-secondary hover:text-text-primary hover:border-border-hover btn-press transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Go Home
          </button>
        </div>
        {error.digest && (
          <p className="mt-4 text-[10px] text-text-tertiary font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
