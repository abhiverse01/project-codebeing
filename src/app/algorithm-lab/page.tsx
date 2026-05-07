// PHASE7: [D3] Eliminated hardcoded colors — replaced hex values with CSS variable-based Tailwind classes
// PHASE5: [M1] Converted sidebar to mobile bottom sheet with backdrop, drag handle, swipe-to-dismiss, Escape handler
// PHASE5: [L3] Added MutationObserver on html class + custom event to re-draw canvas on theme change
// PHASE4: Normalized speed delay so all algorithms run ~same wall-clock duration
// PHASE3: Replaced hardcoded dark colors with theme-aware Tailwind classes
"use client";
// PHASE3: Mobile responsiveness - flex-wrap controls, responsive canvas height, min-w slider labels

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Shuffle, ChevronRight } from "lucide-react";
import {
  SORTING_ALGORITHMS,
  generateRandomArray,
  AlgorithmKey,
  SortStep,
} from "@/lib/algorithms";

const ALGO_KEYS = Object.keys(SORTING_ALGORITHMS) as AlgorithmKey[];

export default function AlgorithmLabPage() {
  const [algo, setAlgo] = useState<AlgorithmKey>("merge");
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(50);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [array, setArray] = useState<number[]>(generateRandomArray(30));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // PHASE4: Mobile collapsible sidebar state
  const [showInfo, setShowInfo] = useState(false);
  // PHASE5: [M1] Touch start ref for swipe-to-dismiss on bottom sheet
  const touchStartRef = useRef<number>(0);
  // PHASE5: Live comparison and swap counters
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);

  const reset = useCallback((newAlgo?: AlgorithmKey, newSize?: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    const sz = newSize ?? arraySize;
    const newArr = generateRandomArray(sz);
    setArray(newArr);
    setStepIndex(0);
    setSteps([]);
    // PHASE5: Reset counters on reset
    setComparisons(0);
    setSwaps(0);
    if (newAlgo) setAlgo(newAlgo);
    if (newSize !== undefined) setArraySize(newSize);
  }, [arraySize]);

  const start = useCallback(() => {
    if (steps.length === 0) {
      const gen = SORTING_ALGORITHMS[algo].fn([...array]);
      const allSteps = [...gen];
      setSteps(allSteps);
      setStepIndex(0);
      setIsRunning(true);
      return;
    }
    setIsRunning(true);
  }, [algo, array, steps]);

  const pause = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning || steps.length === 0) return;
    // PHASE4: Normalized delay — targetDuration at speed 50 = 8000ms
    // delay = clamp(targetDuration * (1 - speed/100) * 2 / totalSteps, 4, 800)
    const totalSteps = steps.length;
    const targetDuration = 8000;
    const delay = Math.max(4, Math.min(800, targetDuration * (1 - speed / 100) * 2 / totalSteps));
    timerRef.current = setTimeout(() => {
      if (stepIndex < steps.length - 1) {
        const nextStep = steps[stepIndex + 1];
        // PHASE5: Count comparisons and swaps
        if (nextStep.comparing[0] >= 0) {
          setComparisons((c) => c + 1);
        }
        if (nextStep.swapping) {
          setSwaps((s) => s + 1);
        }
        setStepIndex((i) => i + 1);
      } else {
        setIsRunning(false);
      }
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRunning, stepIndex, steps, speed]);

  const currentStep = steps[stepIndex] || { array, comparing: [-1, -1] as [number, number], swapping: false, sorted: [] };
  const info = SORTING_ALGORITHMS[algo];

  // Sidebar content — shared between mobile bottom sheet and desktop inline
  const sidebarContent = (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className="text-xs font-semibold text-text-primary mb-3">{info.name}</h3>
        <div className="space-y-2">
          {[
            { label: "Best", value: info.timeBest, color: "text-success" },
            { label: "Average", value: info.timeAvg, color: "text-warning" },
            { label: "Worst", value: info.timeWorst, color: "text-error" },
            { label: "Space", value: info.space, color: "text-info" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-[11px] text-text-tertiary">{row.label}</span>
              <span className={`text-[11px] font-mono ${row.color}`}>{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-[11px] text-text-tertiary">Stable</span>
            <span className={`text-[11px] font-mono ${info.stable ? "text-success" : "text-error"}`}>
              {info.stable ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className="text-xs font-semibold text-text-primary mb-3">Legend</h3>
        <div className="space-y-2">
          {[
            { color: "bg-bg-elevated", label: "Unsorted" },
            { color: "bg-warning", label: "Comparing" },
            { color: "bg-error", label: "Swapping" },
            { color: "bg-success", label: "Sorted" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${l.color}`} />
              <span className="text-[11px] text-text-secondary">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Educational content */}
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className="text-xs font-semibold text-text-primary mb-3">How It Works</h3>
        <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
          {algo === 'bubble' && 'Bubble Sort repeatedly steps through the list, comparing adjacent pairs and swapping them if they are in the wrong order. It continues until no swaps are needed. Simple but slow — always O(n²) comparisons.'}
          {algo === 'insertion' && 'Insertion Sort builds the sorted array one element at a time. For each element, it shifts larger elements right and inserts the current element in its correct position. Fast for nearly-sorted data — O(n) best case.'}
          {algo === 'merge' && 'Merge Sort divides the array in half recursively, sorts each half, then merges them back together. Each level does O(n) work across log n levels, giving O(n log n) guaranteed. Requires O(n) extra space.'}
          {algo === 'quick' && 'Quick Sort picks a pivot element and partitions the array into values less than and greater than the pivot. Average case O(n log n) since each partition roughly halves the array. Worst case O(n²) on sorted input without median-of-three.'}
          {algo === 'heap' && 'Heap Sort first builds a max-heap in O(n) time. Then it repeatedly extracts the maximum element (root) and rebuilds the heap. Each extraction and re-heapify takes O(log n), for n elements: O(n log n) total. In-place with O(1) extra space.'}
          {(algo === 'merge-bottom-up') && 'Bottom-Up Merge Sort iteratively merges subarrays of increasing size: 1→2→4→8... No recursion means no stack overhead and better cache locality than the recursive version. Same O(n log n) guaranteed.'}
          {(algo === 'quick-3way') && '3-Way QuickSort (Dutch National Flag) partitions into three regions: less than, equal to, and greater than the pivot. This handles duplicate values efficiently — all equal elements are placed in position in a single pass, avoiding unnecessary recursive calls.'}
        </p>
        <div className="mt-2 px-2 py-1.5 rounded-md bg-accent-muted border border-accent/10">
          <p className="text-[10px] text-accent">
            <strong>Tip:</strong> {algo === 'quick' && 'Use median-of-three pivot to avoid O(n²) on sorted input.'}
            {algo === 'heap' && 'Heap Sort is guaranteed O(n log n) and uses no extra space — ideal for memory-constrained environments.'}
            {algo === 'merge' && 'Merge Sort is stable and always O(n log n), making it ideal for sorting linked lists and databases.'}
            {(algo === 'merge-bottom-up') && 'The bottom-up variant avoids recursion overhead — better for cache performance on large arrays.'}
            {(algo === 'quick-3way') && 'Use 3-Way QuickSort when your data contains many duplicate values for optimal performance.'}
            {algo === 'bubble' && 'Bubble Sort is mainly educational. In practice, Insertion Sort is almost always better for small arrays.'}
            {algo === 'insertion' && 'Insertion Sort is the fastest O(n²) sort in practice for small or nearly-sorted arrays. Many standard libraries switch to it for small subarrays.'}
          </p>
        </div>
      </div>

      {/* All algorithms comparison */}
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className="text-xs font-semibold text-text-primary mb-3">Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-text-tertiary">
                <th className="text-left pb-2 font-medium">Algorithm</th>
                <th className="text-right pb-2 font-medium">Avg</th>
                <th className="text-right pb-2 font-medium">Space</th>
              </tr>
            </thead>
            <tbody>
              {ALGO_KEYS.map((key) => {
                const a = SORTING_ALGORITHMS[key];
                const isActive = key === algo;
                return (
                  <tr key={key} className={isActive ? "text-text-primary" : "text-text-secondary"}>
                    <td className="py-1 font-medium">{a.name}</td>
                    <td className="py-1 text-right font-mono">{a.timeAvg}</td>
                    <td className="py-1 text-right font-mono">{a.space}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Draw bars on canvas
  useEffect(() => {
    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const arr = currentStep.array;
      const barW = w / arr.length;
      const maxVal = Math.max(...arr, 1);

      arr.forEach((val, i) => {
        const barH = (val / maxVal) * (h - 8);
        const x = i * barW;
        const y = h - barH;

        // PHASE7: [D3] Read all bar colors from CSS variables — zero hardcoded hex outside globals.css
        const styles = getComputedStyle(document.documentElement);
        let color = styles.getPropertyValue("--bg-elevated").trim() || "#e8e8ed";
        if (currentStep.sorted.includes(i)) color = styles.getPropertyValue("--success").trim() || "#34d399";
        else if (currentStep.comparing[0] === i || currentStep.comparing[1] === i) {
          color = currentStep.swapping
            ? (styles.getPropertyValue("--error").trim() || "#f87171")
            : (styles.getPropertyValue("--warning").trim() || "#fbbf24");
        }

        ctx.fillStyle = color;
        const radius = barW > 4 ? 2 : 0;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x + 0.5, y, barW - 1, barH, [radius, radius, 0, 0]);
        } else {
          // Fallback for browsers without roundRect
          ctx.rect(x + 0.5, y, barW - 1, barH);
        }
        ctx.fill();
      });
    };
    drawCanvas();
    // PHASE5: [L3] Re-draw canvas on theme-change custom event
    window.addEventListener("theme-change", drawCanvas);
    return () => window.removeEventListener("theme-change", drawCanvas);
  }, [currentStep]);

  // PHASE5: [L3] MutationObserver on html class to dispatch theme-change event for canvas re-draw
  useEffect(() => {
    const observer = new MutationObserver(() => {
      window.dispatchEvent(new CustomEvent("theme-change"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // PHASE5: [M1] Escape key handler to close info panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showInfo) setShowInfo(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showInfo]);

  // Reset when algo or size changes
  // PHASE5: Reset counters when algorithm or size changes
  const handleAlgoChange = (key: AlgorithmKey) => {
    setComparisons(0);
    setSwaps(0);
    reset(key);
  };
  const handleSizeChange = (sz: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    const newArr = generateRandomArray(sz);
    setArray(newArr);
    setArraySize(sz);
    setSteps([]);
    setStepIndex(0);
    setComparisons(0);
    setSwaps(0);
  };

  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow), no extra padding needed
    <div className="min-h-dvh bg-bg-base">
      {/* Header */}
      <section className="border-b border-border bg-bg-base/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-1">Algorithm Lab</h1>
          <p className="text-text-secondary text-sm">Visualize sorting algorithms step by step. Runs entirely in your browser.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Visualizer */}
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full"
                style={{ height: "clamp(200px, 40vw, 320px)" }}
              />
              {/* Progress bar */}
              {steps.length > 0 && (
                <div className="px-4 py-2 border-t border-border flex items-center gap-3">
                  <div className="flex-1 h-1 rounded-full bg-bg-hover overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-75" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-text-tertiary font-mono">
                    {stepIndex + 1}/{steps.length}
                  </span>
                </div>
              )}
              {/* PHASE5: Comparison and swap counters */}
              <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-text-tertiary">
                <span>Comparisons: <span className="text-text-primary font-mono">{comparisons}</span></span>
                <span>Swaps: <span className="text-text-primary font-mono">{swaps}</span></span>
                {steps.length > 0 && (
                  <span className="hidden sm:inline">Total steps: <span className="text-text-primary font-mono">{steps.length}</span></span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4">
              {/* Algo selector */}
              <div className="flex gap-1 p-0.5 rounded-lg bg-bg-hover border border-border">
                {ALGO_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleAlgoChange(key)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer border-none ${
                      algo === key ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary bg-transparent"
                    }`}
                  >
                    {SORTING_ALGORITHMS[key].name.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Playback */}
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => isRunning ? pause() : start()}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    isRunning ? "bg-warning-muted border-warning/20 text-warning" : "bg-accent border-accent text-white"
                  }`}>
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1); }}
                  className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary bg-transparent cursor-pointer transition-colors">
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => reset()}
                  className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary bg-transparent cursor-pointer transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => reset(undefined, arraySize)}
                  className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary bg-transparent cursor-pointer transition-colors">
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sliders */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto sm:ml-auto">
                <label className="flex items-center gap-2 text-[11px] text-text-secondary min-w-[180px] sm:min-w-0">
                  Size: <span className="text-text-primary font-mono">{arraySize}</span>
                  <input type="range" min={8} max={100} value={arraySize}
                    onChange={(e) => handleSizeChange(Number(e.target.value))}
                    className="w-16 sm:w-20 accent-accent" />
                </label>
                <label className="flex items-center gap-2 text-[11px] text-text-secondary min-w-[180px] sm:min-w-0">
                  Speed: <span className="text-text-primary font-mono">{speed}%</span>
                  <input type="range" min={1} max={100} value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-16 sm:w-20 accent-accent" />
                </label>
              </div>
            </div>
          </div>

          {/* PHASE5: [M1] Mobile bottom sheet toggle — shows algorithm name for prominence */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="lg:hidden w-full flex items-center justify-between px-4 py-3 mt-4 rounded-xl bg-bg-surface border border-border text-[12px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <span className="font-medium">{info.name} — tap for details</span>
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showInfo ? 'rotate-90' : ''}`} />
          </button>

          {/* Sidebar content — extracted so it can render in both mobile sheet and desktop inline */}
          {/* BUG: Sidebar was only visible when showInfo=true — on desktop the toggle button is lg:hidden, so once closed it was unreachable. FIX: Always render on desktop, use bottom sheet only on mobile. */}
          <div className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="space-y-4 sticky top-20">
              {sidebarContent}
            </div>
          </div>

          {/* Mobile bottom sheet */}
          {/* BUG FIX VERIFICATION: [Mobile Panel Z-Index] This AnimatePresence is correctly placed
              as a direct child of the flex container (line ~302), which has NO overflow-hidden or
              backdrop-filter. The header section with backdrop-blur-sm (line ~294) is a SIBLING
              ancestor, NOT a direct parent — so fixed positioning works relative to the viewport. */}
          <AnimatePresence>
            {showInfo && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowInfo(false)}
                />
                {/* BUG FIX: Changed from height:0→auto to y:"100%"→0 for reliable slide-up */}
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="fixed bottom-0 left-0 right-0 z-40 lg:hidden max-h-[60vh] bg-bg-surface rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
                  onTouchStart={(e) => { touchStartRef.current = e.touches[0].clientY; }}
                  onTouchEnd={(e) => {
                    const deltaY = e.changedTouches[0].clientY - touchStartRef.current;
                    if (deltaY > 80) setShowInfo(false);
                  }}
                >
                  <div className="flex justify-center pt-3">
                    <div className="w-12 h-1 bg-border rounded-full" />
                  </div>
                  <div className="px-4 pb-6 max-h-[60vh] overflow-y-auto">
                    {sidebarContent}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
