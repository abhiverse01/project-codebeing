// PHASE7: [D3] Eliminated hardcoded colors — replaced hex values with CSS variable-based Tailwind classes
// PHASE5: [R2] Migrated raw localStorage to safeStorage for Safari private browsing safety
// PHASE4: Added recent prompts from localStorage, category color badges, keyboard wrap-around, improved no-results
// PHASE3: Replaced hardcoded dark colors with theme-aware Tailwind classes
"use client";
// PHASE3: Mobile responsiveness - full-width on mobile, larger touch targets (min 44px)

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { safeStorage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { Search, ArrowRight, Terminal, BookOpen, BarChart3, Sparkles, Users, LayoutGrid, FileCode, GraduationCap, Newspaper, Gamepad2, Trophy, Clock } from "lucide-react";
import { fuzzySearch } from "@/lib/offline-intelligence";
import { templates } from "@/lib/templates";
import { lessons } from "@/lib/lessons";
interface CommandItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

const PAGES: CommandItem[] = [
  { id: "home", label: "Home", href: "/", icon: LayoutGrid, category: "Pages" },
  { id: "codeground", label: "CodeGround", description: "AI code generation", href: "/codeground", icon: Terminal, category: "Pages" },
  { id: "playground", label: "Playground", description: "Multi-file code editor", href: "/playground", icon: Gamepad2, category: "Pages" },
  { id: "challenge", label: "Challenge", description: "Competitive coding challenges", href: "/challenge", icon: Trophy, category: "Pages" },
  { id: "algorithms", label: "Algorithm Lab", description: "Sorting & graph visualizer", href: "/algorithm-lab", icon: BarChart3, category: "Pages" },
  { id: "templates", label: "Templates", description: "30+ code starters", href: "/templates", icon: Sparkles, category: "Pages" },
  { id: "learn", label: "Learn", description: "Interactive lessons", href: "/learn", icon: GraduationCap, category: "Pages" },
  { id: "blog", label: "Blog", description: "Articles & tutorials", href: "/blog", icon: Newspaper, category: "Pages" },
  { id: "team", label: "Team", href: "/team", icon: Users, category: "Pages" },
];

export function CommandPalette() {
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // PHASE5: Recent prompts - use regular variable, not useMemo (avoids React Compiler issue)
  const recentPrompts = (() => {
    try {
      const raw = safeStorage.get('cb-personalization-generations');
      if (raw) {
        const records = JSON.parse(raw);
        return records.slice(-5).reverse().map((r: { prompt?: string }, i: number) => ({
          id: `recent-${i}`,
          label: (r.prompt || '').slice(0, 60) + ((r.prompt || '').length > 60 ? '...' : ''),
          description: 'Recent prompt',
          href: `/codeground?prefill=${encodeURIComponent(r.prompt || '')}`,
          icon: Clock,
          category: 'Recent',
        }));
      }
    } catch {}
    return [];
  })();

  const allItems = useMemo<CommandItem[]>(() => {
    const templateItems: CommandItem[] = templates.slice(0, 20).map((t) => ({
      id: `tpl-${t.id}`,
      label: t.title,
      description: `${t.language} · ${t.category}`,
      href: `/templates?search=${encodeURIComponent(t.title)}`,
      icon: FileCode,
      category: "Templates",
    }));
    const lessonItems: CommandItem[] = lessons.map((l) => ({
      id: `lesson-${l.id}`,
      label: l.title,
      description: `${l.difficulty} · ${l.duration}`,
      href: `/learn?lesson=${l.id}`,
      icon: BookOpen,
      category: "Lessons",
    }));
    return [...PAGES, ...templateItems, ...lessonItems];
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      const base = allItems.slice(0, 12);
      return [...recentPrompts, ...base];
    }
    return fuzzySearch(query, allItems, "label" as keyof CommandItem, 0.15).slice(0, 12);
  }, [query, allItems, recentPrompts]);

  // Reset selection when query changes (via handler, not effect)
  const handleQueryChange = (q: string) => {
    setQuery(q);
    setSelectedIndex(0);
  };

  // Auto-focus input when palette opens — no focus ring because :focus-visible
  // is scoped to exclude input elements (globals.css). The cursor alone indicates focus.
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [commandPaletteOpen]);

  const navigate = (item: CommandItem) => {
    setCommandPaletteOpen(false);
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => i + 1 >= filtered.length ? 0 : i + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => i - 1 < 0 ? filtered.length - 1 : i - 1);
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      setCommandPaletteOpen(false);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:justify-center pt-[10vh] sm:pt-[15vh] px-2 sm:px-0" onClick={() => setCommandPaletteOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg bg-bg-surface border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="w-5 h-5 sm:w-4 sm:h-4 text-text-tertiary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, templates, lessons..."
            className="flex-1 py-4 sm:py-3.5 bg-transparent text-text-primary text-base sm:text-sm placeholder:text-text-tertiary outline-none"
          />
          <kbd className="hidden sm:block px-1.5 py-0.5 rounded bg-bg-hover text-[10px] font-mono text-text-tertiary">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] sm:max-h-[340px] overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-text-tertiary text-sm">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-text-tertiary text-xs mt-1">Try searching for a template language or page name.</p>
            </div>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-left text-sm transition-colors duration-75 cursor-pointer bg-transparent border-none ${
                    i === selectedIndex
                      ? "bg-bg-hover text-text-primary"
                      : "text-text-secondary hover:bg-bg-hover/50"
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.label}</div>
                    {item.description && (
                      <div className="text-[11px] text-text-tertiary truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    item.category === 'Pages' ? 'bg-info-muted text-info' :
                    item.category === 'Templates' ? 'bg-accent-muted text-accent' :
                    item.category === 'Lessons' ? 'bg-success-muted text-success' :
                    item.category === 'Recent' ? 'bg-warning-muted text-warning' :
                    'text-text-tertiary'
                  }`}>
                    {item.category}
                  </span>
                  {i === selectedIndex && (
                    <ArrowRight className="w-3 h-3 flex-shrink-0 text-text-tertiary" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
