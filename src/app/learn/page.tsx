// PHASE7: [D3] Replaced all hardcoded hex colors with design-system CSS variable classes
// PHASE4: Added fuzzy matching for explain command using Levenshtein distance
// PHASE3: Replaced hardcoded dark colors with theme-aware Tailwind classes
"use client";
// PHASE3: Mobile responsiveness - full-width lesson cards, sticky CLI input, scrollable content

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Play,
  RotateCcw,
  ChevronRight,
  GraduationCap,
  Terminal,
  BookOpen,
} from "lucide-react";
import { lessons } from "@/lib/lessons";
import { levenshtein } from "@/lib/offline-intelligence";
import { safeStorage } from "@/lib/utils";

// ── CLI Simulator Data ──

interface TerminalLine {
  id?: string;
  text: string;
  type: "input" | "output" | "error" | "success" | "info" | "heading";
}

const CLI_EXPLANATIONS: Record<string, string> = {
  recursion: `Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem. Every recursive function needs a base case (the condition that stops recursion) and a recursive case (where the function calls itself with modified arguments).

For example, a factorial function calculates n! by multiplying n by (n-1)!. The base case is 0! = 1 or 1! = 1. Without a base case, recursion runs infinitely until it hits a stack overflow.

Recursive solutions are elegant for problems like tree traversal, binary search, divide-and-conquer algorithms (merge sort, quicksort), and mathematical sequences (Fibonacci, towers of Hanoi). However, they use extra stack memory for each call, which can be O(n) space for simple recursion.

Tail recursion optimization (TCO) can reuse the same stack frame, making recursion as space-efficient as iteration in languages that support it (like Scheme, Rust, and ES6 in strict mode). JavaScript historically lacked TCO support in most engines, though it is part of the ES6 specification.

When choosing between recursion and iteration, consider readability vs. performance. For problems with natural recursive structure (trees, graphs, divide-and-conquer), recursion is often clearer. For simple loops, iteration is more efficient. Memoization can dramatically speed up recursive solutions by caching previously computed results.`,

  closures: `A closure is a function bundled with references to its surrounding lexical scope. In JavaScript, functions "close over" variables from their parent scope, retaining access to those variables even after the parent function has returned. This is one of the most powerful and fundamental concepts in JavaScript.

Closures are created every time a function is defined inside another function. The inner function maintains a reference to the outer function's variables, not a copy. This means if the outer variable changes later, the closure sees the updated value. For example, a function that creates counters can share private state through closures.

Common uses of closures include data privacy (module pattern), creating factory functions, maintaining state in callbacks and event handlers, and partial application/currying. Closures are also the foundation for higher-order functions like map, filter, and reduce.

A classic pitfall with closures in loops is the "var in loop" problem, where all closures created in a loop share the same variable reference. This was solved by let (block scoping) in ES6, or by using IIFEs (Immediately Invoked Function Expressions) in older code.

Closures also power React hooks — useState and useEffect work by creating closures that capture the current state value. Understanding closures is essential for debugging hook-related issues like stale closures, where a callback captures an outdated state value.`,

  async: `Asynchronous programming in JavaScript allows code to run without blocking the main thread. JavaScript is single-threaded but uses an event loop to handle concurrent operations through callbacks, Promises, and async/await syntax.

The async/await syntax, introduced in ES2017, provides a cleaner way to write asynchronous code that looks synchronous. An async function always returns a Promise. The await keyword pauses execution within the async function until the awaited Promise settles, then resumes with the resolved value or throws with the rejection reason.

Error handling in async/await uses try/catch blocks, which is more intuitive than .catch() chains. You can also use try/catch with multiple await calls, or use Promise.all() with await for parallel execution of independent async operations.

The event loop processes tasks in a specific order: microtasks (Promise callbacks, queueMicrotask) run before macrotasks (setTimeout, setInterval, I/O). This means Promise.then() callbacks always execute before setTimeout callbacks, even if the timeout is 0ms.

Common patterns include sequential execution (await one after another), parallel execution (Promise.all), racing (Promise.race), and allSettled (Promise.allSettled for getting all results regardless of failures). Async iterators and for-await-of loops handle streams of async data.

Understanding async is critical for modern web development — fetching data, handling file uploads, managing WebSocket connections, and building responsive UIs all depend on proper async handling.`,

  promises: `A Promise is an object representing the eventual completion or failure of an asynchronous operation. Promises have three states: pending, fulfilled (resolved), or rejected. Once settled, a Promise cannot change state again.

Promises are created using the new Promise constructor, which takes an executor function with resolve and reject parameters. The executor runs immediately when the Promise is created. You chain operations using .then() for success, .catch() for errors, and .finally() for cleanup regardless of outcome.

Promise chaining is a key pattern: each .then() returns a new Promise, allowing you to sequence async operations. If a .then() callback returns a value, it becomes the resolved value of the next Promise. If it returns a Promise, the chain waits for that Promise to settle.

Static Promise methods are incredibly useful: Promise.all() waits for all Promises to resolve (fails fast on first rejection), Promise.race() returns the first settled result, Promise.allSettled() waits for all and returns both fulfilled and rejected results, and Promise.any() returns the first fulfilled result (ignoring rejections until all fail).

Error handling with Promises follows bubbling semantics — an error in any .then() callback propagates down the chain until caught by a .catch(). Unhandled promise rejections can cause Node.js processes to crash, so always handle errors.

Promises replaced callback-based patterns ("callback hell" or "pyramid of doom") and are the foundation for async/await, which is syntactic sugar over Promises. Understanding Promise internals helps debug complex async flows and race conditions.`,

  "big-o": `Big O notation describes the upper bound of an algorithm's time or space complexity as a function of input size (n). It ignores constant factors and lower-order terms, focusing on how performance scales. For example, O(n) means linear time, O(n log n) means linearithmic, and O(n²) means quadratic.

Common time complexities from fastest to slowest: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(2ⁿ) exponential, O(n!) factorial. For practical purposes, O(n²) is usually the upper limit for acceptable performance on large datasets.

Space complexity follows the same notation but measures memory usage. An in-place algorithm uses O(1) extra space (e.g., in-place quicksort with Hoare partition), while merge sort uses O(n) auxiliary space for merging. Recursive algorithms have O(n) call stack space in the worst case.

Analyzing complexity involves counting fundamental operations: single statements are O(1), simple loops are O(n), nested loops multiply (O(n²) for two nested loops), and divide-and-conquer algorithms follow the Master Theorem (T(n) = aT(n/b) + O(nᵈ)).

Amortized analysis is important for dynamic arrays: while individual operations might be O(n) (array resize), the average over n operations is O(1). Hash maps provide O(1) average lookup, insert, and delete, with O(n) worst case due to hash collisions.

Understanding Big O is essential for choosing the right algorithm and data structure for your problem. An O(n log n) sort vs an O(n²) sort means the difference between handling 1M items in seconds vs hours.`,

  "event-loop": `The JavaScript event loop is the mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It continuously checks the call stack and task queues, pushing tasks onto the stack when it's empty.

The call stack follows LIFO (Last In, First Out) order. When a function is called, it's pushed onto the stack. When it returns, it's popped. Synchronous code runs entirely on the call stack. When an async operation is encountered (setTimeout, fetch, DOM event), the operation is handed off to browser/Node.js APIs, and a callback is registered.

The task queue (macrotask queue) holds callbacks from setTimeout, setInterval, I/O operations, and UI rendering events. The microtask queue holds callbacks from Promises (then/catch/finally), queueMicrotask, and MutationObserver. Microtasks have higher priority and always run before the next macrotask.

Each iteration of the event loop: 1) Execute all synchronous code on the call stack until empty, 2) Execute all microtasks until the microtask queue is empty, 3) Render the UI (if needed), 4) Take one macrotask from the macrotask queue and execute it, 5) Repeat.

A common gotcha: setTimeout(fn, 0) does not execute immediately. It registers a macrotask that runs after the current stack clears and all microtasks complete. This is why Promise.resolve().then(fn) runs before setTimeout(fn, 0).

In Node.js, the event loop has additional phases: timers, pending callbacks, idle/prepare, poll, check (setImmediate), and close callbacks. Understanding these phases helps optimize server-side I/O operations and avoid blocking the event loop with CPU-intensive tasks.`,

  "map-filter-reduce": `map, filter, and reduce are three foundational array methods in JavaScript that enable functional programming patterns. Together, they replace many traditional for loops with more expressive, composable, and less error-prone code.

Array.prototype.map() creates a new array by applying a callback function to each element. The callback receives (element, index, array) and should return the transformed value. map always returns an array of the same length. Common uses include transforming data, extracting properties, and formatting values.

Array.prototype.filter() creates a new array containing only elements that pass a test. The callback should return a truthy value for elements to include. filter preserves the original element values and order. It's ideal for removing unwanted items, finding subsets, and conditional inclusion.

Array.prototype.reduce() accumulates array elements into a single value (which can be an object, array, number, etc.). It takes an accumulator and current element, returning the new accumulator value. With an initial value, reduce is extremely versatile — it can implement map and filter, build frequency maps, flatten arrays, group data, and compose pipelines.

The power of these methods shines when chained: data.map(transform).filter(condition).reduce(aggregate) creates a readable data pipeline. Each step is a pure function with a clear purpose, making the code self-documenting.

Performance note: these methods always iterate the full array (unlike some/every which short-circuit). For very large arrays or performance-critical code, traditional loops can be faster. However, the readability benefits usually outweigh micro-optimization concerns.`,

  generators: `Generators are special functions in JavaScript that can pause execution and resume later, defined using the function* syntax. They return an iterator object with a next() method. Each call to next() resumes execution until the next yield expression.

When a generator encounters yield, it pauses and returns an object { value, done }. The value is the yielded expression, and done indicates whether the generator has completed. Generators maintain their local state between yields, making them ideal for lazy evaluation and stateful iteration.

Generators enable two-way communication: yield returns a value from the generator, and next(value) sends a value back in. This makes them useful for coroutines, implementing custom iteration logic, and creating infinite sequences (like Fibonacci generators that produce values on demand).

Key use cases include: lazy sequences (processing large datasets without loading everything into memory), async generators (function* + for-await-of for streaming data), implementing iterables (custom data structures), and cooperative multitasking patterns.

Generators also power async/await under the hood. An async function is essentially a generator that yields Promises, with the runtime automatically calling next() when each Promise resolves. yield* delegates to another generator, allowing composition of generator pipelines.

Symbol.iterator makes any object iterable by defining a generator function. This means custom classes can work with for...of, spread syntax, destructuring, and other iteration protocols. Generators are fundamental to understanding modern JavaScript's approach to data flow and control.`,

  prototype: `Every JavaScript object has an internal link to another object called its prototype. When you access a property on an object, JavaScript first looks for it on the object itself, then on its prototype, then on the prototype's prototype, continuing up the "prototype chain" until it reaches null (the end of the chain).

Functions in JavaScript have a prototype property that becomes the prototype of objects created with new. When you write new Person('Alice'), JavaScript creates a new object, sets its prototype to Person.prototype, executes the constructor, and returns the object. This is how inheritance works in JavaScript.

Methods defined on the prototype are shared across all instances, saving memory. A class with 1000 instances shares a single set of methods on the prototype, rather than having 1000 copies. This is why class methods are defined in the class body (which goes on the prototype), not in the constructor.

ES6 classes are syntactic sugar over the prototype system. class Person { constructor(name) { this.name = name; } greet() { ... } } is equivalent to function Person(name) { this.name = name; } Person.prototype.greet = function() { ... }. Understanding the prototype model helps debug issues with instanceof, hasOwnProperty, and method lookup.

The prototype chain is used by many built-in features: Object.create() creates objects with a specific prototype, Object.getPrototypeOf() retrieves the prototype, and Object.setPrototypeOf() changes it (though this is slow and generally discouraged). The __proto__ accessor exists but is deprecated in favor of Object.getPrototypeOf/setPrototypeOf.

Modern JavaScript supports class fields (properties defined in the class body), private fields (with # prefix), static methods and fields, and the super keyword for calling parent class methods. All of these build on top of the prototype system.`,

  dp: `Dynamic programming (DP) is an optimization technique that solves complex problems by breaking them into simpler overlapping subproblems, solving each subproblem once, and storing the results for reuse. It transforms exponential-time recursive solutions into polynomial-time iterative ones.

There are two main DP approaches: top-down (memoization) and bottom-up (tabulation). Top-down starts from the original problem and caches subproblem results recursively. Bottom-up builds up solutions from the smallest subproblems iteratively. Bottom-up is usually more space-efficient and avoids stack overflow.

The key to identifying DP problems is recognizing overlapping subproblems and optimal substructure. If the same subproblems are solved multiple times in a naive recursive approach, and the optimal solution to the main problem can be constructed from optimal solutions to subproblems, DP applies.

Classic DP problems include: Fibonacci (O(n) with tabulation vs O(2ⁿ) naive), longest common subsequence (LCS), longest increasing subsequence (LIS), knapsack problem (0/1 and unbounded), coin change, edit distance, matrix chain multiplication, and subset sum.

State design is the most critical part of DP. A good state captures all information needed to make a decision. For example, in the knapsack problem, the state is (items considered, remaining capacity). The number of state dimensions directly affects the time and space complexity.

Space optimization is often possible with DP. Since each state typically depends only on the previous state, you can reduce 2D tables to 1D arrays. For example, 0/1 knapsack with O(n*W) table becomes O(W) space by iterating items in reverse. This is a common interview optimization technique.`,

  variables: `JavaScript has three ways to declare variables: var, let, and const. Understanding their differences is fundamental to writing correct JavaScript code. var is function-scoped and hoisted (initialized to undefined), while let and const are block-scoped and hoisted but in the "temporal dead zone" until their declaration.

const creates a read-only binding — the variable name cannot be reassigned. However, if the value is an object or array, its contents can still be modified. Use const by default for all declarations, and only use let when you need to reassign. Avoid var in modern code.

Variable hoisting means declarations are moved to the top of their scope during compilation. var declarations are hoisted and initialized to undefined, so accessing them before declaration returns undefined (no error). let and const are hoisted but not initialized — accessing them before declaration throws a ReferenceError.

The temporal dead zone (TDZ) is the period between entering a block and the let/const declaration. Variables in the TDZ cannot be accessed. This catches common bugs where variables are used before being properly initialized.

Shadowing occurs when an inner scope declares a variable with the same name as an outer scope. With let and const, shadowing creates a new binding in the inner scope. This is intentional and useful for closures, but can be confusing if not understood. JavaScript allows this, unlike some languages that prevent shadowing.

Global variables declared with var become properties of the window object (in browsers), while let and const globals do not. This is an important distinction for avoiding global namespace pollution in browser environments.`,

  "higher-order-functions": `A higher-order function is a function that either takes one or more functions as arguments, returns a function, or both. This is a core concept in functional programming and is fundamental to JavaScript's design. Many built-in JavaScript methods are higher-order functions.

Array methods like map, filter, reduce, sort, forEach, some, every, and find all accept callback functions as arguments. Function.prototype.bind, call, and apply are methods on functions that accept or modify other functions. setTimeout, setInterval, and event listeners are also examples of higher-order functions.

Creating higher-order functions enables powerful abstractions: function composition (combining small functions into complex operations), currying (transforming a function with multiple arguments into a sequence of unary functions), partial application (pre-filling some arguments of a function), and middleware patterns (processing pipelines where each step transforms the input).

Function composition, often written as compose(f, g)(x) = f(g(x)), allows building complex transformations from simple, testable pieces. Libraries like Ramda and Lodash/fp provide composition utilities. The pipe operator (|>) proposed for JavaScript would make composition even more readable.

 closures and higher-order functions are deeply connected. A higher-order function that returns an inner function creates a closure, allowing the inner function to access the outer function's parameters and variables. This is the basis for patterns like factories, decorators, and memoization.`,

  destructuring: `Destructuring is a JavaScript expression that allows you to unpack values from arrays or properties from objects into distinct variables. Introduced in ES6, it provides a concise syntax for extracting data and is widely used in modern JavaScript code.

Object destructuring uses curly braces: const { name, age } = person. You can rename variables ({ name: userName }), set default values ({ age = 25 }), nest destructuring patterns, and use computed property keys. Function parameters can be destructured directly: function greet({ name, age }) { ... }.

Array destructuring uses square brackets: const [first, second, rest] = array. You can skip elements ([, , third]), use the rest operator ([first, ...rest]), swap variables without a temp ([a, b] = [b, a]), and set defaults. Combined destructuring works with arrays of objects and objects containing arrays.

Destructuring is particularly useful with function return values, API responses, React component props, and import statements. Named imports in ES modules use destructuring: import { useState, useEffect } from 'react'.

Advanced patterns include destructuring in for-of loops (for (const { name } of users)), destructuring parameters in callbacks (.map(({ id, name }) => ...)), and conditional destructuring using default values for potentially undefined objects.`,

  modules: `JavaScript modules (ES modules, ESM) are the standard way to organize code into reusable, encapsulated files. Introduced in ES2015 and supported natively in browsers and Node.js since v12, modules use import and export syntax and enable static analysis, tree-shaking, and lazy loading.

Export types include named exports (export const x = 1; export function foo() {}), default exports (export default class {}), and re-exports (export { foo } from './other'). Named imports use curly braces (import { foo, bar } from './module'), default imports use any name (import MyComponent from './Component'), and namespace imports collect all exports (import * as utils from './utils').

Modules have key differences from scripts: strict mode is automatic, variables are module-scoped (not global), this is undefined at the top level, and imports are "live bindings" — they always reflect the current value of the exported variable, not a snapshot at import time.

Dynamic imports (import('./module')) return Promises and enable code-splitting and lazy loading. This is essential for performance optimization: load heavy dependencies only when needed. Webpack, Vite, and other bundlers use dynamic imports to create separate chunks.

CommonJS (require/module.exports) is the older Node.js module system. ESM and CJS differ in evaluation timing (ESM is static, CJS is dynamic), resolution algorithm, and this binding. Understanding both is important for working in Node.js ecosystems.`,

  "error-handling": `Proper error handling in JavaScript involves using try/catch/finally blocks, error propagation patterns, custom error classes, and defensive programming techniques. Errors in JavaScript are objects with name, message, and stack properties, inheriting from the Error prototype.

The try/catch/finally pattern is the primary error handling mechanism. Code that might throw goes in try, error handling in catch, and cleanup code (always executed) in finally. Nested try/catch blocks and re-throwing (throw err) allow for layered error handling strategies.

Custom error classes extend Error to create domain-specific error types: class ValidationError extends Error { constructor(field, message) { super(message); this.name = 'ValidationError'; this.field = field; } }. This enables type-specific catch blocks using instanceof checks.

Asynchronous error handling differs: Promise rejections are caught with .catch() or try/catch in async functions. Unhandled rejections can crash Node.js processes. Promise.allSettled() catches all errors while Promise.all() fails fast.

Common error patterns include the "fail fast" principle (validate inputs early), the "return early" pattern (check conditions and return to reduce nesting), and the "error boundary" pattern (in React, catching errors in the component tree). Logging errors with context (what operation failed, what inputs were provided) makes debugging significantly easier.`,

  typescript: `TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static type checking, interfaces, generics, enums, and other features that catch errors at compile time rather than runtime, significantly improving developer experience and code maintainability.

TypeScript's type system is structural (duck typing), not nominal. Two types are compatible if they have the same shape, regardless of their declared names. This means { x: number; y: number } is compatible with interfaces that have the same properties, without explicit extends or implements.

Key TypeScript features include: interfaces for object shapes, type aliases and unions for flexible typing, generics for reusable abstractions, utility types (Partial, Required, Pick, Omit, Record), and declaration files (.d.ts) for consuming untyped JavaScript libraries.

Type narrowing is TypeScript's ability to refine types within conditional branches. Using typeof, instanceof, in operator, and user-defined type guards (function isString(x: unknown): x is string), TypeScript narrows the type from a union to a specific member.

Advanced patterns include mapped types, conditional types, template literal types, and recursive types. These enable powerful type-level programming, though they should be used judiciously to avoid over-engineering type definitions that are hard to understand and maintain.

TypeScript strict mode enables all type-checking options: strictNullChecks (catches null/undefined errors), noImplicitAny (requires explicit types), strictFunctionTypes (contravariant function parameter checking), and more. Always enable strict mode for maximum safety.`,

  arrays: `JavaScript arrays are dynamic, ordered collections that can hold mixed types. They are actually special objects with numeric indices and a length property, inheriting from Array.prototype which provides a rich set of methods for manipulation and transformation.

Mutable array methods modify the original array: push, pop, shift, unshift, splice, sort, reverse, fill, and copyWithin. Immutable methods return new arrays: map, filter, slice, concat, flat, flatMap, toSorted, toReversed, and toSpliced (ES2023).

Array spread syntax (...) creates shallow copies and combines arrays: [...arr1, ...arr2]. Destructuring extracts elements: const [first, ...rest] = arr. The Array.from() and Array.of() static methods create arrays from iterables or arguments.

Searching arrays: indexOf, lastIndexOf, includes for value search; find, findIndex, findLast for predicate search; some, every for testing all/any elements. ES2024 adds findLast and findLastIndex.

Multi-dimensional arrays are simulated as arrays of arrays. Common operations include matrix traversal, transposition, flattening (arr.flat(Infinity)), and grouping (Object.groupBy in ES2024 or reduce-based approaches).

Performance considerations: Array access is O(1), push/pop at the end are amortized O(1), but shift/unshift at the beginning are O(n) because all elements must be reindexed. For queues, consider using a linked list or a two-stack approach for O(1) enqueue/dequeue.`,

  objects: `Objects in JavaScript are collections of key-value pairs where keys are strings or Symbols, and values can be anything including other objects, functions, and arrays. Objects serve as the foundation for almost everything in JavaScript — even functions and arrays are objects under the hood.

Property access uses dot notation (obj.name) or bracket notation (obj['name']). Bracket notation supports dynamic keys and keys that aren't valid identifiers. Object.keys(), Object.values(), and Object.entries() provide iteration. Object.hasOwn() checks own properties (preferred over hasOwnProperty).

Modern object features include: computed property names ({ [key]: value }), shorthand properties ({ name } instead of { name: name }), spread operator ({ ...defaults, ...custom }), optional chaining (obj?.nested?.prop), and nullish coalescing (obj.value ?? fallback).

Object.freeze() makes an object immutable (shallow), Object.seal() prevents adding/deleting properties, and Object.assign() or spread merges objects. For deep cloning, structuredClone() (ES2022) handles most cases including Dates, Maps, Sets, and Arrays.

JavaScript classes use objects and prototypes under the hood. Private class fields (with # prefix) provide true encapsulation. Getters and setters (get/set keywords) enable computed properties. Static members belong to the class itself, not instances.`,

  "this-keyword": `The value of "this" in JavaScript depends on how a function is called, not where it is defined. This is one of the most confusing aspects of JavaScript, especially for developers coming from class-based languages where "this" always refers to the current instance.

In a method call (obj.method()), "this" refers to the object before the dot. In a standalone function call, "this" is undefined in strict mode or the global object in non-strict mode. Arrow functions capture "this" from their enclosing lexical scope, making them ideal for callbacks.

bind(), call(), and apply() explicitly set "this": func.bind(thisArg) returns a new function with bound "this", func.call(thisArg, ...args) calls with temporary "this", and func.apply(thisArg, argsArray) is similar but accepts an array of arguments. bind is commonly used to fix "this" in event handlers and callbacks.

In class constructors, "this" refers to the newly created instance. In arrow functions within class methods, "this" still refers to the instance because it inherits from the enclosing scope. This is why arrow functions are preferred for React event handlers and callbacks.

A common pitfall is losing "this" context when passing methods as callbacks: const fn = obj.method; fn() loses the "this" binding. Solutions include arrow functions (const fn = () => obj.method()), bind (const fn = obj.method.bind(obj)), or using arrow functions in class definitions.`,

  fetch: `The Fetch API is the modern standard for making HTTP requests in JavaScript. It returns Promises, works in both browsers and Node.js (since v18), and supports all HTTP methods, headers, streaming, request/response objects, and more.

A basic GET request: fetch('/api/data').then(res => res.json()).then(data => console.log(data)).catch(err => console.error(err)). With async/await: const res = await fetch('/api/data'); const data = await res.json();.

POST requests include method, headers, and body: fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Alice' }) }). The body can be JSON, FormData, URLSearchParams, Blob, ArrayBuffer, or a ReadableStream.

Error handling with fetch requires checking res.ok (or res.status) because fetch only rejects on network errors, not HTTP errors (4xx, 5xx). Always check: if (!res.ok) throw new Error(\`HTTP \${res.status}\`);

Advanced features include AbortController for canceling requests (useful for cleanup in React useEffect), request/response cloning (res.clone()), streaming responses (res.body.getReader()), cache control, CORS handling, and request/response headers manipulation.

For loading states, fetch provides no built-in mechanism. Common patterns include wrapping fetch in custom hooks (useFetch) with loading, error, and data states. React Query and SWR are popular libraries that add caching, deduplication, background refresh, and optimistic updates on top of fetch.`,

  dom: `The Document Object Model (DOM) is a tree-structured representation of an HTML document. JavaScript interacts with the DOM to read and modify page content, structure, and style. Understanding DOM manipulation is essential for web development, even with frameworks like React.

DOM selection methods: document.getElementById(), document.querySelector() (CSS selector, first match), document.querySelectorAll() (all matches as NodeList), and methods on Element like getElementsByClassName(). querySelector/querySelectorAll are the most versatile and commonly used.

DOM manipulation: createElement(), createTextNode(), appendChild(), removeChild(), insertBefore(), replaceChild(). Modern methods: element.append(), element.prepend(), element.before(), element.after(), element.remove(). innerHTML is convenient but has XSS risks — use textContent for safe text insertion.

Events are the backbone of interactivity: addEventListener() registers handlers, removeEventListener() cleans up. Event bubbling (from target up to document) and capturing (opposite direction) are the two propagation phases. stopPropagation() stops further propagation, preventDefault() cancels the default action.

DOM performance matters: batch reads and writes to avoid layout thrashing (reading layout properties forces browser recalculation), use DocumentFragment for batch insertions, prefer CSS animations over JavaScript animations, and use requestAnimationFrame for visual updates.

Modern frameworks (React, Vue, Svelte) use virtual DOM or compilation to optimize DOM updates. Understanding raw DOM manipulation helps debug framework issues, build accessible components, and optimize performance when frameworks add too much abstraction overhead.`,
};

const RUN_EXAMPLES: Record<string, { code: string; explanation: string }> = {
  python: {
    code: `# Quick Sort in Python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Test it
numbers = [3, 6, 8, 10, 1, 2, 1]
print(f"Sorted: {quicksort(numbers)}")
# Output: Sorted: [1, 1, 2, 3, 6, 8, 10]`,
    explanation: `Quick Sort is a divide-and-conquer algorithm that selects a "pivot" element, partitions the array into elements less than, equal to, and greater than the pivot, then recursively sorts the sub-arrays. Average time complexity is O(n log n), worst case O(n²) if the pivot is always the smallest or largest element.`,
  },
  javascript: {
    code: `// Debounce function in JavaScript
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Usage: rate-limit a search input
const search = debounce((query) => {
  console.log(\`Searching for: \${query}\`);
  // In real app: fetch(\`/api/search?q=\${query}\`)
}, 300);

search("hello");
search("hello world");  // Only this one fires after 300ms`,
    explanation: `Debounce delays function execution until a specified time has elapsed since the last invocation. It's essential for optimizing event handlers (search inputs, window resize, scroll) by preventing rapid successive calls. Each call resets the timer, so only the final call in a burst executes.`,
  },
  typescript: {
    code: `// Type-safe event emitter in TypeScript
type EventMap = {
  login: { userId: string; timestamp: number };
  logout: { userId: string };
  error: { message: string; code: number };
};

class TypedEventEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(
    event: K,
    fn: (data: Events[K]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }
}

// Usage with full type safety
const emitter = new TypedEventEmitter<EventMap>();
emitter.on("login", (e) => console.log(e.userId)); // TypeScript knows e has userId & timestamp
emitter.emit("login", { userId: "abc", timestamp: Date.now() });`,
    explanation: `This typed event emitter uses TypeScript generics to ensure type-safe event handling. The EventMap type defines all possible events and their payload types. The emitter class guarantees that emit() receives the correct payload shape and on() callbacks receive properly typed data. This pattern is used in Node.js (EventEmitter) and many frontend libraries.`,
  },
};

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What does 'typeof null' return in JavaScript?",
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correct: 2,
    explanation: "typeof null returns 'object' — this is a well-known bug in JavaScript that has existed since the first version. It's due to how values are represented internally (null is represented as all-zero bits, same as the object tag).",
  },
  {
    question: "Which array method returns a new array without modifying the original?",
    options: ["array.splice()", "array.sort()", "array.map()", "array.push()"],
    correct: 2,
    explanation: "array.map() creates and returns a new array. splice() modifies in-place, sort() sorts in-place (and returns the same array), and push() adds to the original array. The immutable methods include map, filter, slice, concat, flat, and toSorted.",
  },
  {
    question: "What is the output of: console.log(0.1 + 0.2 === 0.3)?",
    options: ["true", "false", "undefined", "TypeError"],
    correct: 1,
    explanation: "It outputs false because floating-point arithmetic in JavaScript (IEEE 754) introduces rounding errors: 0.1 + 0.2 = 0.30000000000000004. Always use epsilon comparison for floating-point equality: Math.abs(a - b) < Number.EPSILON.",
  },
  {
    question: "What does the '??' (nullish coalescing) operator do?",
    options: [
      "Checks if a value is falsy",
      "Returns the right operand if the left is null or undefined",
      "Throws an error if value is null",
      "Converts null to undefined",
    ],
    correct: 1,
    explanation: "The nullish coalescing operator (??) returns the right operand only when the left is null or undefined. Unlike || which checks for any falsy value (0, '', false), ?? only triggers on null/undefined, making it safer for defaults like count ?? 0.",
  },
  {
    question: "Which keyword creates a block-scoped variable in JavaScript?",
    options: ["var", "let", "function", "global"],
    correct: 1,
    explanation: "let (and const) create block-scoped variables, limited to the nearest enclosing {} block or statement. var is function-scoped, meaning it hoists to the nearest function boundary. Block scoping with let/const prevents accidental leakage and makes code more predictable.",
  },
];

// ── CodeSandbox Component ──

function CodeSandbox({ code, expectedOutput }: { code: string; expectedOutput: string }) {
  const [editedCode, setEditedCode] = useState(code);
  const [output, setOutput] = useState("");
  const [hasRun, setHasRun] = useState(false);

  const runCode = () => {
    const logs: string[] = [];
    const mockConsole = { log: (...args: unknown[]) => logs.push(args.map(String).join(" ")) };
    try {
      const fn = new Function("console", editedCode);
      fn(mockConsole);
      setOutput(logs.join("\n") || "(no output)");
    } catch (e) {
      setOutput(`Error: ${e}`);
    }
    setHasRun(true);
  };

  const reset = () => {
    setEditedCode(code);
    setOutput("");
    setHasRun(false);
  };

  return (
    <div className="rounded-xl border border-border bg-bg-surface overflow-hidden mt-4">
      <div className="border-b border-border">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">Editor</span>
          <div className="flex gap-1.5">
            <button onClick={runCode} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-success-muted text-success hover:bg-success/20 border border-success/20 transition-colors cursor-pointer bg-transparent">
              <Play className="w-2.5 h-2.5" /> Run
            </button>
            <button onClick={reset} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-text-tertiary hover:text-text-secondary bg-transparent border border-border cursor-pointer transition-colors">
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </button>
          </div>
        </div>
        <textarea
          value={editedCode}
          onChange={(e) => setEditedCode(e.target.value)}
          className="w-full bg-transparent text-text-primary text-xs font-mono p-4 resize-none outline-none leading-relaxed"
          rows={12}
          spellCheck={false}
        />
      </div>
      <div>
        <div className="px-3 py-2 border-b border-border">
          <span className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
            Output {hasRun && output === expectedOutput && <span className="text-success ml-2">✓ Correct</span>}
          </span>
        </div>
        <div className="p-4 min-h-[60px]">
          {output ? (
            <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap">{output}</pre>
          ) : (
            <span className="text-[11px] text-text-tertiary">Click Run to execute the code</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CLI Simulator Component ──

function CLISimulator() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: "CodeBeing CLI Simulator v1.0", type: "heading" },
    { text: 'Type "help" for available commands.', type: "info" },
    { text: "", type: "output" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [quizState, setQuizState] = useState<"idle" | "active" | "done">("idle");
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number[]>([]);
  const termRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [lines]);

  // Auto-focus terminal input on mount — no focus ring because :focus-visible
  // is scoped to exclude input elements (globals.css). The cursor alone indicates focus.
  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const typeOutput = useCallback(async (text: string, type: TerminalLine["type"] = "output") => {
    setIsTyping(true);
    const chars = text.split("");
    let current = "";
    const id = `typing-${Date.now()}`;
    setLines((prev) => [...prev, { text: "", type, id }]);

    for (let i = 0; i < chars.length; i++) {
      current += chars[i];
      await new Promise((r) => setTimeout(r, 15));
      setLines((prev) => prev.map((l) => (l.id === id ? { ...l, text: current } : l)));
    }
    setIsTyping(false);
  }, []);

  const addLines = useCallback((newLines: TerminalLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const handleCommand = useCallback(
    async (cmd: string) => {
      const trimmed = cmd.trim().toLowerCase();
      setLines((prev) => [...prev, { text: `$ codebeing > ${cmd}`, type: "input" }]);
      setHistory((prev) => [...prev, cmd]);
      setHistoryIndex(-1);
      setInput("");

      if (!trimmed) return;

      if (trimmed === "help") {
        addLines([
          { text: "Available Commands:", type: "heading" },
          { text: "  help              — Show this help message", type: "output" },
          { text: "  run [language]    — Show code example (python, javascript, typescript)", type: "output" },
          { text: "  explain [concept] — Explain a concept (see list below)", type: "output" },
          { text: "  quiz              — Start a 5-question JavaScript quiz", type: "output" },
          { text: "  clear             — Clear the terminal", type: "output" },
          { text: "  history           — Show last 10 commands", type: "output" },
          { text: "", type: "output" },
          { text: "Concepts available:", type: "info" },
          { text: "  recursion, closures, async, promises, big-o, event-loop,", type: "output" },
          { text: "  map-filter-reduce, generators, prototype, dp, variables,", type: "output" },
          { text: "  higher-order-functions, destructuring, modules,", type: "output" },
          { text: "  error-handling, typescript, arrays, objects,", type: "output" },
          { text: "  this-keyword, fetch, dom", type: "output" },
        ]);
        return;
      }

      if (trimmed === "clear") {
        setLines([]);
        return;
      }

      if (trimmed === "history") {
        const recent = history.slice(-10);
        if (recent.length === 0) {
          addLines([{ text: "No commands in history.", type: "info" }]);
        } else {
          addLines([
            { text: "Recent commands:", type: "heading" },
            ...recent.map((h, i) => ({ text: `  ${i + 1}. ${h}`, type: "output" } as TerminalLine)),
          ]);
        }
        return;
      }

      if (trimmed === "quiz") {
        setQuizState("active");
        setQuizQuestionIdx(0);
        setQuizScore(0);
        setQuizAnswered([]);
        const q = QUIZ_QUESTIONS[0];
        addLines([
          { text: "━━━ JavaScript Quiz ━━━", type: "heading" },
          { text: `Q${1}: ${q.question}`, type: "info" },
          ...q.options.map((opt, i) => ({ text: `  ${String.fromCharCode(65 + i)}. ${opt}`, type: "output" } as TerminalLine)),
          { text: 'Type your answer (a/b/c/d):', type: "info" },
        ]);
        return;
      }

      // Handle quiz answer
      if (quizState === "active") {
        const answerChar = trimmed.charAt(0).toLowerCase();
        const answerIdx = answerChar.charCodeAt(0) - 97;
        const q = QUIZ_QUESTIONS[quizQuestionIdx];

        if (answerIdx >= 0 && answerIdx < 4 && !quizAnswered.includes(quizQuestionIdx)) {
          const isCorrect = answerIdx === q.correct;
          const newScore = isCorrect ? quizScore + 1 : quizScore;
          const newAnswered = [...quizAnswered, quizQuestionIdx];

          if (isCorrect) {
            addLines([
              { text: "  ✓ Correct!", type: "success" },
              { text: `  ${q.explanation}`, type: "output" },
            ]);
          } else {
            addLines([
              { text: `  ✗ Incorrect. The answer was ${String.fromCharCode(65 + q.correct)}.`, type: "error" },
              { text: `  ${q.explanation}`, type: "output" },
            ]);
          }

          if (quizQuestionIdx < QUIZ_QUESTIONS.length - 1) {
            setQuizQuestionIdx((prev) => prev + 1);
            setQuizScore(newScore);
            setQuizAnswered(newAnswered);
            const nextQ = QUIZ_QUESTIONS[quizQuestionIdx + 1];
            setTimeout(() => {
              addLines([
                { text: "", type: "output" },
                { text: `Q${quizQuestionIdx + 2}: ${nextQ.question}`, type: "info" },
                ...nextQ.options.map((opt, i) => ({ text: `  ${String.fromCharCode(65 + i)}. ${opt}`, type: "output" } as TerminalLine)),
                { text: "Type your answer (a/b/c/d):", type: "info" },
              ]);
            }, 500);
          } else {
            setQuizScore(newScore);
            setQuizAnswered(newAnswered);
            setQuizState("done");
            const pct = Math.round((newScore / QUIZ_QUESTIONS.length) * 100);
            addLines([
              { text: "", type: "output" },
              { text: "━━━ Quiz Complete! ━━━", type: "heading" },
              { text: `  Score: ${newScore}/${QUIZ_QUESTIONS.length} (${pct}%)`, type: newScore >= 4 ? "success" : "info" },
              { text: newScore >= 4 ? "  Excellent! You have a strong grasp of JavaScript." : newScore >= 3 ? "  Good job! Keep learning and practicing." : "  Keep studying! Review the concepts above.", type: "output" },
            ]);
          }
          return;
        }
        // If invalid answer or already answered
        if (quizAnswered.includes(quizQuestionIdx)) {
          addLines([{ text: "  Already answered. Moving to next question...", type: "info" }]);
          if (quizQuestionIdx < QUIZ_QUESTIONS.length - 1) {
            const nextQ = QUIZ_QUESTIONS[quizQuestionIdx + 1];
            setQuizQuestionIdx((prev) => prev + 1);
            addLines([
              { text: `Q${quizQuestionIdx + 2}: ${nextQ.question}`, type: "info" },
              ...nextQ.options.map((opt, i) => ({ text: `  ${String.fromCharCode(65 + i)}. ${opt}`, type: "output" } as TerminalLine)),
              { text: "Type your answer (a/b/c/d):", type: "info" },
            ]);
          }
          return;
        }
      }

      if (trimmed.startsWith("run ")) {
        const lang = trimmed.slice(4).trim();
        const example = RUN_EXAMPLES[lang];
        if (example) {
          await typeOutput(`${lang.charAt(0).toUpperCase() + lang.slice(1)} Example:`, "heading");
          await typeOutput(example.code, "output");
          await typeOutput("", "output");
          await typeOutput(example.explanation, "info");
        } else {
          addLines([
            { text: `Unknown language: "${lang}"`, type: "error" },
            { text: "Available: python, javascript, typescript", type: "info" },
          ]);
        }
        return;
      }

      if (trimmed.startsWith("explain ")) {
        // PHASE4: Fuzzy matching for explain command using Levenshtein distance
        const concept = trimmed.slice(8).trim();
        const topics = Object.keys(CLI_EXPLANATIONS);

        function findBestMatch(query: string, topicList: string[]): { match: string; distance: number } | null {
          const q = query.toLowerCase().trim();
          if (topicList.includes(q)) return { match: q, distance: 0 };
          const prefixMatch = topicList.find(t => t.startsWith(q) || q.startsWith(t));
          if (prefixMatch) return { match: prefixMatch, distance: 0 };
          let bestMatch = '';
          let bestDist = Infinity;
          for (const topic of topicList) {
            const dist = levenshtein(q, topic);
            if (dist < bestDist) {
              bestDist = dist;
              bestMatch = topic;
            }
          }
          return bestDist <= 3 ? { match: bestMatch, distance: bestDist } : null;
        }

        const directExplanation = CLI_EXPLANATIONS[concept.toLowerCase()];
        if (directExplanation) {
          await typeOutput(`${concept.charAt(0).toUpperCase() + concept.slice(1)}:`, "heading");
          await typeOutput(directExplanation, "output");
        } else {
          const fuzzyResult = findBestMatch(concept, topics);
          if (fuzzyResult && fuzzyResult.distance > 0) {
            addLines([
              { text: `Did you mean: ${fuzzyResult.match}?`, type: "info" },
            ]);
            const explanation = CLI_EXPLANATIONS[fuzzyResult.match];
            await typeOutput(`${fuzzyResult.match.charAt(0).toUpperCase() + fuzzyResult.match.slice(1)}:`, "heading");
            await typeOutput(explanation, "output");
          } else {
            addLines([
              { text: `Unknown concept: "${concept}"`, type: "error" },
              { text: "Type 'help' to see available concepts.", type: "info" },
            ]);
          }
        }
        return;
      }

      addLines([
        { text: `Unknown command: "${trimmed}"`, type: "error" },
        { text: 'Type "help" for available commands.', type: "info" },
      ]);
    },
    [addLines, history, quizState, quizQuestionIdx, quizScore, quizAnswered, typeOutput]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isTyping) {
      handleCommand(input);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-base overflow-hidden h-full flex flex-col min-h-[400px] sm:min-h-0">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-bg-surface flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-error" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning" />
        <div className="w-2.5 h-2.5 rounded-full bg-success" />
        <span className="ml-2 text-[11px] text-text-tertiary font-mono">codebeing — cli simulator</span>
      </div>

      {/* Terminal body */}
      {/* PHASE4: Terminal body — added max-h-[50vh] sm:max-h-none for mobile viewport constraint */}
      <div ref={termRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed max-h-[50vh] sm:max-h-none">
        {lines.map((line, i) => {
          const id = line.id || `line-${i}`;
          return (
            <div
              key={id}
              className={`whitespace-pre-wrap break-words ${
                line.type === "input"
                  ? "text-success"
                  : line.type === "error"
                  ? "text-error"
                  : line.type === "success"
                  ? "text-success"
                  : line.type === "info"
                  ? "text-accent"
                  : line.type === "heading"
                  ? "text-text-primary font-semibold"
                  : "text-text-secondary"
              }`}
            >
              {line.type === "input" && <span className="text-accent">$ codebeing &gt; </span>}
              {line.text}
            </div>
          );
        })}

        {/* Input line - sticky on mobile */}
        {/* PHASE4: CLI input line — added z-10 for sticky stacking context on mobile */}
        <div className="flex items-center text-success mt-1 sticky bottom-0 bg-bg-base pt-1 z-10">
          <span className="text-accent flex-shrink-0">$ codebeing &gt; </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            className="flex-1 min-w-0 bg-transparent text-success outline-none text-xs font-mono caret-success disabled:opacity-50"
            spellCheck={false}
            /* GODMODE FIX #Issue4: Removed autoFocus — causes visible focus ring on page load.
               Replaced with programmatic focus in useEffect with focus-soft suppression. */
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Learn Page ──

type LearnTab = "lessons" | "cli";

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<LearnTab>("lessons");
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(safeStorage.get("cb-lessons") || "[]") as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    safeStorage.set("cb-lessons", JSON.stringify(completed));
  }, [completed]);

  const toggleComplete = (id: string) => {
    setCompleted((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const active = activeLesson ? lessons.find((l) => l.id === activeLesson) : null;

  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow)
    <div className="min-h-dvh bg-bg-base">
      {/* Header */}
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-1">Learn</h1>
          <p className="text-text-secondary text-sm">Interactive micro-lessons and a CLI simulator to learn by doing.</p>

          {/* Tabs */}
          <div className="mt-4 flex items-center gap-1 p-1 bg-bg-hover rounded-lg border border-border w-fit">
            <button
              onClick={() => setActiveTab("lessons")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors border-none cursor-pointer ${
                activeTab === "lessons"
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:text-text-primary bg-transparent"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Interactive Lessons
            </button>
            <button
              onClick={() => setActiveTab("cli")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors border-none cursor-pointer ${
                activeTab === "cli"
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:text-text-primary bg-transparent"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              CLI Simulator
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "lessons" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-muted border border-accent/20">
                <span className="text-[11px] text-accent font-medium">
                  Progress: {completed.length}/{lessons.length} completed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
              {/* Sidebar */}
              <div className="space-y-1 max-h-[50vh] lg:max-h-none overflow-y-auto overscroll-contain -mx-1 px-1 lg:mx-0 lg:px-0">
                {lessons.map((lesson) => {
                  const isActive = activeLesson === lesson.id;
                  const isDone = completed.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson.id)}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer bg-transparent border-none ${
                        isActive
                          ? "bg-bg-hover text-text-primary"
                          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/[0.1]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{lesson.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                              lesson.difficulty === "beginner"
                                ? "bg-success-muted text-success"
                                : lesson.difficulty === "intermediate"
                                ? "bg-warning-muted text-warning"
                                : "bg-error-muted text-error"
                            }`}
                          >
                            {lesson.difficulty}
                          </span>
                          <span className="text-[9px] text-text-tertiary">{lesson.duration}</span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-3 h-3 mt-1 transition-colors ${
                          isActive ? "text-accent" : "text-text-tertiary"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Lesson content */}
              <div className="min-w-0 overflow-x-auto">
                {active ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-text-primary">{active.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                              active.difficulty === "beginner"
                                ? "bg-success-muted text-success"
                                : active.difficulty === "intermediate"
                                ? "bg-warning-muted text-warning"
                                : "bg-error-muted text-error"
                            }`}
                          >
                            {active.difficulty}
                          </span>
                          <span className="text-[10px] text-text-tertiary">{active.duration}</span>
                          <span className="text-[10px] text-text-tertiary">{active.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleComplete(active.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                          completed.includes(active.id)
                            ? "bg-success-muted border-success/20 text-success"
                            : "bg-bg-hover border-border text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {completed.includes(active.id) ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Completed
                          </>
                        ) : (
                          "Mark Complete"
                        )}
                      </button>
                    </div>

                    <div className="prose-sm text-text-secondary text-sm leading-relaxed mb-4 [&_h2]:text-text-primary [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h3]:text-text-primary [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mb-1 [&_h3]:mt-3 [&_p]:mb-3 [&_code]:text-accent [&_code]:bg-bg-hover [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_strong]:text-text-primary [&_ul]:space-y-1 [&_li]:text-text-secondary">
                      {active.content.split("\n").map((line, i) => {
                        if (line.startsWith("## "))
                          return <h2 key={i}>{line.replace("## ", "")}</h2>;
                        if (line.startsWith("### "))
                          return <h3 key={i}>{line.replace("### ", "")}</h3>;
                        if (line.startsWith("- "))
                          return <li key={i}>{line.replace("- ", "")}</li>;
                        if (line.trim() === "") return <br key={i} />;
                        return (
                          <p
                            key={i}
                            dangerouslySetInnerHTML={{
                              __html: line
                                .replace(/`([^`]+)`/g, "<code>$1</code>")
                                .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"),
                            }}
                          />
                        );
                      })}
                    </div>

                    <CodeSandbox code={active.code} expectedOutput={active.expectedOutput} />

                    {active.hints.length > 0 && (
                      <div className="mt-4 p-4 rounded-xl bg-bg-elevated border border-border">
                        <h4 className="text-xs font-medium text-text-secondary mb-2">Hints</h4>
                        <ul className="space-y-1.5">
                          {active.hints.map((hint, i) => (
                            <li key={i} className="text-[11px] text-text-tertiary flex gap-2">
                              <span className="text-accent">{i + 1}.</span> {hint}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <GraduationCap className="w-10 h-10 text-text-tertiary mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-1">Choose a lesson</h3>
                    <p className="text-text-secondary text-sm max-w-xs">
                      Select a lesson from the sidebar to start learning with interactive code examples.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "cli" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-text-primary mb-1">CLI Simulator</h2>
              <p className="text-text-secondary text-sm">
                Practice commands, explore concepts, and test your knowledge — all from a terminal interface.
              </p>
            </div>
            <CLISimulator />
          </motion.div>
        )}
      </div>
    </div>
  );
}
