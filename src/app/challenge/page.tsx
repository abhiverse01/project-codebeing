// PHASE7: [D3] Eliminated hardcoded colors — replaced hex values with CSS variable-based Tailwind classes
// PHASE5: [U9] Standardized all toast.error calls to duration: 5000ms
// PHASE5: Suppressed intentional setState-in-effect lint for prefers-reduced-motion initialization
// PHASE5: [M3] Escape key handler to close success overlay (but NOT the challenge itself)
// PHASE4: Replaced setInterval timer with performance.now() + requestAnimationFrame for precision
// PHASE3: Replaced hardcoded dark colors with theme-aware Tailwind classes
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  Trophy,
  Clock,
  ChevronRight,
  Filter,
  Check,
  X,
  Eye,
  EyeOff,
  Zap,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// ── Challenge Data ──

interface TestCase {
  input: string;
  expected: string;
}

interface Challenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  description: string;
  starterCode: string;
  testCases: TestCase[];
  timeLimit: number;
  hint: string;
}

interface LeaderboardEntry {
  challengeId: string;
  timeTaken: number;
  passedTests: number;
  totalTests: number;
  timestamp: number;
}

const CHALLENGES: Challenge[] = [
  // Arrays & Strings
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Strings",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nReturn the answer as an array of two indices.",
    starterCode: `function twoSum(nums, target) {
  // Your code here
  return [];
}

// Test helper
const testCases = [
  { nums: [2, 7, 11, 15], target: 9 },
  { nums: [3, 2, 4], target: 6 },
  { nums: [3, 3], target: 6 },
];

for (const tc of testCases) {
  console.log(JSON.stringify(twoSum(tc.nums, tc.target)));
}`,
    testCases: [
      { input: "nums=[2,7,11,15], target=9", expected: "[0,1] or [1,0]" },
      { input: "nums=[3,2,4], target=6", expected: "[1,2] or [2,1]" },
      { input: "nums=[3,3], target=6", expected: "[0,1] or [1,0]" },
    ],
    timeLimit: 300,
    hint: "Use a hash map to store values and their indices as you iterate.",
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    category: "Arrays & Strings",
    description:
      'Write a function that reverses a string. The input string is given as an array of characters.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.\n\nLog the reversed string.',
    starterCode: `function reverseString(s) {
  // Your code here
  return s;
}

console.log(reverseString(["h","e","l","l","o"]));`,
    testCases: [
      { input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', expected: '["h","a","n","n","a","H"]' },
      { input: '["A"]', expected: '["A"]' },
    ],
    timeLimit: 180,
    hint: "Use two pointers: one from the start, one from the end. Swap and converge.",
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Arrays & Strings",
    description:
      'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.\n\nLog "true" or "false".',
    starterCode: `function isValid(s) {
  // Your code here
  return false;
}

console.log(isValid("()"));
console.log(isValid("()[]{}"));
console.log(isValid("(]"));`,
    testCases: [
      { input: '"()"', expected: "true" },
      { input: '"()[]{}"', expected: "true" },
      { input: '"(]"', expected: "false" },
    ],
    timeLimit: 240,
    hint: "Use a stack. Push opening brackets, pop and compare on closing brackets.",
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating",
    difficulty: "Medium",
    category: "Arrays & Strings",
    description:
      'Given a string `s`, find the length of the longest substring without repeating characters.\n\nLog the length as a number.',
    starterCode: `function lengthOfLongestSubstring(s) {
  // Your code here
  return 0;
}

console.log(lengthOfLongestSubstring("abcabcbb"));
console.log(lengthOfLongestSubstring("bbbbb"));
console.log(lengthOfLongestSubstring("pwwkew"));`,
    testCases: [
      { input: '"abcabcbb"', expected: "3" },
      { input: '"bbbbb"', expected: "1" },
      { input: '"pwwkew"', expected: "3" },
    ],
    timeLimit: 360,
    hint: "Use a sliding window with a Set or Map to track characters in the current window.",
  },
  // Math & Logic
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "Easy",
    category: "Math & Logic",
    description:
      'Write a function that takes an integer `n` and returns an array of strings from 1 to n.\n\n- For multiples of 3, use "Fizz" instead of the number\n- For multiples of 5, use "Buzz"\n- For multiples of both 3 and 5, use "FizzBuzz"',
    starterCode: `function fizzBuzz(n) {
  // Your code here
  return [];
}

console.log(JSON.stringify(fizzBuzz(5)));
console.log(JSON.stringify(fizzBuzz(15)));`,
    testCases: [
      { input: "n=5", expected: '["1","2","Fizz","4","Buzz"]' },
      { input: "n=15", expected: 'Contains "FizzBuzz" at index 14' },
      { input: "n=1", expected: '["1"]' },
    ],
    timeLimit: 120,
    hint: "Check divisibility by 15 first (both 3 and 5), then 3, then 5.",
  },
  {
    id: "prime-check",
    title: "Prime Check",
    difficulty: "Easy",
    category: "Math & Logic",
    description:
      "Given an integer `n`, determine if it is a prime number.\n\nReturn `true` if prime, `false` otherwise.\n\nLog the result.",
    starterCode: `function isPrime(n) {
  // Your code here
  return false;
}

console.log(isPrime(7));
console.log(isPrime(10));
console.log(isPrime(1));`,
    testCases: [
      { input: "n=7", expected: "true" },
      { input: "n=10", expected: "false" },
      { input: "n=2", expected: "true" },
    ],
    timeLimit: 180,
    hint: "Check divisibility from 2 to sqrt(n). Handle edge cases: n < 2.",
  },
  {
    id: "fibonacci",
    title: "Fibonacci Number",
    difficulty: "Easy",
    category: "Math & Logic",
    description:
      "Given `n`, calculate the nth Fibonacci number.\n\nF(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).\n\nLog the result.",
    starterCode: `function fib(n) {
  // Your code here
  return 0;
}

console.log(fib(0));
console.log(fib(10));
console.log(fib(20));`,
    testCases: [
      { input: "n=0", expected: "0" },
      { input: "n=10", expected: "55" },
      { input: "n=20", expected: "6765" },
    ],
    timeLimit: 180,
    hint: "Use an iterative approach with two variables for O(1) space, or memoization for O(n) time.",
  },
  {
    id: "power-of-two",
    title: "Power of Two",
    difficulty: "Easy",
    category: "Math & Logic",
    description:
      "Given an integer `n`, return `true` if it is a power of two. Otherwise return `false`.\n\nLog the result.",
    starterCode: `function isPowerOfTwo(n) {
  // Your code here
  return false;
}

console.log(isPowerOfTwo(1));
console.log(isPowerOfTwo(16));
console.log(isPowerOfTwo(3));`,
    testCases: [
      { input: "n=1", expected: "true" },
      { input: "n=16", expected: "true" },
      { input: "n=3", expected: "false" },
    ],
    timeLimit: 150,
    hint: "A power of two has exactly one bit set. Use: n > 0 && (n & (n - 1)) === 0.",
  },
  // Searching & Sorting
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    category: "Searching & Sorting",
    description:
      "Given a sorted array of integers and a target value, return the index of the target. If not found, return -1.\n\nLog the index.",
    starterCode: `function binarySearch(nums, target) {
  // Your code here
  return -1;
}

console.log(binarySearch([-1,0,3,5,9,12], 9));
console.log(binarySearch([-1,0,3,5,9,12], 2));`,
    testCases: [
      { input: "nums=[-1,0,3,5,9,12], target=9", expected: "4" },
      { input: "nums=[-1,0,3,5,9,12], target=2", expected: "-1" },
      { input: "nums=[5], target=5", expected: "0" },
    ],
    timeLimit: 240,
    hint: "Use two pointers (low, high). Compare target with nums[mid] and narrow the range.",
  },
  {
    id: "bubble-sort",
    title: "Bubble Sort",
    difficulty: "Easy",
    category: "Searching & Sorting",
    description:
      "Implement bubble sort on an array of integers.\n\nReturn the sorted array.\n\nLog the result as JSON.",
    starterCode: `function bubbleSort(arr) {
  // Your code here
  return arr;
}

console.log(JSON.stringify(bubbleSort([64, 34, 25, 12, 22, 11, 90])));
console.log(JSON.stringify(bubbleSort([5, 1, 4, 2, 8])));`,
    testCases: [
      { input: "[64,34,25,12,22,11,90]", expected: "[11,12,22,25,34,64,90]" },
      { input: "[5,1,4,2,8]", expected: "[1,2,4,5,8]" },
      { input: "[1]", expected: "[1]" },
    ],
    timeLimit: 240,
    hint: "Repeatedly swap adjacent elements if they are in wrong order. Optimize with early exit flag.",
  },
  {
    id: "merge-sorted",
    title: "Merge Two Sorted Arrays",
    difficulty: "Easy",
    category: "Searching & Sorting",
    description:
      "Given two sorted arrays, merge them into one sorted array.\n\nLog the merged result as JSON.",
    starterCode: `function mergeSortedArrays(arr1, arr2) {
  // Your code here
  return [];
}

console.log(JSON.stringify(mergeSortedArrays([1,3,5], [2,4,6])));
console.log(JSON.stringify(mergeSortedArrays([], [1])));`,
    testCases: [
      { input: "[1,3,5], [2,4,6]", expected: "[1,2,3,4,5,6]" },
      { input: "[], [1]", expected: "[1]" },
      { input: "[1,2,3], [4,5,6]", expected: "[1,2,3,4,5,6]" },
    ],
    timeLimit: 240,
    hint: "Use two pointers, one for each array. Compare and advance the smaller one.",
  },
  {
    id: "peak-element",
    title: "Find Peak Element",
    difficulty: "Medium",
    category: "Searching & Sorting",
    description:
      "Given an integer array `nums`, find a peak element and return its index.\n\nA peak element is an element that is strictly greater than its neighbors. You may assume nums[-1] = nums[n] = -∞.\n\nLog the index.",
    starterCode: `function findPeakElement(nums) {
  // Your code here
  return -1;
}

console.log(findPeakElement([1,2,3,1]));
console.log(findPeakElement([1,2,1,3,5,6,4]));`,
    testCases: [
      { input: "[1,2,3,1]", expected: "2" },
      { input: "[1,2,1,3,5,6,4]", expected: "1 or 5" },
      { input: "[1]", expected: "0" },
    ],
    timeLimit: 300,
    hint: "Use binary search: if nums[mid] < nums[mid+1], the peak is on the right side.",
  },
  // Dynamic Programming
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    description:
      "You are climbing a staircase with `n` steps. Each time you can either climb 1 or 2 steps.\n\nReturn the number of distinct ways to reach the top.\n\nLog the result.",
    starterCode: `function climbStairs(n) {
  // Your code here
  return 0;
}

console.log(climbStairs(2));
console.log(climbStairs(3));
console.log(climbStairs(10));`,
    testCases: [
      { input: "n=2", expected: "2" },
      { input: "n=3", expected: "3" },
      { input: "n=10", expected: "89" },
    ],
    timeLimit: 180,
    hint: "This is the Fibonacci sequence in disguise. F(n) = F(n-1) + F(n-2).",
  },
  {
    id: "max-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      "Given an integer array `nums`, find the subarray with the largest sum and return its sum.\n\nLog the maximum sum.",
    starterCode: `function maxSubArray(nums) {
  // Your code here
  return 0;
}

console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));
console.log(maxSubArray([1]));
console.log(maxSubArray([5,4,-1,7,8]));`,
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6" },
      { input: "[1]", expected: "1" },
      { input: "[5,4,-1,7,8]", expected: "23" },
    ],
    timeLimit: 300,
    hint: "Kadane's algorithm: track current max ending here and global max.",
  },
  {
    id: "coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      "Given an integer array `coins` representing different denominations and an integer `amount`, return the fewest number of coins needed to make up that amount.\n\nReturn -1 if it's not possible.\n\nLog the result.",
    starterCode: `function coinChange(coins, amount) {
  // Your code here
  return -1;
}

console.log(coinChange([1, 5, 10, 25], 30));
console.log(coinChange([2], 3));
console.log(coinChange([1], 0));`,
    testCases: [
      { input: "coins=[1,5,10,25], amount=30", expected: "2" },
      { input: "coins=[2], amount=3", expected: "-1" },
      { input: "coins=[1], amount=0", expected: "0" },
    ],
    timeLimit: 420,
    hint: "Use DP: dp[i] = min coins to make amount i. Initialize with Infinity, dp[0] = 0.",
  },
  {
    id: "word-break",
    title: "Word Break",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      'Given a string `s` and a dictionary of strings `wordDict`, determine if `s` can be segmented into space-separated words from the dictionary.\n\nLog "true" or "false".',
    starterCode: `function wordBreak(s, wordDict) {
  // Your code here
  return false;
}

console.log(wordBreak("leetcode", ["leet","code"]));
console.log(wordBreak("applepenapple", ["apple","pen"]));
console.log(wordBreak("catsandog", ["cats","dog","sand","and","cat"]));`,
    testCases: [
      { input: 's="leetcode", dict=["leet","code"]', expected: "true" },
      { input: 's="applepenapple", dict=["apple","pen"]', expected: "true" },
      { input: 's="catsandog", dict=["cats","dog","sand","and","cat"]', expected: "false" },
    ],
    timeLimit: 420,
    hint: "Use DP: dp[i] = true if s[0..i-1] can be segmented. Check each wordDict word as suffix.",
  },
  // Data Structures
  {
    id: "stack-with-min",
    title: "Min Stack",
    difficulty: "Medium",
    category: "Data Structures",
    description:
      "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nImplement `MinStack` with push(x), pop(), top(), and getMin() methods.\n\nLog the results of the test operations.",
    starterCode: `class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }

  push(x) {
    // Your code here
  }

  pop() {
    // Your code here
  }

  top() {
    // Your code here
    return -1;
  }

  getMin() {
    // Your code here
    return -1;
  }
}

const ms = new MinStack();
ms.push(-2);
ms.push(0);
ms.push(-3);
console.log(ms.getMin()); // -3
ms.pop();
console.log(ms.top());    // 0
console.log(ms.getMin()); // -2`,
    testCases: [
      { input: "push(-2), push(0), push(-3), getMin()", expected: "-3" },
      { input: "pop(), top()", expected: "0" },
      { input: "getMin()", expected: "-2" },
    ],
    timeLimit: 360,
    hint: "Maintain a parallel stack that tracks the minimum at each level.",
  },
  {
    id: "queue-from-stacks",
    title: "Queue from Stacks",
    difficulty: "Easy",
    category: "Data Structures",
    description:
      "Implement a FIFO queue using only two stacks.\n\nImplement enqueue(x) and dequeue().\n\nLog the dequeued values.",
    starterCode: `class QueueFromStacks {
  constructor() {
    this.stack1 = [];
    this.stack2 = [];
  }

  enqueue(x) {
    // Your code here
  }

  dequeue() {
    // Your code here
    return undefined;
  }
}

const q = new QueueFromStacks();
q.enqueue(1);
q.enqueue(2);
q.enqueue(3);
console.log(q.dequeue()); // 1
console.log(q.dequeue()); // 2
console.log(q.dequeue()); // 3`,
    testCases: [
      { input: "enqueue(1), enqueue(2), dequeue()", expected: "1" },
      { input: "dequeue()", expected: "2" },
      { input: "dequeue()", expected: "3" },
    ],
    timeLimit: 240,
    hint: "Use stack1 for enqueue, stack2 for dequeue. When stack2 is empty, pour all from stack1.",
  },
  {
    id: "linked-list-cycle",
    title: "Linked List Cycle",
    difficulty: "Easy",
    category: "Data Structures",
    description:
      "Given the head of a linked list, determine if the linked list has a cycle.\n\nEach node has a `val` and a `next` property.\n\nLog 'true' if there is a cycle, 'false' otherwise.",
    starterCode: `function hasCycle(head) {
  // head is { val, next }
  // Your code here
  return false;
}

// Create a cycle
const node1 = { val: 3, next: null };
const node2 = { val: 2, next: null };
const node3 = { val: 0, next: null };
const node4 = { val: -4, next: null };
node1.next = node2;
node2.next = node3;
node3.next = node4;
node4.next = node2; // cycle!

console.log(hasCycle(node1));

// No cycle
const a = { val: 1, next: null };
const b = { val: 2, next: null };
a.next = b;
console.log(hasCycle(a));`,
    testCases: [
      { input: "3->2->0->-4->(back to 2)", expected: "true" },
      { input: "1->2->null", expected: "false" },
    ],
    timeLimit: 240,
    hint: "Floyd's Tortoise and Hare: slow moves 1 step, fast moves 2 steps. If they meet, there's a cycle.",
  },
  {
    id: "binary-tree-depth",
    title: "Binary Tree Max Depth",
    difficulty: "Easy",
    category: "Data Structures",
    description:
      "Given the root of a binary tree, return its maximum depth.\n\nEach node has a `val`, `left`, and `right` property.\n\nLog the depth.",
    starterCode: `function maxDepth(root) {
  // root is { val, left, right }
  // Your code here
  return 0;
}

// Tree: [3,9,20,null,null,15,7]
const root = {
  val: 3,
  left: { val: 9, left: null, right: null },
  right: {
    val: 20,
    left: { val: 15, left: null, right: null },
    right: { val: 7, left: null, right: null },
  },
};

console.log(maxDepth(root));
console.log(maxDepth(null));`,
    testCases: [
      { input: "[3,9,20,null,null,15,7]", expected: "3" },
      { input: "null (empty tree)", expected: "0" },
    ],
    timeLimit: 240,
    hint: "Recursively: 1 + max(depth(left), depth(right)). Base case: null returns 0.",
  },
];

const CATEGORIES = [
  "All",
  "Arrays & Strings",
  "Math & Logic",
  "Searching & Sorting",
  "Dynamic Programming",
  "Data Structures",
];

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Easy: { bg: "bg-success-muted", text: "text-success", border: "border-success/20" },
  Medium: { bg: "bg-warning-muted", text: "text-warning", border: "border-warning/20" },
  Hard: { bg: "bg-error-muted", text: "text-error", border: "border-error/20" },
};

const LEADERBOARD_KEY = "codebeing_challenge_leaderboard";

import { safeStorage } from "@/lib/utils";

function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = safeStorage.get(LEADERBOARD_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
  if (typeof window === "undefined") return;
  safeStorage.set(LEADERBOARD_KEY, JSON.stringify(entries));
}

function getPersonalBest(challengeId: string): LeaderboardEntry | null {
  const entries = getLeaderboard();
  const challengeEntries = entries
    .filter((e) => e.challengeId === challengeId && e.passedTests === e.totalTests)
    .sort((a, b) => a.timeTaken - b.timeTaken);
  return challengeEntries[0] || null;
}

export default function ChallengePage() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; output: string; testCase: TestCase }[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "tests" | "leaderboard">("description");
  // PHASE4: Respect prefers-reduced-motion for confetti
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    setPrefersReducedMotion(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // PHASE5: [M3] Escape key handler — closes success overlay but NOT the challenge
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSuccess) setShowSuccess(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSuccess]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // PHASE4: Timer using performance.now() + requestAnimationFrame for drift-free precision
  const timerStartRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!timerRunning) return;
    timerStartRef.current = performance.now() - timer * 1000;

    const tick = () => {
      const elapsed = (performance.now() - timerStartRef.current) / 1000;
      const newTimer = Math.floor(elapsed);
      if (selectedChallenge && newTimer >= selectedChallenge.timeLimit) {
        setTimer(selectedChallenge.timeLimit);
        setTimerRunning(false);
        toast.error("Time's up!", { duration: 5000 });
        return;
      }
      setTimer(newTimer);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [timerRunning, selectedChallenge]);

  const filteredChallenges = CHALLENGES.filter((c) => {
    if (categoryFilter !== "All" && c.category !== categoryFilter) return false;
    if (difficultyFilter !== "All" && c.difficulty !== difficultyFilter) return false;
    return true;
  });

  const selectChallenge = useCallback((challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setCode(challenge.starterCode);
    setTimer(0);
    setTimerRunning(false);
    setTestResults([]);
    setShowHint(false);
    setShowSuccess(false);
    setAllPassed(false);
    setActiveTab("description");
  }, []);

  const startChallenge = useCallback(() => {
    setTimerRunning(true);
  }, []);

  function isTestPassed(output: string, expected: string): boolean {
    const trimmedOutput = output.trim().toLowerCase();
    const trimmedExpected = expected.trim().toLowerCase();

    if (trimmedExpected.includes(" or ")) {
      return trimmedExpected.split(" or ").some(
        (opt) => trimmedOutput === opt.trim()
      );
    }

    if (trimmedExpected.startsWith("contains ")) {
      const substr = trimmedExpected.replace("contains ", "").trim();
      return trimmedOutput.includes(substr);
    }

    return trimmedOutput === trimmedExpected;
  }

  const runTests = useCallback(() => {
    if (!selectedChallenge || !iframeRef.current) return;

    setTestResults([]);
    setTimerRunning(false);

    const startTime = performance.now();
    const logs: string[] = [];

    const sandboxedCode = `
      <html>
      <head><style>body { margin: 0; padding: 0; background: transparent; }</style></head>
      <body>
      <script>
        (function() {
          const noop = function() { throw new Error('API blocked'); };
          const blocked = { fetch: noop, XMLHttpRequest: noop, WebSocket: noop, importScripts: noop };
          for (const [key, fn] of Object.entries(blocked)) {
            try { window[key] = fn; } catch(e) {}
          }

          function send(type, args) {
            const content = args.map(arg => {
              if (arg === null) return 'null';
              if (arg === undefined) return 'undefined';
              if (typeof arg === 'object') {
                try { return JSON.stringify(arg); } catch(e) { return String(arg); }
              }
              return String(arg);
            }).join(' ');
            parent.postMessage({ source: 'challenge-sandbox', type, content }, '*');
          }

          console.log = function(...args) { send('log', args); };
          console.error = function(...args) { send('error', args); };

          try {
            ${code.replace(/<\/script>/gi, "<\\/script>")}
            parent.postMessage({ source: 'challenge-sandbox', type: '__done__' }, '*');
          } catch(e) {
            send('error', [e.toString()]);
            parent.postMessage({ source: 'challenge-sandbox', type: '__done__' }, '*');
          }
        })();
      <\/script>
      </body>
      </html>
    `;

    const doneHandler = (event: MessageEvent) => {
      if (event.data?.source !== "challenge-sandbox") return;

      if (event.data.type === "__done__") {
        window.removeEventListener("message", doneHandler);

        // Process test results
        const results = selectedChallenge.testCases.map((tc, i) => {
          const output = logs[i] || "(no output)";
          const passed = isTestPassed(output, tc.expected);
          return { passed, output, testCase: tc };
        });

        setTestResults(results);
        const allPass = results.every((r) => r.passed);
        setAllPassed(allPass);

        if (allPass) {
          setShowSuccess(true);
          const elapsed = Math.round((performance.now() - startTime) / 100) / 10;
          toast.success(`All tests passed in ${timer}s!`, {
            description: `Execution time: ${elapsed}ms`,
          });

          // PHASE4: Show personal best notification
          const prevBest = getPersonalBest(selectedChallenge.id);
          if (prevBest && timer < prevBest.timeTaken) {
            toast.success(`New personal best! ${prevBest.timeTaken}s → ${timer}s`);
          } else if (!prevBest) {
            toast.success(`First completion! Solved in ${timer}s`);
          }

          // Save to leaderboard
          const entries = getLeaderboard();
          entries.push({
            challengeId: selectedChallenge.id,
            timeTaken: timer,
            passedTests: results.filter((r) => r.passed).length,
            totalTests: results.length,
            timestamp: Date.now(),
          });
          saveLeaderboard(entries);
        } else {
          toast.error(`${results.filter((r) => r.passed).length}/${results.length} tests passed`, { duration: 5000 });
        }

        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.srcdoc = "";
          }
        }, 100);
      } else if (event.data.type === "log" || event.data.type === "error") {
        logs.push(event.data.content);
      }
    };

    window.addEventListener("message", doneHandler);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = sandboxedCode;
    }
  }, [code, selectedChallenge, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (!selectedChallenge) return "text-success";
    const pct = ((selectedChallenge.timeLimit - timer) / selectedChallenge.timeLimit) * 100;
    if (pct > 50) return "text-success";
    if (pct > 20) return "text-warning";
    return "text-error";
  };

  const leaderboardData = getLeaderboard();

  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow), h-screen changed to calc to avoid overflow
    <div className="h-[calc(100dvh-var(--navbar-height))] flex flex-col bg-bg-base">
      {/* Top bar */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-border bg-bg-base/90 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span className="text-sm font-medium text-text-primary">Challenge Mode</span>
          <span className="text-[10px] text-text-tertiary">
            {CHALLENGES.length} problems
          </span>
        </div>
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Leaderboard
        </button>
      </div>

      {/* Confetti — PHASE4: respects prefers-reduced-motion */}
      <AnimatePresence>
        {showSuccess && !prefersReducedMotion && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: `${Math.random() * 100}%`,
                  y: "-10px",
                  rotate: 0,
                  opacity: 1,
                  scale: 0.5 + Math.random() * 0.5,
                }}
                animate={{
                  y: "100vh",
                  rotate: 360 + Math.random() * 360,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "linear",
                }}
                className="absolute w-2 h-2 rounded-sm"
                style={{
                  background: ["var(--color-accent)", "var(--color-success)", "var(--color-warning)", "var(--color-error)", "var(--color-accent)", "var(--color-info)"][i % 6],
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
      {/* PHASE4: Simple success banner when reduced motion is preferred */}
      <AnimatePresence>
        {showSuccess && prefersReducedMotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-8 py-4 rounded-xl bg-success/20 border border-success/30 shadow-2xl"
          >
            <div className="text-center">
              <Trophy className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-lg font-semibold text-success">All Tests Passed!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE3: Mobile challenge selector + filters — dropdowns for mobile since sidebar is hidden */}
      <div className="md:hidden px-3 py-2 border-b border-border bg-bg-base flex-shrink-0 space-y-2">
        <select
          value={selectedChallenge?.id || ""}
          onChange={(e) => {
            const ch = CHALLENGES.find((c) => c.id === e.target.value);
            if (ch) selectChallenge(ch);
          }}
          className="w-full bg-bg-surface border border-border rounded-md px-2 py-1.5 text-[11px] text-text-primary outline-none cursor-pointer"
        >
          <option value="" disabled>
            {selectedChallenge ? selectedChallenge.title : "Select a challenge..."}
          </option>
          {filteredChallenges.map((c) => (
            <option key={c.id} value={c.id} className="bg-bg-surface">
              {c.title} [{c.difficulty}] — {c.category}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 bg-bg-surface border border-border rounded-md px-2 py-1.5 text-[11px] text-text-primary outline-none cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-bg-surface">
                {c}
              </option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="flex-1 bg-bg-surface border border-border rounded-md px-2 py-1.5 text-[11px] text-text-primary outline-none cursor-pointer"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d} className="bg-bg-surface">
                {d === "All" ? "All Difficulties" : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-bg-base flex flex-col flex-shrink-0 hidden md:flex">
          {/* Filters */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-text-tertiary" />
              <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">Filter</span>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-bg-surface border border-border rounded-md px-2 py-1.5 text-[11px] text-text-primary outline-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-bg-surface">
                  {c}
                </option>
              ))}
            </select>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full bg-bg-surface border border-border rounded-md px-2 py-1.5 text-[11px] text-text-primary outline-none cursor-pointer"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d} className="bg-bg-surface">
                  {d === "All" ? "All Difficulties" : d}
                </option>
              ))}
            </select>
          </div>

          {/* Challenge list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredChallenges.map((challenge) => {
              const best = getPersonalBest(challenge.id);
              const dc = DIFFICULTY_COLORS[challenge.difficulty];
              return (
                <button
                  key={challenge.id}
                  onClick={() => selectChallenge(challenge)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors bg-transparent border-none cursor-pointer group ${
                    selectedChallenge?.id === challenge.id
                      ? "bg-accent-muted border border-accent/20"
                      : "hover:bg-bg-hover border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-primary font-medium truncate flex-1">
                      {challenge.title}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${dc.bg} ${dc.text} ${dc.border} border ml-2 flex-shrink-0`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-text-tertiary">{challenge.category}</span>
                    {best && (
                      <span className="text-[9px] text-success">Best: {best.timeTaken}s</span>
                    )}
                  </div>
                </button>
              );
            })}
            {filteredChallenges.length === 0 && (
              <div className="text-center py-8 text-[11px] text-text-tertiary">
                No challenges match your filters
              </div>
            )}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedChallenge ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center animate-fade-up">
                <Sparkles className="w-10 h-10 text-accent/40 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                  Competitive Coding
                </h2>
                <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
                  Choose a challenge from the sidebar to start coding. Solve algorithmic problems with a countdown timer and compete against yourself.
                </p>
                <div className="flex flex-wrap gap-3 justify-center text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-text-secondary">{CHALLENGES.filter((c) => c.difficulty === "Easy").length} Easy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <span className="text-text-secondary">{CHALLENGES.filter((c) => c.difficulty === "Medium").length} Medium</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-error" />
                    <span className="text-text-secondary">{CHALLENGES.filter((c) => c.difficulty === "Hard").length} Hard</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* PHASE4: Challenge header — added flex-wrap gap-2 for responsive wrapping on mobile */}
              {/* Challenge header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-bg-base flex-shrink-0 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {selectedChallenge.title}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[selectedChallenge.difficulty].bg} ${DIFFICULTY_COLORS[selectedChallenge.difficulty].text} ${DIFFICULTY_COLORS[selectedChallenge.difficulty].border}`}>
                    {selectedChallenge.difficulty}
                  </span>
                  <span className="text-[10px] text-text-tertiary hidden sm:inline">
                    {selectedChallenge.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Timer */}
                  <div className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${getTimerColor()}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(timer)}
                    <span className="text-[10px] text-text-tertiary font-normal">
                      / {formatTime(selectedChallenge.timeLimit)}
                    </span>
                  </div>

                  {testResults.length === 0 && (
                    <button
                      onClick={startChallenge}
                      disabled={timerRunning}
                      className={`btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors border-none cursor-pointer ${
                        timerRunning
                          ? "bg-success-muted text-success"
                          : "bg-accent text-white hover:bg-accent-hover"
                      }`}
                    >
                      <Play className="w-3 h-3" />
                      {timerRunning ? "Running" : "Start Timer"}
                    </button>
                  )}

                  <button
                    onClick={() => setCode(selectedChallenge.starterCode)}
                    className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer"
                    title="Reset code"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Success banner */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-4 py-2.5 bg-success-muted border-b border-success/20 flex items-center justify-between flex-shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">
                        All tests passed!
                      </span>
                      <span className="text-[11px] text-success/70">
                        Time: {timer}s
                      </span>
                    </div>
                    <button
                      onClick={() => setShowSuccess(false)}
                      className="p-1 rounded text-success/60 hover:text-success bg-transparent border-none cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tabs */}
              <div className="flex items-center gap-1 px-4 border-b border-border flex-shrink-0">
                {(["description", "tests", "leaderboard"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 text-[11px] font-medium transition-colors bg-transparent border-none border-b-2 cursor-pointer capitalize ${
                      activeTab === tab
                        ? "text-text-primary border-accent"
                        : "text-text-tertiary border-transparent hover:text-text-secondary"
                    }`}
                  >
                    {tab}
                    {tab === "tests" && testResults.length > 0 && (
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] ${
                        allPassed
                          ? "bg-success-muted text-success"
                          : "bg-error-muted text-error"
                      }`}>
                        {testResults.filter((r) => r.passed).length}/{testResults.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === "description" && (
                    <motion.div
                      key="desc"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col overflow-hidden"
                    >
                      <div className="flex-1 overflow-y-auto p-4">
                        <pre className="text-xs text-text-primary font-mono whitespace-pre-wrap leading-relaxed">
                          {selectedChallenge.description}
                        </pre>
                      </div>

                      {/* Hint toggle */}
                      <div className="px-4 py-2 border-t border-border flex-shrink-0">
                        <button
                          onClick={() => setShowHint(!showHint)}
                          className="flex items-center gap-1.5 text-[11px] text-warning hover:text-warning/80 transition-colors bg-transparent border-none cursor-pointer"
                        >
                          {showHint ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {showHint ? "Hide Hint" : "Show Hint"}
                        </button>
                        <AnimatePresence>
                          {showHint && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="text-[11px] text-warning/70 mt-1.5 pl-4 border-l-2 border-warning/30">
                                {selectedChallenge.hint}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Code editor */}
                      <div className="border-t border-border flex-shrink-0">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-bg-surface/50 border-b border-border">
                          <span className="text-[10px] text-text-tertiary font-mono">solution.js</span>
                          <button
                            onClick={runTests}
                            className="btn-press flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium bg-accent text-white hover:bg-accent-hover transition-colors border-none cursor-pointer"
                          >
                            <Play className="w-3 h-3" />
                            Run Tests
                          </button>
                        </div>
                        <textarea
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          spellCheck={false}
                          className="w-full h-48 bg-bg-base text-text-primary font-mono text-xs p-3 resize-none outline-none leading-relaxed"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "tests" && (
                    <motion.div
                      key="tests"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 overflow-y-auto p-4"
                    >
                      {testResults.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-[11px] text-text-tertiary">
                          Run your code to see test results here
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {testResults.map((result, i) => (
                            <div
                              key={i}
                              className={`rounded-lg border p-3 ${
                                result.passed
                                  ? "bg-success-muted border-success/15"
                                  : "bg-error-muted border-error/15"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {result.passed ? (
                                  <Check className="w-3.5 h-3.5 text-success" />
                                ) : (
                                  <X className="w-3.5 h-3.5 text-error" />
                                )}
                                <span className={`text-[11px] font-medium ${result.passed ? "text-success" : "text-error"}`}>
                                  Test {i + 1}
                                </span>
                              </div>
                              <div className="text-[10px] text-text-tertiary space-y-0.5">
                                <div>
                                  <span className="text-text-secondary">Input: </span>
                                  {result.testCase.input}
                                </div>
                                <div>
                                  <span className="text-text-secondary">Expected: </span>
                                  {result.testCase.expected}
                                </div>
                                <div>
                                  <span className="text-text-secondary">Got: </span>
                                  <span className={result.passed ? "text-success" : "text-error"}>
                                    {result.output}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "leaderboard" && (
                    <motion.div
                      key="leaderboard"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 overflow-y-auto p-4"
                    >
                      {leaderboardData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-[11px] text-text-tertiary">
                          No records yet. Complete a challenge to see your results.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium mb-2">
                            Personal Records
                          </div>
                          {leaderboardData
                            .sort((a, b) => b.timestamp - a.timestamp)
                            .slice(0, 20)
                            .map((entry, i) => {
                              const challenge = CHALLENGES.find((c) => c.id === entry.challengeId);
                              if (!challenge) return null;
                              return (
                                <div
                                  key={`${entry.challengeId}-${entry.timestamp}`}
                                  className="flex items-center justify-between px-3 py-2 rounded-md bg-bg-surface/50 border border-border"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-text-tertiary w-5 text-right">{i + 1}</span>
                                    <span className="text-[11px] text-text-primary">{challenge.title}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${DIFFICULTY_COLORS[challenge.difficulty].bg} ${DIFFICULTY_COLORS[challenge.difficulty].text} ${DIFFICULTY_COLORS[challenge.difficulty].border}`}>
                                      {challenge.difficulty}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-text-secondary">
                                      {entry.passedTests}/{entry.totalTests} passed
                                    </span>
                                    <span className={`text-[11px] font-mono font-medium ${
                                      entry.passedTests === entry.totalTests ? "text-success" : "text-warning"
                                    }`}>
                                      {entry.timeTaken}s
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Leaderboard panel (desktop overlay) */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-72 border-l border-border bg-bg-base flex-shrink-0 overflow-hidden hidden lg:flex flex-col"
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                <span className="text-[11px] font-medium text-text-primary">All Records</span>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="p-1 rounded text-text-tertiary hover:text-text-primary bg-transparent border-none cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {leaderboardData.length === 0 ? (
                  <div className="text-center py-8 text-[10px] text-text-tertiary">
                    No records yet
                  </div>
                ) : (
                  leaderboardData
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 30)
                    .map((entry, i) => {
                      const challenge = CHALLENGES.find((c) => c.id === entry.challengeId);
                      if (!challenge) return null;
                      return (
                        <div
                          key={`${entry.challengeId}-${entry.timestamp}`}
                          className="px-2 py-1.5 rounded-md hover:bg-bg-hover"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-text-primary">{challenge.title}</span>
                            <span className={`text-[10px] font-mono ${
                              entry.passedTests === entry.totalTests ? "text-success" : "text-warning"
                            }`}>
                              {entry.timeTaken}s
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] px-1 py-0.5 rounded-full ${DIFFICULTY_COLORS[challenge.difficulty].bg} ${DIFFICULTY_COLORS[challenge.difficulty].text}`}>
                              {challenge.difficulty}
                            </span>
                            <span className="text-[9px] text-text-tertiary">
                              {entry.passedTests}/{entry.totalTests}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile leaderboard bottom sheet */}
      <AnimatePresence>
        {showLeaderboard && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setShowLeaderboard(false)}
            />
            {/* Bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 lg:hidden max-h-[70vh] bg-bg-base border-t border-border rounded-t-2xl flex flex-col shadow-2xl"
            >
              {/* Drag handle + close button */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0">
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <div className="w-8 h-1 rounded-full bg-border" />
                </div>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="absolute right-4 p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors bg-transparent border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Title */}
              <div className="px-4 pb-2 flex-shrink-0">
                <span className="text-sm font-semibold text-text-primary">All Records</span>
              </div>
              {/* Leaderboard content */}
              <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
                {leaderboardData.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-text-tertiary">
                    No records yet
                  </div>
                ) : (
                  leaderboardData
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 30)
                    .map((entry, i) => {
                      const challenge = CHALLENGES.find((c) => c.id === entry.challengeId);
                      if (!challenge) return null;
                      return (
                        <div
                          key={`${entry.challengeId}-${entry.timestamp}`}
                          className="px-3 py-2 rounded-lg hover:bg-bg-hover"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-text-primary font-medium">{challenge.title}</span>
                            <span className={`text-[11px] font-mono font-semibold ${
                              entry.passedTests === entry.totalTests ? "text-success" : "text-warning"
                            }`}>
                              {entry.timeTaken}s
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${DIFFICULTY_COLORS[challenge.difficulty].bg} ${DIFFICULTY_COLORS[challenge.difficulty].text} ${DIFFICULTY_COLORS[challenge.difficulty].border}`}>
                              {challenge.difficulty}
                            </span>
                            <span className="text-[10px] text-text-tertiary">
                              {entry.passedTests}/{entry.totalTests} tests
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden iframe for execution */}
      <iframe ref={iframeRef} className="hidden" sandbox="allow-scripts" title="Challenge Sandbox" />
    </div>
  );
}
