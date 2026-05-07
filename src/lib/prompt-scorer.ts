// PHASE4: Context-aware tips with prompt analysis, positive feedback for score 100
// ── Prompt Quality Scorer ──
// Client-side scoring: clarity, specificity, completeness, token estimate

export interface PromptScore {
  total: number;
  clarity: number;
  specificity: number;
  completeness: number;
  tokenEstimate: number;
  tip: string;
}

const VERB_KEYWORDS = [
  "write", "create", "build", "make", "implement", "generate", "code",
  "develop", "design", "parse", "fetch", "render", "sort", "filter",
  "search", "validate", "transform", "compute", "calculate", "convert",
  "optimize", "refactor", "test", "debug", "extract", "analyze",
  "format", "serialize", "decode", "encode", "compress", "encrypt",
  "handle", "process", "return", "display", "show", "update", "delete",
];

const LANGUAGE_KEYWORDS = [
  "python", "javascript", "typescript", "rust", "go", "golang", "c++", "cpp",
  "java", "sql", "bash", "shell", "ruby", "swift", "kotlin", "php",
  "html", "css", "react", "vue", "angular", "svelte", "next.js", "node",
  "express", "django", "flask", "fastapi", "rails", "spring",
];

const OUTPUT_FORMAT_HINTS = [
  "json", "csv", "xml", "html", "markdown", "yaml", "toml", "pdf",
  "array", "object", "string", "boolean", "integer", "map", "list",
  "tuple", "set", "promise", "async", "callback", "function",
  "return", "output", "result", "response", "format",
];

const EXAMPLE_INDICATORS = [
  "example", "for instance", "e.g.", "such as", "like this", "sample",
  "test case", "input:", "output:", "expected", "given", "when", "then",
  "scenario", "case:", "for example",
];

const EDGE_CASE_KEYWORDS = [
  "edge case", "boundary", "corner case", "empty", "null", "undefined",
  "error", "invalid", "overflow", "underflow", "timeout", "zero",
  "negative", "duplicate", "missing", "malformed",
];

const CONSTRAINT_KEYWORDS = [
  "constraint", "limit", "maximum", "minimum", "range", "must", "should",
  "require", "only", "without", "no more than", "at least", "exactly",
  "must be", "cannot", "don't", "avoid", "ensure", "validate",
];

const ERROR_HANDLING_KEYWORDS = [
  "error handling", "try catch", "exception", "throw", "error", "fail",
  "fallback", "default", "graceful", "recover", "retry", "validation",
  "guard", "assert", "sanity check", "edge case",
];

function countKeywordMatches(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((count, kw) => count + (lower.includes(kw) ? 1 : 0), 0);
}

function scoreClarity(prompt: string): number {
  let score = 0;

  // Verb presence (0-40)
  const verbMatches = countKeywordMatches(prompt, VERB_KEYWORDS);
  score += Math.min(40, verbMatches * 15);

  // Language spec (0-30)
  const langMatches = countKeywordMatches(prompt, LANGUAGE_KEYWORDS);
  score += Math.min(30, langMatches * 20);

  // Output format hint (0-30)
  const formatMatches = countKeywordMatches(prompt, OUTPUT_FORMAT_HINTS);
  score += Math.min(30, formatMatches * 12);

  // Sentence structure bonus — has clear subject-verb pattern
  const sentences = prompt.split(/[.!?]+/).filter((s) => s.trim().length > 5);
  if (sentences.length >= 1) score += 5;
  if (sentences.length >= 2) score += 5;

  return Math.min(100, score);
}

function scoreSpecificity(prompt: string): number {
  let score = 0;
  const words = prompt.split(/\s+/).filter((w) => w.length > 0);

  // Word count (0-30): sweet spot 10-50 words
  if (words.length >= 10) score += 15;
  if (words.length >= 20) score += 10;
  if (words.length >= 40) score += 5;
  if (words.length < 3) score -= 10;

  // Examples mentioned (0-35)
  const exampleMatches = countKeywordMatches(prompt, EXAMPLE_INDICATORS);
  score += Math.min(35, exampleMatches * 18);

  // Edge cases (0-20)
  const edgeCaseMatches = countKeywordMatches(prompt, EDGE_CASE_KEYWORDS);
  score += Math.min(20, edgeCaseMatches * 10);

  // Specific naming (variables, function names, types) (0-15)
  const hasIdentifiers = /[a-zA-Z_]\w*\s*[(:=]/.test(prompt);
  if (hasIdentifiers) score += 10;
  const hasQuotedStrings = /"[^"]+"|'[^']+'|`[^`]+`/.test(prompt);
  if (hasQuotedStrings) score += 5;

  return Math.min(100, Math.max(0, score));
}

function scoreCompleteness(prompt: string): number {
  let score = 0;

  // Input/output examples (0-35)
  const hasInput = /input[:\s]/i.test(prompt) || /given[:\s]/i.test(prompt);
  const hasOutput = /output[:\s]/i.test(prompt) || /return[:\s]/i.test(prompt) || /expected[:\s]/i.test(prompt);
  if (hasInput) score += 18;
  if (hasOutput) score += 18;

  // Constraints (0-25)
  const constraintMatches = countKeywordMatches(prompt, CONSTRAINT_KEYWORDS);
  score += Math.min(25, constraintMatches * 8);

  // Error handling (0-20)
  const errorMatches = countKeywordMatches(prompt, ERROR_HANDLING_KEYWORDS);
  score += Math.min(20, errorMatches * 10);

  // Context completeness (0-20): has both what and how
  const hasWhat = countKeywordMatches(prompt, VERB_KEYWORDS) > 0;
  const hasHow = countKeywordMatches(prompt, LANGUAGE_KEYWORDS) > 0 || countKeywordMatches(prompt, OUTPUT_FORMAT_HINTS) > 0;
  if (hasWhat && hasHow) score += 20;
  else if (hasWhat || hasHow) score += 8;

  return Math.min(100, Math.max(0, score));
}

// PHASE4: Context-aware tips with prompt-based analysis
function generateTip(clarity: number, specificity: number, completeness: number, prompt: string): string {
  const tips: string[] = [];
  const lower = prompt.toLowerCase();

  // Check for specific missing elements
  const hasVerb = VERB_KEYWORDS.some(v => lower.includes(v));
  const hasLang = LANGUAGE_KEYWORDS.some(l => lower.includes(l));
  const wordCount = prompt.split(/\s+/).filter(w => w.length > 0).length;

  if (!hasVerb) {
    tips.push("Start with a verb: 'Write', 'Build', 'Explain', or 'Convert'");
  }
  if (!hasLang) {
    tips.push("Specify the language: 'in Python', 'using TypeScript'");
  }
  if (wordCount < 8) {
    tips.push("Add what it should do: 'that returns X', 'given input Y'");
  }
  if (!lower.includes('return') && !lower.includes('output') && !lower.includes('result')) {
    tips.push("Mention the output format: 'as a function', 'as a class'");
  }

  if (specificity < 40 && tips.length < 2) {
    tips.push("Add an example input/output");
  }

  // Return max 2 tips
  return tips.length > 0 ? tips.slice(0, 2).join(" · ") : "";
}

export function scorePrompt(prompt: string): PromptScore {
  if (!prompt || prompt.trim().length === 0) {
    return { total: 0, clarity: 0, specificity: 0, completeness: 0, tokenEstimate: 0, tip: "" };
  }

  const clarity = scoreClarity(prompt);
  const specificity = scoreSpecificity(prompt);
  const completeness = scoreCompleteness(prompt);

  // Weighted total: clarity 35%, specificity 35%, completeness 30%
  const total = Math.round(clarity * 0.35 + specificity * 0.35 + completeness * 0.3);
  const tokenEstimate = Math.ceil(prompt.length * 0.25);
  // PHASE4: Show positive feedback for perfect score, context-aware tips otherwise
  const tip = total === 100
    ? "Great prompt! ✓"
    : total < 50
      ? generateTip(clarity, specificity, completeness, prompt)
      : "";

  return { total, clarity, specificity, completeness, tokenEstimate, tip };
}
