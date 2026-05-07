// PHASE7: [D3] Eliminated 5 hardcoded hex colors — replaced with CSS variable-based Tailwind classes
// PHASE3: Replaced hardcoded dark text colors with theme-aware Tailwind classes
"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center text-center py-12 px-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-accent-muted border border-accent-muted flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-text-secondary text-xs max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-press inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors border-none cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
