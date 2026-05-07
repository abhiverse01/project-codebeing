// PHASE7: [D3] Eliminated hardcoded colors — blog post accents now use CSS variable keys
// PHASE5: [U6] Added reading progress bar to article modal with scroll tracking
// PHASE3: onClick handler was a no-op (no article view); Added selectedPost state, AnimatePresence modal with framer-motion enter/exit, real article content for all 9 posts (3-4 paragraphs each with code examples), simple markdown renderer for bold and inline code, scroll lock when modal open, click outside to close, X close button
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, ArrowRight, X } from "lucide-react";
import { fuzzySearch } from "@/lib/offline-intelligence";

// PHASE7: [D3] Blog post accent color keys — resolved to CSS variables at render time
const POST_ACCENT_MAP: Record<string, { text: string; bg: string; bar: string }> = {
  accent: { text: "var(--accent)", bg: "var(--accent-muted)", bar: "var(--accent)" },
  success: { text: "var(--success)", bg: "var(--success-muted)", bar: "var(--success)" },
  warning: { text: "var(--warning)", bg: "var(--warning-muted)", bar: "var(--warning)" },
  error: { text: "var(--error)", bg: "var(--error-muted)", bar: "var(--error)" },
  info: { text: "var(--info)", bg: "var(--info-muted)", bar: "var(--info)" },
  purple: { text: "var(--chart-2)", bg: "rgba(139,92,246,0.12)", bar: "var(--chart-2)" },
  pink: { text: "var(--error)", bg: "var(--error-muted)", bar: "var(--error)" },
};

function getPostAccent(key: string) {
  return POST_ACCENT_MAP[key] || POST_ACCENT_MAP.accent;
}

// ── Simple markdown renderer for bold and inline code ──
function renderMarkdown(text: string): string {
  let html = text;
  // Escape HTML
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>');
  // Inline code: `text`
  html = html.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-bg-hover text-accent text-[12px] font-mono">$1</code>');
  return html;
}

const BLOG_POSTS = [
  {
    id: "understanding-async-await",
    title: "Understanding Async/Await in JavaScript",
    description: "A deep dive into JavaScript's async/await syntax, how it works under the hood with Promises, and practical patterns for handling concurrent operations in modern applications.",
    category: "Tutorial",
    readTime: "8 min",
    date: "2024-12-15",
    color: "accent",
    content: `JavaScript's **async/await** syntax is one of the most important features introduced in ES2017. It provides a clean, readable way to work with asynchronous code without falling into callback hell or chaining complex promise chains. At its core, async/await is syntactic sugar over Promises — the \`await\` keyword pauses execution until a Promise resolves, and \`async\` wraps a function to always return a Promise.

**How it works under the hood.** When the JavaScript engine encounters an \`await\` expression, it suspends the function's execution and returns a pending Promise to the caller. Once the awaited Promise settles, the function resumes from where it left off. This is implemented using generators and state machines internally, but as a developer you never need to worry about that — the syntax reads like synchronous code.

Here's a practical example of fetching data from multiple APIs concurrently:

\`\`\`javascript
async function fetchUserDashboard() {
  try {
    const [user, posts, notifications] = await Promise.all([
      fetch('/api/user').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/notifications').then(r => r.json()),
    ]);
    return { user, posts, notifications };
  } catch (error) {
    console.error('Dashboard fetch failed:', error);
    throw error;
  }
}
\`\`\`

**Error handling patterns.** Always wrap \`await\` calls in \`try/catch\` blocks for granular error handling. For parallel operations, use \`Promise.allSettled()\` instead of \`Promise.all()\` when you don't want one rejection to fail the entire batch. This pattern is especially useful in dashboard applications where partial data is better than no data at all.

**Sequential vs. parallel execution.** One common mistake is awaiting multiple independent operations sequentially. If API calls don't depend on each other, always use \`Promise.all()\` or \`Promise.allSettled()\` to run them in parallel. This can reduce wait time from the sum of all requests to just the slowest one — a significant improvement when dealing with network latency.`,
  },
  {
    id: "big-o-algorithm-analysis",
    title: "Big-O Notation: A Visual Guide to Algorithm Complexity",
    description: "Master Big-O notation with visual comparisons of common algorithms. Learn when to use hash maps, binary search, and dynamic programming by understanding time and space tradeoffs.",
    category: "Research",
    readTime: "12 min",
    date: "2024-12-10",
    color: "success",
    content: `**Big-O notation** describes the upper bound of an algorithm's growth rate as input size increases. It's not about exact performance — it's about understanding how your code scales. A function that runs in **O(n log n)** will handle 10,000 items gracefully, while an **O(n²)** function will slow to a crawl on the same data.

**Common complexities ranked from best to worst:** O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!). For most practical applications, you want to aim for O(n log n) or better. Anything above O(n²) is generally unacceptable for production use except on very small datasets.

Consider this comparison of **search strategies**:

\`\`\`javascript
// O(n) - Linear Search
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

// O(log n) - Binary Search (requires sorted array)
function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
\`\`\`

**Space complexity matters too.** It's tempting to optimize time at the expense of space, but memory is not infinite. **Memoization** is a classic tradeoff — caching results uses more memory but dramatically reduces time complexity. For example, Fibonacci without memoization is **O(2ⁿ)**, but with memoization it drops to **O(n)**.

**When to use hash maps.** If you need to check membership frequently, a hash map gives you **O(1)** lookups compared to **O(n)** for arrays. This single insight can transform a slow algorithm into an efficient one. Use \`Map\` or \`Set\` in JavaScript when you need fast lookups, deduplication, or frequency counting.`,
  },
  {
    id: "react-custom-hooks-patterns",
    title: "5 React Custom Hook Patterns Every Developer Should Know",
    description: "From useLocalStorage to useDebounce, these custom hook patterns will level up your React development. Complete implementations with TypeScript types and real-world usage examples.",
    category: "Tools",
    readTime: "10 min",
    date: "2024-12-05",
    color: "warning",
    content: `Custom hooks are the secret weapon of experienced React developers. They let you extract component logic into reusable functions, following the same rules as built-in hooks. Here are five patterns that I use in almost every project.

**1. useLocalStorage** — Sync state with \`localStorage\` so data persists across page reloads:

\`\`\`typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}
\`\`\`

**2. useDebounce** — Delay rapid-fire state changes, perfect for search inputs:

\`\`\`typescript
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
\`\`\`

**3. useToggle** — A tiny but handy hook for boolean state management. Simple to implement but saves boilerplate in modals, dropdowns, and settings panels. It returns \`[value, toggle]\` where toggle flips the boolean.

**4. useMediaQuery** — Respond to CSS media queries in JavaScript. Essential for responsive components that need to behave differently on mobile vs desktop, like showing a drawer on small screens and a sidebar on large ones.

**5. useIntersectionObserver** — Detect when elements enter the viewport. Perfect for lazy loading images, infinite scroll, scroll-triggered animations, and analytics tracking. The Intersection Observer API is performant because it runs off the main thread.

The key to great custom hooks is **composability**. Don't build one massive hook — build small, focused hooks and combine them. For example, \`useLocalStorage\` + \`useDebounce\` = auto-saving search preferences with a typing delay.`,
  },
  {
    id: "rust-vs-go-systems-programming",
    title: "Rust vs Go: Choosing the Right Systems Language",
    description: "An honest comparison of Rust and Go for backend development. Memory safety, concurrency models, compile times, ecosystem maturity, and when each language shines.",
    category: "Research",
    readTime: "15 min",
    date: "2024-11-28",
    color: "error",
    content: `The **Rust vs Go** debate is one of the most heated in the systems programming world. Both are modern languages designed for performance-critical applications, but they take fundamentally different approaches. Understanding these differences is crucial for making the right architectural decision.

**Memory Safety.** Rust's borrow checker enforces memory safety at compile time — if your Rust code compiles, it won't have data races, null pointer dereferences, or use-after-free bugs. Go uses garbage collection instead, which is simpler to reason about but introduces runtime overhead and occasional GC pauses. For mission-critical systems where downtime is unacceptable, Rust's compile-time guarantees are invaluable.

**Concurrency Model.** Go's **goroutines** are lightweight threads managed by the Go runtime, and channels provide a clean way to communicate between them. The model is simple: \`go func()\` spawns a goroutine, and \`ch <- value\` sends data through a channel. Rust's async/await with the **tokio** runtime is more powerful but more complex — you need to think about Send/Sync traits, pinning, and executor selection.

Here's a quick comparison of an HTTP server in both languages:

\`\`\`go
// Go - Simple HTTP server
func main() {
    http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
        json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
    })
    http.ListenAndServe(":8080", nil)
}
\`\`\`

**Compile Times.** Go compiles incredibly fast — large projects build in seconds. Rust's compile times are notoriously slow, especially with deep dependency trees. This impacts developer productivity significantly during development cycles.

**Ecosystem & Learning Curve.** Go has a smaller standard library surface but incredible consistency. The \`go\` toolchain is unified — formatting, testing, dependency management, and building all use the same tool. Rust has a richer ecosystem via crates.io but a much steeper learning curve. The borrow checker alone can take weeks to feel comfortable with.

**My recommendation:** Choose **Go** for microservices, CLI tools, and teams that need to move fast. Choose **Rust** for systems-level code, WebAssembly, and scenarios where memory safety and zero-cost abstractions are non-negotiable.`,
  },
  {
    id: "typescript-generics-explained",
    title: "TypeScript Generics: From Basics to Advanced Patterns",
    description: "Demystify TypeScript generics with progressive examples. Constraints, conditional types, mapped types, and real patterns used in production codebases.",
    category: "Tutorial",
    readTime: "11 min",
    date: "2024-11-20",
    color: "info",
    content: `**TypeScript generics** allow you to write flexible, reusable code that maintains full type safety. Think of them as type variables — placeholders that get filled in when you use the function, class, or interface. They're the backbone of the TypeScript standard library and essential for any serious TypeScript project.

**Basic Generics.** The simplest form is a generic function that works with any type:

\`\`\`typescript
function identity<T>(value: T): T {
  return value;
}
const num = identity(42);        // type: number
const str = identity("hello");   // type: string
\`\`\`

**Constraints with \`extends\`.** You often don't want truly generic types — you want types that satisfy certain requirements. Use \`extends\` to constrain generics:

\`\`\`typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}
getLength("hello");  // works - string has .length
getLength([1, 2, 3]); // works - arrays have .length
getLength(42);       // error - number doesn't have .length
\`\`\`

**Conditional Types.** These let you create types that depend on other types, similar to ternary expressions:

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">;  // true
type B = IsString<42>;       // false
\`\`\`

**Mapped Types.** Transform every property in an existing type. This is how \`Partial<T>\`, \`Required<T>\`, and \`Readonly<T>\` are implemented in the standard library:

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
\`\`\`

**Real-world pattern: API response types.** A common production pattern is a generic API client that types both the request parameters and the response:

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  return response.json();
}
\`\`\`

The key insight with generics is that they **erase at runtime** — they exist purely for the type checker. This means they add zero runtime overhead while giving you compile-time safety.`,
  },
  {
    id: "docker-containerization-guide",
    title: "Containerization with Docker: A Practical Developer Guide",
    description: "Learn Docker from the ground up. Write Dockerfiles, compose multi-container stacks, optimize image sizes, and deploy with confidence. Includes Node.js and Python examples.",
    category: "Tools",
    readTime: "14 min",
    date: "2024-11-15",
    color: "purple",
    content: `**Docker** has become the standard way to package and deploy applications. A container bundles your code with its dependencies, ensuring it runs identically on any machine — from your laptop to production. This eliminates the "works on my machine" problem once and for all.

**Writing efficient Dockerfiles.** The key to fast builds is **layer caching**. Each instruction in a Dockerfile creates a layer. If a layer changes, all subsequent layers are rebuilt. So always put instructions that change rarely (like \`apt-get install\`) before those that change often (like \`COPY . .\`):

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

**Multi-stage builds** are essential for keeping image sizes small. The first stage installs dependencies and builds the application, the second stage copies only the build artifacts:

\`\`\`dockerfile
# Build stage
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
\`\`\`

**Docker Compose** lets you define multi-container applications in a single YAML file. A typical web app might have three services: the app itself, a PostgreSQL database, and Redis for caching. Each service gets its own container with isolated networking.

**Image optimization tips:** Use Alpine-based images to reduce size from ~1GB to ~50MB. Combine \`RUN\` commands with \`&&\` to reduce layers. Use \`.dockerignore\` to exclude \`node_modules\`, \`.git\`, and build artifacts. Always pin image versions with tags for reproducibility — never use \`latest\` in production.`,
  },
  {
    id: "dynamic-programming-intro",
    title: "Dynamic Programming: From Fear to Fluency",
    description: "Break through the DP barrier with visual explanations of memoization and tabulation. Covers Fibonacci, coin change, longest common subsequence, and practical problem-solving strategies.",
    category: "Tutorial",
    readTime: "13 min",
    date: "2024-11-10",
    color: "pink",
    content: `**Dynamic Programming (DP)** is an optimization technique that solves complex problems by breaking them into simpler overlapping subproblems. Instead of solving the same subproblem repeatedly, DP stores results in a table and reuses them. This transforms exponential-time algorithms into polynomial-time ones.

**Two approaches: Top-down (memoization) and Bottom-up (tabulation).** Top-down starts from the original problem and recursively breaks it down, caching results as it goes. Bottom-up solves the smallest subproblems first and builds up to the solution. Both achieve the same time complexity, but bottom-up is usually faster in practice because it avoids function call overhead.

**The Fibonacci example** is the classic DP introduction:

\`\`\`javascript
// Naive: O(2^n) — recalculates the same values repeatedly
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// DP with memoization: O(n)
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

// DP with tabulation: O(n) time, O(1) space
function fibTab(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}
\`\`\`

**The Coin Change problem** is a great next step. Given coins of different denominations and a target amount, find the minimum number of coins needed. This is a classic **1D DP** problem where \`dp[i]\` represents the minimum coins needed for amount \`i\`.

**Identifying DP problems.** Look for these signals: the problem asks for an optimal value (minimum, maximum, longest), the problem involves making choices, and there are overlapping subproblems. Start by defining your state (what does \`dp[i]\` represent?), then figure out the recurrence relation (how does \`dp[i]\` relate to smaller subproblems?). Practice is key — start with the classic problems (knapsack, LCS, edit distance) before moving to harder ones.`,
  },
  {
    id: "open-source-contributing-guide",
    title: "Your First Open Source Contribution: A Step-by-Step Guide",
    description: "How to find the right project, understand codebases, make meaningful contributions, and navigate the pull request process. Real stories from first-time contributors.",
    category: "Open Source",
    readTime: "9 min",
    date: "2024-11-05",
    color: "success",
    content: `Contributing to **open source** can feel intimidating, but it's one of the fastest ways to grow as a developer. You get code review from experienced engineers, work on real-world codebases, and build a public portfolio. Here's a practical guide to making your first contribution.

**Step 1: Find the right project.** Start with tools you already use daily — your code editor, a CLI tool, or a library in your tech stack. Projects with the **"good first issue"** or **"help wanted"** labels on GitHub are specifically looking for new contributors. Check the project's contributing guide (\`CONTRIBUTING.md\`) for setup instructions and coding standards.

**Step 2: Set up your environment.** Fork the repository to your GitHub account, clone it locally, and install dependencies. Read the \`README.md\` and \`ARCHITECTURE.md\` if available. Before writing any code, make sure you can build and run the project, and verify that all existing tests pass.

**Step 3: Understand the codebase.** Don't try to understand everything at once. Start with the specific area you're modifying. Use your IDE's "Go to Definition" and "Find References" features liberally. Add \`console.log\` statements to trace the execution flow. Understanding the data flow is more important than understanding every line.

**Step 4: Make your contribution.** Create a descriptive branch name like \`fix/login-validation\` or \`feat/dark-mode\`. Make small, focused changes — one PR should do one thing. Write clear commit messages. Add tests if the project has a test suite (this dramatically increases the chance your PR gets merged).

**Step 5: Submit your PR.** Write a clear description explaining what you changed and why. Reference the issue number. Include screenshots if your change affects the UI. Be responsive to feedback — maintainers review PRs in their free time, so be patient and polite.

**Pro tips:** Start with documentation fixes or typo corrections to get familiar with the workflow. Engage in discussions in issues before jumping to code. Many maintainers prefer that you discuss your approach first rather than submitting a surprise PR.`,
  },
  {
    id: "sql-window-functions-mastery",
    title: "SQL Window Functions: Unlocking Analytical Queries",
    description: "Go beyond GROUP BY with window functions. Learn ROW_NUMBER, RANK, LAG, LEAD, and running totals with practical examples on real-world datasets.",
    category: "Tutorial",
    readTime: "10 min",
    date: "2024-10-28",
    color: "warning",
    content: `**Window functions** are one of SQL's most powerful features, yet many developers never learn them properly. Unlike \`GROUP BY\` which collapses rows, window functions perform calculations across a set of rows while keeping all rows in the result. This makes them ideal for running totals, rankings, and comparisons between rows.

**Basic syntax:** \`FUNCTION() OVER (PARTITION BY ... ORDER BY ...)\`. The \`PARTITION BY\` clause divides data into groups (like GROUP BY), and \`ORDER BY\` defines the order within each group. Both are optional.

**ROW_NUMBER, RANK, and DENSE_RANK** assign sequential numbers to rows:

\`\`\`sql
SELECT
  employee_name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as row_num,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dense_rank
FROM employees;
\`\`\`

The difference: **ROW_NUMBER** always gives unique numbers (1, 2, 3, 4). **RANK** gives ties the same number and skips the next (1, 2, 2, 4). **DENSE_RANK** gives ties the same number but doesn't skip (1, 2, 2, 3).

**LAG and LEAD** access values from previous or next rows — incredibly useful for calculating differences or growth rates:

\`\`\`sql
SELECT
  month,
  revenue,
  LAG(revenue, 1) OVER (ORDER BY month) as prev_month,
  revenue - LAG(revenue, 1) OVER (ORDER BY month) as growth
FROM monthly_sales;
\`\`\`

**Running totals** use the \`SUM()\` window function with a default frame of rows from the start to the current row. This is much more efficient than self-joins or correlated subqueries.

**Practical use cases:** Find the top N items per category, calculate year-over-year growth, identify consecutive events (like login streaks), compute rolling averages, and detect gaps in sequences. Once you understand window functions, you'll find uses for them everywhere.`,
  },
];

const CATEGORIES = ["All", "Tutorial", "Research", "Tools", "Open Source"];

export default function BlogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<typeof BLOG_POSTS[number] | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [readProgress, setReadProgress] = useState(0);

  const filtered = useMemo(() => {
    let result = BLOG_POSTS;
    if (category !== "All") result = result.filter((p) => p.category === category);
    if (query.trim()) result = fuzzySearch(query, result, "title", 0.1);
    return result;
  }, [query, category]);

  const featured = filtered[0];
  const secondary = filtered.slice(1);

  // Track reading progress inside modal content — NO body scroll lock
  // BUG FIX: Removed `document.body.style.overflow = "hidden"` — this persisted across
  // page navigations in Next.js, permanently freezing scroll. The modal is already fixed
  // with a backdrop, so body scroll lock is unnecessary. Reading progress is tracked
  // via the modal's internal scroll container (modalContentRef), not window scroll.
  useEffect(() => {
    if (!selectedPost) return;
    const modalEl = modalContentRef.current;
    if (!modalEl) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = modalEl;
      setReadProgress(scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0);
    };
    modalEl.addEventListener("scroll", handleScroll, { passive: true });
    // Reset progress to 0 when a new post is selected — done via the effect cleanup
    // which removes the old listener and the new effect reattaches with scrollTop at 0
    return () => modalEl.removeEventListener("scroll", handleScroll);
  }, [selectedPost]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPost(null);
    };
    if (selectedPost) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedPost]);

  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow)
    <div className="min-h-dvh bg-bg-base">
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-1">Blog</h1>
          <p className="text-text-secondary text-sm">Tutorials, research, and insights for developers.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-surface border border-border text-text-primary text-sm placeholder:text-text-tertiary outline-none focus:border-accent/50 transition-colors" />
          </div>
          <div className="flex gap-1 p-0.5 rounded-lg bg-bg-hover border border-border">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer border-none ${
                  category === c ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary bg-transparent"
                }`}>{c}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-secondary text-sm">No articles found.</div>
        )}

        {/* Featured */}
        {featured && (
          <motion.article layout className="group mb-6 p-6 rounded-xl bg-bg-surface border border-border hover:border-border-hover transition-all cursor-pointer"
            onClick={() => setSelectedPost(featured)}>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ backgroundColor: getPostAccent(featured.color).bg, color: getPostAccent(featured.color).text }}>
                {featured.category}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                <Clock className="w-2.5 h-2.5" /> {featured.readTime}
              </span>
              <span className="text-[10px] text-text-tertiary">{featured.date}</span>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors flex items-center gap-2">
              {featured.title}
              <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">{featured.description}</p>
            {/* Decorative gradient bar */}
            <div className="mt-4 h-1 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${getPostAccent(featured.color).bar}, transparent)` }} />
          </motion.article>
        )}

        {/* Secondary grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {secondary.map((post) => (
            <motion.article key={post.id} layout
              className="group p-4 rounded-xl bg-bg-surface border border-border hover:border-border-hover transition-all cursor-pointer"
              onClick={() => setSelectedPost(post)}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ backgroundColor: getPostAccent(post.color).bg, color: getPostAccent(post.color).text }}>
                  {post.category}
                </span>
                <span className="text-[9px] text-text-tertiary">{post.readTime}</span>
              </div>
              <h3 className="text-sm font-medium text-text-primary mb-1.5 group-hover:text-accent transition-colors leading-snug flex items-start gap-1.5">
                <span className="flex-1">{post.title}</span>
                <ArrowRight className="w-3 h-3 mt-0.5 text-text-tertiary group-hover:text-accent transition-colors flex-shrink-0" />
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">{post.description}</p>
              <div className="mt-3 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${getPostAccent(post.color).bar}, transparent)` }} />
            </motion.article>
          ))}
        </div>
      </div>

      {/* ── Article Modal ── */}
      {/* PHASE4: Article Modal — full-screen on mobile, padded on sm+ */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedPost(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Reading progress bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-accent/70 z-10 transition-all duration-150" style={{ width: `${Math.min(readProgress * 100, 100)}%` }} />

            {/* PHASE4: Modal inner — full-screen on mobile with 100dvh, rounded only on sm+ */}
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-2xl max-h-[100dvh] sm:max-h-[85vh] bg-bg-surface border-0 sm:border sm:border-border rounded-none sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/50 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                      style={{ backgroundColor: getPostAccent(selectedPost.color).bg, color: getPostAccent(selectedPost.color).text }}
                    >
                      {selectedPost.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                      <Clock className="w-2.5 h-2.5" /> {selectedPost.readTime}
                    </span>
                    <span className="text-[10px] text-text-tertiary">{selectedPost.date}</span>
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-all bg-transparent border-none cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-semibold text-text-primary leading-snug">
                  {selectedPost.title}
                </h2>
              </div>

              {/* Modal body - scrollable */}
              <div ref={modalContentRef} className="flex-1 overflow-y-auto px-6 py-6">
                <div
                  className="prose text-sm text-text-secondary leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: selectedPost.content
                      .split("\n\n")
                      .map((paragraph) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return "";
                        // Code blocks (triple backticks)
                        if (trimmed.startsWith("```")) {
                          const lines = trimmed.split("\n");
                          const lang = lines[0].replace("```", "").trim();
                          const code = lines.slice(1, -1).join("\n");
                          return `<pre class="my-4 p-4 rounded-xl bg-bg-base border border-border overflow-x-auto"><code class="text-[12px] font-mono text-text-secondary leading-relaxed">${code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
                        }
                        return `<p>${renderMarkdown(trimmed)}</p>`;
                      })
                      .join(""),
                  }}
                />
              </div>

              {/* Decorative gradient bar */}
              <div className="flex-shrink-0 h-1" style={{ background: `linear-gradient(90deg, ${getPostAccent(selectedPost.color).bar}, transparent)` }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
