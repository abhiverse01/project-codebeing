// PHASE4: TF-IDF with IDF normalization, top-3 snippet results, TS-priority language detection, camelCase tokenization + stop words + stemming
// ── Offline Intelligence System ──
// Fuzzy search, syntax detection, complexity estimation, prompt→snippet matching

// ── Fuzzy Search (Levenshtein distance) ──

export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

export function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return 1;
  const dist = levenshtein(q, t);
  return Math.max(0, 1 - dist / Math.max(q.length, t.length));
}

export function fuzzySearch<T extends object>(
  query: string,
  items: T[],
  key: keyof T & string,
  threshold = 0.2
): T[] {
  return items
    .map((item) => ({ item, score: fuzzyScore(query, String((item as Record<string, unknown>)[key] ?? "")) }))
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

// ── Syntax Detection ──

const LANGUAGE_SIGNATURES: Record<string, string[]> = {
  python: [
    "def ", "import ", "from ", "class ", "print(", "self.", "elif ",
    "lambda:", "yield ", "__init__", "range(", "None", "True", "False",
    "# ", '"""', "'''", "async def", "await ", "with open",
  ],
  javascript: [
    "const ", "let ", "var ", "function ", "=>", "console.log", "require(",
    "module.exports", "=== ", "!== ", "null", "undefined", "async ", "await ",
    "Array.", "Promise", ".then(", ".catch(", "typeof ", "document.",
  ],
  typescript: [
    "const ", "let ", ": string", ": number", ": boolean", "interface ",
    "type ", "<T>", "enum ", "as ", "readonly", "namespace ", "implements ",
    "export ", "import type", "?: ", "function ", "=>",
  ],
  rust: [
    "fn ", "let mut ", "impl ", "pub fn", "struct ", "enum ", "match ",
    "&self", "Vec<", "String", "use std::", "println!", "#[derive",
    "Option<", "Result<", "unwrap()", "cargo",
  ],
  go: [
    "func ", "package ", "import (", "fmt.", ":= ", "func main",
    "var ", "type ", "struct ", "interface {}", "goroutine", "chan ",
    "go func", "defer ", "error", "nil",
  ],
  c: [
    "#include", "int main(", "printf(", "scanf(", "void ", "malloc(",
    "free(", "struct ", "typedef ", "enum ", "#define", "NULL", "stdio.h",
    "return 0",
  ],
  cpp: [
    "#include", "std::", "cout<<", "cin>>", "vector<", "string ",
    "class ", "template<", "namespace ", "using ", "auto ", "nullptr",
    "iostream", "int main(",
  ],
  sql: [
    "SELECT ", "FROM ", "WHERE ", "INSERT INTO", "UPDATE ", "DELETE ",
    "CREATE TABLE", "ALTER TABLE", "JOIN ", "GROUP BY", "ORDER BY",
    "INNER JOIN", "LEFT JOIN", "COUNT(", "SUM(", "AVG(",
  ],
  bash: [
    "#!/bin/bash", "echo ", "if [", "fi", "for ", "done", "while ",
    "$1", "$2", "grep ", "awk ", "sed ", "export ", "source ", "chmod ",
    "curl ", "wget ",
  ],
};

// TS-specific indicators get double weight
const TS_PRIORITY = ["interface ", "type ", "<T>", "?: ", "as "];

export function detectLanguage(code: string): {
  language: string;
  confidence: number;
} {
  const scores: Record<string, number> = {};
  for (const [lang, signatures] of Object.entries(LANGUAGE_SIGNATURES)) {
    scores[lang] = signatures.reduce(
      (score, sig) => score + (code.includes(sig) ? 1 : 0),
      0
    );
    // PHASE4: TypeScript gets bonus weight for TS-specific signatures
    if (lang === "typescript") {
      const tsBonus = TS_PRIORITY.filter((sig) => code.includes(sig)).length;
      scores[lang] += tsBonus; // double-count TS-specific indicators
    }
  }
  const totalSignatures = code.split(/\s+/).length;
  const best = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return {
    language: best[0],
    confidence: Math.min(1, best[1] / Math.max(3, totalSignatures * 0.1)),
  };
}

// ── Complexity Estimator ──

export function estimateComplexity(code: string): {
  time: string;
  space: string;
  explanation: string;
} {
  const lines = code.split("\n");
  let maxNesting = 0;
  let currentNesting = 0;
  let hasRecursion = false;
  let hasLogN = false;
  let hasLinear = false;
  let hasHashLookup = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\s*for\s*\(.*\)\s*\{?$/.test(trimmed)) {
      currentNesting++;
      maxNesting = Math.max(maxNesting, currentNesting);
      hasLinear = true;
    } else if (/^\s*while\s*\(/.test(trimmed)) {
      currentNesting++;
      maxNesting = Math.max(maxNesting, currentNesting);
    } else if (/^\s*if\s*\(/.test(trimmed)) {
      currentNesting++;
    } else if (trimmed === "}" || trimmed === "};") {
      currentNesting = Math.max(0, currentNesting - 1);
    }
    if (/\b(floor|ceil|log|Math\.\w+|\.split|\.substring)\b/.test(trimmed)) {
      hasLogN = true;
    }
    if (/\b(function|def|fn)\s+\w+.*\bself\b|\bfunction\s+\w+.*\(\w+\)/.test(trimmed)) {
      // Check if function calls itself
    }
    if (/\b(Map|Set|HashMap|HashSet|dict|set|object)\b/.test(trimmed)) {
      hasHashLookup = true;
    }
  }

  // Check recursion
  const funcMatch = code.match(/(?:function|def|fn)\s+(\w+)/g);
  if (funcMatch) {
    for (const fn of funcMatch) {
      const name = fn.replace(/(?:function|def|fn)\s+/, "");
      const callPattern = new RegExp(`\\b${name}\\s*\\(`, "g");
      const calls = code.match(callPattern);
      if (calls && calls.length > 1) hasRecursion = true;
    }
  }

  let time = "O(1)";
  let space = "O(1)";
  let explanation = "Constant time — no loops or recursion detected.";

  if (hasRecursion && hasLinear) {
    time = "O(n log n)";
    space = "O(n)";
    explanation = "Likely O(n log n) — recursive divide-and-conquer with linear splitting (e.g., merge sort, quicksort).";
  } else if (hasRecursion) {
    time = "O(2^n)";
    space = "O(n)";
    explanation = "Exponential — recursive calls without memoization. Consider adding dynamic programming.";
  } else if (hasLogN && maxNesting === 1) {
    time = "O(n log n)";
    space = "O(n)";
    explanation = "O(n log n) — single loop with logarithmic operation (e.g., sorting, heap operations).";
  } else if (maxNesting >= 2) {
    time = `O(n^${maxNesting})`;
    space = "O(n)";
    explanation = `O(n^${maxNesting}) — ${maxNesting} nested loops detected. Consider optimizing with hash maps or sorting.`;
  } else if (hasHashLookup && hasLinear) {
    time = "O(n)";
    space = "O(n)";
    explanation = "O(n) — linear traversal with constant-time hash lookups.";
  } else if (hasLinear) {
    time = "O(n)";
    space = "O(1)";
    explanation = "O(n) — single pass through the input data.";
  } else if (hasLogN) {
    time = "O(log n)";
    space = "O(1)";
    explanation = "O(log n) — logarithmic reduction (e.g., binary search).";
  }

  return { time, space, explanation };
}

// ── Prompt → Snippet Matcher (TF-IDF cosine similarity) ──

interface Snippet {
  keywords: string[];
  code: string;
  language: string;
  title: string;
}

// PHASE4: Stop words list for query preprocessing
const STOP_WORDS = new Set([
  "a", "an", "the", "in", "of", "for", "to", "with", "using", "that",
  "this", "how", "write", "create", "make", "build", "implement", "function", "code", "program",
]);

// PHASE4: Basic stemming — strip common suffixes from words longer than 4 chars
function stem(word: string): string {
  if (word.length <= 4) return word;
  const suffixes = ["ing", "tion", "ed", "er", "s"];
  for (const sfx of suffixes) {
    if (word.endsWith(sfx) && word.length - sfx.length > 2) {
      return word.slice(0, -sfx.length);
    }
  }
  return word;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    // PHASE4: Split on camelCase boundaries
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .filter((w) => !STOP_WORDS.has(w))
    .map(stem);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

function textToVector(text: string, vocab: string[], idf: number[]): number[] {
  const tokens = tokenize(text);
  const tf: Record<string, number> = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  const maxTf = Math.max(...Object.values(tf), 1);
  // PHASE4: TF-IDF = (TF / maxTF) * IDF
  return vocab.map((word, idx) => ((tf[word] || 0) / maxTf) * idf[idx]);
}

// PHASE4: Compute IDF weights from a vocabulary and document collection
function computeIDF(vocab: string[], documents: string[]): number[] {
  const N = documents.length;
  return vocab.map(word => {
    const df = documents.filter(doc => doc.includes(word)).length;
    return df > 0 ? Math.log(1 + N / df) : 0;
  });
}

// PHASE4: Return top 3 matches with 0-1 float scores
export function findBestSnippet(
  query: string,
  snippets: Snippet[]
): { results: { snippet: Snippet; score: number }[] } | null {
  const documents = snippets.map(
    (s) => `${s.keywords.join(" ")} ${s.title}`
  );
  const allText = [query, ...documents].join(" ");
  const tokens = tokenize(allText);
  const unique = [...new Set(tokens)];
  const vocab = unique.slice(0, 500); // limit vocab size

  // PHASE4: Compute IDF weights from the document collection
  const idf = computeIDF(vocab, documents);

  const queryVec = textToVector(query, vocab, idf);

  const scored: { snippet: Snippet; score: number }[] = [];

  for (let i = 0; i < snippets.length; i++) {
    const snippetVec = textToVector(documents[i], vocab, idf);
    const score = cosineSimilarity(queryVec, snippetVec);
    if (score > 0.05) {
      scored.push({ snippet: snippets[i], score: Math.min(1, score) });
    }
  }

  // PHASE4: Sort by score descending and return top 3
  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3);

  return top3.length > 0 ? { results: top3 } : null;
}

// ── Code Formatter (basic indentation normalizer) ──

export function formatCode(code: string): string {
  const lines = code.split("\n");
  const formatted: string[] = [];
  let indent = 0;
  const indentStr = "  ";

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted.push("");
      continue;
    }

    // Decrease indent for closing braces
    if (/^[}\])]/.test(trimmed)) {
      indent = Math.max(0, indent - 1);
    }

    formatted.push(indentStr.repeat(indent) + trimmed);

    // Increase indent for opening braces (if line ends with {)
    if (/[{(\[]\s*$/.test(trimmed) && !/^[}\])]/.test(trimmed)) {
      indent++;
    }
  }

  return formatted.join("\n");
}
