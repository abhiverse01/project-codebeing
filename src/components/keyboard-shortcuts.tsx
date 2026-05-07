// PHASE4: Replaced hardcoded text-[#c8c8d8] with text-text-primary, border-cb-inline-border with border-border
"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { Keyboard, X } from "lucide-react";

const SHORTCUTS = [
  { keys: "⌘K", description: "Command Palette" },
  { keys: "Ctrl+Enter", description: "Send prompt (CodeGround)" },
  { keys: "/", description: "Slash commands (CodeGround)" },
  { keys: "?", description: "Keyboard shortcuts (this modal)" },
  { keys: "Escape", description: "Close modal / palette" },
  { keys: "↑ / ↓", description: "Navigate suggestions" },
  { keys: "Enter", description: "Select suggestion / send" },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-bg-hover border border-border text-[11px] font-mono text-text-primary min-w-[32px]">
      {children}
    </kbd>
  );
}

export function KeyboardShortcuts() {
  const keyboardShortcutsOpen = useAppStore((s) => s.keyboardShortcutsOpen);
  const setKeyboardShortcutsOpen = useAppStore((s) => s.setKeyboardShortcutsOpen);

  const close = useCallback(() => {
    setKeyboardShortcutsOpen(false);
  }, [setKeyboardShortcutsOpen]);

  useEffect(() => {
    if (!keyboardShortcutsOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyboardShortcutsOpen, close]);

  return (
    <AnimatePresence>
      {keyboardShortcutsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={close}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ animationDuration: "150ms" }} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-lg mx-4 bg-bg-surface border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Keyboard className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold text-text-primary">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Shortcuts grid */}
            <div className="px-5 py-4">
              {/* Two columns on desktop, single on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {SHORTCUTS.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-xs text-text-secondary">{shortcut.description}</span>
                    <Kbd>{shortcut.keys}</Kbd>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-[10px] text-text-tertiary">
                  Press <kbd className="px-1 py-0.5 rounded bg-bg-hover text-text-secondary font-mono text-[9px]">?</kbd> to toggle this modal from anywhere.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
