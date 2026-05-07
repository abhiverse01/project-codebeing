// PHASE7: [D3] Eliminated 2 hardcoded hex colors — replaced with CSS variable-based Tailwind classes
// PHASE3: Replaced hardcoded dark colors with theme-aware Tailwind classes
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, FileText, TestTube, FileSearch, BookOpen, Languages } from "lucide-react";

export interface SlashCommand {
  trigger: string;
  label: string;
  description: string;
  template: string;
  category: "language" | "action";
  icon: React.ComponentType<{ className?: string }>;
}

export const COMMANDS: SlashCommand[] = [
  // Language commands
  {
    trigger: "/python",
    label: "Python",
    description: "Generate Python code",
    template: "Write a Python function that {task}. Include type hints and a docstring.",
    category: "language",
    icon: Code,
  },
  {
    trigger: "/typescript",
    label: "TypeScript",
    description: "Generate TypeScript code",
    template: "Write a TypeScript {task}. Use proper types and interfaces.",
    category: "language",
    icon: Code,
  },
  {
    trigger: "/javascript",
    label: "JavaScript",
    description: "Generate JavaScript code",
    template: "Write a JavaScript {task}. Use modern ES6+ syntax.",
    category: "language",
    icon: Code,
  },
  {
    trigger: "/rust",
    label: "Rust",
    description: "Generate Rust code",
    template: "Write a Rust {task}. Follow Rust best practices and idiomatic patterns.",
    category: "language",
    icon: Code,
  },
  {
    trigger: "/go",
    label: "Go",
    description: "Generate Go code",
    template: "Write a Go {task}. Follow Go conventions and idiomatic patterns.",
    category: "language",
    icon: Code,
  },
  {
    trigger: "/cpp",
    label: "C++",
    description: "Generate C++ code",
    template: "Write a C++ {task}. Include appropriate headers and use modern C++ features.",
    category: "language",
    icon: Code,
  },
  {
    trigger: "/sql",
    label: "SQL",
    description: "Generate SQL queries",
    template: "Write a SQL {task}. Include comments explaining each part.",
    category: "language",
    icon: Code,
  },
  {
    trigger: "/bash",
    label: "Bash",
    description: "Generate Bash scripts",
    template: "Write a Bash script that {task}. Include error handling and comments.",
    category: "language",
    icon: Code,
  },

  // Action commands
  {
    trigger: "/explain",
    label: "Explain Code",
    description: "Get line-by-line explanation",
    template: "Explain the following code step by step:\n\n```\n{code}\n```\n\nInclude time and space complexity analysis.",
    category: "action",
    icon: FileSearch,
  },
  {
    trigger: "/optimize",
    label: "Optimize",
    description: "Optimize for performance",
    template: "Optimize the following code for better performance:\n\n```\n{code}\n```\n\nKeep the same functionality but improve time/space complexity.",
    category: "action",
    icon: TestTube,
  },
  {
    trigger: "/test",
    label: "Write Tests",
    description: "Generate unit tests",
    template: "Write comprehensive unit tests for the following code:\n\n```\n{code}\n```\n\nInclude edge cases and error scenarios.",
    category: "action",
    icon: TestTube,
  },
  {
    trigger: "/document",
    label: "Document",
    description: "Add documentation and comments",
    template: "Add comprehensive documentation to the following code:\n\n```\n{code}\n```\n\nInclude JSDoc/docstrings, inline comments, and a usage example.",
    category: "action",
    icon: BookOpen,
  },
  {
    trigger: "/refactor",
    label: "Refactor",
    description: "Clean up and refactor code",
    template: "Refactor the following code to be cleaner and more maintainable:\n\n```\n{code}\n```\n\nApply DRY principles, improve naming, and add proper structure.",
    category: "action",
    icon: FileText,
  },
  {
    trigger: "/translate-to",
    label: "Translate Code",
    description: "Convert between languages",
    template: "Translate the following code to {language}:\n\n```\n{code}\n```\n\nMaintain the same logic and functionality while using idiomatic {language} patterns.",
    category: "action",
    icon: Languages,
  },
];

interface SlashCommandMenuProps {
  visible: boolean;
  query: string;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function SlashCommandMenu({
  visible,
  query,
  onSelect,
  onClose,
  textareaRef,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? COMMANDS.filter(
        (cmd) =>
          cmd.trigger.includes(query) ||
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description.toLowerCase().includes(query.toLowerCase())
      )
    : COMMANDS;

  const languageCommands = filtered.filter((c) => c.category === "language");
  const actionCommands = filtered.filter((c) => c.category === "action");

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!visible || filtered.length === 0) return;

      const allItems = [...languageCommands, ...actionCommands];

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % allItems.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
          break;
        case "Tab":
        case "Enter":
          e.preventDefault();
          if (allItems[selectedIndex]) {
            onSelect(allItems[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [visible, filtered, languageCommands, actionCommands, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [visible, handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (!menuRef.current) return;
    const selected = menuRef.current.querySelector("[data-selected='true']");
    selected?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!visible || filtered.length === 0) return null;

  let globalIndex = 0;

  const renderGroup = (title: string, commands: SlashCommand[], startIdx: number) => (
    <div key={title}>
      <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
        {title}
      </div>
      {commands.map((cmd) => {
        const idx = startIdx + globalIndex;
        globalIndex++;
        const isSelected = idx === selectedIndex;
        const Icon = cmd.icon;
        return (
          <button
            key={cmd.trigger}
            data-selected={isSelected}
            onClick={() => onSelect(cmd)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-75 border-none cursor-pointer ${
              isSelected
                ? "bg-accent-muted text-text-primary"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{cmd.trigger}</span>
                <span className="text-[10px] text-text-tertiary">—</span>
                <span className="text-[11px] text-text-secondary">{cmd.label}</span>
              </div>
              <p className="text-[10px] text-text-tertiary mt-0.5 truncate">{cmd.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.12 }}
          className="absolute bottom-full left-0 right-0 mb-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-bg-surface shadow-xl shadow-black/40 z-50"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "var(--scrollbar-thumb) transparent",
          }}
        >
          {languageCommands.length > 0 &&
            renderGroup("Languages", languageCommands, 0)}
          {actionCommands.length > 0 &&
            renderGroup("Actions", actionCommands, languageCommands.length)}
          <div className="px-3 py-1.5 text-[10px] text-text-tertiary border-t border-border flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-bg-hover text-text-secondary">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-bg-hover text-text-secondary">Tab</kbd> Select</span>
            <span><kbd className="px-1 py-0.5 rounded bg-bg-hover text-text-secondary">Esc</kbd> Close</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
