export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration: string;
  content: string;
  code: string;
  expectedOutput: string;
  hints: string[];
  tags: string[];
}

export const lessons: Lesson[] = [
  {
    id: 'recursion-intro',
    title: 'What is Recursion?',
    description: 'Learn how functions can call themselves to solve problems that can be broken down into smaller, identical sub-problems.',
    difficulty: 'beginner',
    category: 'Fundamentals',
    duration: '5 min read',
    content: `## What is Recursion?

**Recursion** is a programming technique where a function calls itself to solve a problem. Think of it like a Russian nesting doll — each doll contains a smaller version of itself, and you keep opening dolls until you reach the smallest one that cannot be opened further.

### The Two Essential Parts

Every recursive function **must** have two things:

1. **A base case** — the condition under which the function stops calling itself. Without this, you get infinite recursion and a stack overflow.
2. **A recursive case** — the part where the function calls itself with a *smaller* or *simpler* input, moving closer to the base case.

### Why Does Recursion Matter?

Recursion naturally expresses problems that have a **self-similar structure**. Traversing trees, exploring file systems, generating combinations, and computing mathematical sequences like factorials and Fibonacci numbers are all problems where recursion shines. Many divide-and-conquer algorithms (merge sort, quicksort, binary search) are most naturally expressed recursively.

Many programmers find recursion intimidating at first, but once it "clicks," you'll find it an elegant tool in your arsenal. The key insight is **trust**: when you write the recursive call, trust that it will correctly solve the smaller problem — you only need to handle how the current step connects to that result.

### Classic Example: Factorial

The factorial of \`n\` (written \`n!\`) is the product of all positive integers up to \`n\`. For example, \`5! = 5 × 4 × 3 × 2 × 1 = 120\`. Notice how \`5! = 5 × 4!\` — the problem contains itself at a smaller scale. This self-similarity is exactly what recursion handles beautifully.

The call stack for \`factorial(5)\` looks like this:
- \`factorial(5)\` calls \`factorial(4)\`
- \`factorial(4)\` calls \`factorial(3)\`
- \`factorial(3)\` calls \`factorial(2)\`
- \`factorial(2)\` calls \`factorial(1)\` ← **base case**, returns \`1\`
- Then each call resolves: \`2×1=2\`, \`3×2=6\`, \`4×6=24\`, \`5×24=120\``,
    code: `function factorial(n) {
  // Base case: 0! and 1! are both 1
  if (n <= 1) return 1;

  // Recursive case: n! = n × (n-1)!
  return n * factorial(n - 1);
}

console.log("5! =", factorial(5));
console.log("0! =", factorial(0));
console.log("7! =", factorial(7));

// Visualize the recursion depth
function factorialVerbose(n, depth = 0) {
  const indent = "  ".repeat(depth);
  console.log(indent + "factorial(" + n + ")");
  if (n <= 1) {
    console.log(indent + "  → base case: return 1");
    return 1;
  }
  const result = n * factorialVerbose(n - 1, depth + 1);
  console.log(indent + "  → return " + n + " × result = " + result);
  return result;
}

console.log("\\nTracing factorial(4):");
factorialVerbose(4);`,
    expectedOutput: `5! = 120
0! = 1
7! = 5040

Tracing factorial(4):
factorial(4)
  factorial(3)
    factorial(2)
      factorial(1)
        → base case: return 1
      → return 2 × result = 2
    → return 3 × result = 6
  → return 4 × result = 24`,
    hints: [
      'Every recursive function needs a base case — ask yourself: "What is the simplest version of this problem that I can answer directly?"',
      'Make sure each recursive call moves closer to the base case. If the input doesn\'t get smaller, you\'ll loop forever.',
      'Try tracing the call stack on paper: write down each function call and its return value as you work through the example.',
    ],
    tags: ['recursion', 'functions', 'algorithms', 'fundamentals'],
  },
  {
    id: 'async-await',
    title: 'How Async/Await Works',
    description: 'Master modern asynchronous JavaScript by understanding how async/await builds on top of Promises to make asynchronous code read like synchronous code.',
    difficulty: 'intermediate',
    category: 'Asynchronous JavaScript',
    duration: '7 min read',
    content: `## How Async/Await Works

JavaScript is **single-threaded**, but it needs to handle things that take time — fetching data from APIs, reading files, waiting for user input. That's where asynchronous programming comes in.

### Before async/await: Promise Chains

Before \`async/await\` (introduced in ES2017), we used **Promise chains** with \`.then()\`. While powerful, deeply nested chains became hard to read and reason about — a problem nicknamed "callback hell" in its earlier form:

\`\`\`
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => fetchComments(posts[0].id))
  .then(comments => render(comments))
  .catch(err => console.error(err));
\`\`\`

### Enter async/await

The \`async/await\` syntax lets you write asynchronous code that **looks synchronous**. An \`async\` function always returns a Promise. The \`await\` keyword pauses execution inside that function until the Promise resolves:

\`\`\`
async function loadData() {
  const user = await fetchUser(1);
  const posts = await fetchPosts(user.id);
  return posts;
}
\`\`\`

Under the hood, this is **syntactic sugar** over Promises. The JavaScript engine transforms your \`await\` expressions into \`.then()\` calls automatically. This means you can mix both styles — call \`.then()\` on an \`async\` function's return value, or \`await\` a Promise inside an \`async\` function.

### Why It Matters

\`async/await\` dramatically improves **readability** and **debuggability**. Stack traces are cleaner, error handling uses familiar \`try/catch\` blocks, and the code flows top-to-bottom instead of jumping between callback levels.

### Parallel vs Sequential

A common mistake is awaiting operations one at a time when they could run in parallel. Use \`Promise.all()\` with \`await\` to kick off multiple async operations simultaneously and wait for all of them at once.

The example below simulates API fetches with an in-memory data store. Try modifying the code to see how sequential vs parallel execution changes the flow.`,
    code: `function fakeFetch(url) {
  const data = {
    "/users": [{ name: "Alice" }, { name: "Bob" }],
    "/posts": [{ title: "Hello World" }, { title: "Async Tips" }],
  };
  return new Promise(resolve => resolve(data[url] || []));
}

async function main() {
  // Sequential: each await pauses until the previous one resolves
  console.log("Sequential fetch:");
  const users = await fakeFetch("/users");
  console.log("  Users:", users.map(u => u.name).join(", "));

  const posts = await fakeFetch("/posts");
  console.log("  Posts:", posts.map(p => p.title).join(", "));

  // Parallel: both requests start at the same time
  console.log("\\nParallel fetch with Promise.all:");
  const [allUsers, allPosts] = await Promise.all([
    fakeFetch("/users"),
    fakeFetch("/posts"),
  ]);
  console.log("  Users:", allUsers.map(u => u.name).join(", "));
  console.log("  Posts:", allPosts.map(p => p.title).join(", "));

  // Error handling with try/catch
  console.log("\\nError handling:");
  try {
    const missing = await fakeFetch("/invalid");
    console.log("  Got:", missing);
  } catch (err) {
    console.log("  Error:", err.message);
  }
}

main();`,
    expectedOutput: `Sequential fetch:
  Users: Alice, Bob
  Posts: Hello World, Async Tips

Parallel fetch with Promise.all:
  Users: Alice, Bob
  Posts: Hello World, Async Tips

Error handling:
  Got: []`,
    hints: [
      'An async function always returns a Promise, even if you return a plain value — the engine wraps it automatically.',
      'Use Promise.all() when multiple async operations are independent and can run in parallel for better performance.',
      'Always wrap await calls in try/catch for proper error handling — an unhandled rejection is harder to debug.',
    ],
    tags: ['async', 'await', 'promises', 'es2017', 'concurrency'],
  },
  {
    id: 'binary-search',
    title: 'Binary Search Explained',
    description: 'Understand one of the most fundamental algorithms — binary search — which finds items in a sorted array by repeatedly halving the search space.',
    difficulty: 'beginner',
    category: 'Algorithms',
    duration: '5 min read',
    content: `## Binary Search Explained

Imagine you're looking for a word in a dictionary. You don't start from page 1 and read every page — you open the book somewhere near the middle, check whether the word comes before or after that point, and then focus on just one half of the remaining pages. You repeat this process until you find the word. That's **binary search**.

### How It Works

Binary search works on a **sorted array**. It maintains two pointers — \`left\` and \`right\` — that define the current search range. On each step:

1. Calculate the **middle index**: \`mid = floor((left + right) / 2)\`
2. Compare the middle element with the **target**
3. If it matches — you're done!
4. If the middle element is **less than** the target, the target must be in the **right half** — move \`left\` to \`mid + 1\`
5. If the middle element is **greater**, the target must be in the **left half** — move \`right\` to \`mid - 1\`

Each step eliminates **half** of the remaining elements, which is why binary search runs in **O(log n)** time. For an array of 1 million elements, binary search needs at most ~20 comparisons, compared to 1 million for a linear scan.

### Why It Matters

Binary search is a building block for countless algorithms and is one of the most common interview topics. It appears in database indexing, version control systems (bisecting to find the commit that introduced a bug), auto-complete systems, and numerical root-finding algorithms.

The code below traces each step of the algorithm so you can see exactly how the search range shrinks with each comparison.`,
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let steps = 0;

  while (left <= right) {
    steps++;
    const mid = Math.floor((left + right) / 2);
    console.log("  Step " + steps + ": index " + mid + " → value " + arr[mid]);

    if (arr[mid] === target) {
      console.log("  Found " + target + " at index " + mid + " in " + steps + " steps!");
      return mid;
    } else if (arr[mid] < target) {
      console.log("  " + arr[mid] + " < " + target + " → go right");
      left = mid + 1;
    } else {
      console.log("  " + arr[mid] + " > " + target + " → go left");
      right = mid - 1;
    }
  }
  console.log("  " + target + " not found after " + steps + " steps");
  return -1;
}

const sorted = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
console.log("Array: " + sorted.join(", "));
console.log("\\nSearch for 23:");
binarySearch(sorted, 23);
console.log("\\nSearch for 4:");
binarySearch(sorted, 4);`,
    expectedOutput: `Array: 2, 5, 8, 12, 16, 23, 38, 56, 72, 91

Search for 23:
  Step 1: index 4 → value 16
  16 < 23 → go right
  Step 2: index 7 → value 56
  56 > 23 → go left
  Step 3: index 5 → value 23
  Found 23 at index 5 in 3 steps!

Search for 4:
  Step 1: index 4 → value 16
  16 > 4 → go left
  Step 2: index 1 → value 5
  5 > 4 → go left
  Step 3: index 0 → value 2
  2 < 4 → go right
  4 not found after 3 steps`,
    hints: [
      'Binary search ONLY works on sorted arrays. If the array isn\'t sorted, sort it first or use a different approach.',
      'Watch out for off-by-one errors: use <= (not <) in the while condition, and use mid + 1 / mid - 1 (not mid) when narrowing the range.',
      'For very large arrays, left + right could overflow. Use left + Math.floor((right - left) / 2) as a safer alternative.',
    ],
    tags: ['algorithms', 'search', 'arrays', 'divide-and-conquer', 'O(log n)'],
  },
  {
    id: 'closures',
    title: 'Understanding Closures',
    description: 'Discover how closures allow functions to "remember" the environment in which they were created, enabling powerful patterns like factories and memoization.',
    difficulty: 'intermediate',
    category: 'Core JavaScript',
    duration: '6 min read',
    content: `## Understanding Closures

A **closure** is a function that retains access to variables from its **lexical scope** — the scope where it was defined — even after that scope has finished executing. This is one of the most powerful features in JavaScript and is at the heart of many common patterns.

### How Closures Work

When a function is created in JavaScript, it captures a reference to the variables in its surrounding scope. Normally, when a function finishes running, its local variables are garbage-collected. But if an **inner function** references those variables, they survive — the inner function "closes over" them.

Think of a closure like a **backpack**. When a function is defined inside another function, it packs up the variables it needs from the outer function into a backpack. Even when the outer function returns and its frame is gone from the call stack, the inner function still carries that backpack with it.

### Why It Matters

Closures are used everywhere in JavaScript:
- **Module pattern**: private variables that can't be accessed from outside
- **Callback functions**: event handlers that reference outer variables
- **Partial application / currying**: pre-filling some arguments of a function
- **Memoization**: caching expensive computation results
- **Iterators and generators**: maintaining state across calls

### Practical Patterns

**Counter Factory**: A function that creates independent counter objects. Each counter has its own private \`count\` variable that nothing else can directly access or modify — this is **data privacy** through closures.

**Memoization**: Wrapping a function so it caches its results. The first time you call it with a given argument, it computes and stores the result. On subsequent calls with the same argument, it returns the cached value instantly. This can turn an exponential-time recursive algorithm into a linear-time one.

The code below demonstrates both patterns. Notice how each counter maintains its own independent state.`,
    code: `// Pattern 1: Counter factory with private state
function createCounter(start = 0) {
  let count = start; // This variable is "closed over"
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

const counterA = createCounter(10);
const counterB = createCounter(0);

console.log("Counter A (starts at 10):");
console.log("  Count:", counterA.getCount());
counterA.increment();
counterA.increment();
counterA.increment();
console.log("  After 3 increments:", counterA.getCount());
counterA.decrement();
console.log("  After 1 decrement:", counterA.getCount());

console.log("\\nCounter B (starts at 0):");
console.log("  Count:", counterB.getCount());
counterB.increment();
console.log("  After 1 increment:", counterB.getCount());

// Pattern 2: Memoization
function memoize(fn) {
  const cache = {};
  return function (...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      console.log("  Cache HIT for (" + args.join(", ") + ")");
      return cache[key];
    }
    console.log("  Computing for (" + args.join(", ") + ")");
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

const square = memoize(function (n) {
  return n * n;
});

console.log("\\nMemoized square:");
console.log("  Result:", square(5));
console.log("  Result:", square(5));
console.log("  Result:", square(5));
console.log("  Result:", square(10));`,
    expectedOutput: `Counter A (starts at 10):
  Count: 10
  After 3 increments: 13
  After 1 decrement: 12

Counter B (starts at 0):
  Count: 0
  After 1 increment: 1

Memoized square:
  Computing for (5)
  Result: 25
  Cache HIT for (5)
  Result: 25
  Cache HIT for (5)
  Result: 25
  Computing for (10)
  Result: 100`,
    hints: [
      'A closure is created every time an inner function references a variable from an outer function — it\'s not a special syntax, it\'s a natural consequence of lexical scoping.',
      'Common gotcha: closures in loops share the same variable reference. Use let (not var) in for loops, or use IIFEs to create separate scopes.',
      'Closures keep their referenced variables in memory. Be mindful of memory leaks — if a closure references a large object, that object won\'t be garbage-collected as long as the closure exists.',
    ],
    tags: ['closures', 'scope', 'functions', 'memory', 'patterns'],
  },
  {
    id: 'map-filter-reduce',
    title: 'Map, Filter, Reduce',
    description: 'Master the three most powerful array methods in JavaScript — learn to transform, filter, and aggregate data with clean, declarative code.',
    difficulty: 'beginner',
    category: 'Functional Programming',
    duration: '5 min read',
    content: `## Map, Filter, Reduce

These three methods are the **bread and butter** of functional programming in JavaScript. They allow you to process arrays in a clean, declarative way — you describe *what* you want, not *how* to do it.

### \`Array.prototype.map()\`

**Map** transforms every element in an array, producing a **new array** of the same length. Think of it as a factory assembly line: each item goes in, gets transformed, and comes out the other end.

\`[1, 2, 3].map(x => x * 2)\` → \`[2, 4, 6]\`

### \`Array.prototype.filter()\`

**Filter** selects a subset of elements based on a condition, producing a **new array** (possibly shorter). It's like a bouncer at a club — each element either gets in or doesn't.

\`[1, 2, 3, 4, 5].filter(x => x % 2 === 0)\` → \`[2, 4]\`

### \`Array.prototype.reduce()\`

**Reduce** aggregates an array into a **single value**. It takes a callback with an accumulator and the current element. The accumulator carries the running result across each step. It's the most versatile of the three — you can use it to implement both \`map\` and \`filter\`.

\`[1, 2, 3].reduce((sum, x) => sum + x, 0)\` → \`6\`

### The Real Power: Chaining

These methods return **new arrays**, which means you can chain them together. Instead of writing nested loops and intermediate variables, you compose transformations in a pipeline: filter → map → reduce. This reads like a sentence and is much easier to reason about.

### Why It Matters

These methods encourage **immutability** (never mutating the original array), **composability** (chaining operations), and **declarative thinking** (focusing on the "what"). They reduce bugs, improve readability, and are used extensively in frameworks like React (with \`state.map(...)\`) and data processing pipelines.

The example below works with a product catalog, demonstrating each method individually and then combining all three.`,
    code: `const products = [
  { name: "Laptop",  price: 999, category: "electronics" },
  { name: "Book",    price: 12,  category: "education" },
  { name: "Phone",   price: 699, category: "electronics" },
  { name: "Pen",     price: 2,   category: "education" },
  { name: "Tablet",  price: 499, category: "electronics" },
];

// Map: transform each product into just its name
const names = products.map(p => p.name);
console.log("All products:", names.join(", "));

// Filter: only items that cost more than $100
const expensive = products.filter(p => p.price > 100);
console.log("Over $100:", expensive.map(p => p.name + " ($" + p.price + ")").join(", "));

// Reduce: calculate the total price of everything
const total = products.reduce((sum, p) => sum + p.price, 0);
console.log("Total value: $" + total);

// Chaining: sum of electronics only
const electronicsTotal = products
  .filter(p => p.category === "electronics")
  .map(p => p.price)
  .reduce((sum, price) => sum + price, 0);
console.log("Electronics total: $" + electronicsTotal);

// Chaining: build a formatted list of affordable items
const summary = products
  .filter(p => p.price <= 100)
  .map(p => "  " + p.name + ": $" + p.price)
  .reduce((text, line) => text + "\\n" + line, "Items under $100:");
console.log(summary);`,
    expectedOutput: `All products: Laptop, Book, Phone, Pen, Tablet
Over $100: Laptop ($999), Phone ($699), Tablet ($499)
Total value: $2211
Electronics total: $2197
Items under $100:
  Book: $12
  Pen: $2`,
    hints: [
      'Always use map/filter/reduce instead of for loops when you\'re transforming data — your code will be more readable and less error-prone.',
      'Remember: map and filter always return a new array (never undefined). If you forget to return a value in the callback, map will fill the array with undefined.',
      'The second argument to reduce (0 in our example) is the initial value. Always provide it — otherwise reduce uses the first element as the initial value, which can cause bugs with empty arrays.',
    ],
    tags: ['arrays', 'map', 'filter', 'reduce', 'functional-programming'],
  },
  {
    id: 'big-o-notation',
    title: 'What is Big O Notation?',
    description: 'Learn to analyze algorithm efficiency using Big O notation — the standard way computer scientists describe how code scales with input size.',
    difficulty: 'beginner',
    category: 'Computer Science',
    duration: '6 min read',
    content: `## What is Big O Notation?

**Big O notation** describes how an algorithm's performance scales as the input size (\`n\`) grows. It answers the question: *"If my input gets 10x bigger, how much slower does my code get?"*

### Common Complexities (from best to worst)

| Complexity | Name | Example | Growth |
|---|---|---|---|
| **O(1)** | Constant | Array access by index | No growth |
| **O(log n)** | Logarithmic | Binary search | Very slow growth |
| **O(n)** | Linear | Loop through array | Proportional |
| **O(n log n)** | Linearithmic | Efficient sorting | Slightly more than linear |
| **O(n²)** | Quadratic | Nested loops | Proportional to square |
| **O(2ⁿ)** | Exponential | Recursive Fibonacci (naive) | Doubles with each +1 |

### Why It Matters

A naive algorithm that works fine for 100 items might take **hours** for 1 million items, while an optimized algorithm handles it in **milliseconds**. Big O gives you the vocabulary to compare approaches and make smart decisions.

### Key Principles

- **Drop constants**: O(2n) simplifies to O(n) — we care about the growth *trend*, not exact counts
- **Drop lower-order terms**: O(n² + n) simplifies to O(n²) — the highest-order term dominates for large n
- **Consider worst case**: Big O typically describes the worst-case scenario unless stated otherwise
- **Space matters too**: "Time complexity" is about operations, "space complexity" is about memory usage

### Visualizing Growth

The table in the example code shows exactly how each complexity grows as \`n\` increases from 10 to 100,000. Notice how O(n²) explodes — at n=100,000 it requires nearly **5 billion** operations, while O(log n) only needs 17. This is why algorithm choice matters so much for large datasets.

Big O is your compass for writing code that scales. The earlier you learn to think in terms of complexity, the better your architectural decisions will be.`,
    code: `function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(0) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return String(n);
}

function bigO(n) {
  return {
    constant: 1,
    logarithmic: Math.ceil(Math.log2(n)),
    linear: n,
    quadratic: (n * (n - 1)) / 2,
  };
}

console.log("Operations needed at different input sizes (n):\\n");
console.log("      n     O(1)  O(log n)      O(n)      O(n²)");
console.log("  ─────────────────────────────────────────────────");

for (const n of [10, 100, 1000, 10000, 100000]) {
  const { constant, logarithmic, linear, quadratic } = bigO(n);
  const row = [
    String(n).padStart(7),
    String(constant).padStart(5),
    String(logarithmic).padStart(8),
    String(linear).padStart(8),
    formatNum(quadratic).padStart(9),
  ];
  console.log("  " + row.join("  "));
}

console.log("\\nKey takeaway:");
console.log("  O(n²) grows explosively — avoid nested loops on large datasets.");
console.log("  O(log n) grows slowly — binary search is incredibly efficient.");`,
    expectedOutput: `Operations needed at different input sizes (n):

      n     O(1)  O(log n)      O(n)      O(n²)
  ─────────────────────────────────────────────────
       10      1         4        10         45
      100      1         7       100      4950
     1000      1        10      1000      500K
    10000      1        14     10000        50M
   100000      1        17    100000      5000M

Key takeaway:
  O(n²) grows explosively — avoid nested loops on large datasets.
  O(log n) grows slowly — binary search is incredibly efficient.`,
    hints: [
      'Focus on the worst-case growth rate. O(n) means "at most proportional to n" — the algorithm might sometimes finish faster, but never slower than linear.',
      'When analyzing code, count nested loops: one loop = O(n), two nested loops = O(n²), three nested loops = O(n³). Each level of nesting multiplies.',
      'Don\'t forget about space complexity! An algorithm might be O(n log n) time but O(n) space — make sure to consider both when choosing an approach.',
    ],
    tags: ['big-o', 'algorithms', 'complexity', 'performance', 'computer-science'],
  },
  {
    id: 'event-loop',
    title: 'How the Event Loop Works',
    description: 'Understand the heart of JavaScript\'s concurrency model — the event loop that manages the call stack, microtasks, and macrotasks.',
    difficulty: 'intermediate',
    category: 'Runtime & Concurrency',
    duration: '7 min read',
    content: `## How the Event Loop Works

JavaScript has a single **call stack** — it can only do one thing at a time. Yet it can handle network requests, user clicks, timers, and file reads without freezing. How? The **event loop**.

### The Core Components

1. **Call Stack**: Where your synchronous code executes. Each function call is pushed on, and popped off when it returns.

2. **Web APIs / Node APIs**: Browser or Node.js APIs (like \`setTimeout\`, \`fetch\`, \`fs.readFile\`) run operations in the background, outside the main thread.

3. **Microtask Queue**: Holds Promises (\`.then\`, \`await\` continuation). This queue has **higher priority** and is drained completely before moving on.

4. **Macrotask Queue**: Holds callbacks from \`setTimeout\`, \`setInterval\`, I/O events, and UI rendering. This queue has **lower priority**.

### The Event Loop Cycle

The event loop continuously checks:
1. **Is the call stack empty?** If not, keep executing.
2. **Are there microtasks?** If yes, execute ALL of them (the entire queue is drained).
3. **Are there macrotasks?** Execute ONE macrotask.
4. **Render** (browser only) — update the screen if needed.
5. Repeat.

This means: **microtasks always run before the next macrotask**. Even if you schedule a \`setTimeout(..., 0)\`, it won't fire until all pending Promises have resolved.

### Why This Matters

Understanding the event loop prevents surprises like "Why did my \`setTimeout(cb, 0)\` not run immediately?" or "Why does \`await\` sometimes seem to reorder my code?" It also helps you write performant code — batching DOM reads/writes, avoiding long-running synchronous operations that block the stack, and using microtasks for work that must complete before rendering.

The example below demonstrates the exact execution order of synchronous code, microtasks, and macrotasks.`,
    code: `console.log("1. Script start");

// Schedule a macrotask (setTimeout)
setTimeout(function () {
  console.log("5. setTimeout callback (macrotask)");
}, 0);

// Schedule microtasks (Promises)
Promise.resolve()
  .then(function () {
    console.log("3. First Promise.then (microtask 1)");
  })
  .then(function () {
    console.log("4. Second Promise.then (microtask 2)");
  });

// This runs synchronously — it's on the call stack NOW
console.log("2. Script end");

// --- Execution order explanation ---
// 1 & 2: Synchronous code on the call stack runs first (top to bottom)
// 3 & 4: After the call stack is empty, the microtask queue is drained
//        (ALL microtasks run before any macrotask)
// 5: Only after the microtask queue is empty does the event loop
//        process the macrotask queue (setTimeout callback)`,
    expectedOutput: `1. Script start
2. Script end
3. First Promise.then (microtask 1)
4. Second Promise.then (microtask 2)
5. setTimeout callback (macrotask)`,
    hints: [
      'The golden rule: microtasks ALWAYS run before macrotasks. If you schedule a setTimeout(fn, 0) and a Promise.resolve().then(fn), the Promise handler runs first.',
      'The call stack must be completely empty before the event loop starts processing queues. Long-running synchronous functions block everything.',
      'In Node.js, process.nextTick() has even higher priority than Promises — it runs before the microtask queue is processed.',
    ],
    tags: ['event-loop', 'call-stack', 'microtasks', 'macrotasks', 'concurrency', 'runtime'],
  },
  {
    id: 'generators',
    title: 'Generators in JavaScript',
    description: 'Learn about generator functions, the yield keyword, and how they enable lazy evaluation, infinite sequences, and custom iteration patterns.',
    difficulty: 'intermediate',
    category: 'Advanced JavaScript',
    duration: '6 min read',
    content: `## Generators in JavaScript

A **generator** is a special kind of function that can **pause** its execution and **resume** later. It's declared with a \`function*\` syntax and uses the \`yield\` keyword to produce values one at a time.

### How Generators Work

When you call a generator function, it doesn't execute immediately. Instead, it returns a **generator object** — an iterator with a \`.next()\` method. Each call to \`.next()\` runs the generator until it hits the next \`yield\` expression, pauses, and returns the yielded value.

A generator result has two properties:
- \`value\`: the yielded value
- \`done\`: \`false\` if the generator can produce more values, \`true\` when it finishes

### Why Generators Matter

1. **Lazy evaluation**: Values are computed on-demand, not all at once. This means you can work with conceptually infinite sequences (like all Fibonacci numbers) without running out of memory — you only generate values as you need them.

2. **Custom iteration**: Generators are iterables, so they work with \`for...of\`, the spread operator (\`[...]\`), and destructuring. This makes them perfect for creating custom data structures with complex traversal logic.

3. **Cooperative concurrency**: Generators can yield control back to the caller at any point. This pattern (sometimes called "coroutines") is used by libraries like \`co\` and was the foundation for async/await before it became native syntax.

4. **Clean stateful iteration**: Unlike closures with counters, generators handle iteration state naturally through their execution context — the function "remembers" where it left off between calls.

### The \`yield*\` Delegate

The \`yield*\` keyword delegates to another generator or iterable, flattening nested iteration. You can also pass values *into* a generator with \`gen.next(value)\`, enabling two-way communication.

The example below demonstrates a range generator, an infinite Fibonacci sequence (safely consumed in finite chunks), and a reusable \`take()\` utility for limiting generator output.`,
    code: `// Generator: range of numbers
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

console.log("Range 1 to 5:");
for (const num of range(1, 5)) {
  console.log("  " + num);
}

// Generator: infinite Fibonacci sequence
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Utility: take first N values from any generator
function* take(gen, count) {
  for (let i = 0; i < count; i++) {
    const { value, done } = gen.next();
    if (done) return;
    yield value;
  }
}

const first10 = [...take(fibonacci(), 10)];
console.log("\\nFirst 10 Fibonacci numbers:");
console.log("  " + first10.join(", "));

// Utility: take while a condition holds
function* takeWhile(gen, predicate) {
  for (const value of gen) {
    if (!predicate(value)) return;
    yield value;
  }
}

const under100 = [...takeWhile(fibonacci(), n => n <= 100)];
console.log("\\nFibonacci numbers under 100:");
console.log("  " + under100.join(", "));
console.log("  Count:", under100.length);

// Generators are lazy — no work is done until consumed
console.log("\\nKey: Generators produce values ON DEMAND.");
console.log("  The Fibonacci generator above is infinite,");
console.log("  but we only compute what we ask for.");`,
    expectedOutput: `Range 1 to 5:
  1
  2
  3
  4
  5

First 10 Fibonacci numbers:
  0, 1, 1, 2, 3, 5, 8, 13, 21, 34

Fibonacci numbers under 100:
  0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
  Count: 12

Key: Generators produce values ON DEMAND.
  The Fibonacci generator above is infinite,
  but we only compute what we ask for.`,
    hints: [
      'A generator function doesn\'t execute until you call .next() on it (or iterate with for...of). The function body is "frozen" between yields.',
      'Use yield* to delegate to another generator or iterable — it yields every value from the inner generator before continuing.',
      'Generators can receive values from the caller via gen.next(value). The passed value becomes the result of the yield expression inside the generator.',
    ],
    tags: ['generators', 'iterators', 'yield', 'lazy-evaluation', 'es6'],
  },
  {
    id: 'prototype-chain',
    title: 'Prototype Chain',
    description: 'Deep dive into JavaScript\'s prototype-based inheritance system — understand how objects delegate to their prototypes and how the chain is built.',
    difficulty: 'advanced',
    category: 'Object-Oriented JavaScript',
    duration: '8 min read',
    content: `## The Prototype Chain

JavaScript doesn't use classical class-based inheritance (despite the modern \`class\` syntax). Under the hood, it uses **prototypal inheritance** — objects can directly inherit from other objects via an internal link called \`[[Prototype]]\`, accessible as \`__proto__\` (or through \`Object.getPrototypeOf()\`).

### How Property Lookup Works

When you access a property on an object (e.g., \`dog.speak()\`), JavaScript:
1. Checks if the object itself has that property (own property)
2. If not, follows the \`[[Prototype]]\` link to the parent object and checks there
3. Continues up the chain until it finds the property or reaches \`Object.prototype\`
4. If \`Object.prototype\` doesn't have it either, returns \`undefined\`

This chain is called the **prototype chain**. Every object (except \`Object.create(null)\`) ultimately chains to \`Object.prototype\`, whose \`__proto__\` is \`null\` — the end of the chain.

### Constructor Functions and Prototypes

Before ES6 \`class\`, JavaScript used **constructor functions** combined with prototype assignment:

- \`new Animal("Rex")\` creates a new object, sets its \`__proto__\` to \`Animal.prototype\`, and runs the constructor function with \`this\` bound to the new object
- Methods shared by all instances go on \`Animal.prototype\` (not inside the constructor) — this saves memory
- Inheritance is set up by making \`Dog.prototype = Object.create(Animal.prototype)\`

### \`class\` Is Syntactic Sugar

The modern \`class\` keyword doesn't introduce new inheritance mechanics. It compiles down to constructor functions and prototype manipulation. Understanding the prototype chain is essential for debugging, metaprogramming, and using advanced patterns like mixins.

### Why It Matters

Understanding prototypes helps you:
- Debug "method not found" errors by tracing the chain
- Write memory-efficient code (shared methods on the prototype)
- Implement mixins and composition patterns
- Understand how built-in methods (\`.toString()\`, \`.hasOwnProperty()\`) work
- Properly use \`Object.create()\`, \`Object.keys()\` vs \`for...in\`, and the \`in\` operator

The code below builds an inheritance hierarchy with \`Animal\` and \`Dog\` and traces the full prototype chain.`,
    code: `// Constructor function pattern
function Animal(name) {
  this.name = name;
}

// Shared methods go on the prototype
Animal.prototype.speak = function () {
  return this.name + " makes a sound.";
};

// Inheritance: Dog extends Animal
function Dog(name, breed) {
  Animal.call(this, name); // Call parent constructor
  this.breed = breed;
}

// Set up the prototype chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // Fix constructor reference

Dog.prototype.bark = function () {
  return this.name + " (a " + this.breed + ") barks!";
};

const dog = new Dog("Rex", "German Shepherd");

console.log("Instance:", dog.name, "-", dog.breed);
console.log("Own method (bark):", dog.bark());
console.log("Inherited method (speak):", dog.speak());

// Trace the prototype chain
console.log("\\nPrototype chain:");
console.log("  dog.__proto__ === Dog.prototype:",
  dog.__proto__ === Dog.prototype);
console.log("  Dog.prototype.__proto__ === Animal.prototype:",
  Dog.prototype.__proto__ === Animal.prototype);
console.log("  Animal.prototype.__proto__ === Object.prototype:",
  Animal.prototype.__proto__ === Object.prototype);
console.log("  Object.prototype.__proto__:",
  Object.prototype.__proto__);

// Own vs inherited properties
console.log("\\nProperty ownership:");
console.log("  dog.hasOwnProperty('name'):", dog.hasOwnProperty("name"));
console.log("  dog.hasOwnProperty('speak'):", dog.hasOwnProperty("speak"));
console.log("  'speak' in dog:", "speak" in dog);
console.log("  'breed' in dog:", "breed" in dog);`,
    expectedOutput: `Instance: Rex - German Shepherd
Own method (bark): Rex (a German Shepherd) barks!
Inherited method (speak): Rex makes a sound.

Prototype chain:
  dog.__proto__ === Dog.prototype: true
  Dog.prototype.__proto__ === Animal.prototype: true
  Animal.prototype.__proto__ === Object.prototype: true
  Object.prototype.__proto__: null

Property ownership:
  dog.hasOwnProperty('name'): true
  dog.hasOwnProperty('speak'): false
  'speak' in dog: true
  'breed' in dog: true`,
    hints: [
      'Always use Object.create() to set up inheritance — never do Child.prototype = new Parent() (it runs the parent constructor unnecessarily and can cause issues with shared reference types).',
      'hasOwnProperty() checks only own properties, while the "in" operator checks the entire prototype chain. Object.keys() also only returns own enumerable properties.',
      'Modern class syntax is cleaner but produces the same prototype chain. You can mix both — a class extends a constructor function, or vice versa.',
    ],
    tags: ['prototypes', 'inheritance', 'oop', 'constructors', 'prototype-chain'],
  },
  {
    id: 'dynamic-programming',
    title: 'Dynamic Programming Basics',
    description: 'Learn the fundamental technique of dynamic programming — breaking complex problems into overlapping subproblems and caching results for exponential speedups.',
    difficulty: 'advanced',
    category: 'Algorithms',
    duration: '10 min read',
    content: `## Dynamic Programming Basics

**Dynamic Programming (DP)** is an optimization technique for problems that exhibit two properties:

1. **Overlapping subproblems**: The same subproblems are solved multiple times. A naive recursive Fibonacci call computes \`fib(3)\` many times across different branches.

2. **Optimal substructure**: The optimal solution to the problem can be built from optimal solutions to its subproblems.

DP works by solving each subproblem **exactly once** and storing the result. When the same subproblem appears again, you reuse the stored result instead of recomputing it.

### Two Approaches

**Top-down (Memoization)**: Start with the original problem, recursively break it down, and cache results. This is often the more intuitive approach — it's recursive DP with a cache. The first time \`fib(n)\` is computed, it's stored. Subsequent calls return the cached value instantly.

**Bottom-up (Tabulation)**: Start from the smallest subproblems, fill a table iteratively, and build up to the final answer. This avoids recursion entirely and is often slightly faster (no call stack overhead). For Fibonacci, you compute \`fib(0)\`, \`fib(1)\`, \`fib(2)\`, ... up to \`fib(n)\`.

### The Coin Change Problem

A classic DP problem: given coins of different denominations, find the **minimum number of coins** needed to make a given amount.

Define \`dp[i]\` = minimum coins to make amount \`i\`. For each amount from 1 to the target, try every coin denomination and pick the one that results in the fewest coins:

\`dp[i] = min(dp[i], dp[i - coin] + 1)\` for each coin ≤ i

### Why It Matters

DP turns **exponential** algorithms into **polynomial** ones. The naive Fibonacci is O(2ⁿ) — it would take billions of operations for n=50. With DP, it's O(n) — 50 operations. This is the single most impactful optimization technique for a wide class of problems.

The example below implements Fibonacci with both approaches and solves the coin change problem.`,
    code: `// Top-down: Fibonacci with memoization
function fibMemo(n, memo) {
  if (memo === undefined) memo = {};
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

console.log("Fibonacci — Top-down (memoization):");
console.log("  fib(10) =", fibMemo(10));
console.log("  fib(30) =", fibMemo(30));
console.log("  fib(50) =", fibMemo(50));

// Bottom-up: Fibonacci with tabulation
function fibTab(n) {
  if (n <= 1) return n;
  var table = [0, 1];
  for (var i = 2; i <= n; i++) {
    table[i] = table[i - 1] + table[i - 2];
  }
  return table[n];
}

console.log("\\nFibonacci — Bottom-up (tabulation):");
console.log("  fib(10) =", fibTab(10));
console.log("  fib(30) =", fibTab(30));
console.log("  fib(50) =", fibTab(50));

// Classic DP problem: Coin Change (minimum coins)
function coinChange(coins, amount) {
  var dp = [];
  for (var i = 0; i <= amount; i++) dp[i] = Infinity;
  dp[0] = 0;

  for (var i = 1; i <= amount; i++) {
    for (var c = 0; c < coins.length; c++) {
      if (coins[c] <= i) {
        dp[i] = Math.min(dp[i], dp[i - coins[c]] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log("\\nCoin Change — minimum coins needed:");
console.log("  coins=[1,5,10,25], amount=30  →", coinChange([1, 5, 10, 25], 30), "coins");
console.log("  coins=[1,5,10,25], amount=99  →", coinChange([1, 5, 10, 25], 99), "coins");
console.log("  coins=[2,3,6],     amount=7   →", coinChange([2, 3, 6], 7), "coins");
console.log("  coins=[5],         amount=3   →", coinChange([5], 3), "coins");`,
    expectedOutput: `Fibonacci — Top-down (memoization):
  fib(10) = 55
  fib(30) = 832040
  fib(50) = 12586269025

Fibonacci — Bottom-up (tabulation):
  fib(10) = 55
  fib(30) = 832040
  fib(50) = 12586269025

Coin Change — minimum coins needed:
  coins=[1,5,10,25], amount=30  → 2 coins
  coins=[1,5,10,25], amount=99  → 9 coins
  coins=[2,3,6],     amount=7   → 3 coins
  coins=[5],         amount=3   → -1 coins`,
    hints: [
      'Start by identifying the subproblems and the recurrence relation. Ask: "How can I express the answer for size n in terms of answers for smaller sizes?"',
      'Bottom-up is usually preferred in interviews because it avoids recursion depth limits and is easier to debug (you can print the DP table at any step).',
      'Not all recursive problems benefit from DP — only those with overlapping subproblems. If each recursive call leads to unique subproblems (like generating all permutations), DP doesn\'t help.',
    ],
    tags: ['dynamic-programming', 'memoization', 'tabulation', 'fibonacci', 'coin-change', 'optimization'],
  },
];
