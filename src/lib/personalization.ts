// PHASE5: [R2] Migrated raw localStorage to safeStorage utility for Safari private browsing safety
// ── Personalization Engine ──
// localStorage-based preference tracking (persists across sessions)
import { safeStorage } from "@/lib/utils";

interface GenerationRecord {
  language: string;
  promptLength: number;
  styleKeywords: string[];
  timestamp: number;
}

interface Preferences {
  records: GenerationRecord[];
  topLanguage: string;
  topLanguagePct: number;
  avgPromptLen: number;
  promptStyle: "short" | "medium" | "detailed";
  totalGenerations: number;
  styleProfile: string;
  languageDistribution: Record<string, number>;
  lastGenerated: number | null;
}

interface PreferenceVisualization {
  topLanguage: string;
  topLanguagePct: number;
  avgPromptLen: number;
  promptStyle: string;
  totalGenerations: number;
  styleProfile: string;
  lastGenerated: string | null;
  languageBars: { language: string; count: number; pct: number }[];
}

const STORAGE_KEY = "codebeing_preferences";
const MAX_RECORDS = 50;

function getRecords(): GenerationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = safeStorage.get(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GenerationRecord[];
  } catch {
    return [];
  }
}

function saveRecords(records: GenerationRecord[]): void {
  if (typeof window === "undefined") return;
  safeStorage.set(STORAGE_KEY, JSON.stringify(records));
}

function extractStyleKeywords(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const keywords: string[] = [];

  if (/function|method|procedure/.test(lower)) keywords.push("functions");
  if (/class|object|oop|constructor/.test(lower)) keywords.push("class-oriented");
  if (/module|import|export|package/.test(lower)) keywords.push("modular");
  if (/async|await|promise|callback/.test(lower)) keywords.push("async");
  if (/type|interface|generic|ts|typescript/.test(lower)) keywords.push("typed");
  if (/test|spec|unit|integration/.test(lower)) keywords.push("testing");
  if (/api|rest|http|endpoint|route/.test(lower)) keywords.push("api");
  if (/hook|react|component|state|props/.test(lower)) keywords.push("react");
  if (/sql|query|database|table|join/.test(lower)) keywords.push("database");
  if (/algorithm|sort|search|optimize/.test(lower)) keywords.push("algorithms");

  return keywords;
}

/**
 * Track a generation for personalization.
 */
export function trackPreference(language: string, prompt: string): void {
  const records = getRecords();
  records.push({
    language: language.toLowerCase(),
    promptLength: prompt.length,
    styleKeywords: extractStyleKeywords(prompt),
    timestamp: Date.now(),
  });
  if (records.length > MAX_RECORDS) {
    records.splice(0, records.length - MAX_RECORDS);
  }
  saveRecords(records);
}

/**
 * Get full preferences object.
 */
export function getPreferences(): Preferences | null {
  const records = getRecords();
  if (records.length === 0) return null;

  // Language distribution
  const langCounts: Record<string, number> = {};
  for (const r of records) {
    const lang = r.language || "unknown";
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  }

  const sorted = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
  const topLanguage = sorted[0] ? sorted[0][0] : "unknown";
  const topLanguagePct = Math.round((sorted[0]?.[1] || 0) / records.length * 100);

  // Average prompt length
  const avgPromptLen = Math.round(
    records.reduce((sum, r) => sum + r.promptLength, 0) / records.length
  );

  // Prompt style classification
  let promptStyle: "short" | "medium" | "detailed";
  if (avgPromptLen < 30) promptStyle = "short";
  else if (avgPromptLen < 80) promptStyle = "medium";
  else promptStyle = "detailed";

  // Style profile
  const keywordCounts: Record<string, number> = {};
  for (const r of records) {
    for (const kw of r.styleKeywords) {
      keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
    }
  }
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([kw]) => kw);

  const hasMultipleLangs = sorted.length >= 3;
  let styleProfile: string;
  if (topKeywords.length === 0) {
    styleProfile = hasMultipleLangs ? "Polyglot Explorer" : "General Coder";
  } else if (hasMultipleLangs) {
    styleProfile = `Polyglot · ${topKeywords.join(", ")}`;
  } else {
    styleProfile = topKeywords.join(", ");
  }

  const lastGenerated = records[records.length - 1]?.timestamp ?? null;

  return {
    records,
    topLanguage,
    topLanguagePct,
    avgPromptLen,
    promptStyle,
    totalGenerations: records.length,
    styleProfile,
    languageDistribution: langCounts,
    lastGenerated,
  };
}

/**
 * Get visualization data for the preference panel.
 */
export function getPreferenceVisualization(): PreferenceVisualization | null {
  const prefs = getPreferences();
  if (!prefs) return null;

  const languageBars = Object.entries(prefs.languageDistribution)
    .map(([language, count]) => ({
      language: language.charAt(0).toUpperCase() + language.slice(1),
      count,
      pct: Math.round((count / prefs.totalGenerations) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);

  const promptStyleLabel = prefs.promptStyle === "short"
    ? "Concise prompts"
    : prefs.promptStyle === "medium"
      ? "Medium prompts"
      : "Detailed prompts";

  return {
    topLanguage: prefs.topLanguage.charAt(0).toUpperCase() + prefs.topLanguage.slice(1),
    topLanguagePct: prefs.topLanguagePct,
    avgPromptLen: prefs.avgPromptLen,
    promptStyle: promptStyleLabel,
    totalGenerations: prefs.totalGenerations,
    styleProfile: prefs.styleProfile,
    lastGenerated: prefs.lastGenerated
      ? new Date(prefs.lastGenerated).toLocaleString()
      : null,
    languageBars,
  };
}

/**
 * Get a preferences suffix to append to prompts.
 */
export function getPreferencesSuffix(): string {
  const prefs = getPreferences();
  if (!prefs) return "";

  const parts: string[] = [];

  parts.push(`Preferred language: ${prefs.topLanguage}`);

  if (prefs.promptStyle === "short") {
    parts.push("Keep it concise");
  } else if (prefs.promptStyle === "detailed") {
    parts.push("Provide thorough explanation with comments");
  }

  if (prefs.totalGenerations > 5) {
    parts.push("Include inline comments");
  }

  return `\n\n[User preferences: ${parts.join(". ")}]`;
}
