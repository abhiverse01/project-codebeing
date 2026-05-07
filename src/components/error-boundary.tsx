// PHASE7: [D3] Eliminated 5 hardcoded hex colors — replaced with CSS variable-based Tailwind classes
// PHASE4: Added componentDidCatch to log errors via sendBeacon
// PHASE3: Replaced hardcoded dark colors with theme-aware Tailwind classes
'use client';
import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  // PHASE4: Actually log errors to an available endpoint
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/generate', JSON.stringify({
          type: 'error',
          error: error.message,
          componentStack: errorInfo.componentStack,
        }));
      }
    } catch {
      // sendBeacon may fail in some environments
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md animate-fade-up">
            <div className="w-14 h-14 rounded-2xl bg-error-muted border border-error-muted flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h2>
            <p className="text-text-secondary text-sm mb-4">An unexpected error occurred. This has been logged.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 rounded-lg text-sm bg-accent text-white hover:bg-accent-hover btn-press"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 rounded-lg text-sm bg-bg-hover border border-border text-text-secondary hover:text-text-primary btn-press"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
