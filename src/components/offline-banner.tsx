// BUG FIX: Offline banner — fixed persistent display, added delay guard, improved dismiss.
// Root causes: (1) navigator.onLine unreliable in dev/iframe → banner showed on load
// (2) auto-dismiss timer lost in Strict Mode double-mount (3) banner z-40 conflicted with panels
// Fix: Add 3s delay guard before showing (prevents flash), ref for timeout, lower z-index,
// ensure dismiss button always visible, dispatch removal on unmount.
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';

type BannerState = 'hidden' | 'offline' | 'back-online';

export function OfflineBanner() {
  // BUG FIX: Initialize as 'hidden' always — never trust navigator.onLine on first render.
  // navigator.onLine can be false in dev environments, iframes, and during initial page load.
  // We wait for actual offline/online events to determine state, with a 3s delay guard.
  const [state, setState] = useState<BannerState>('hidden');
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  const hideBanner = useCallback(() => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    setState('hidden');
  }, []);

  const handleOnline = useCallback(() => {
    if (!mountedRef.current) return;
    setState('back-online');
    dismissTimeoutRef.current = setTimeout(hideBanner, 2500);
  }, [hideBanner]);

  const handleOffline = useCallback(() => {
    if (!mountedRef.current) return;
    // BUG FIX: 3-second delay guard — prevents flash offline banners during page load.
    // If the user actually goes offline, the banner will show after 3 seconds.
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    dismissTimeoutRef.current = setTimeout(() => {
      setState('offline');
    }, 3000);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
    };
  }, [handleOnline, handleOffline]);

  if (state === 'hidden') return null;

  return (
    <div
      className="fixed top-[var(--navbar-height)] left-0 right-0 z-30 transition-all duration-300 ease-out"
      role="alert"
      aria-live="polite"
    >
      {state === 'offline' && (
        <div className="bg-warning-muted/95 border-b border-warning/20 backdrop-blur-md relative">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-warning flex-shrink-0" />
            <span className="text-xs text-warning font-medium">
              You&apos;re offline — some features may be limited
            </span>
            {/* BUG FIX: Add manual dismiss button so users can close the banner */}
            <button
              onClick={hideBanner}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-warning/60 hover:text-warning hover:bg-warning/10 transition-colors bg-transparent border-none cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      {state === 'back-online' && (
        <div className="bg-success-muted/95 border-b border-success/20 backdrop-blur-md relative">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-success flex-shrink-0" />
            <span className="text-xs text-success font-medium">
              Back online
            </span>
            <button
              onClick={hideBanner}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-success/60 hover:text-success hover:bg-success/10 transition-colors bg-transparent border-none cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
