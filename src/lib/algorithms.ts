// ── Sorting Algorithm Engine ──
// Generator-based step-by-step algorithms for visualization
// PHASE4: QuickSort now uses median-of-three pivot selection to avoid O(n²) on sorted input

export type SortStep = {
  array: number[];
  comparing: [number, number];
  swapping: boolean;
  sorted: number[];
  pivot?: number;
};

function* bubbleSortGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const sorted: number[] = [];
  for (let i = a.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      yield { array: [...a], comparing: [j, j + 1], swapping: a[j] > a[j + 1], sorted: [...sorted] };
      if (a[j] > a[j + 1]) {
        const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
      }
    }
    sorted.push(i);
  }
  sorted.push(0);
  yield { array: [...a], comparing: [-1, -1], swapping: false, sorted: [...sorted] };
}

// PHASE4: Median-of-three pivot selection to avoid O(n²) on sorted/reverse-sorted input
function medianOfThree(arr: number[], lo: number, hi: number): number {
  const mid = Math.floor((lo + hi) / 2);
  const a = arr[lo], b = arr[mid], c = arr[hi];
  // Sort lo, mid, hi conceptually and return the median index
  if (a > b) {
    if (b > c) return mid;
    if (a > c) return hi;
    return lo;
  } else {
    if (a > c) return lo;
    if (b > c) return hi;
    return mid;
  }
}

function* quickSortGen(arr: number[], lo = 0, hi = arr.length - 1, sorted: number[] = []): Generator<SortStep> {
  if (lo < hi) {
    // PHASE4: Use median-of-three pivot instead of always using last element
    const pivotIdx = medianOfThree(arr, lo, hi);
    // Swap median pivot to hi position (existing partitioning expects pivot at hi)
    const tmp0 = arr[pivotIdx]; arr[pivotIdx] = arr[hi]; arr[hi] = tmp0;
    let pivot = hi;
    let i = lo;
    for (let j = lo; j < hi; j++) {
      yield { array: [...arr], comparing: [j, pivot], swapping: arr[j] < arr[pivot], sorted: [...sorted], pivot };
      if (arr[j] < arr[pivot]) {
        const t2 = arr[i]; arr[i] = arr[j]; arr[j] = t2;
        i++;
      }
    }
    const t3 = arr[i]; arr[i] = arr[hi]; arr[hi] = t3;
    sorted.push(i);
    yield { array: [...arr], comparing: [-1, -1], swapping: false, sorted: [...sorted] };
    yield* quickSortGen(arr, lo, i - 1, sorted);
    yield* quickSortGen(arr, i + 1, hi, sorted);
  } else if (lo === hi) {
    sorted.push(lo);
  }
  if (lo === 0 && hi === arr.length - 1) {
    yield { array: [...arr], comparing: [-1, -1], swapping: false, sorted: Array.from({ length: arr.length }, (_, i) => i) };
  }
}

function* mergeSortGen(arr: number[], l = 0, r = arr.length - 1, sorted: number[] = []): Generator<SortStep> {
  if (l < r) {
    const m = Math.floor((l + r) / 2);
    yield* mergeSortGen(arr, l, m, sorted);
    yield* mergeSortGen(arr, m + 1, r, sorted);
    // Merge
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      yield { array: [...arr], comparing: [l + i, m + 1 + j], swapping: left[i] <= right[j], sorted: [...sorted] };
      if (left[i] <= right[j]) {
        arr[k] = left[i]; i++;
      } else {
        arr[k] = right[j]; j++;
      }
      k++;
    }
    while (i < left.length) { arr[k] = left[i]; i++; k++; }
    while (j < right.length) { arr[k] = right[j]; j++; k++; }
    yield { array: [...arr], comparing: [-1, -1], swapping: false, sorted: [...sorted] };
  }
  if (l === 0 && r === arr.length - 1) {
    yield { array: [...arr], comparing: [-1, -1], swapping: false, sorted: Array.from({ length: arr.length }, (_, i) => i) };
  }
}

// PHASE5: QuickSort with 3-way partition for better duplicate handling
function* quickSort3WayGen(arr: number[], lo = 0, hi = arr.length - 1, sorted: number[] = []): Generator<SortStep> {
  if (lo < hi) {
    const pivotIdx = medianOfThree(arr, lo, hi);
    const tmp0 = arr[pivotIdx]; arr[pivotIdx] = arr[hi]; arr[hi] = tmp0;
    const pivot = arr[hi];

    // Dutch National Flag partition
    let lt = lo;   // region: < pivot
    let gt = hi;   // region: > pivot
    let i = lo;    // current index

    while (i <= gt) {
      yield { array: [...arr], comparing: [i, Math.min(lt + 1, hi)], swapping: false, sorted: [...sorted], pivot: hi };

      if (arr[i] < pivot) {
        const t1 = arr[lt]; arr[lt] = arr[i]; arr[i] = t1;
        lt++;
        i++;
      } else if (arr[i] > pivot) {
        const t2 = arr[gt]; arr[gt] = arr[i]; arr[i] = t2;
        gt--;
      } else {
        i++; // arr[i] === pivot, skip
      }
    }

    // Mark pivot region as sorted
    for (let k = lt; k <= gt; k++) {
      sorted.push(k);
    }

    yield { array: [...arr], comparing: [-1, -1], swapping: false, sorted: [...sorted] };

    yield* quickSort3WayGen(arr, lo, lt - 1, sorted);
    yield* quickSort3WayGen(arr, gt + 1, hi, sorted);
  } else if (lo === hi) {
    sorted.push(lo);
  }

  if (lo === 0 && hi === arr.length - 1) {
    yield { array: [...arr], comparing: [-1, -1], swapping: false, sorted: Array.from({ length: arr.length }, (_, i) => i) };
  }
}

// PHASE5: MergeSort bottom-up iterative variant — no recursion, more cache-friendly
function* mergeSortBottomUpGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const n = a.length;
  const sorted: number[] = [];

  // Start with subarrays of size 1, merge pairs into size 2, 4, 8...
  for (let width = 1; width < n; width *= 2) {
    for (let i = 0; i < n; i += 2 * width) {
      const left = i;
      const mid = Math.min(i + width, n);
      const right = Math.min(i + 2 * width, n);

      // Merge a[left..mid-1] and a[mid..right-1]
      const leftArr = a.slice(left, mid);
      const rightArr = a.slice(mid, right);
      let li = 0, ri = 0, k = left;

      while (li < leftArr.length && ri < rightArr.length) {
        yield { array: [...a], comparing: [left + li, mid + ri], swapping: leftArr[li] <= rightArr[ri], sorted: [...sorted] };
        if (leftArr[li] <= rightArr[ri]) {
          a[k] = leftArr[li]; li++;
        } else {
          a[k] = rightArr[ri]; ri++;
        }
        k++;
      }
      while (li < leftArr.length) { a[k] = leftArr[li]; li++; k++; }
      while (ri < rightArr.length) { a[k] = rightArr[ri]; ri++; k++; }
    }
    yield { array: [...a], comparing: [-1, -1], swapping: false, sorted: [...sorted] };
  }

  // Mark all as sorted
  yield { array: [...a], comparing: [-1, -1], swapping: false, sorted: Array.from({ length: n }, (_, i) => i) };
}

function* heapSortGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const n = a.length;
  const sorted: number[] = [];

  function* heapify(size: number, root: number) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size && a[left] > a[largest]) largest = left;
    if (right < size && a[right] > a[largest]) largest = right;
    if (largest !== root) {
      yield { array: [...a], comparing: [root, largest], swapping: true, sorted: [...sorted] };
      const temp = a[root];
      a[root] = a[largest];
      a[largest] = temp;
      yield* heapify(size, largest);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    yield { array: [...a], comparing: [0, i], swapping: true, sorted };
    const tmp = a[0]; a[0] = a[i]; a[i] = tmp;
    sorted.push(i);
    yield* heapify(i, 0);
  }
  sorted.push(0);
  yield { array: [...a], comparing: [-1, -1], swapping: false, sorted: [...sorted] };
}

function* insertionSortGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const sorted: number[] = [];
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0) {
      yield { array: [...a], comparing: [j - 1, j], swapping: a[j - 1] > a[j], sorted: [...sorted] };
      if (a[j - 1] > a[j]) {
        const t4 = a[j - 1]; a[j - 1] = a[j]; a[j] = t4;
        j--;
      } else break;
    }
  }
  yield { array: [...a], comparing: [-1, -1], swapping: false, sorted: Array.from({ length: a.length }, (_, i) => i) };
}

// PHASE5: Added merge-bottom-up and quick-3way algorithm entries
export const SORTING_ALGORITHMS = {
  bubble: { name: "Bubble Sort", fn: bubbleSortGen, timeAvg: "O(n²)", timeBest: "O(n)", timeWorst: "O(n²)", space: "O(1)", stable: true },
  insertion: { name: "Insertion Sort", fn: insertionSortGen, timeAvg: "O(n²)", timeBest: "O(n)", timeWorst: "O(n²)", space: "O(1)", stable: true },
  merge: { name: "Merge Sort", fn: mergeSortGen, timeAvg: "O(n log n)", timeBest: "O(n log n)", timeWorst: "O(n log n)", space: "O(n)", stable: true },
  "merge-bottom-up": { name: "Merge (Bottom-Up)", fn: mergeSortBottomUpGen, timeAvg: "O(n log n)", timeBest: "O(n log n)", timeWorst: "O(n log n)", space: "O(n)", stable: true },
  quick: { name: "Quick Sort", fn: quickSortGen, timeAvg: "O(n log n)", timeBest: "O(n log n)", timeWorst: "O(n²)", space: "O(log n)", stable: false },
  "quick-3way": { name: "Quick (3-Way)", fn: quickSort3WayGen, timeAvg: "O(n log n)", timeBest: "O(n)", timeWorst: "O(n²)", space: "O(log n)", stable: false },
  heap: { name: "Heap Sort", fn: heapSortGen, timeAvg: "O(n log n)", timeBest: "O(n log n)", timeWorst: "O(n log n)", space: "O(1)", stable: false },
} as const;

export type AlgorithmKey = keyof typeof SORTING_ALGORITHMS;

export function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 5);
}

// ── Graph Algorithms ──

export interface GraphNode {
  id: number;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: number;
  to: number;
}

export function generateRandomGraph(nodeCount: number): { nodes: GraphNode[]; edges: GraphEdge[]; adjacency: Map<number, number[]> } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const adjacency = new Map<number, number[]>();

  // Position nodes in a circle
  const cx = 250, cy = 250, r = 180;
  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    nodes.push({
      id: i,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
    adjacency.set(i, []);
  }

  // Create edges (ensure connected graph with random extra edges)
  for (let i = 1; i < nodeCount; i++) {
    const target = Math.floor(Math.random() * i);
    edges.push({ from: i, to: target });
    adjacency.get(i)!.push(target);
    adjacency.get(target)!.push(i);
  }
  // Add some random extra edges
  const extraEdges = Math.floor(nodeCount * 0.5);
  for (let e = 0; e < extraEdges; e++) {
    const a = Math.floor(Math.random() * nodeCount);
    const b = Math.floor(Math.random() * nodeCount);
    if (a !== b && !adjacency.get(a)!.includes(b)) {
      edges.push({ from: a, to: b });
      adjacency.get(a)!.push(b);
      adjacency.get(b)!.push(a);
    }
  }

  return { nodes, edges, adjacency };
}

export function* bfsGenerator(
  adjacency: Map<number, number[]>,
  start: number
): Generator<{ visited: number[]; current: number; queue: number[] }> {
  const visited = new Set<number>();
  const queue: number[] = [start];
  visited.add(start);

  while (queue.length > 0) {
    const current = queue.shift()!;
    yield { visited: [...visited], current, queue: [...queue] };
    for (const neighbor of (adjacency.get(current) || []).sort((a, b) => a - b)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}

export function* dfsGenerator(
  adjacency: Map<number, number[]>,
  start: number
): Generator<{ visited: number[]; current: number; stack: number[] }> {
  const visited = new Set<number>();
  const stack: number[] = [start];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    yield { visited: [...visited], current, stack: [...stack] };
    for (const neighbor of (adjacency.get(current) || []).sort((a, b) => b - a)) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
}
