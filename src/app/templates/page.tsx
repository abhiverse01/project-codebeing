// PHASE7: [D3] Eliminated hardcoded colors — replaced hex values with CSS variable-based Tailwind classes
// PHASE5: [U10] Enhanced empty search state with query echo and clear button
"use client";
// PHASE3: Mobile responsiveness - stacked filters, single-column template grid on small screens

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Copy, Check, ChevronDown, X, Code } from "lucide-react";
import { templates } from "@/lib/templates";
import { fuzzySearch } from "@/lib/offline-intelligence";

const LANGUAGES = ["All", ...new Set(templates.map((t) => t.language))];
const CATEGORIES = ["All", ...new Set(templates.map((t) => t.category))];

export default function TemplatesPage() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("All");
  const [cat, setCat] = useState("All");
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = templates;
    if (lang !== "All") result = result.filter((t) => t.language === lang);
    if (cat !== "All") result = result.filter((t) => t.category === cat);
    if (query.trim()) result = fuzzySearch(query, result, "title", 0.1);
    return result;
  }, [query, lang, cat]);

  const handleCopy = async (id: string, code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const previewTemplate = preview ? templates.find((t) => t.id === preview) : null;

  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow)
    <div className="min-h-dvh bg-bg-base">
      {/* Header */}
      <section className="border-b border-border bg-bg-base/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-1">Templates</h1>
          <p className="text-text-secondary text-sm">{templates.length} curated code starters. Search, filter, copy, and build.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-bg-surface border border-border text-text-primary text-sm placeholder:text-text-tertiary outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select value={lang} onChange={(e) => setLang(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-lg bg-bg-surface border border-border text-text-secondary text-xs outline-none cursor-pointer focus:border-accent/50">
                {LANGUAGES.map((l) => <option key={l} value={l} className="bg-bg-surface">{l === "All" ? "All Languages" : l}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-tertiary pointer-events-none" />
            </div>

            <div className="relative">
              <select value={cat} onChange={(e) => setCat(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-lg bg-bg-surface border border-border text-text-secondary text-xs outline-none cursor-pointer focus:border-accent/50">
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-bg-surface">{c === "All" ? "All Categories" : c}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-tertiary pointer-events-none" />
            </div>

            <span className="text-[11px] text-text-tertiary">{filtered.length} results</span>
          </div>
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((tpl) => (
            <motion.div key={tpl.id} layout
              className="group p-4 rounded-xl bg-bg-surface border border-border hover:border-border-hover transition-all duration-150 cursor-pointer"
              onClick={() => setPreview(tpl.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                    {tpl.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-accent-muted text-[10px] text-accent font-medium">{tpl.language}</span>
                    <span className="text-[10px] text-text-tertiary">{tpl.category}</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleCopy(tpl.id, tpl.code); }}
                  className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer">
                  {copied === tpl.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">{tpl.description}</p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {tpl.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded bg-bg-hover text-[9px] text-text-tertiary">{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Code className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary text-sm">Nothing matches &ldquo;{query}&rdquo;</p>
            <button onClick={() => setQuery("")} className="mt-3 text-[12px] text-accent hover:underline bg-transparent border-none cursor-pointer">
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {/* PHASE3: Wrapped modal in AnimatePresence for consistent enter/exit animation matching blog modal */}
      <AnimatePresence>
      {previewTemplate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-3xl max-h-[85vh] bg-bg-surface border border-border rounded-xl overflow-hidden shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div>
                <h3 className="text-sm font-medium text-text-primary">{previewTemplate.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-accent-muted text-[10px] text-accent font-medium">{previewTemplate.language}</span>
                  <span className="text-[10px] text-text-tertiary">{previewTemplate.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleCopy(previewTemplate.id, previewTemplate.code)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent text-white hover:bg-accent-hover transition-colors border-none cursor-pointer">
                  {copied === previewTemplate.id ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
                <button onClick={() => setPreview(null)} className="p-1.5 rounded-md text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Code */}
            <div className="overflow-auto max-h-[calc(85vh-52px)] p-5">
              <pre className="text-xs text-text-primary font-mono leading-relaxed whitespace-pre-wrap">
                {previewTemplate.code}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
