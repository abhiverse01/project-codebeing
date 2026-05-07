// PHASE7: [D3] Eliminated hardcoded colors — replaced hex values with CSS variable-based Tailwind classes
// PHASE5: [R4] Added 4MB size guard to saveFilesToSession to prevent sessionStorage overflow
// PHASE4: Reviewed for stale closure — playground has no setTimeout-based execution timeout pattern (unlike js-sandbox), no fix needed
// PHASE3: Replaced hardcoded dark colors with theme-aware Tailwind classes
"use client";
// PHASE3: Mobile responsiveness - hide left/right panels on mobile, responsive header

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCode,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelRightClose,
  Send,
  Bot,
  Sparkles,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

// ── Types ──

interface PlaygroundFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface OutputEntry {
  id: string;
  type: "analysis" | "ai" | "info";
  content: string;
  timestamp: number;
}

// ── Language Detection ──

const EXT_TO_LANG: Record<string, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  py: "Python",
  rs: "Rust",
  go: "Go",
  cpp: "C++",
  c: "C++",
  sql: "SQL",
  sh: "Bash",
};

function detectLanguageFromName(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return EXT_TO_LANG[ext] || "Plain Text";
}

function estimateComplexitySimple(content: string): string {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  let maxNesting = 0;
  let currentNesting = 0;
  let hasRecursion = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\s*(for|while)\s*[\(]/.test(trimmed)) {
      currentNesting++;
      maxNesting = Math.max(maxNesting, currentNesting);
    }
    if (trimmed === "}" || trimmed === "});") {
      currentNesting = Math.max(0, currentNesting - 1);
    }
  }

  const funcMatch = content.match(/(?:function|def|fn)\s+(\w+)/g);
  if (funcMatch) {
    for (const fn of funcMatch) {
      const name = fn.replace(/(?:function|def|fn)\s+/, "");
      const matches = content.match(new RegExp(`\\b${name}\\s*\\(`, "g"));
      if (matches && matches.length > 1) {
        hasRecursion = true;
      }
    }
  }

  if (hasRecursion) return "High";
  if (maxNesting >= 2) return "High";
  if (maxNesting === 1 || lines.length > 20) return "Medium";
  if (lines.length > 5) return "Low";
  return "Minimal";
}

// ── Default Files ──

const DEFAULT_FILE: PlaygroundFile = {
  id: "file-1",
  name: "index.js",
  content: `// Welcome to CodeBeing Playground!\n// Start coding here...\n\nfunction greet(name) {\n  console.log(\`Hello, \${name}! Welcome to CodeBeing.\`);\n}\n\ngreet("Developer");\n`,
  language: "JavaScript",
};

// ── Session Storage ──

const STORAGE_KEY = "cb-playground-files";

function loadFilesFromSession(): PlaygroundFile[] {
  if (typeof window === "undefined") return [DEFAULT_FILE];
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PlaygroundFile[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return [DEFAULT_FILE];
}

function saveFilesToSession(files: PlaygroundFile[]): void {
  try {
    // PHASE5: [R4] Size guard — sessionStorage has ~5MB limit
    const data = JSON.stringify(files);
    if (data.length > 4 * 1024 * 1024) {
      return; // Silently skip if too large
    }
    sessionStorage.setItem(STORAGE_KEY, data);
  } catch {
    // storage full
  }
}

// ── File Tree Item ──

function FileTreeItem({
  file,
  isActive,
  onClick,
  onDelete,
  onRename,
}: {
  file: PlaygroundFile;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  const startRename = () => {
    setRenameValue(file.name);
    setIsRenaming(true);
  };

  useEffect(() => {
    if (isRenaming) {
      const timer = setTimeout(() => renameRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isRenaming]);

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== file.name) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  };

  return (
    <div
      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
        isActive
          ? "bg-bg-hover text-text-primary"
          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
      }`}
      onClick={() => {
        if (!isRenaming) onClick();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        startRename();
      }}
    >
      <FileCode className="w-3 h-3 flex-shrink-0 text-accent" />
      {isRenaming ? (
        <input
          ref={renameRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setIsRenaming(false);
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-bg-elevated text-text-primary text-xs px-1.5 py-0.5 rounded outline-none border border-accent/40 min-w-0"
        />
      ) : (
        <span className="flex-1 text-xs truncate font-mono">{file.name}</span>
      )}
      {!isRenaming && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-bg-hover transition-opacity bg-transparent border-none cursor-pointer"
          title="Delete file"
        >
          <X className="w-3 h-3 text-text-tertiary hover:text-error" />
        </button>
      )}
    </div>
  );
}

// ── Main Component ──

export default function PlaygroundPage() {
  const [files, setFiles] = useState<PlaygroundFile[]>([DEFAULT_FILE]);
  const [activeFileId, setActiveFileId] = useState<string>(DEFAULT_FILE.id);
  const [hydrated, setHydrated] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [outputs, setOutputs] = useState<OutputEntry[]>([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [mobileFileDrawer, setMobileFileDrawer] = useState(false);
  const [mobileOutputDrawer, setMobileOutputDrawer] = useState(false);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Load from sessionStorage after hydration to avoid mismatch
  useEffect(() => {
    const stored = loadFilesFromSession();
    setFiles(stored);
    setActiveFileId(stored[0]?.id || DEFAULT_FILE.id);
    setHydrated(true);
    // Open panels on desktop (>= 768px)
    if (window.innerWidth >= 768) {
      setLeftPanelOpen(true);
      setRightPanelOpen(true);
    }
  }, []);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Persist files (only after hydration)
  useEffect(() => {
    if (hydrated) {
      saveFilesToSession(files);
    }
  }, [files, hydrated]);

  // Scroll output panel
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [outputs]);

  // Auto-analyze when active file changes
  useEffect(() => {
    if (!activeFile) return;
    const lineCount = activeFile.content.split("\n").length;
    const complexity = estimateComplexitySimple(activeFile.content);
    const nonEmptyLines = activeFile.content.split("\n").filter((l) => l.trim().length > 0).length;

    setOutputs((prev) => [
      ...prev.filter((o) => o.type !== "analysis"),
      {
        id: `analysis-${activeFile.id}`,
        type: "analysis",
        content: `File: ${activeFile.name}\nLanguage: ${activeFile.language}\nLines: ${lineCount} (${nonEmptyLines} non-empty)\nEstimated complexity: ${complexity}`,
        timestamp: Date.now(),
      },
    ]);
  }, [activeFileId, activeFile]);

  const addFile = () => {
    if (files.length >= 5) return;
    const id = `file-${Date.now()}`;
    const newFile: PlaygroundFile = {
      id,
      name: `untitled-${files.length + 1}.js`,
      content: "// New file\n",
      language: "JavaScript",
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(id);
  };

  const deleteFile = (id: string) => {
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
    setOutputs((prev) => prev.filter((o) => !o.id.includes(id)));
  };

  const renameFile = (id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, name: newName, language: detectLanguageFromName(newName) }
          : f
      )
    );
  };

  const updateFileContent = (id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content } : f))
    );
  };

  const askAi = async () => {
    if (!aiQuestion.trim() || aiLoading || !activeFile) return;
    const question = aiQuestion.trim();
    setAiQuestion("");
    setAiLoading(true);

    setOutputs((prev) => [
      ...prev,
      {
        id: `ai-q-${Date.now()}`,
        type: "info",
        content: `Q: ${question}`,
        timestamp: Date.now(),
      },
    ]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: `Context (file: ${activeFile.name}):\n\`\`\`\n${activeFile.content.slice(0, 1000)}\n\`\`\`\n\nQuestion: ${question}`,
        }),
      });

      const data = await res.json();

      if (res.ok && data.generated_text) {
        setOutputs((prev) => [
          ...prev,
          {
            id: `ai-a-${Date.now()}`,
            type: "ai",
            content: data.generated_text,
            timestamp: Date.now(),
          },
        ]);
      } else {
        setOutputs((prev) => [
          ...prev,
          {
            id: `ai-offline-${Date.now()}`,
            type: "ai",
            content: `[Offline Mode] Unable to reach AI. Here is a basic analysis:\n\nFile "${activeFile.name}" contains ${activeFile.content.split("\n").length} lines of ${activeFile.language} code with estimated ${estimateComplexitySimple(activeFile.content)} complexity.\n\nTip: Configure HF_API_KEY for full AI-powered code analysis.`,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      setOutputs((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          type: "ai",
          content: "[Offline Mode] Network error. AI is currently unavailable. Configure HF_API_KEY environment variable to enable AI features.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const clearOutput = () => {
    setOutputs([]);
  };

  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow), h-screen changed to calc to avoid overflow
    <div className="h-[calc(100dvh-var(--navbar-height))] flex flex-col bg-bg-base">
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-border bg-bg-base/90 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-accent" />
          <span className="text-sm font-medium text-text-primary">Playground</span>
          <span className="text-[10px] text-text-tertiary font-mono">{files.length}/5 files</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileFileDrawer((prev) => !prev);
              } else {
                setLeftPanelOpen((prev) => !prev);
              }
            }}
            className={`p-2 rounded-md transition-colors bg-transparent border-none cursor-pointer ${(leftPanelOpen || mobileFileDrawer) ? "text-accent bg-accent-muted" : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"}`}
            title="Toggle file tree"
          >
            {(leftPanelOpen || mobileFileDrawer) ? <PanelLeftClose className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileOutputDrawer((prev) => !prev);
              } else {
                setRightPanelOpen((prev) => !prev);
              }
            }}
            className={`p-2 rounded-md transition-colors bg-transparent border-none cursor-pointer ${(rightPanelOpen || mobileOutputDrawer) ? "text-accent bg-accent-muted" : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"}`}
            title="Toggle output panel"
          >
            {(rightPanelOpen || mobileOutputDrawer) ? <PanelRightClose className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - File Tree */}
          {leftPanelOpen && (
            <>
              <ResizablePanel defaultSize={16} minSize={12} maxSize={22}>
                <div className="h-full flex flex-col bg-bg-surface border-r border-border">
                  {/* Tree header */}
                  <div className="px-3 py-2.5 border-b border-border flex items-center justify-between flex-shrink-0">
                    <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Files</span>
                    <button
                      onClick={addFile}
                      disabled={files.length >= 5}
                      className={`p-1 rounded-md transition-colors bg-transparent border-none cursor-pointer ${files.length >= 5 ? "text-text-tertiary cursor-not-allowed" : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"}`}
                      title="Add file (max 5)"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* File list */}
                  <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain">
                    {files.map((file) => (
                      <FileTreeItem
                        key={file.id}
                        file={file}
                        isActive={file.id === activeFileId}
                        onClick={() => setActiveFileId(file.id)}
                        onDelete={() => deleteFile(file.id)}
                        onRename={(newName) => renameFile(file.id, newName)}
                      />
                    ))}
                  </div>

                  {/* AI Ask */}
                  <div className="border-t border-border flex-shrink-0">
                    <AnimatePresence>
                      {showAiInput ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-2">
                            <div className="flex items-center gap-1.5">
                              <input
                                value={aiQuestion}
                                onChange={(e) => setAiQuestion(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") askAi();
                                }}
                                placeholder="Ask about this file..."
                                className="flex-1 bg-bg-elevated text-text-primary text-xs px-2 py-1.5 rounded-md outline-none border border-border placeholder:text-text-tertiary focus:border-accent/40"
                              />
                              <button
                                onClick={askAi}
                                disabled={aiLoading || !aiQuestion.trim()}
                                className="p-1.5 rounded-md bg-accent text-white transition-colors border-none cursor-pointer hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {aiLoading ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => setShowAiInput(true)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors text-xs bg-transparent border-none cursor-pointer"
                        >
                          <Bot className="w-3 h-3" />
                          <span>Ask AI about this file</span>
                        </button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle className="bg-bg-hover" />
            </>
          )}

          {/* Center Panel - Code Editor */}
          <ResizablePanel defaultSize={leftPanelOpen && rightPanelOpen ? 60 : leftPanelOpen ? 78 : rightPanelOpen ? 78 : 100}>
            <div className="h-full flex flex-col">
              {/* Tab bar */}
              <div className="flex items-center border-b border-border bg-bg-surface overflow-x-auto flex-shrink-0">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-mono whitespace-nowrap transition-colors border-r border-border bg-transparent cursor-pointer ${
                      file.id === activeFileId
                        ? "text-text-primary bg-bg-base border-b-2 border-b-accent"
                        : "text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"
                    }`}
                  >
                    <FileCode className="w-3 h-3" />
                    {file.name}
                  </button>
                ))}
              </div>

              {/* Editor */}
              {activeFile ? (
                <textarea
                  value={activeFile.content}
                  onChange={(e) => updateFileContent(activeFile.id, e.target.value)}
                  spellCheck={false}
                  className="flex-1 w-full bg-bg-base text-text-primary text-xs font-mono p-4 resize-none outline-none leading-relaxed placeholder:text-text-tertiary"
                  placeholder="Start typing code here..."
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-text-tertiary text-sm">Select or create a file to start coding</span>
                </div>
              )}

              {/* Status bar */}
              <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-bg-surface flex-shrink-0">
                <div className="flex items-center gap-3 text-[10px] text-text-tertiary">
                  <span>{activeFile?.name}</span>
                  <span>{activeFile?.language}</span>
                  <span>{activeFile?.content.split("\n").length} lines</span>
                </div>
                <span className="text-[10px] text-text-tertiary">Session storage</span>
              </div>
            </div>
          </ResizablePanel>

          {/* Right Panel - Output */}
          {rightPanelOpen && (
            <>
              <ResizableHandle className="bg-bg-hover" />
              <ResizablePanel defaultSize={leftPanelOpen ? 24 : 20} minSize={14} maxSize={30}>
                <div className="h-full flex flex-col bg-bg-surface border-l border-border">
                  {/* Output header */}
                  <div className="px-3 py-2.5 border-b border-border flex items-center justify-between flex-shrink-0">
                    <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Output</span>
                    <button
                      onClick={clearOutput}
                      className="p-1 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer"
                      title="Clear output"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Output content */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {outputs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <Sparkles className="w-6 h-6 text-text-tertiary mb-2" />
                        <p className="text-[11px] text-text-tertiary">Output will appear here</p>
                        <p className="text-[10px] text-text-tertiary mt-1">Select a file or ask AI a question</p>
                      </div>
                    ) : (
                      outputs.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-2.5 rounded-lg text-xs font-mono leading-relaxed ${
                            entry.type === "analysis"
                              ? "bg-bg-elevated border border-border text-text-secondary"
                              : entry.type === "ai"
                              ? "bg-accent-muted border border-accent/15 text-text-primary"
                              : "bg-bg-hover text-text-tertiary"
                          }`}
                        >
                          {entry.type === "ai" && (
                            <div className="flex items-center gap-1 mb-1">
                              <Bot className="w-3 h-3 text-accent" />
                              <span className="text-[9px] text-accent font-medium uppercase tracking-wider">AI Response</span>
                            </div>
                          )}
                          {entry.type === "analysis" && (
                            <div className="flex items-center gap-1 mb-1">
                              <FileCode className="w-3 h-3 text-accent" />
                              <span className="text-[9px] text-accent font-medium uppercase tracking-wider">Analysis</span>
                            </div>
                          )}
                          <pre className="whitespace-pre-wrap">{entry.content}</pre>
                        </motion.div>
                      ))
                    )}
                    {aiLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-2.5 rounded-lg bg-accent-muted border border-accent/15"
                      >
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 text-accent animate-spin" />
                          <span className="text-[10px] text-accent">Analyzing...</span>
                        </div>
                      </motion.div>
                    )}
                    <div ref={outputEndRef} />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Mobile File Drawer */}
      {/* BUG FIX VERIFICATION: [Mobile Panel Z-Index] This AnimatePresence is correctly placed
          as a direct child of the root wrapper div (line ~394). It is NOT inside the overflow-hidden
          main area div (line ~433), so fixed positioning works relative to the viewport.
          The header with backdrop-blur-sm (line ~396) is a sibling, not a parent. */}
      <AnimatePresence>
        {mobileFileDrawer && (
          <>
            <motion.div
              key="file-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setMobileFileDrawer(false)}
            />
            <motion.div
              key="file-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 md:hidden max-h-[60vh] bg-bg-surface rounded-t-xl border-t border-border shadow-xl flex flex-col"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
                <div className="w-8 h-1 rounded-full bg-border" />
              </div>
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between flex-shrink-0">
                <span className="text-xs font-medium text-text-primary">Files</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={addFile}
                    disabled={files.length >= 5}
                    className={`p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer ${files.length >= 5 ? "text-text-tertiary cursor-not-allowed" : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"}`}
                    title="Add file (max 5)"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMobileFileDrawer(false)}
                    className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* File list */}
              <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
                {files.map((file) => (
                  <FileTreeItem
                    key={file.id}
                    file={file}
                    isActive={file.id === activeFileId}
                    onClick={() => {
                      setActiveFileId(file.id);
                      setMobileFileDrawer(false);
                    }}
                    onDelete={() => deleteFile(file.id)}
                    onRename={(newName) => renameFile(file.id, newName)}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Output Drawer */}
      {/* BUG FIX VERIFICATION: [Mobile Panel Z-Index] Same as file drawer — correctly placed at
          root level, outside the overflow-hidden main area. Fixed positioning is safe here. */}
      <AnimatePresence>
        {mobileOutputDrawer && (
          <>
            <motion.div
              key="output-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setMobileOutputDrawer(false)}
            />
            <motion.div
              key="output-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 md:hidden max-h-[60vh] bg-bg-surface rounded-t-xl border-t border-border shadow-xl flex flex-col"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
                <div className="w-8 h-1 rounded-full bg-border" />
              </div>
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between flex-shrink-0">
                <span className="text-xs font-medium text-text-primary">Output</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearOutput}
                    className="p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer"
                    title="Clear output"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMobileOutputDrawer(false)}
                    className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Output content */}
              <div className="overflow-y-auto flex-1 p-3 space-y-2">
                {outputs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <Sparkles className="w-6 h-6 text-text-tertiary mb-2" />
                    <p className="text-[11px] text-text-tertiary">Output will appear here</p>
                    <p className="text-[10px] text-text-tertiary mt-1">Select a file or ask AI a question</p>
                  </div>
                ) : (
                  outputs.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2.5 rounded-lg text-xs font-mono leading-relaxed ${
                        entry.type === "analysis"
                          ? "bg-bg-elevated border border-border text-text-secondary"
                          : entry.type === "ai"
                          ? "bg-accent-muted border border-accent/15 text-text-primary"
                          : "bg-bg-hover text-text-tertiary"
                      }`}
                    >
                      {entry.type === "ai" && (
                        <div className="flex items-center gap-1 mb-1">
                          <Bot className="w-3 h-3 text-accent" />
                          <span className="text-[9px] text-accent font-medium uppercase tracking-wider">AI Response</span>
                        </div>
                      )}
                      {entry.type === "analysis" && (
                        <div className="flex items-center gap-1 mb-1">
                          <FileCode className="w-3 h-3 text-accent" />
                          <span className="text-[9px] text-accent font-medium uppercase tracking-wider">Analysis</span>
                        </div>
                      )}
                      <pre className="whitespace-pre-wrap">{entry.content}</pre>
                    </motion.div>
                  ))
                )}
                {aiLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-2.5 rounded-lg bg-accent-muted border border-accent/15"
                  >
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 text-accent animate-spin" />
                      <span className="text-[10px] text-accent">Analyzing...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
