// ── Session Intelligence ──
// Tracks user behavior in sessionStorage, clears on tab close

interface GenerationRecord {
  language: string;
  promptLength: number;
  timestamp: number;
}

const STORAGE_KEY = "codebeing_generations";

function getRecords(): GenerationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GenerationRecord[];
  } catch {
    return [];
  }
}

function saveRecords(records: GenerationRecord[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/**
 * Track a code generation event.
 */
export function trackGeneration(language: string, promptLength: number): void {
  const records = getRecords();
  records.push({
    language: language.toLowerCase(),
    promptLength,
    timestamp: Date.now(),
  });
  // Keep only last 50 records
  if (records.length > 50) records.splice(0, records.length - 50);
  saveRecords(records);
}

/**
 * Get insights about the current session's coding patterns.
 */
export function getSessionInsights(): {
  mostUsedLanguage: string;
  avgPromptLength: number;
  totalGenerations: number;
  styleChip: string;
} | null {
  const records = getRecords();
  if (records.length < 3) return null;

  // Count languages
  const langCounts: Record<string, number> = {};
  for (const r of records) {
    const lang = r.language;
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  }

  // Find most used
  const sorted = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
  const mostUsedLanguage = sorted[0] ? sorted[0][0] : "unknown";

  // Average prompt length
  const avgPromptLength = Math.round(
    records.reduce((sum, r) => sum + r.promptLength, 0) / records.length
  );

  // Determine prompt style
  let promptStyle: string;
  if (avgPromptLength < 30) {
    promptStyle = "Short prompts";
  } else if (avgPromptLength < 80) {
    promptStyle = "Medium prompts";
  } else {
    promptStyle = "Detailed prompts";
  }

  // Determine coding preference
  const hasMultipleLangs = sorted.length >= 3;
  let pref: string;
  if (hasMultipleLangs) {
    pref = "Polyglot";
  } else {
    // Check what types of tasks
    const allPrompts = records.map((r) => r.promptLength).join(" ");
    pref = "Prefers functions";
  }

  const totalGenerations = records.length;
  const styleChip = `${capitalize(mostUsedLanguage)} · ${promptStyle} · ${pref}`;

  return { mostUsedLanguage, avgPromptLength, totalGenerations, styleChip };
}

/**
 * Get a preferences suffix string to append to the next prompt.
 */
export function getPreferencesSuffix(): string {
  const insights = getSessionInsights();
  if (!insights) return "";

  const parts: string[] = [];

  // Language preference
  parts.push(`Preferred language: ${insights.mostUsedLanguage}`);

  // Prompt length preference
  if (insights.avgPromptLength < 30) {
    parts.push("Keep it concise");
  } else if (insights.avgPromptLength > 80) {
    parts.push("Provide thorough explanation");
  }

  // Style preference
  if (insights.totalGenerations > 5) {
    parts.push("Include inline comments");
  }

  return `\n\n[User preferences: ${parts.join(". ")}]`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
