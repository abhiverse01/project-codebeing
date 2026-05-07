// PHASE7: [D3] Eliminated hardcoded colors — replaced hex values with CSS variable-based Tailwind classes
// PHASE7: Frontend Renaissance — visual overhaul, bug fixes, design system
// PHASE7: [BUG 2] Isolated message rendering in React.memo MessageList to prevent streaming re-renders
// PHASE7: [BUG 1] Added scroll-to-top guard on mount, deferred auto-focus after scroll
// PHASE7: [BUG 3] Ensured no overflow:hidden conflicts blocking page scroll
"use client";
// PHASE3: Mobile responsiveness - ensured min tap targets, overflow prevention

import { useState, useRef, useEffect, useCallback, memo, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Copy,
  Download,
  RotateCcw,
  Send,
  Terminal,
  Wifi,
  WifiOff,
  Sparkles,
  Play,
  User,
  Lightbulb,
  Check,
  Share2,
  FileCode,
  Link2,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { detectLanguage, estimateComplexity } from "@/lib/offline-intelligence";
import { templates } from "@/lib/templates";
import { findBestSnippet } from "@/lib/offline-intelligence";
import { scorePrompt, type PromptScore } from "@/lib/prompt-scorer";
import { SlashCommandMenu, type SlashCommand } from "@/components/slash-commands";
import { JsSandbox } from "@/components/js-sandbox";
import { EmptyState } from "@/components/empty-state";
import { trackGeneration, getSessionInsights, getPreferencesSuffix } from "@/lib/session-intelligence";
import { trackPreference, getPreferenceVisualization, getPreferencesSuffix as getPersonalizationSuffix } from "@/lib/personalization";
import { compressSession, decompressSession, buildShareUrl, parseShareUrl } from "@/lib/session-compress";
import { generateDocs, exportAsMarkdown, downloadMarkdown } from "@/lib/docs-generator";

interface Message {
  role: "user" | "assistant";
  content: string;
  lang?: string;
}

const LANGUAGES = ["Auto", "Python", "JavaScript", "TypeScript", "Rust", "Go", "C++", "SQL", "Bash"];

// PHASE7: BUG FIX — streaming lag: isolated message rendering in React.memo to prevent full-tree re-renders per token.
// Only re-renders when messages array reference or isStreaming changes. The parent's streaming
// state updates (setMessages per token) propagate to this component via props, but memo
// prevents sibling re-renders (score bar, controls, panels) from triggering on every character.
const MessageList = memo(function MessageList({ messages, isStreaming }: { messages: Message[]; isStreaming: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  return (
    <div className="space-y-4">
      {messages.map((msg, i) => (
        <div key={i} className={`max-w-3xl ${msg.role === "user" ? "ml-auto" : ""} animate-fade-up`}>
          <div className={`rounded-lg px-4 py-3 font-mono text-xs leading-relaxed ${
            msg.role === "user"
              ? "bg-accent-muted border border-accent/20 text-text-primary max-w-[80%]"
              : "bg-bg-surface border border-border text-text-primary"
          }`}>
            {msg.role === "user" ? (
              <span>{msg.content}</span>
            ) : (
              <pre className="whitespace-pre-wrap"><span className={isStreaming && i === messages.length - 1 ? 'streaming-cursor' : ''}>{msg.content}</span></pre>
            )}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
});

function CodeGroundContent() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [gistCopied, setGistCopied] = useState(false);
  const [attributionCopied, setAttributionCopied] = useState(false);
  const [shareReady, setShareReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("Auto");
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);
  const [usingOffline, setUsingOffline] = useState(false);
  // GODMODE FIX: Removed unused `copied` state + `handleCopy` function — no UI button called it.
  // Only `handleCopyWithAttribution` was wired. Dead state eliminated.
  // PHASE5: [R5] Rate limit countdown state
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const rateLimitIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  // GODMODE FIX: Portal hydration guard — `typeof window !== "undefined"` causes SSR↔client
  // mismatch (server renders nothing, client renders portal). On slow mobile connections, React
  // may discard the client DOM and re-render from SSR output, preventing portal mount entirely.
  // useState+useEffect ensures server and client agree on initial render (both false), then
  // portals mount after hydration completes. This is the standard Next.js App Router pattern.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Slash command state
  const [slashMenuVisible, setSlashMenuVisible] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");

  // JS Sandbox state
  const [showSandbox, setShowSandbox] = useState(false);

  // Session intelligence
  const [sessionInsights, setSessionInsights] = useState<string | null>(null);

  // Personalization panel (Feature 1)
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  // Session replay mode (Feature 2)
  const [isReplayMode, setIsReplayMode] = useState(false);

  // Docs panel (Feature 4)
  const [showDocsPanel, setShowDocsPanel] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState("");
  const [docsLanguage, setDocsLanguage] = useState("");
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsCopied, setDocsCopied] = useState(false);
  // GODMODE FIX: Coordinated scroll lock — uses a ref counter so codeground panels and
  // navbar mobile menu don't fight over `html.scroll-locked`. Each opener increments,
  // each closer decrements. Class is only removed when counter reaches 0.
  const scrollLockCounter = useRef(0);
  const updateScrollLock = useCallback((delta: number) => {
    const html = document.documentElement;
    scrollLockCounter.current = Math.max(0, scrollLockCounter.current + delta);
    if (scrollLockCounter.current > 0) {
      html.classList.add("scroll-locked");
    } else {
      html.classList.remove("scroll-locked");
    }
  }, []);
  useEffect(() => {
    if (showProfilePanel) updateScrollLock(1); else updateScrollLock(-1);
    if (showDocsPanel) updateScrollLock(1); else updateScrollLock(-1);
    return () => { updateScrollLock(-2); };
  }, [showProfilePanel, showDocsPanel, updateScrollLock]);

  // GODMODE FIX: Swipe-to-dismiss touch refs for profile panel too
  const profileTouchRef = useRef<number>(0);
  const docsTouchRef = useRef<number>(0);

  // BUG FIX: [Streaming Lag] Wrapped scorePrompt in useMemo to avoid recalculating on every render.
  // During streaming (setMessages per 16ms frame), the parent re-renders. Without memo,
  // scorePrompt would re-run on every keystroke AND every streaming frame. useMemo ensures
  // it only re-computes when `prompt` actually changes.
  const promptScore: PromptScore = useMemo(
    () => prompt.length > 0 ? scorePrompt(prompt) : { total: 0, clarity: 0, specificity: 0, completeness: 0, tokenEstimate: 0, tip: "" },
    [prompt]
  );

  // BUG FIX: [Scroll-to-Middle] Scroll-to-top MUST be the FIRST useEffect that runs on mount.
  // React guarantees effects execute in declaration order. Any preceding effects that trigger
  // state updates (e.g., loading shared URLs) could cause layout shift before scroll fires.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Load shared snippet OR compressed session from URL
  useEffect(() => {
    // Check for compressed session first (Feature 2)
    const sessionMsgs = parseShareUrl(searchParams);
    if (sessionMsgs && sessionMsgs.length > 0) {
      setMessages(sessionMsgs);
      setIsReplayMode(true);
      return;
    }

    // Fall back to existing share snippet
    const share = searchParams.get("share");
    if (share) {
      try {
        const raw = atob(decodeURIComponent(share));
        const decoded = JSON.parse(decodeURIComponent(escape(raw)));
        if (decoded.code && typeof decoded.code === "string") {
          setMessages([{ role: "assistant", content: decoded.code, lang: decoded.language }]);
        }
        if (decoded.prompt && typeof decoded.prompt === "string") {
          setPrompt(decoded.prompt);
        }
        if (decoded.language) {
          setLanguage(decoded.language);
        }
      } catch {
        // Invalid share data, ignore
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/generate").then((r) => r.json()).then((d) => setApiStatus(d.ok ?? false)).catch(() => setApiStatus(false));
  }, []);

  // GODMODE FIX #Issue3: Auto-focus ONLY after code generation completes, NOT on page mount.
  // PREVIOUS BUG: `if (!loading)` was true on initial mount (loading starts as false), so the
  // effect ran immediately on every page load, focusing the input with a visible border change
  // (focus-within:border-accent/50 on the wrapper). This looked like a bug — "input automatically
  // highlighted when page opens."
  // FIX: Track whether a generation has occurred with a ref. Only auto-focus after the first
  // generation completes (loading goes from true → false, not the initial false state).
  const hasGeneratedRef = useRef(false);
  useEffect(() => {
    if (!loading && hasGeneratedRef.current) {
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        // focus-soft signals the onFocus handler to skip input-wrapper-focused.
        // No timeout removal needed — :focus-visible is scoped to exclude inputs,
        // so the textarea never shows a ring regardless.
        el.classList.add("focus-soft");
        el.focus({ preventScroll: true });
        // Remove after wrapper's onFocus handler has fired (same frame).
        requestAnimationFrame(() => el.classList.remove("focus-soft"));
      });
    }
  }, [loading]);

  // PHASE5: [R5] Cleanup rate limit interval on unmount
  useEffect(() => {
    return () => {
      if (rateLimitIntervalRef.current) clearInterval(rateLimitIntervalRef.current);
    };
  }, []);

  // GODMODE FIX #4: Removed auto-focus on page mount.
  // The previous code did setTimeout(() => inputRef.current?.focus(), 100) on every non-shared
  // page load, which caused a visible blue focus ring on the textarea before the user interacted.
  // This looks like a bug (highlighted input for no reason). Auto-focus is now ONLY triggered
  // after code generation completes (hasGeneratedRef guard above), which is the natural
  // time to prompt for the next input. Users can also click/tap the input at any time.

  // Load session insights on mount
  useEffect(() => {
    const insights = getSessionInsights();
    if (insights) {
      setSessionInsights(insights.styleChip);
    }
  }, [messages.length]);

  // Slash command detection
  const handlePromptChange = useCallback((value: string) => {
    setPrompt(value);
    // Check if we're at the start with a slash
    if (value.length === 1 && value === "/") {
      setSlashMenuVisible(true);
      setSlashQuery("");
    } else if (value.startsWith("/") && !value.includes(" ")) {
      setSlashMenuVisible(true);
      setSlashQuery(value.slice(1));
    } else {
      setSlashMenuVisible(false);
    }
  }, []);

  const handleSlashSelect = useCallback((command: SlashCommand) => {
    setSlashMenuVisible(false);
    // For language commands, just set the language
    if (command.category === "language") {
      const langName = command.label;
      setLanguage(langName);
      setPrompt("");
      inputRef.current?.focus();
    } else {
      // For action commands, insert the template
      setPrompt(command.template);
      inputRef.current?.focus();
    }
  }, []);

  const handleSlashClose = useCallback(() => {
    setSlashMenuVisible(false);
  }, []);

  const lastCodeBlock = messages.length > 0 && messages[messages.length - 1].role === "assistant"
    ? messages[messages.length - 1].content : "";

  const detectedLang = lastCodeBlock ? detectLanguage(lastCodeBlock).language : "";
  const isJavaScriptCode = ["javascript", "typescript"].includes(detectedLang) || language === "JavaScript" || language === "TypeScript";

  // GODMODE FIX: Removed dead `handleCopy` — no button called it. `handleCopyWithAttribution`
  // is the only copy action wired in the UI. Keeping this would be dead code.

  const handleCopyWithAttribution = async () => {
    if (!lastCodeBlock) return;
    const attributed = `${lastCodeBlock}\n// Generated with CodeBeing — https://codebeing.vercel.app`;
    await navigator.clipboard.writeText(attributed);
    setAttributionCopied(true);
    setTimeout(() => setAttributionCopied(false), 1500);
  };

  const handleShare = async () => {
    if (!lastCodeBlock) return;
    const payload = JSON.stringify({ code: lastCodeBlock, language: detectedLang || language, prompt: messages.find(m => m.role === "user")?.content || "" });
    const encoded = btoa(unescape(encodeURIComponent(payload)));
    const url = `${window.location.origin}/codeground?share=${encodeURIComponent(encoded)}`;
    await navigator.clipboard.writeText(url);
    setShareReady(true);
    toast.success("Share URL copied to clipboard");
    setTimeout(() => setShareReady(false), 2000);
  };

  // Feature 2: Share full session
  const handleShareSession = async () => {
    if (messages.length === 0) return;
    try {
      const url = buildShareUrl(messages);
      await navigator.clipboard.writeText(url);
      toast.success("Full session URL copied to clipboard");
    } catch {
      toast.error("Failed to compress session", { duration: 5000 });
    }
  };

  const handleExportGist = async () => {
    if (!lastCodeBlock) return;
    const attributed = `${lastCodeBlock}\n// Generated with CodeBeing — https://codebeing.vercel.app`;
    await navigator.clipboard.writeText(attributed);
    setGistCopied(true);
    toast.success("Copied with attribution. Paste at gist.github.com");
    setTimeout(() => setGistCopied(false), 3000);
  };

  const handleDownload = () => {
    if (!lastCodeBlock) return;
    const ext: Record<string, string> = { python: "py", javascript: "js", typescript: "ts", rust: "rs", go: "go", sql: "sql", bash: "sh", cpp: "cpp" };
    const lang = detectedLang || "txt";
    const blob = new Blob([lastCodeBlock], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codebeing-output.${ext[lang] || "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Feature 4: Generate docs
  const handleGenerateDocs = async () => {
    if (!lastCodeBlock) return;
    setDocsLoading(true);
    setShowDocsPanel(true);
    setDocsLanguage(detectedLang || language);
    try {
      const docs = await generateDocs(lastCodeBlock, detectedLang || language);
      setGeneratedDocs(docs);
    } catch {
      setGeneratedDocs("// Error generating documentation. Please try again.");
    } finally {
      setDocsLoading(false);
    }
  };

  const handleCopyDocs = async () => {
    if (!generatedDocs) return;
    await navigator.clipboard.writeText(generatedDocs);
    setDocsCopied(true);
    setTimeout(() => setDocsCopied(false), 2000);
  };

  const handleDownloadDocs = () => {
    if (!generatedDocs) return;
    const md = exportAsMarkdown(generatedDocs, lastCodeBlock, docsLanguage);
    downloadMarkdown(md, `docs-${Date.now()}.md`);
    toast.success("Documentation downloaded as .md");
  };

  const sendPrompt = async () => {
    if (loading) return;
    if (!prompt.trim()) {
      toast.error("Write something first — describe what you want to build.", { duration: 5000 });
      // PHASE4: Shake animation on textarea wrapper
      if (inputWrapperRef.current) {
        inputWrapperRef.current.classList.add("animate-shake");
        setTimeout(() => inputWrapperRef.current?.classList.remove("animate-shake"), 400);
      }
      inputRef.current?.focus();
      return;
    }
    const userText = prompt.trim();
    setPrompt("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);
    hasGeneratedRef.current = true; // Mark that a generation has started
    setUsingOffline(false);
    setShowSandbox(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userText }),
      });

      // PHASE5: [R5] Handle 429 rate limit with countdown timer
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10);
        setRateLimitCountdown(retryAfter);
        // BUG: User had no way to know when retry is available. FIX: Countdown timer shows seconds remaining.
        if (rateLimitIntervalRef.current) clearInterval(rateLimitIntervalRef.current);
        rateLimitIntervalRef.current = setInterval(() => {
          setRateLimitCountdown((prev) => {
            if (prev <= 1) {
              if (rateLimitIntervalRef.current) clearInterval(rateLimitIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setMessages((prev) => [...prev, { role: "assistant", content: `// Rate limited — try again in ${retryAfter}s` }]);
        setLoading(false);
        toast.error(`Slow down — try again in ${retryAfter}s`);
        return;
      }

      const data = await res.json();

      if (res.ok && data.generated_text) {
        // PHASE5: [V5] Simulated streaming — reveal output progressively for real-time UX
        const fullText = data.generated_text as string;
        setMessages((prev) => [...prev, { role: "assistant", content: '', lang: detectLanguage(fullText).language }]);
        let charIndex = 0;
        const streamInterval = setInterval(() => {
          charIndex += Math.max(1, Math.ceil(fullText.length / 200)); // ~200 frames
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullText.slice(0, charIndex) };
            return updated;
          });
          if (charIndex >= fullText.length) {
            clearInterval(streamInterval);
            const lang = detectLanguage(fullText).language;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullText, lang };
              return updated;
            });
            setLoading(false);
            trackGeneration(lang, userText.length);
            trackPreference(lang, userText);
            const insights = getSessionInsights();
            if (insights) setSessionInsights(insights.styleChip);
          }
        }, 32); // ~30fps streaming — PHASE7 BUG FIX: reduced from 60fps to 30fps to minimize re-renders
        return;
      } else {
        // PHASE4: Fall back to offline with top-3 snippet results
        const snippetResults = findBestSnippet(userText, templates.map((t) => ({
          keywords: [...t.tags, t.title, t.description, t.language, t.category],
          code: t.code,
          language: t.language,
          title: t.title,
        })));
        const bestMatch = snippetResults?.results[0];
        const offlineCode = bestMatch
          ? `// Offline mode — closest match from template library\n// Match: "${bestMatch.snippet.title}" (score: ${(bestMatch.score * 100).toFixed(0)}%)${snippetResults.results.length > 1 ? `\n// Runners-up: ${snippetResults.results.slice(1).map(r => `"${r.snippet.title}" (${(r.score * 100).toFixed(0)}%)`).join(", ")}` : ""}\n\n${bestMatch.snippet.code}`
          : `// Offline mode — no API key configured\n// Set HF_API_KEY to enable AI generation\n\n// In the meantime, here's a starter template:\nfunction hello() {\n  console.log("Hello from CodeBeing!");\n}\n\nhello();`;
        setUsingOffline(true);
        setMessages((prev) => [...prev, { role: "assistant", content: offlineCode }]);
        // GODMODE FIX: Track the detected/requested language, not hardcoded "javascript"
        const offlineLang = detectedLang || language || "javascript";
        trackGeneration(offlineLang, userText.length);
        trackPreference(offlineLang, userText);
        const insights = getSessionInsights();
        if (insights) setSessionInsights(insights.styleChip);
      }
    } catch {
      setUsingOffline(true);
      setMessages((prev) => [...prev, { role: "assistant", content: "// Offline mode — network unavailable\nfunction hello() {\n  console.log('Hello from CodeBeing!');\n}\n\nhello();" }]);
      const catchLang = language === "Auto" ? "javascript" : language.toLowerCase();
      trackGeneration(catchLang, userText.length);
      trackPreference(catchLang, userText);
      const insights = getSessionInsights();
      if (insights) setSessionInsights(insights.styleChip);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyStyle = () => {
    const sessionSuffix = getPreferencesSuffix();
    const personalSuffix = getPersonalizationSuffix();
    const suffix = personalSuffix || sessionSuffix;
    if (suffix) {
      setPrompt((prev) => prev + suffix);
      inputRef.current?.focus();
    }
  };

  // Feature 1: Apply style from personalization
  const handleApplyPersonalStyle = () => {
    const suffix = getPersonalizationSuffix();
    if (suffix) {
      setPrompt((prev) => prev + suffix);
      inputRef.current?.focus();
      setShowProfilePanel(false);
      toast.success("Applied your coding style preferences");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendPrompt();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
    setShowSandbox(false);
    setIsReplayMode(false);
    inputRef.current?.focus();
  };

  const complexity = lastCodeBlock ? estimateComplexity(lastCodeBlock) : null;

  // Score bar color
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-success";
    if (score >= 40) return "bg-warning";
    return "bg-error";
  };

  // Feature 1: Profile visualization data
  const profileViz = showProfilePanel ? getPreferenceVisualization() : null;

  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow), h-screen changed to calc to avoid overflow
    <div className="h-[calc(100dvh-var(--navbar-height))] flex flex-col bg-bg-base">
      {/* Header — refined toolbar */}
      <div className="h-11 flex items-center justify-between px-3 sm:px-4 border-b border-border bg-bg-surface/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <span className="text-sm font-medium text-text-primary truncate">CodeGround</span>
          {usingOffline && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-muted text-[10px] font-medium text-warning flex-shrink-0">
              <WifiOff className="w-2.5 h-2.5" /> Offline
            </span>
          )}
          {!usingOffline && apiStatus && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-muted text-[10px] font-medium text-success flex-shrink-0">
              <Wifi className="w-2.5 h-2.5" /> Online
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
          {lastCodeBlock && (
            <>
              <button onClick={handleCopyWithAttribution} className={`p-2 rounded-lg transition-colors bg-transparent border-none cursor-pointer ${attributionCopied ? "text-success copy-success" : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover"}`} title="Copy with attribution">
                {attributionCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button onClick={handleShare} className={`hidden md:inline-flex p-2 rounded-lg transition-colors bg-transparent border-none cursor-pointer ${shareReady ? "text-success copy-success" : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover"}`} title="Share snippet">
                {shareReady ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
              {/* Feature 2: Share full session — hidden on mobile to save space */}
              <button
                onClick={handleShareSession}
                disabled={messages.length === 0}
                className={`hidden lg:inline-flex p-2 rounded-lg transition-colors bg-transparent border-none cursor-pointer ${messages.length === 0 ? "text-text-tertiary/50 cursor-not-allowed" : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover"}`}
                title="Share full session"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
              {/* GODMODE: Gist hidden on small mobile — copy+share is enough */}
              <button onClick={handleExportGist} className={`hidden md:inline-flex p-2 rounded-lg transition-colors bg-transparent border-none cursor-pointer ${gistCopied ? "text-success copy-success" : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover"}`} title="Export as Gist">
                {gistCopied ? <Check className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
              </button>
              <button onClick={handleDownload} className="hidden sm:inline-flex p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer" title="Download">
                <Download className="w-3.5 h-3.5" />
              </button>
              {/* Feature 4: Generate Docs — always visible */}
              <button
                onClick={handleGenerateDocs}
                className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer"
                title="Generate documentation"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              {isJavaScriptCode && (
                <button
                  onClick={() => setShowSandbox(!showSandbox)}
                  className={`p-2 rounded-lg transition-colors bg-transparent border-none cursor-pointer ${showSandbox ? "text-success bg-success-muted" : "text-text-tertiary hover:text-success hover:bg-bg-hover"}`}
                  title="Run in sandbox"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
          {/* Feature 1: Profile button */}
          <button
            onClick={() => setShowProfilePanel(!showProfilePanel)}
            className={`p-2 rounded-lg transition-colors bg-transparent border-none cursor-pointer ${showProfilePanel ? "text-accent bg-accent-muted" : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover"}`}
            title="Your Profile"
          >
            <User className="w-3.5 h-3.5" />
          </button>
          {messages.length > 0 && (
            <button onClick={clearChat} className="p-2 rounded-lg text-text-tertiary hover:text-error hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer" title="Clear">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Panel — rendered via createPortal to <body> to escape ANY parent
          container clipping. AnimatePresence is INSIDE the portal so exit animations
          work (conditional portal would unmount AnimatePresence before exit completes).
          z-[60]/z-[61] ensures panels render above navbar (z-50). Desktop mode uses fixed
          positioning since portaled content has no layout context.
          GODMODE FIX: Uses `mounted` state instead of `typeof window` to avoid SSR hydration
          mismatch that prevented panels from mounting on mobile devices. */}
      {mounted && createPortal(
        <>
          <AnimatePresence>
            {showProfilePanel && (
              <motion.div
                key="profile-backdrop"
                className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowProfilePanel(false)}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showProfilePanel && (
              <motion.div
                key="profile-panel"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="bg-bg-surface flex flex-col
                  fixed bottom-0 left-0 right-0 z-[61] lg:fixed lg:top-11 lg:right-0 lg:bottom-0 lg:left-auto lg:w-80
                  max-h-[70vh] lg:max-h-none rounded-t-2xl lg:rounded-none shadow-2xl
                  border-t lg:border-t-0 lg:border-l border-border mobile-safe-bottom"
                onTouchStart={(e) => { profileTouchRef.current = e.touches[0].clientY; }}
                onTouchEnd={(e) => {
                  const deltaY = e.changedTouches[0].clientY - profileTouchRef.current;
                  if (deltaY > 80) setShowProfilePanel(false);
                }}
              >
                <div className="lg:hidden flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-border rounded-full" />
                </div>
                <div className="flex items-center justify-between px-4 pt-1 lg:pt-0 pb-2 border-b border-border">
                  <h3 className="text-xs font-semibold text-text-primary">Your Coding Profile</h3>
                  <button
                    onClick={() => setShowProfilePanel(false)}
                    className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4 lg:max-w-3xl mx-auto overflow-y-auto flex-1">
                {profileViz ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Language distribution bar chart */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">
                        Language Distribution ({profileViz.totalGenerations} generations)
                      </span>
                      <div className="space-y-1.5">
                        {profileViz.languageBars.map((bar) => (
                          <div key={bar.language} className="flex items-center gap-2">
                            <span className="text-[10px] text-text-secondary w-16 text-right flex-shrink-0">{bar.language}</span>
                            <div className="flex-1 h-2 bg-bg-hover rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${bar.pct}%` }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-accent to-accent/70"
                              />
                            </div>
                            <span className="text-[10px] text-text-tertiary w-8 text-right font-mono">{bar.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Style stats */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">Preferences</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-md bg-bg-hover border border-border p-2">
                          <span className="text-[9px] text-text-tertiary block">Top Language</span>
                          <span className="text-[11px] text-text-primary font-medium">{profileViz.topLanguage} ({profileViz.topLanguagePct}%)</span>
                        </div>
                        <div className="rounded-md bg-bg-hover border border-border p-2">
                          <span className="text-[9px] text-text-tertiary block">Prompt Style</span>
                          <span className="text-[11px] text-text-primary font-medium">{profileViz.promptStyle}</span>
                        </div>
                        <div className="rounded-md bg-bg-hover border border-border p-2">
                          <span className="text-[9px] text-text-tertiary block">Avg Length</span>
                          <span className="text-[11px] text-text-primary font-medium">{profileViz.avgPromptLen} chars</span>
                        </div>
                        <div className="rounded-md bg-bg-hover border border-border p-2">
                          <span className="text-[9px] text-text-tertiary block">Style Profile</span>
                          <span className="text-[11px] text-text-primary font-medium">{profileViz.styleProfile}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleApplyPersonalStyle}
                        className="btn-press w-full mt-2 px-3 py-1.5 rounded-md text-[11px] font-medium bg-accent-muted text-accent hover:bg-accent/20 transition-colors border-none cursor-pointer"
                      >
                        Pre-fill based on your style
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <User className="w-6 h-6 text-text-tertiary mx-auto mb-2" />
                    <p className="text-[11px] text-text-tertiary">No generations yet. Start coding to build your profile.</p>
                  </div>
                )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}

      {/* Feature 2: Replay mode banner */}
      <AnimatePresence>
        {isReplayMode && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="px-4 py-2 bg-accent-muted border-b border-accent/20 flex items-center justify-between flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <Link2 className="w-3 h-3 text-accent" />
              <span className="text-[11px] text-accent font-medium">
                Session Replay — watching a shared session
              </span>
            </div>
            <button
              onClick={() => setIsReplayMode(false)}
              className="text-[10px] px-2 py-0.5 rounded bg-accent-muted text-accent hover:bg-accent/20 transition-colors border-none cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complexity bar */}
      {complexity && (
        <div className="px-4 py-1.5 border-b border-border bg-bg-surface/50 flex items-center gap-4 text-[10px] flex-shrink-0">
          <span className="text-text-tertiary">Detected: <span className="text-text-secondary">{detectedLang}</span></span>
          <span className="text-text-tertiary">Time: <span className="text-success font-mono">{complexity.time}</span></span>
          <span className="text-text-tertiary">Space: <span className="text-info font-mono">{complexity.space}</span></span>
          <span className="text-text-tertiary hidden sm:inline">{complexity.explanation}</span>
        </div>
      )}

      {/* Messages + Sandbox + Docs Panel */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Messages area */}
          <div className={`flex-1 p-4 space-y-4 overflow-y-auto transition-all ${showDocsPanel ? "lg:mr-80" : ""}`}>
            {/* BUG FIX: Removed duplicate empty state + example chips — was rendered TWICE causing visual artifacts */}
            {messages.length === 0 && !loading && (
              <EmptyState
                icon={Sparkles}
                title="Your canvas awaits"
                description="Describe what you want to build. Use Ctrl+Enter to send, or type / for commands. Works offline with local intelligence."
                actionLabel="Try a slash command"
                onAction={() => {
                  setPrompt("/");
                  inputRef.current?.focus();
                }}
              />
            )}

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto animate-fade-up px-2" style={{ animationDelay: "0.15s" }}>
                {["Binary search in Python", "React custom hook", "SQL JOIN query", "Express REST API", "Go HTTP server"].map((s) => (
                  <button key={s} onClick={() => { setPrompt(s); inputRef.current?.focus(); }}
                    className="btn-press px-3 py-1.5 rounded-lg bg-bg-surface border border-border text-[11px] text-text-secondary hover:text-text-primary hover:border-border-hover hover:bg-bg-hover transition-all cursor-pointer">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* PHASE7: BUG FIX [BUG 2] — Replace inline message rendering with memoized MessageList */}
            <MessageList messages={messages} isStreaming={loading} />

            {loading && (
              <div className="max-w-3xl animate-fade-up">
                <div className="rounded-xl px-4 py-3 bg-bg-surface border border-border inline-flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                  </div>
                  <span className="text-[11px] text-text-tertiary">Generating...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* JS Sandbox panel */}
        {/* BUG FIX: Changed from height:0→auto to maxHeight animation for reliable expand/collapse */}
        <AnimatePresence>
          {showSandbox && lastCodeBlock && (
            <motion.div
              initial={{ maxHeight: 0, opacity: 0 }}
              animate={{ maxHeight: "300px", opacity: 1 }}
              exit={{ maxHeight: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-border flex-shrink-0"
            >
              <JsSandbox code={lastCodeBlock} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Docs Panel — same createPortal + AnimatePresence pattern as Profile Panel.
          Portal always rendered (cheap when empty); AnimatePresence inside controls visibility.
          z-[60]/z-[61] ensures panels render above navbar (z-50).
          GODMODE FIX: Uses `mounted` state for hydration-safe portal mounting. */}
      {mounted && createPortal(
        <>
          <AnimatePresence>
            {showDocsPanel && (
              <motion.div
                key="docs-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
                onClick={() => setShowDocsPanel(false)}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showDocsPanel && (
              <motion.div
                key="docs-panel"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="fixed bottom-0 left-0 right-0 z-[61] lg:fixed lg:top-11 lg:right-0 lg:bottom-0 lg:left-auto max-h-[60vh] lg:max-h-none flex flex-col rounded-t-2xl lg:rounded-none border-t lg:border-t-0 lg:border-l border-border bg-bg-surface lg:w-80 shadow-2xl mobile-safe-bottom"
                onTouchStart={(e) => { docsTouchRef.current = e.touches[0].clientY; }}
                onTouchEnd={(e) => {
                  const deltaY = e.changedTouches[0].clientY - docsTouchRef.current;
                  if (deltaY > 80) setShowDocsPanel(false);
                }}
              >
                {/* Drag handle (mobile) */}
                <div className="lg:hidden flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-border rounded-full" />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-border flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[11px] font-medium text-text-primary">Documentation</span>
                    {docsLanguage && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-muted text-accent">
                        {docsLanguage}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDocsPanel(false)}
                    className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3">
                  {docsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex items-center gap-2 text-text-tertiary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-[11px]">Generating docs...</span>
                      </div>
                    </div>
                  ) : generatedDocs ? (
                    <pre className="text-[11px] text-text-primary font-mono whitespace-pre-wrap leading-relaxed">
                      {generatedDocs}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[11px] text-text-tertiary">
                      No documentation generated
                    </div>
                  )}
                </div>

                {/* Actions */}
                {generatedDocs && !docsLoading && (
                  <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border flex-shrink-0">
                    <button
                      onClick={handleCopyDocs}
                      className={`btn-press flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors border-none cursor-pointer ${
                        docsCopied
                          ? "bg-success-muted text-success"
                          : "bg-bg-hover text-text-primary hover:bg-bg-hover"
                      }`}
                    >
                      {docsCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {docsCopied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownloadDocs}
                      className="btn-press flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium bg-accent-muted text-accent hover:bg-accent/20 transition-colors border-none cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      Download .md
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}

      {/* Error bar */}
      {error && (
        <div className="px-4 py-2 bg-error-muted border-t border-error/20 text-[11px] text-error flex items-center justify-between flex-shrink-0">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto text-error/60 hover:text-error bg-transparent border-none cursor-pointer">✕</button>
        </div>
      )}

      {/* Session Intelligence style chip */}
      <AnimatePresence>
        {sessionInsights && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="px-4 py-1.5 border-t border-border bg-bg-surface/30 flex items-center justify-between flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-accent" />
              <span className="text-[10px] text-text-secondary">Your style:</span>
              <span className="text-[10px] text-text-primary font-medium">{sessionInsights}</span>
            </div>
            <button
              onClick={handleApplyStyle}
              className="text-[10px] px-2 py-0.5 rounded bg-accent-muted text-accent hover:bg-accent/20 transition-colors border-none cursor-pointer"
            >
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt quality score bar — GODMODE: Polished mobile layout, hidden on very small screens */}
      {prompt.length > 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden sm:flex px-4 py-1.5 border-t border-border bg-bg-base items-center gap-3 flex-shrink-0"
        >
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-text-tertiary flex-shrink-0 w-14">Clarity</span>
            <div className="flex-1 h-1 bg-bg-hover rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-200 ${getScoreColor(promptScore.clarity)}`} style={{ width: `${promptScore.clarity}%` }} />
            </div>
            <span className="text-[10px] text-text-tertiary w-6 text-right font-mono">{promptScore.clarity}</span>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-text-tertiary flex-shrink-0 w-16">Specificity</span>
            <div className="flex-1 h-1 bg-bg-hover rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-200 ${getScoreColor(promptScore.specificity)}`} style={{ width: `${promptScore.specificity}%` }} />
            </div>
            <span className="text-[10px] text-text-tertiary w-6 text-right font-mono">{promptScore.specificity}</span>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-text-tertiary flex-shrink-0 w-20">Completeness</span>
            <div className="flex-1 h-1 bg-bg-hover rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-200 ${getScoreColor(promptScore.completeness)}`} style={{ width: `${promptScore.completeness}%` }} />
            </div>
            <span className="text-[10px] text-text-tertiary w-6 text-right font-mono">{promptScore.completeness}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] text-text-tertiary">~{promptScore.tokenEstimate} tokens</span>
            {promptScore.tip && promptScore.total < 50 && (
              <div className="relative group">
                <Lightbulb className="w-3 h-3 text-warning cursor-help" />
                <div className="absolute bottom-full right-0 mb-1 px-2 py-1.5 rounded-md bg-bg-elevated border border-border text-[10px] text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg shadow-black/30">
                  {promptScore.tip}
                </div>
              </div>
            )}
            {promptScore.total === 100 && (
              <span className="text-[10px] text-success font-medium whitespace-nowrap">{promptScore.tip}</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Input area — GODMODE: Safe area bottom for iPhone home indicator */}
      <div className="px-3 sm:px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-border bg-bg-base flex-shrink-0">
        <div className="max-w-3xl mx-auto relative">
          <SlashCommandMenu
            visible={slashMenuVisible}
            query={slashQuery}
            onSelect={handleSlashSelect}
            onClose={handleSlashClose}
            textareaRef={inputRef}
          />
          <div ref={inputWrapperRef} className="flex gap-2">
            <div className="flex-1 flex items-end bg-bg-surface border border-border rounded-lg transition-colors min-w-0" id="codeground-input-wrapper">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the code you want to generate... (type / for commands)"
                rows={1}
                className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-tertiary px-3 py-2.5 resize-none outline-none min-h-[40px] max-h-[120px]"
                disabled={loading}
                onFocus={(e) => {
                  // GODMODE FIX: Skip wrapper highlight during programmatic (soft) focus.
                  // focus-soft class is added by JS before programmatic .focus() calls to prevent
                  // a visible accent border flash. Without this guard, the wrapper shows a
                  // highlighted border every time code generation completes or the palette opens.
                  if (!e.currentTarget.classList.contains("focus-soft")) {
                    inputWrapperRef.current?.classList.add("input-wrapper-focused");
                  }
                }}
                onBlur={() => inputWrapperRef.current?.classList.remove("input-wrapper-focused")}
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-text-tertiary text-[10px] px-2 py-1 border-l border-border outline-none cursor-pointer mr-1"
              >
                {LANGUAGES.map((l) => <option key={l} value={l} className="bg-bg-surface text-text-primary">{l}</option>)}
              </select>
            </div>
            <button
              onClick={sendPrompt}
              disabled={loading || !prompt.trim() || rateLimitCountdown > 0}
              className={`btn-press w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 border-none ${
                loading || !prompt.trim() || rateLimitCountdown > 0
                  ? "bg-bg-hover text-text-tertiary cursor-not-allowed"
                  : "bg-accent text-white hover:bg-accent-hover shadow-sm shadow-accent-glow"
              }`}
            >
              {rateLimitCountdown > 0 ? (
                <span className="text-[11px] font-mono">{rateLimitCountdown}s</span>
              ) : loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-1.5 flex justify-between items-center">
          <span className="text-[10px] text-text-tertiary hidden sm:inline">Ctrl+Enter to send · <kbd className="px-1 py-0.5 rounded bg-bg-hover text-text-secondary text-[9px] font-mono">/</kbd> for commands</span>
          <span className="text-[10px] text-text-tertiary sm:hidden">Tap <kbd className="px-1 py-0.5 rounded bg-bg-hover text-text-secondary text-[9px] font-mono">/</kbd> for commands</span>
          <span className={`text-[10px] font-mono tabular-nums transition-colors ${prompt.length > 1950 ? "text-error" : prompt.length > 1800 ? "text-warning" : "text-text-tertiary"}`}>{prompt.length}/2000</span>
        </div>
      </div>
    </div>
  );
}

function CodeGroundFallback() {
  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow)
    <div className="h-[calc(100dvh-var(--navbar-height))] flex items-center justify-center bg-bg-base">
      <div className="skeleton w-16 h-1 mb-2 rounded" />
      <div className="skeleton w-32 h-1" />
    </div>
  );
}

export default function CodeGroundPage() {
  return (
    <Suspense fallback={<CodeGroundFallback />}>
      <CodeGroundContent />
    </Suspense>
  );
}
