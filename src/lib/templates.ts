// CodeBeing Developer Platform — Template Library
// Complete, runnable code templates organized by category.

export interface CodeTemplate {
  id: string;
  title: string;
  description: string;
  language: string;
  category: string;
  code: string;
  tags: string[];
}

export const templates: CodeTemplate[] = [
  // ──────────────────────────────────────────────
  //  1. REST API with Express.js
  // ──────────────────────────────────────────────
  {
    id: "rest-api-express",
    title: "REST API with Express.js",
    description:
      "A minimal Express.js REST API with CRUD endpoints for managing todo items, including JSON body parsing and error handling middleware.",
    language: "javascript",
    category: "API",
    tags: ["express", "rest", "crud", "node"],
    code: `import express from "express";

const app = express();
app.use(express.json());

type Todo = { id: number; title: string; done: boolean };
let todos: Todo[] = [];
let nextId = 1;

// List all todos
app.get("/todos", (_req, res) => {
  res.json(todos);
});

// Create a new todo
app.post("/todos", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });
  const todo: Todo = { id: nextId++, title, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

// Update a todo by id
app.put("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((t) => t.id === id);
  if (!todo) return res.status(404).json({ error: "not found" });
  Object.assign(todo, req.body);
  res.json(todo);
});

// Delete a todo by id
app.delete("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  todos = todos.filter((t) => t.id !== id);
  res.status(204).end();
});

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "internal server error" });
  }
);

app.listen(3000, () => console.log("Server listening on port 3000"));`,
  },

  // ──────────────────────────────────────────────
  //  2. React Custom Hook – useLocalStorage
  // ──────────────────────────────────────────────
  {
    id: "react-use-local-storage",
    title: "React Custom Hook (useLocalStorage)",
    description:
      "A type-safe React hook that persists state to localStorage with automatic serialization and deserialization.",
    language: "typescript",
    category: "Frontend",
    tags: ["react", "hooks", "localstorage", "persistence"],
    code: `import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Read the initial value from localStorage or fall back
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Wrapper that also writes to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue =
          value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(nextValue));
        return nextValue;
      });
    },
    [key]
  );

  // Sync across tabs via the "storage" event
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue) as T);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  return [storedValue, setValue];
}`,
  },

  // ──────────────────────────────────────────────
  //  3. Python Binary Search
  // ──────────────────────────────────────────────
  {
    id: "python-binary-search",
    title: "Python Binary Search",
    description:
      "Iterative and recursive binary search implementations that work on any sorted sequence, returning the index or -1.",
    language: "python",
    category: "Algorithms",
    tags: ["binary-search", "algorithms", "searching"],
    code: `def binary_search(arr: list[int], target: int) -> int:
    """Iterative binary search. Returns index of target or -1."""
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1


def binary_search_recursive(arr: list[int], target: int,
                            left: int = 0, right: int | None = None) -> int:
    """Recursive binary search. Returns index of target or -1."""
    if right is None:
        right = len(arr) - 1
    if left > right:
        return -1
    mid = left + (right - left) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    return binary_search_recursive(arr, target, left, mid - 1)


# Quick demo
if __name__ == "__main__":
    data = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    for val in [7, 2, 19, 0]:
        idx = binary_search(data, val)
        print(f"binary_search({val}) = {idx}")
        idx2 = binary_search_recursive(data, val)
        print(f"binary_search_recursive({val}) = {idx2}")`,
  },

  // ──────────────────────────────────────────────
  //  4. Python Flask REST API
  // ──────────────────────────────────────────────
  {
    id: "python-flask-rest-api",
    title: "Python Flask REST API",
    description:
      "A lightweight Flask REST API with in-memory storage, request validation, and JSON error responses.",
    language: "python",
    category: "API",
    tags: ["flask", "rest", "python", "crud"],
    code: `from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

# In-memory notes store
notes: dict[int, dict] = {}
_next_id = 1


def _new_id() -> int:
    global _next_id
    nid = _next_id
    _next_id += 1
    return nid


@app.route("/notes", methods=["GET"])
def list_notes():
    return jsonify(list(notes.values())), 200


@app.route("/notes/<int:note_id>", methods=["GET"])
def get_note(note_id: int):
    note = notes.get(note_id)
    if note is None:
        return jsonify({"error": "Note not found"}), 404
    return jsonify(note), 200


@app.route("/notes", methods=["POST"])
def create_note():
    body = request.get_json(silent=True) or {}
    title = body.get("title", "").strip()
    content = body.get("content", "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400
    note = {
        "id": _new_id(),
        "title": title,
        "content": content,
        "created_at": datetime.utcnow().isoformat(),
    }
    notes[note["id"]] = note
    return jsonify(note), 201


@app.route("/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id: int):
    if note_id not in notes:
        return jsonify({"error": "Note not found"}), 404
    del notes[note_id]
    return "", 204


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)`,
  },

  // ──────────────────────────────────────────────
  //  5. TypeScript Generic Stack
  // ──────────────────────────────────────────────
  {
    id: "typescript-generic-stack",
    title: "TypeScript Generic Stack",
    description:
      "A fully typed generic Stack implementation with push, pop, peek, size, and iterator support.",
    language: "typescript",
    category: "Algorithms",
    tags: ["generics", "data-structure", "stack", "typescript"],
    code: `export class Stack<T> implements Iterable<T> {
  private items: T[] = [];

  /** Push an item onto the top of the stack. */
  push(item: T): void {
    this.items.push(item);
  }

  /** Remove and return the top item. Throws if empty. */
  pop(): T {
    if (this.items.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.items.pop()!;
  }

  /** Return the top item without removing it. */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /** Number of items currently in the stack. */
  get size(): number {
    return this.items.length;
  }

  /** True when the stack has no items. */
  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  /** Remove all items from the stack. */
  clear(): void {
    this.items.length = 0;
  }

  /** Iterate from bottom to top. */
  [Symbol.iterator](): Iterator<T> {
    let index = 0;
    const items = this.items;
    return {
      next(): IteratorResult<T> {
        if (index < items.length) {
          return { value: items[index++], done: false };
        }
        return { value: undefined, done: true } as IteratorResult<T>;
      },
    };
  }
}

// Usage example
const nums = new Stack<number>();
for (const n of [10, 20, 30]) nums.push(n);
console.log(nums.peek()); // 30
console.log(nums.pop());  // 30
console.log([...nums]);   // [10, 20]`,
  },

  // ──────────────────────────────────────────────
  //  6. Go HTTP Server
  // ──────────────────────────────────────────────
  {
    id: "go-http-server",
    title: "Go HTTP Server",
    description:
      "A production-style Go HTTP server with structured JSON logging, graceful shutdown, and health-check endpoint.",
    language: "go",
    category: "Backend",
    tags: ["go", "http", "server", "graceful-shutdown"],
    code: `package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

// jsonLogger writes structured log lines to stdout.
func jsonLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		entry := map[string]interface{}{
			"method":   r.Method,
			"path":     r.URL.Path,
			"duration": time.Since(start).String(),
			"status":   w.Header().Get("X-Status"),
		}
		b, _ := json.Marshal(entry)
		fmt.Println(string(b))
	})
}

// healthHandler returns a simple JSON health payload.
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)

	handler := jsonLogger(mux)
	server := &http.Server{Addr: ":8080", Handler: handler}

	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		log.Println("Listening on :8080")
		if err := server.ListenAndServe(); err != http.ErrServerClosed {
			log.Fatalf("Listen error: %v", err)
		}
	}()

	// Wait for interrupt signal, then shut down gracefully
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	server.Shutdown(ctx)
	wg.Wait()
}`,
  },

  // ──────────────────────────────────────────────
  //  7. Rust CLI Argument Parser
  // ──────────────────────────────────────────────
  {
    id: "rust-cli-argument-parser",
    title: "Rust CLI Argument Parser",
    description:
      "A zero-dependency CLI argument parser that supports flags, options with values, and positional arguments.",
    language: "rust",
    category: "Utilities",
    tags: ["rust", "cli", "args", "parser"],
    code: `use std::collections::HashMap;
use std::env;

/// Simple CLI parser that separates flags, options, and positional args.
struct CliArgs {
    flags: Vec<String>,
    options: HashMap<String, String>,
    positional: Vec<String>,
}

impl CliArgs {
    fn parse() -> Self {
        let args: Vec<String> = env::args().skip(1).collect();
        let mut flags = Vec::new();
        let mut options = HashMap::new();
        let mut positional = Vec::new();
        let mut i = 0;

        while i < args.len() {
            let arg = &args[i];
            if arg.starts_with("--") {
                let key = arg[2..].to_string();
                if i + 1 < args.len() && !args[i + 1].starts_with('-') {
                    options.insert(key, args[i + 1].clone());
                    i += 2;
                } else {
                    flags.push(key);
                    i += 1;
                }
            } else if arg.starts_with('-') && arg.len() > 1 {
                // Treat single-dash tokens as combined flags (-abc → a, b, c)
                for ch in arg[1..].chars() {
                    flags.push(ch.to_string());
                }
                i += 1;
            } else {
                positional.push(arg.clone());
                i += 1;
            }
        }
        Self { flags, options, positional }
    }
}

fn main() {
    let cli = CliArgs::parse();
    println!("Flags:     {:?}", cli.flags);
    println!("Options:   {:?}", cli.options);
    println!("Positional: {:?}", cli.positional);

    if cli.flags.contains(&"help".to_string()) {
        println!("Usage: app [options] [args]");
        println!("  --name <value>   Set your name");
        println!("  --verbose        Enable verbose output");
        println!("  -v               Short for --verbose");
    }
}`,
  },

  // ──────────────────────────────────────────────
  //  8. SQL CRUD Queries
  // ──────────────────────────────────────────────
  {
    id: "sql-crud-queries",
    title: "SQL CRUD Queries",
    description:
      "Complete CREATE, READ, UPDATE, DELETE queries for a users table with indexing, filtering, and pagination.",
    language: "sql",
    category: "Database",
    tags: ["sql", "crud", "postgresql", "queries"],
    code: `-- ── Schema ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    email     VARCHAR(255) NOT NULL UNIQUE,
    role      VARCHAR(20)  NOT NULL DEFAULT 'member',
    active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

-- ── Create ──────────────────────────────────────
INSERT INTO users (name, email, role)
VALUES ('Alice', 'alice@example.com', 'admin');

-- ── Read ────────────────────────────────────────
SELECT * FROM users WHERE active = TRUE;

SELECT name, email FROM users
WHERE role = 'admin'
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

-- ── Update ──────────────────────────────────────
UPDATE users
SET name = 'Alice Smith', role = 'superadmin'
WHERE id = 1
RETURNING *;

-- Soft-delete example
UPDATE users SET active = FALSE WHERE id = 1;

-- ── Delete ──────────────────────────────────────
DELETE FROM users WHERE id = 1;

-- ── Aggregation ─────────────────────────────────
SELECT role, COUNT(*) AS total, MIN(created_at) AS earliest
FROM users
GROUP BY role
HAVING COUNT(*) > 1
ORDER BY total DESC;`,
  },

  // ──────────────────────────────────────────────
  //  9. Docker Compose (Node + PostgreSQL)
  // ──────────────────────────────────────────────
  {
    id: "docker-compose-node-postgres",
    title: "Docker Compose (Node + PostgreSQL)",
    description:
      "A two-service Docker Compose file that runs a Node.js API alongside a PostgreSQL database with health checks and volume mounts.",
    language: "yaml",
    category: "DevOps",
    tags: ["docker", "compose", "node", "postgresql"],
    code: `version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://app_user:secret@db:5432/app_db
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d app_db"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:`,
  },

  // ──────────────────────────────────────────────
  //  10. GitHub Actions CI/CD Pipeline
  // ──────────────────────────────────────────────
  {
    id: "github-actions-cicd",
    title: "GitHub Actions CI/CD Pipeline",
    description:
      "A CI/CD workflow that runs tests on push/PR and deploys to a staging environment on the main branch.",
    language: "yaml",
    category: "DevOps",
    tags: ["github-actions", "ci", "cd", "pipeline"],
    code: `name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-\${{ matrix.node-version }}
          path: coverage/

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: |
          echo "Deploying to staging server..."
          ssh -o StrictHostKeyChecking=no deploy@staging.example.com <<'EOF'
            cd /opt/app
            git pull origin main
            npm ci --production
            npm run build
            pm2 restart app
          EOF`,
  },

  // ──────────────────────────────────────────────
  //  11. Python Decorator Pattern
  // ──────────────────────────────────────────────
  {
    id: "python-decorator-pattern",
    title: "Python Decorator Pattern",
    description:
      "Reusable decorators for timing, retrying with exponential backoff, and singleton enforcement.",
    language: "python",
    category: "Utilities",
    tags: ["python", "decorators", "patterns", "retry"],
    code: `import functools
import time
import random


def timer(func):
    """Print elapsed time after each call."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper


def retry(max_attempts: int = 3, base_delay: float = 1.0):
    """Retry a function with exponential backoff."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as exc:
                    if attempt == max_attempts:
                        raise
                    delay = base_delay * (2 ** (attempt - 1))
                    print(f"Attempt {attempt} failed: {exc}. "
                          f"Retrying in {delay}s...")
                    time.sleep(delay)
        return wrapper
    return decorator


def singleton(cls):
    """Ensure a class has only one instance."""
    instances: dict[type, object] = {}

    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance


# Demo
@timer
@retry(max_attempts=3)
def unstable_api_call() -> str:
    if random.random() < 0.7:
        raise ConnectionError("Service unavailable")
    return "success"


@singleton
class DatabaseConnection:
    def __init__(self, url: str = "postgres://localhost/db"):
        self.url = url
        print(f"Connected to {self.url}")


if __name__ == "__main__":
    print(unstable_api_call())
    db1 = DatabaseConnection()
    db2 = DatabaseConnection()
    print(db1 is db2)  # True`,
  },

  // ──────────────────────────────────────────────
  //  12. JavaScript Debounce & Throttle
  // ──────────────────────────────────────────────
  {
    id: "js-debounce-throttle",
    title: "JavaScript Debounce & Throttle",
    description:
      "Production-ready debounce and throttle utilities with leading/trailing edge options and cancel support.",
    language: "javascript",
    category: "Frontend",
    tags: ["debounce", "throttle", "performance", "events"],
    code: `/**
 * Debounce — delays invocation until \`delay\` ms have elapsed
 * since the last call. Supports leading & trailing edges.
 */
export function debounce(fn, delay, { leading = false, trailing = true } = {}) {
  let timer = null;
  let isLeading = true;

  function debounced(...args) {
    const callNow = leading && isLeading;
    isLeading = false;

    clearTimeout(timer);
    timer = setTimeout(() => {
      if (trailing) fn.apply(this, args);
      timer = null;
      isLeading = true;
    }, delay);

    if (callNow) fn.apply(this, args);
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
    isLeading = true;
  };

  return debounced;
}

/**
 * Throttle — ensures fn is called at most once every \`interval\` ms.
 * Fires on the leading edge and once more on the trailing edge.
 */
export function throttle(fn, interval) {
  let lastTime = 0;
  let timer = null;

  function throttled(...args) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);

    if (remaining <= 0 || remaining > interval) {
      if (timer) { clearTimeout(timer); timer = null; }
      fn.apply(this, args);
      lastTime = now;
    } else if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastTime = Date.now();
        timer = null;
      }, remaining);
    }
  }

  throttled.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };

  return throttled;
}`,
  },

  // ──────────────────────────────────────────────
  //  13. React Context + Reducer Pattern
  // ──────────────────────────────────────────────
  {
    id: "react-context-reducer",
    title: "React Context + Reducer Pattern",
    description:
      "A type-safe React context combined with useReducer for global state management, complete with actions and a custom hook.",
    language: "typescript",
    category: "Frontend",
    tags: ["react", "context", "reducer", "state-management"],
    code: `import React, { createContext, useContext, useReducer, ReactNode } from "react";

// ── Types ──────────────────────────────────────
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QTY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR" };

interface CartState {
  items: CartItem[];
  total: number;
}

// ── Reducer ────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.payload.id);
      const items = existing
        ? state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...state.items, { ...action.payload, quantity: 1 }];
      return { items, total: items.reduce((s, i) => s + i.price * i.quantity, 0) };
    }
    case "REMOVE_ITEM":
      return cartReducer(
        { ...state, items: state.items.filter((i) => i.id !== action.payload) },
        { type: "CLEAR" } // recalc total
      );
    case "UPDATE_QTY": {
      const items = state.items
        .map((i) =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        )
        .filter((i) => i.quantity > 0);
      return { items, total: items.reduce((s, i) => s + i.price * i.quantity, 0) };
    }
    case "CLEAR":
      return { items: state.items, total: state.items.reduce((s, i) => s + i.price * i.quantity, 0) };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────
const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}`,
  },

  // ──────────────────────────────────────────────
  //  14. TypeScript Event Emitter
  // ──────────────────────────────────────────────
  {
    id: "typescript-event-emitter",
    title: "TypeScript Event Emitter",
    description:
      "A fully typed, generic Event Emitter class supporting on, off, once, and emit with wildcard listeners.",
    language: "typescript",
    category: "Backend",
    tags: ["events", "pubsub", "patterns", "typescript"],
    code: `type Listener<T = unknown> = (payload: T) => void;

export class EventEmitter<Events extends Record<string, unknown> = Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<Listener<any>>>();
  private wildcardListeners = new Set<Listener<{ event: string; payload: unknown }>>();

  /** Subscribe to a specific event. */
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  /** Subscribe to every event via a wildcard. */
  onAny(listener: Listener<{ event: string; payload: unknown }>): () => void {
    this.wildcardListeners.add(listener);
    return () => { this.wildcardListeners.delete(listener); };
  }

  /** Remove a listener for a specific event. */
  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this.listeners.get(event)?.delete(listener);
  }

  /** Subscribe once — auto-removes after the first invocation. */
  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const wrapper: Listener<Events[K]> = (payload) => {
      this.off(event, wrapper);
      listener(payload);
    };
    return this.on(event, wrapper);
  }

  /** Emit an event with a payload. */
  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners.get(event)?.forEach((fn) => {
      try { fn(payload); } catch (e) { console.error(e); }
    });
    this.wildcardListeners.forEach((fn) => {
      try { fn({ event: event as string, payload }); } catch (e) { console.error(e); }
    });
  }
}

// Usage
interface AppEvents {
  login: { userId: string; timestamp: number };
  logout: { userId: string };
  error: { message: string; code: number };
}

const bus = new EventEmitter<AppEvents>();
const unsub = bus.on("login", ({ userId }) => console.log(\`User \${userId} logged in\`));
bus.emit("login", { userId: "u1", timestamp: Date.now() });
unsub();`,
  },

  // ──────────────────────────────────────────────
  //  15. Python Async Web Scraper
  // ──────────────────────────────────────────────
  {
    id: "python-async-web-scraper",
    title: "Python Async Web Scraper",
    description:
      "A concurrent web scraper using aiohttp and asyncio that fetches multiple pages with rate limiting and error handling.",
    language: "python",
    category: "Utilities",
    tags: ["async", "aiohttp", "scraper", "python"],
    code: `import asyncio
import aiohttp
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ScrapedPage:
    url: str
    status: int
    text: str
    error: Optional[str] = None
    elapsed: float = 0.0


class AsyncScraper:
    def __init__(self, max_concurrent: int = 5, rate_limit: float = 0.5):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.rate_limit = rate_limit
        self.last_request_time: float = 0.0
        self.lock = asyncio.Lock()
        self.results: list[ScrapedPage] = field(default_factory=list)

    async def _fetch(self, session: aiohttp.ClientSession, url: str) -> ScrapedPage:
        async with self.semaphore:
            # Rate limiting
            async with self.lock:
                elapsed_since_last = asyncio.get_event_loop().time() - self.last_request_time
                if elapsed_since_last < self.rate_limit:
                    await asyncio.sleep(self.rate_limit - elapsed_since_last)
                self.last_request_time = asyncio.get_event_loop().time()

            import time
            start = time.perf_counter()
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    text = await resp.text()
                    elapsed = time.perf_counter() - start
                    return ScrapedPage(url=url, status=resp.status, text=text, elapsed=elapsed)
            except Exception as exc:
                elapsed = time.perf_counter() - start
                return ScrapedPage(url=url, status=0, text="", error=str(exc), elapsed=elapsed)

    async def scrape(self, urls: list[str]) -> list[ScrapedPage]:
        connector = aiohttp.TCPConnector(limit=0)
        async with aiohttp.ClientSession(connector=connector) as session:
            tasks = [self._fetch(session, url) for url in urls]
            self.results = await asyncio.gather(*tasks)
        return self.results


if __name__ == "__main__":
    urls = [
        "https://httpbin.org/get",
        "https://httpbin.org/delay/1",
        "https://httpbin.org/status/404",
        "https://httpbin.org/html",
    ]
    scraper = AsyncScraper(max_concurrent=2, rate_limit=0.3)
    results = asyncio.run(scraper.scrape(urls))
    for page in results:
        status = page.status if not page.error else f"ERROR: {page.error}"
        print(f"{page.url} → {status} ({page.elapsed:.2f}s)")`,
  },

  // ──────────────────────────────────────────────
  //  16. JWT Auth Middleware (Node.js)
  // ──────────────────────────────────────────────
  {
    id: "jwt-auth-middleware",
    title: "JWT Auth Middleware (Node.js)",
    description:
      "Express middleware for issuing and verifying JSON Web Tokens with configurable secret, expiry, and role-based authorization.",
    language: "javascript",
    category: "Auth",
    tags: ["jwt", "auth", "middleware", "security"],
    code: `import express from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "change-me-in-production";
const DEFAULT_EXPIRY = "1h";

/** Middleware: attach JWT payload to req.user or return 401. */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/** Middleware factory: require a specific role in the JWT. */
function authorize(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

/** Issue a signed JWT for the given payload. */
function signToken(payload, expiry = DEFAULT_EXPIRY) {
  return jwt.sign(payload, SECRET, { expiresIn: expiry });
}

// ── Demo routes ────────────────────────────────
const app = express();
app.use(express.json());

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // In production, verify against a database & hash comparison
  if (username === "admin" && password === "admin") {
    const token = signToken({ sub: username, role: "admin" });
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

app.get("/profile", authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.get("/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome, admin" });
});

app.listen(3000, () => console.log("Auth server on :3000"));`,
  },

  // ──────────────────────────────────────────────
  //  17. React Testing Library Component Test
  // ──────────────────────────────────────────────
  {
    id: "react-testing-library-test",
    title: "React Testing Library Component Test",
    description:
      "A comprehensive test suite for a Counter component using React Testing Library and Vitest/Jest, covering user interactions and edge cases.",
    language: "typescript",
    category: "Testing",
    tags: ["testing", "react-testing-library", "jest", "vitest"],
    code: `import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

// ── Component under test ───────────────────────
function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);
  const reset = () => setCount(initial);

  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// ── Tests ──────────────────────────────────────
describe("Counter", () => {
  it("renders the initial count", () => {
    render(<Counter initial={5} />);
    expect(screen.getByTestId("count").textContent).toBe("5");
  });

  it("increments the count on button click", async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByText("Increment"));
    await user.click(screen.getByText("Increment"));
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("decrements the count on button click", async () => {
    const user = userEvent.setup();
    render(<Counter initial={3} />);
    await user.click(screen.getByText("Decrement"));
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("resets to the initial value", async () => {
    const user = userEvent.setup();
    render(<Counter initial={10} />);
    await user.click(screen.getByText("Increment"));
    await user.click(screen.getByText("Increment"));
    await user.click(screen.getByText("Reset"));
    expect(screen.getByTestId("count").textContent).toBe("10");
  });

  it("matches snapshot", () => {
    const { container } = render(<Counter />);
    expect(container).toMatchSnapshot();
  });
});`,
  },

  // ──────────────────────────────────────────────
  //  18. Python Sorting Algorithms Comparison
  // ──────────────────────────────────────────────
  {
    id: "python-sorting-comparison",
    title: "Python Sorting Algorithms Comparison",
    description:
      "Implementations of bubble sort, merge sort, and quicksort with timing benchmarks and correctness verification.",
    language: "python",
    category: "Algorithms",
    tags: ["sorting", "algorithms", "benchmark", "python"],
    code: `import random
import time
from typing import Callable, List


def bubble_sort(arr: List[int]) -> List[int]:
    a = arr[:]
    n = len(a)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break
    return a


def merge_sort(arr: List[int]) -> List[int]:
    if len(arr) <= 1:
        return arr[:]
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    result: List[int] = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result


def quick_sort(arr: List[int]) -> List[int]:
    if len(arr) <= 1:
        return arr[:]
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)


def benchmark(name: str, func: Callable, data: List[int]) -> None:
    start = time.perf_counter()
    result = func(data)
    elapsed = time.perf_counter() - start
    assert result == sorted(data), f"{name} produced wrong result!"
    print(f"{name:12s}: {elapsed:.6f}s  (n={len(data)})")


if __name__ == "__main__":
    random.seed(42)
    sizes = [100, 1_000, 5_000]
    for size in sizes:
        data = [random.randint(0, size * 10) for _ in range(size)]
        print(f"\\nSize: {size}")
        benchmark("bubble_sort", bubble_sort, data)
        benchmark("merge_sort", merge_sort, data)
        benchmark("quick_sort", quick_sort, data)`,
  },

  // ──────────────────────────────────────────────
  //  19. Bash Script: Project Setup
  // ──────────────────────────────────────────────
  {
    id: "bash-project-setup",
    title: "Bash Script: Project Setup",
    description:
      "A portable Bash script that scaffolds a new Node.js/TypeScript project with Git, ESLint, Prettier, and GitHub repo creation.",
    language: "bash",
    category: "DevOps",
    tags: ["bash", "scaffolding", "project-setup", "automation"],
    code: `#!/usr/bin/env bash
# scaffold.sh — Bootstrap a new TypeScript project
set -euo pipefail

# ── Configuration ───────────────────────────────
PROJECT_NAME="\${1:?Usage: ./scaffold.sh <project-name>}"
DESCRIPTION="A new TypeScript project"
REPO_REMOTE=""

# ── Create project directory ────────────────────
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"
echo "📁 Created ./$PROJECT_NAME"

# ── Initialize git and package.json ─────────────
git init -b main
npm init -y > /dev/null
npm i -D typescript @types/node eslint prettier tsx vitest

# ── Create tsconfig.json ────────────────────────
cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
EOF

# ── Scaffold source structure ───────────────────
mkdir -p src tests
cat > src/index.ts <<'EOF'
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
EOF

cat > tests/index.test.ts <<'EOF'
import { describe, it, expect } from "vitest";
import { greet } from "../src/index";
describe("greet", () => {
  it("returns a greeting", () => expect(greet("World")).toBe("Hello, World!"));
});
EOF

# ── Add convenience npm scripts ─────────────────
npx json -I -f package.json -e '
  this.scripts.dev = "tsx watch src/index.ts";
  this.scripts.build = "tsc";
  this.scripts.test = "vitest run";
  this.scripts.lint = "eslint src tests";
'

echo "✅ Project '$PROJECT_NAME' is ready!"
echo "   cd $PROJECT_NAME && npm test"`,
  },

  // ──────────────────────────────────────────────
  //  20. Next.js API Route with Zod Validation
  // ──────────────────────────────────────────────
  {
    id: "nextjs-api-route-zod",
    title: "Next.js API Route with Zod Validation",
    description:
      "A Next.js App Router API route that validates request bodies and query params using Zod schemas with proper error responses.",
    language: "typescript",
    category: "API",
    tags: ["nextjs", "zod", "validation", "api-route"],
    code: `import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ── Validation schemas ─────────────────────────
const CreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().int().min(0).max(150).optional(),
});

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

type User = z.infer<typeof CreateUserSchema> & { id: string };
const users: User[] = [];

// ── GET /api/users ─────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { page, limit, search } = parsed.data;
  let filtered = users;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  const start = (page - 1) * limit;
  return NextResponse.json({
    data: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  });
}

// ── POST /api/users ────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = CreateUserSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 422 }
    );
  }

  const user: User = { id: crypto.randomUUID(), ...result.data };
  users.push(user);
  return NextResponse.json(user, { status: 201 });
}`,
  },

  // ──────────────────────────────────────────────
  //  21. Python Data Class with Validation
  // ──────────────────────────────────────────────
  {
    id: "python-dataclass-validation",
    title: "Python Data Class with Validation",
    description:
      "A validated data class using __post_init__ for field constraints, a from_dict factory method, and serialization.",
    language: "python",
    category: "Backend",
    tags: ["dataclass", "validation", "python", "patterns"],
    code: `from dataclasses import dataclass, field, asdict
from datetime import date, datetime
from typing import Optional


class ValidationError(Exception):
    """Raised when a field fails its validation check."""


def _validate_age(value: int) -> int:
    if not 0 <= value <= 150:
        raise ValidationError(f"Age {value} must be between 0 and 150")
    return value


@dataclass
class User:
    """A user record with built-in field validation."""
    username: str
    email: str
    age: int
    bio: Optional[str] = None
    is_active: bool = True
    created_at: date = field(default_factory=date.today)

    def __post_init__(self):
        self.username = self.username.strip().lower()
        if "@" not in self.email:
            raise ValidationError(f"Invalid email: {self.email}")
        if len(self.username) < 3:
            raise ValidationError("Username must be at least 3 characters")
        self.age = _validate_age(self.age)

    @classmethod
    def from_dict(cls, data: dict) -> "User":
        """Create a User from a dictionary, ignoring extra keys."""
        valid_keys = {f.name for f in cls.__dataclass_fields__.values()}
        filtered = {k: v for k, v in data.items() if k in valid_keys}
        return cls(**filtered)

    def to_dict(self) -> dict:
        return asdict(self)

    def to_public_dict(self) -> dict:
        d = self.to_dict()
        d["created_at"] = self.created_at.isoformat()
        return d


if __name__ == "__main__":
    u1 = User(username="Alice", email="alice@example.com", age=30)
    print(u1.to_public_dict())

    u2 = User.from_dict({
        "username": " Bob ",
        "email": "bob@example.com",
        "age": 25,
        "role": "admin",  # ignored — not a valid field
    })
    print(u2)`,
  },

  // ──────────────────────────────────────────────
  //  22. JavaScript Promise.all with Error Handling
  // ──────────────────────────────────────────────
  {
    id: "js-promise-all-error-handling",
    title: "JavaScript Promise.all with Error Handling",
    description:
      "Robust patterns for concurrent promise execution including settleAll, retryPromise, and batched execution.",
    language: "javascript",
    category: "Utilities",
    tags: ["promises", "async", "error-handling", "concurrency"],
    code: `/**
 * Like Promise.allSettled but returns { successes, failures } arrays.
 */
export async function settleAll(promises) {
  const results = await Promise.allSettled(promises);
  const successes = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
  const failures = results
    .filter((r) => r.status === "rejected")
    .map((r) => r.reason);
  return { successes, failures };
}

/**
 * Retry a promise-returning function with exponential backoff.
 */
export async function retryPromise(fn, { maxAttempts = 3, baseDelay = 1000 } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Process items in batches of \`concurrency\` at a time.
 */
export async function batchProcess(items, handler, { concurrency = 5 } = {}) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const { successes, failures } = await settleAll(batch.map(handler));
    results.push(...successes);
    if (failures.length > 0) {
      console.warn(\`Batch \${i / concurrency + 1}: \${failures.length} failures\`, failures);
    }
  }
  return results;
}

// ── Demo ───────────────────────────────────────
async function fetchUser(id) {
  if (id === 3) throw new Error("User 3 not found");
  return { id, name: \`User \${id}\` };
}

(async () => {
  const { successes, failures } = await settleAll([1, 2, 3, 4].map(fetchUser));
  console.log("Successes:", successes);
  console.log("Failures:", failures.map((e) => e.message));

  const retried = await retryPromise(() => fetchUser(3), { maxAttempts: 2 });
  console.log("Retried:", retried);
})();`,
  },

  // ──────────────────────────────────────────────
  //  23. TypeScript Middleware Chain Pattern
  // ──────────────────────────────────────────────
  {
    id: "typescript-middleware-chain",
    title: "TypeScript Middleware Chain Pattern",
    description:
      "A composable middleware chain similar to Koa/Express that processes requests through a pipeline of async handlers.",
    language: "typescript",
    category: "Backend",
    tags: ["middleware", "patterns", "chain", "typescript"],
    code: `type Middleware<T> = (ctx: T, next: () => Promise<void>) => Promise<void>;

export class MiddlewareChain<T> {
  private middlewares: Middleware<T>[] = [];

  /** Append a middleware to the chain. */
  use(middleware: Middleware<T>): this {
    this.middlewares.push(middleware);
    return this;
  }

  /** Execute all middleware in order over the given context. */
  async execute(ctx: T): Promise<void> {
    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      if (i < this.middlewares.length) {
        await this.middlewares[i](ctx, () => dispatch(i + 1));
      }
    };

    await dispatch(0);
  }
}

// ── Example: HTTP request context ──────────────
interface RequestContext {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  status: number;
  response?: unknown;
}

// Timing middleware
const timer: Middleware<RequestContext> = async (ctx, next) => {
  const start = performance.now();
  await next();
  const ms = (performance.now() - start).toFixed(2);
  ctx.headers["x-response-time"] = \`\${ms}ms\`;
  console.log(\`\${ctx.method} \${ctx.url} — \${ms}ms\`);
};

// Auth middleware
const auth: Middleware<RequestContext> = async (ctx, next) => {
  const token = ctx.headers["authorization"];
  if (!token) {
    ctx.status = 401;
    ctx.response = { error: "Unauthorized" };
    return;
  }
  await next();
};

// Logger middleware
const logger: Middleware<RequestContext> = async (ctx, next) => {
  console.log(\`→ \${ctx.method} \${ctx.url}\`);
  await next();
  console.log(\`← \${ctx.status}\`);
};

// Usage
const chain = new MiddlewareChain<RequestContext>();
chain.use(timer).use(logger).use(auth);

const ctx: RequestContext = {
  method: "GET", url: "/api/profile",
  headers: { authorization: "Bearer token123" },
  status: 200, response: { name: "Alice" },
};
await chain.execute(ctx);`,
  },

  // ──────────────────────────────────────────────
  //  24. SQL Window Functions
  // ──────────────────────────────────────────────
  {
    id: "sql-window-functions",
    title: "SQL Window Functions",
    description:
      "Advanced SQL queries demonstrating ROW_NUMBER, RANK, LAG/LEAD, running totals, and moving averages over an orders table.",
    language: "sql",
    category: "Database",
    tags: ["sql", "window-functions", "analytics", "postgresql"],
    code: `-- ── Sample data ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id         SERIAL PRIMARY KEY,
    customer   VARCHAR(50)  NOT NULL,
    product    VARCHAR(50)  NOT NULL,
    amount     NUMERIC(10,2) NOT NULL,
    order_date DATE         NOT NULL
);

INSERT INTO orders (customer, product, amount, order_date) VALUES
  ('Alice',  'Widget',  50.00, '2024-01-05'),
  ('Bob',    'Gadget', 120.00, '2024-01-07'),
  ('Alice',  'Gadget',  80.00, '2024-01-12'),
  ('Charlie','Widget',  50.00, '2024-01-15'),
  ('Bob',    'Widget',  50.00, '2024-01-20'),
  ('Alice',  'Doohickey',200.00,'2024-01-25'),
  ('Bob',    'Gadget', 120.00, '2024-02-01'),
  ('Charlie','Gadget',  80.00, '2024-02-05');

-- 1. Row number per customer ordered by date
SELECT *,
  ROW_NUMBER() OVER (PARTITION BY customer ORDER BY order_date) AS row_num
FROM orders;

-- 2. Rank customers by total spend
SELECT customer,
  SUM(amount) AS total_spend,
  RANK() OVER (ORDER BY SUM(amount) DESC) AS rank
FROM orders
GROUP BY customer;

-- 3. Compare each order to the customer's previous order amount
SELECT customer, order_date, amount,
  LAG(amount) OVER (PARTITION BY customer ORDER BY order_date) AS prev_amount,
  amount - LAG(amount) OVER (PARTITION BY customer ORDER BY order_date) AS delta
FROM orders;

-- 4. Running total per customer
SELECT customer, order_date, amount,
  SUM(amount) OVER (PARTITION BY customer ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM orders;

-- 5. 3-order moving average per customer
SELECT customer, order_date, amount,
  AVG(amount) OVER (PARTITION BY customer ORDER BY order_date
    ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS moving_avg
FROM orders;`,
  },

  // ──────────────────────────────────────────────
  //  25. Rust File Reader
  // ──────────────────────────────────────────────
  {
    id: "rust-file-reader",
    title: "Rust File Reader",
    description:
      "A Rust utility that reads a text file line-by-line with buffered I/O, counts words and lines, and reports file metadata.",
    language: "rust",
    category: "Utilities",
    tags: ["rust", "file-io", "buffered", "filesystem"],
    code: `use std::env;
use std::fs::{self, File, Metadata};
use std::io::{BufRead, BufReader};
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

struct FileStats {
    path: String,
    size_bytes: u64,
    line_count: usize,
    word_count: usize,
    char_count: usize,
}

fn read_file_stats(path: &Path) -> Result<FileStats, String> {
    let file = File::open(path).map_err(|e| format!("Cannot open file: {e}"))?;
    let metadata: Metadata = file.metadata().map_err(|e| format!("Cannot read metadata: {e}"))?;

    let reader = BufReader::new(file);
    let mut line_count = 0usize;
    let mut word_count = 0usize;
    let mut char_count = 0usize;

    for line in reader.lines() {
        let line = line.map_err(|e| format!("Read error: {e}"))?;
        line_count += 1;
        word_count += line.split_whitespace().count();
        char_count += line.chars().count();
    }

    Ok(FileStats {
        path: path.display().to_string(),
        size_bytes: metadata.len(),
        line_count,
        word_count,
        char_count,
    })
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <file-path>", args[0]);
        std::process::exit(1);
    }

    let path = Path::new(&args[1]);
    match read_file_stats(path) {
        Ok(stats) => {
            println!("File:       {}", stats.path);
            println!("Size:       {} bytes", stats.size_bytes);
            println!("Lines:      {}", stats.line_count);
            println!("Words:      {}", stats.word_count);
            println!("Characters: {}", stats.char_count);
        }
        Err(err) => eprintln!("Error: {err}"),
    }
}`,
  },

  // ──────────────────────────────────────────────
  //  26. Go REST API with Chi
  // ──────────────────────────────────────────────
  {
    id: "go-rest-api-chi",
    title: "Go REST API with Chi",
    description:
      "A clean REST API built with the Chi router featuring CRUD endpoints, JSON middleware, and a custom 404 handler.",
    language: "go",
    category: "API",
    tags: ["go", "chi", "rest", "api"],
    code: `package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"sync"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Task struct {
	ID        int    \`json:"id"\`
	Title     string \`json:"title"\`
	Completed bool   \`json:"completed"\`
}

var (
	tasks  []Task
	nextID int
	mu     sync.RWMutex
)

func listTasks(w http.ResponseWriter, r *http.Request) {
	mu.RLock()
	defer mu.RUnlock()
	json.NewEncoder(w).Encode(tasks)
}

func createTask(w http.ResponseWriter, r *http.Request) {
	var t Task
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, \`{"error":"invalid JSON"}\`, 400)
		return
	}
	if t.Title == "" {
		http.Error(w, \`{"error":"title required"}\`, 400)
		return
	}
	mu.Lock()
	nextID++
	t.ID = nextID
	tasks = append(tasks, t)
	mu.Unlock()
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(t)
}

func deleteTask(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(chi.URLParam(r, "id"))
	mu.Lock()
	defer mu.Unlock()
	for i, t := range tasks {
		if t.ID == id {
			tasks = append(tasks[:i], tasks[i+1:]...)
			w.WriteHeader(204)
			return
		}
	}
	http.Error(w, \`{"error":"not found"}\`, 404)
}

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/tasks", listTasks)
	r.Post("/tasks", createTask)
	r.Delete("/tasks/{id}", deleteTask)

	http.ListenAndServe(":8080", r)
}`,
  },

  // ──────────────────────────────────────────────
  //  27. Python SQLAlchemy ORM Model
  // ──────────────────────────────────────────────
  {
    id: "python-sqlalchemy-orm",
    title: "Python SQLAlchemy ORM Model",
    description:
      "SQLAlchemy 2.0 ORM models with relationships, a typed repository pattern, and query examples including joins and pagination.",
    language: "python",
    category: "Database",
    tags: ["sqlalchemy", "orm", "python", "database"],
    code: `from datetime import datetime
from typing import Optional
from sqlalchemy import create_engine, ForeignKey, select, func
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    relationship, Session, joinedload
)


class Base(DeclarativeBase):
    pass


class Author(Base):
    __tablename__ = "authors"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False, index=True)
    email: Mapped[str] = mapped_column(unique=True)
    bio: Mapped[Optional[str]] = mapped_column(default=None)
    books: Mapped[list["Book"]] = relationship(back_populates="author", lazy="selectin")

    def __repr__(self) -> str:
        return f"Author(id={self.id}, name={self.name!r})"


class Book(Base):
    __tablename__ = "books"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(nullable=False, index=True)
    published_year: Mapped[Optional[int]] = mapped_column(default=None)
    author_id: Mapped[int] = mapped_column(ForeignKey("authors.id"))
    author: Mapped["Author"] = relationship(back_populates="books")

    def __repr__(self) -> str:
        return f"Book(id={self.id}, title={self.title!r})"


class AuthorRepository:
    def __init__(self, session: Session):
        self.session = session

    def find_by_id(self, author_id: int) -> Optional[Author]:
        stmt = select(Author).options(joinedload(Author.books)).where(Author.id == author_id)
        return self.session.scalar(stmt)

    def list_all(self, page: int = 1, size: int = 20) -> list[Author]:
        offset = (page - 1) * size
        stmt = select(Author).offset(offset).limit(size).order_by(Author.name)
        return list(self.session.scalars(stmt).all())

    def count(self) -> int:
        return self.session.scalar(select(func.count(Author.id))) or 0


if __name__ == "__main__":
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        repo = AuthorRepository(session)
        author = Author(name="J.K. Rowling", email="jk@example.com",
                        bio="British author")
        author.books = [
            Book(title="Harry Potter and the Philosopher's Stone", published_year=1997),
            Book(title="Harry Potter and the Chamber of Secrets", published_year=1998),
        ]
        session.add(author)
        session.commit()

        found = repo.find_by_id(1)
        print(found)
        for book in found.books:
            print(f"  → {book.title} ({book.published_year})")

        print(f"Total authors: {repo.count()}")`,
  },

  // ──────────────────────────────────────────────
  //  28. JavaScript Deep Clone Utility
  // ──────────────────────────────────────────────
  {
    id: "js-deep-clone",
    title: "JavaScript Deep Clone Utility",
    description:
      "A deep clone utility that handles Date, RegExp, Map, Set, Array, plain objects, and circular references without structuredClone.",
    language: "javascript",
    category: "Utilities",
    tags: ["deep-clone", "utility", "immutable", "javascript"],
    code: `/**
 * Deep clone a value, handling Date, RegExp, Map, Set, Array,
 * plain objects, and circular references.
 */
export function deepClone(value, seen = new WeakMap()) {
  // Primitives and functions are returned as-is
  if (value === null || typeof value !== "object") return value;

  // Circular reference protection
  if (seen.has(value)) return seen.get(value);

  // Date
  if (value instanceof Date) return new Date(value.getTime());

  // RegExp
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  // Map — recursively clone entries
  if (value instanceof Map) {
    const clone = new Map();
    seen.set(value, clone);
    for (const [k, v] of value) {
      clone.set(deepClone(k, seen), deepClone(v, seen));
    }
    return clone;
  }

  // Set
  if (value instanceof Set) {
    const clone = new Set();
    seen.set(value, clone);
    for (const item of value) clone.add(deepClone(item, seen));
    return clone;
  }

  // Array
  if (Array.isArray(value)) {
    const clone = [];
    seen.set(value, clone);
    for (let i = 0; i < value.length; i++) {
      clone[i] = deepClone(value[i], seen);
    }
    return clone;
  }

  // Plain object — check that it's not a special class instance
  const proto = Object.getPrototypeOf(value);
  if (proto !== null && proto !== Object.prototype) {
    return value; // Don't clone class instances
  }

  const clone = {};
  seen.set(value, clone);
  for (const key of Object.keys(value)) {
    clone[key] = deepClone(value[key], seen);
  }
  return clone;
}

// ── Demo ───────────────────────────────────────
const original = {
  date: new Date(),
  regex: /test/gi,
  map: new Map([["a", 1]]),
  nested: { arr: [1, { b: 2 }], set: new Set([1, 2, 3]) },
};
original.self = original; // circular reference

const cloned = deepClone(original);
console.log(cloned.date instanceof Date);         // true
console.log(cloned.regex instanceof RegExp);       // true
console.log(cloned.map.get("a"));                  // 1
console.log(cloned.self === cloned);               // true (circular preserved)
console.log(cloned !== original);                  // true`,
  },

  // ──────────────────────────────────────────────
  //  29. TypeScript Builder Pattern
  // ──────────────────────────────────────────────
  {
    id: "typescript-builder-pattern",
    title: "TypeScript Builder Pattern",
    description:
      "A type-safe, fluent Builder pattern for constructing complex objects step-by-step with compile-time validation of required fields.",
    language: "typescript",
    category: "Backend",
    tags: ["builder", "patterns", "fluent-api", "typescript"],
    code: `// ── Types ────────────────────────────────────────────
interface HTTPRequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  headers: Record<string, string>;
  body: unknown;
  timeout: number;
  retries: number;
}

// ── Builder ─────────────────────────────────────
class RequestBuilder {
  private config: Partial<HTTPRequestConfig> = {
    method: "GET",
    headers: {},
    timeout: 5000,
    retries: 0,
  };

  /** Set the HTTP method. */
  method(method: HTTPRequestConfig["method"]): this {
    this.config.method = method;
    return this;
  }

  /** Set the request URL (required). */
  url(url: string): this {
    this.config.url = url;
    return this;
  }

  /** Add a single header. */
  header(key: string, value: string): this {
    this.config.headers![key] = value;
    return this;
  }

  /** Merge multiple headers at once. */
  headers(headers: Record<string, string>): this {
    this.config.headers = { ...this.config.headers, ...headers };
    return this;
  }

  /** Set the JSON body. */
  body(data: unknown): this {
    this.config.body = data;
    return this;
  }

  /** Set the timeout in ms. */
  timeout(ms: number): this {
    this.config.timeout = ms;
    return this;
  }

  /** Enable retry with N attempts. */
  retries(count: number): this {
    this.config.retries = count;
    return this;
  }

  /** Build the final config. Throws if URL is missing. */
  build(): HTTPRequestConfig {
    if (!this.config.url) {
      throw new Error("url is required");
    }
    return this.config as HTTPRequestConfig;
  }
}

// ── Usage ───────────────────────────────────────
const request = new RequestBuilder()
  .method("POST")
  .url("https://api.example.com/users")
  .header("Authorization", "Bearer token123")
  .headers({ "Accept": "application/json", "X-Request-ID": "abc" })
  .body({ name: "Alice", role: "admin" })
  .timeout(10000)
  .retries(3)
  .build();

console.log(request);`,
  },

  // ──────────────────────────────────────────────
  //  30. CSS Grid Layout System
  // ──────────────────────────────────────────────
  {
    id: "css-grid-layout-system",
    title: "CSS Grid Layout System",
    description:
      "A responsive CSS Grid layout system with utility classes, named grid areas, auto-fit responsive columns, and dark mode support.",
    language: "typescript",
    category: "Frontend",
    tags: ["css", "grid", "layout", "responsive", "design-system"],
    code: `/* ─── CodeBeing Grid Layout System ─── */

/* CSS Custom Properties for theming */
:root {
  --cb-grid-columns: 12;
  --cb-grid-gap: 1rem;
  --cb-grid-margin: auto;
  --cb-container-max: 1200px;
  --cb-breakpoint-sm: 640px;
  --cb-breakpoint-md: 768px;
  --cb-breakpoint-lg: 1024px;
}

/* Container */
.cb-container {
  width: 100%;
  max-width: var(--cb-container-max);
  margin: var(--cb-grid-margin);
  padding: 0 var(--cb-grid-gap);
  box-sizing: border-box;
}

/* Grid wrapper */
.cb-grid {
  display: grid;
  gap: var(--cb-grid-gap);
  grid-template-columns: repeat(var(--cb-grid-columns), 1fr);
}

/* Span utilities: .cb-col-{n} spans n columns */
.cb-col-1  { grid-column: span 1; }
.cb-col-2  { grid-column: span 2; }
.cb-col-3  { grid-column: span 3; }
.cb-col-4  { grid-column: span 4; }
.cb-col-6  { grid-column: span 6; }
.cb-col-8  { grid-column: span 8; }
.cb-col-12 { grid-column: span 12; }

/* Responsive: stack on small screens */
@media (max-width: calc(var(--cb-breakpoint-md) - 1px)) {
  .cb-col-1, .cb-col-2, .cb-col-3, .cb-col-4,
  .cb-col-6, .cb-col-8, .cb-col-12 {
    grid-column: span 12;
  }
}

/* Auto-fit responsive cards */
.cb-auto-grid {
  display: grid;
  gap: var(--cb-grid-gap);
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
}

/* Named area layout */
.cb-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: var(--cb-grid-gap);
}

.cb-header  { grid-area: header; }
.cb-sidebar { grid-area: sidebar; }
.cb-main    { grid-area: main; }
.cb-footer  { grid-area: footer; }

@media (max-width: calc(var(--cb-breakpoint-md) - 1px)) {
  .cb-layout {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
}`,
  },

  // ──────────────────────────────────────────────
  //  31. Python FastAPI Endpoint
  // ──────────────────────────────────────────────
  {
    id: "python-fastapi-endpoint",
    title: "Python FastAPI Endpoint",
    description:
      "A complete FastAPI application with Pydantic models, path/query/body parameter validation, and automatic OpenAPI docs.",
    language: "python",
    category: "API",
    tags: ["fastapi", "pydantic", "python", "api"],
    code: `from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(title="CodeBeing API", version="1.0.0")

# ── Pydantic Models ─────────────────────────────
class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    role: str = Field(default="member", pattern=r"^(admin|member|viewer)$")

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

# ── In-memory store ─────────────────────────────
_fake_db: dict[int, dict] = {}
_next_id = 1


def _next_user_id() -> int:
    global _next_id
    uid = _next_id
    _next_id += 1
    return uid

# ── Endpoints ───────────────────────────────────
@app.get("/users", response_model=list[UserOut])
def list_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    users = list(_fake_db.values())
    if role:
        users = [u for u in users if u["role"] == role]
    return users[offset : offset + limit]


@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    user = _fake_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/users", response_model=UserOut, status_code=201)
def create_user(payload: UserCreate):
    user_id = _next_user_id()
    user = {
        "id": user_id,
        "name": payload.name,
        "email": payload.email,
        "role": payload.role,
        "created_at": datetime.utcnow(),
    }
    _fake_db[user_id] = user
    return user


@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int):
    if user_id not in _fake_db:
        raise HTTPException(status_code=404, detail="User not found")
    del _fake_db[user_id]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`,
  },

  // ──────────────────────────────────────────────
  //  32. JavaScript Array Utility Functions
  // ──────────────────────────────────────────────
  {
    id: "js-array-utilities",
    title: "JavaScript Array Utility Functions",
    description:
      "A library of reusable higher-order array utilities including chunk, flatten, unique, groupBy, sortBy, and zip.",
    language: "javascript",
    category: "Utilities",
    tags: ["arrays", "functional", "utilities", "javascript"],
    code: `/**
 * Split an array into chunks of the given size.
 */
export function chunk(array, size) {
  if (size < 1) throw new Error("Size must be >= 1");
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Flatten a nested array to the specified depth (default: Infinity).
 */
export function flatten(array, depth = Infinity) {
  return array.flat(depth);
}

/**
 * Deduplicate an array using a key function or primitive equality.
 */
export function unique(array, keyFn) {
  const seen = keyFn ? new Set() : new Set(array);
  if (!keyFn) return [...seen];
  const result = [];
  for (const item of array) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

/**
 * Group array items by a key function into a Map.
 */
export function groupBy(array, keyFn) {
  const map = new Map();
  for (const item of array) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

/**
 * Stable sort an array by an iteratee (number or string).
 */
export function sortBy(array, iteratee) {
  const fn = typeof iteratee === "function"
    ? iteratee
    : (item) => item[iteratee];
  return [...array].sort((a, b) => {
    const va = fn(a), vb = fn(b);
    return va < vb ? -1 : va > vb ? 1 : 0;
  });
}

/**
 * Zip multiple arrays into tuples.
 */
export function zip(...arrays) {
  const length = Math.min(...arrays.map((a) => a.length));
  return Array.from({ length }, (_, i) => arrays.map((a) => a[i]));
}

/**
 * Create a Map from key-value pairs (entries).
 */
export function fromPairs(pairs) {
  return new Map(pairs);
}

// ── Demo ───────────────────────────────────────
console.log(chunk([1, 2, 3, 4, 5], 2));       // [[1,2],[3,4],[5]]
console.log(flatten([1, [2, [3, [4]]]]));      // [1,2,3,4]
console.log(unique([{id:1},{id:2},{id:1}], x => x.id)); // 2 items
console.log(groupBy(["a","bb","c","dd"], s => s.length)); // Map {1:['a','c'], 2:['bb','dd']}
console.log(sortBy([{n:"C"},{n:"A"},{n:"B"}], "n")); // A, B, C
console.log(zip([1,2], ["a","b"], [true, false])); // [[1,a,true],[2,b,false]]`,
  },

  // ──────────────────────────────────────────────
  //  33. Python LRU Cache Implementation
  // ──────────────────────────────────────────────
  {
    id: "python-lru-cache",
    title: "Python LRU Cache Implementation",
    description:
      "A from-scratch LRU cache using an OrderedDict with O(1) get/put operations, eviction policy, and a decorator interface.",
    language: "python",
    category: "Algorithms",
    tags: ["lru", "cache", "data-structure", "python"],
    code: `from collections import OrderedDict
from functools import wraps
from typing import Any, Callable, Hashable, Optional, TypeVar

K = TypeVar("K", bound=Hashable)
V = TypeVar("V")
T = TypeVar("T")


class LRUCache:
    """Least-Recently-Used cache with O(1) get/put using OrderedDict."""

    def __init__(self, capacity: int):
        if capacity < 1:
            raise ValueError("Capacity must be >= 1")
        self.capacity = capacity
        self.cache: OrderedDict[K, V] = OrderedDict()
        self.hits = 0
        self.misses = 0

    def get(self, key: K) -> Optional[V]:
        if key in self.cache:
            self.hits += 1
            self.cache.move_to_end(key)  # mark as recently used
            return self.cache[key]
        self.misses += 1
        return None

    def put(self, key: K, value: V) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
            self.cache[key] = value
        else:
            if len(self.cache) >= self.capacity:
                self.cache.popitem(last=False)  # evict least recently used
            self.cache[key] = value

    def __len__(self) -> int:
        return len(self.cache)

    def __contains__(self, key: K) -> bool:
        return key in self.cache

    def clear(self) -> None:
        self.cache.clear()
        self.hits = 0
        self.misses = 0

    @property
    def hit_rate(self) -> float:
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0

    def __repr__(self) -> str:
        return (f"LRUCache(capacity={self.capacity}, "
                f"size={len(self)}, hit_rate={self.hit_rate:.1%})")


def lru_cache_decorator(maxsize: int = 128):
    """Decorator to memoize a function using an LRU cache."""
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        cache = LRUCache(maxsize)

        @wraps(func)
        def wrapper(*args, **kwargs):
            key = (args, frozenset(kwargs.items()))
            result = cache.get(key)
            if result is not None:
                return result
            result = func(*args, **kwargs)
            cache.put(key, result)
            return result

        wrapper.cache = cache  # expose for inspection
        return wrapper
    return decorator


# ── Demo ────────────────────────────────────────
if __name__ == "__main__":
    cache = LRUCache(3)
    for k in ["a", "b", "c", "d"]:
        cache.put(k, k.upper())
    print(cache)       # size=3 (a was evicted)
    print(cache.get("b"))  # b (hit, moved to end)
    print(cache.get("a"))  # None (miss)

    @lru_cache_decorator(maxsize=4)
    def fibonacci(n: int) -> int:
        if n < 2:
            return n
        return fibonacci(n - 1) + fibonacci(n - 2)

    print(f"fib(30) = {fibonacci(30)}")
    print(fibonacci.cache)`,
  },

  // ──────────────────────────────────────────────
  //  34. YAML Kubernetes Deployment
  // ──────────────────────────────────────────────
  {
    id: "yaml-k8s-deployment",
    title: "YAML Kubernetes Deployment",
    description:
      "A production-ready Kubernetes Deployment and Service manifest for a Node.js app with health checks, resource limits, and HPA.",
    language: "yaml",
    category: "DevOps",
    tags: ["kubernetes", "k8s", "deployment", "yaml"],
    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: codebeing-api
  labels:
    app: codebeing-api
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: codebeing-api
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: codebeing-api
        version: v1
    spec:
      containers:
        - name: api
          image: codebeing/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: codebeing-secrets
                  key: database-url
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: codebeing-api-svc
spec:
  type: LoadBalancer
  selector:
    app: codebeing-api
  ports:
    - port: 80
      targetPort: 3000
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: codebeing-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: codebeing-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70`,
  },

  // ──────────────────────────────────────────────
  //  35. TypeScript Result Error Handling
  // ──────────────────────────────────────────────
  {
    id: "typescript-result-type",
    title: "TypeScript Result Error Handling",
    description:
      "A Result monad type for functional error handling without try/catch, supporting map, flatMap, unwrap, and match.",
    language: "typescript",
    category: "Utilities",
    tags: ["result", "monad", "error-handling", "functional"],
    code: `type Err = { ok: false; error: Error };
type Ok<T> = { ok: true; value: T };
type Result<T> = Ok<T> | Err;

/** Create a successful Result. */
function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

/** Create a failed Result. */
function fail(error: string | Error): Result<never> {
  return { ok: false, error: error instanceof Error ? error : new Error(error) };
}

/** Wrap a throwing function in a Result. */
function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return ok(fn());
  } catch (e) {
    return fail(e instanceof Error ? e : new Error(String(e)));
  }
}

/** Transform the value if Ok; pass through errors. */
function map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
  return result.ok ? ok(fn(result.value)) : result;
}

/** Chain a Result-returning function. */
function flatMap<T, U>(result: Result<T>, fn: (value: T) => Result<U>): Result<U> {
  return result.ok ? fn(result.value) : result;
}

/** Pattern-match on Ok / Err. */
function match<T, U>(
  result: Result<T>,
  handlers: { ok: (value: T) => U; err: (error: Error) => U }
): U {
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error);
}

// ── Usage ───────────────────────────────────────
function parseJSON(input: string): Result<unknown> {
  return tryCatch(() => JSON.parse(input));
}

function validateString(data: unknown): Result<string> {
  if (typeof data === "string" && data.length > 0) return ok(data);
  return fail("Expected a non-empty string");
}

const result = flatMap(parseJSON('["hello", "world"]'), (data) =>
  flatMap(
    Array.isArray(data) && typeof data[0] === "string"
      ? ok(data[0])
      : fail("Expected string array"),
    validateString
  )
);

console.log(
  match(result, {
    ok: (val) => \`Success: "\${val}"\`,
    err: (e) => \`Error: \${e.message}\`,
  })
);`,
  },
];
