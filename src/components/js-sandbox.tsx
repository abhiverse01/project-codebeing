// PHASE7: [D3] Eliminated 6 hardcoded hex colors — replaced with CSS variable-based Tailwind classes
// PHASE4: Fixed stale closure in timeout — now uses completedRef instead of closure-captured isRunning
// PHASE4: Made scrollbar color theme-aware for light mode support
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Trash2, Terminal, Clock, AlertCircle } from "lucide-react";

interface JsSandboxProps {
  code: string;
}

interface LogEntry {
  type: "log" | "error" | "info";
  content: string;
  timestamp: number;
}

export function JsSandbox({ code }: JsSandboxProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  // PHASE4: Ref to track execution completion, avoiding stale closure in timeout
  const completedRef = useRef(false);

  // Scroll to bottom on new logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Listen for messages from sandbox
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.source === "codebeing-sandbox") {
        if (event.data.type === "log" || event.data.type === "error" || event.data.type === "info") {
          setLogs((prev) => [
            ...prev,
            {
              type: event.data.type,
              content: String(event.data.content),
              timestamp: Date.now(),
            },
          ]);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const runCode = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    setExecutionTime(null);

    const startTime = performance.now();

    // Create sandboxed environment with stripped APIs
    const sandboxedCode = `
      <html>
      <head><style>
        body { margin: 0; padding: 0; background: transparent; }
      </style></head>
      <body>
      <script>
        // Strip dangerous APIs
        (function() {
          const noop = function() { throw new Error('API blocked in sandbox'); };
          const blocked = {
            fetch: noop,
            XMLHttpRequest: noop,
            WebSocket: noop,
            eval: noop,
            Function: noop,
            importScripts: noop,
            open: noop,
            close: noop,
            alert: noop,
            confirm: noop,
            prompt: noop,
          };
          
          for (const [key, fn] of Object.entries(blocked)) {
            try { window[key] = fn; } catch(e) {}
          }
          
          // Override console to send messages to parent
          const originalConsole = {
            log: console.log,
            error: console.error,
            info: console.info,
            warn: console.warn,
          };
          
          function send(type, args) {
            const content = args.map(arg => {
              if (arg === null) return 'null';
              if (arg === undefined) return 'undefined';
              if (typeof arg === 'object') {
                try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
              }
              return String(arg);
            }).join(' ');
            parent.postMessage({ source: 'codebeing-sandbox', type, content }, '*');
          }
          
          console.log = function(...args) { send('log', args); };
          console.error = function(...args) { send('error', args); };
          console.info = function(...args) { send('info', args); };
          console.warn = function(...args) { send('error', args); };
          
          try {
            ${code.replace(/<\/script>/gi, "<\\/script>")}
            parent.postMessage({ source: 'codebeing-sandbox', type: '__done__', time: performance.now() }, '*');
          } catch(e) {
            send('error', [e.toString()]);
            parent.postMessage({ source: 'codebeing-sandbox', type: '__done__', time: performance.now() }, '*');
          }
        })();
      <\/script>
      </body>
      </html>
    `;

    // PHASE4: Reset completed ref before execution
    completedRef.current = false;

    // Listen for done message
    const doneHandler = (event: MessageEvent) => {
      if (event.data?.source === "codebeing-sandbox" && event.data.type === "__done__") {
        // PHASE4: Mark completed and clear timeout via ref
        completedRef.current = true;
        clearTimeout(timeoutId);
        const elapsed = Math.round((event.data.time - startTime) * 100) / 100;
        setExecutionTime(elapsed);
        setIsRunning(false);
        window.removeEventListener("message", doneHandler);
      }
    };
    window.addEventListener("message", doneHandler);

    // Set srcdoc on iframe
    if (iframeRef.current) {
      iframeRef.current.srcdoc = sandboxedCode;
    }

    // PHASE4: Store timeout ID and use completedRef instead of stale isRunning
    const timeoutId = setTimeout(() => {
      if (!completedRef.current) {
        setLogs((prev) => [
          ...prev,
          { type: "error", content: "Execution timed out (10s limit)", timestamp: Date.now() },
        ]);
        setIsRunning(false);
        setExecutionTime(10000);
      }
    }, 10000);
  }, [code, isRunning]);

  const clearLogs = () => {
    setLogs([]);
    setExecutionTime(null);
  };

  return (
    <div className="rounded-lg border border-border bg-bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-bg-base/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-success" />
          <span className="text-xs font-medium text-text-primary">Sandbox Output</span>
          {isRunning && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning-muted text-warning animate-pulse">
              Running...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {executionTime !== null && (
            <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
              <Clock className="w-2.5 h-2.5" />
              {executionTime}ms
            </span>
          )}
          <button
            onClick={clearLogs}
            className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer"
            title="Clear output"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal output */}
      <div
        ref={terminalRef}
        className="p-3 min-h-[100px] max-h-[300px] overflow-y-auto font-mono text-xs leading-relaxed bg-bg-base"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: 'var(--scrollbar-thumb) transparent',
        }}
      >
        {logs.length === 0 && !isRunning && (
          <div className="flex items-center gap-2 text-text-tertiary">
            <Play className="w-3 h-3" />
            <span>Click Run to execute the JavaScript code</span>
          </div>
        )}
        {logs.map((entry, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 ${
              entry.type === "error"
                ? "text-error"
                : entry.type === "info"
                  ? "text-info"
                  : "text-success"
            }`}
          >
            <span className="select-none flex-shrink-0 mt-0.5">
              {entry.type === "error" ? (
                <AlertCircle className="w-3 h-3 inline" />
              ) : (
                <span className="text-text-tertiary">›</span>
              )}
            </span>
            <pre className="whitespace-pre-wrap break-all flex-1">{entry.content}</pre>
          </div>
        ))}
      </div>

      {/* Hidden iframe for execution */}
      <iframe
        ref={iframeRef}
        className="hidden"
        sandbox="allow-scripts"
        title="CodeBeing JS Sandbox"
      />
    </div>
  );
}
