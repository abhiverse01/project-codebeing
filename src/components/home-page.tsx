// PHASE7: Complete homepage rebuild — mesh gradient hero, animated terminal, bento grid, tech ticker, developer section
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Terminal,
  BarChart3,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Zap,
  GitCompareArrows,
  Play,
  Slash,
  Mail,
  Github,
} from "lucide-react";

// ── Terminal Demo ──

const TERMINAL_DEMOS = [
  {
    prompt: "Write a Python function for binary search",
    output: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

# Example: search in sorted array
result = binary_search([1,3,5,7,9,11], 7)
print(f"Found at index: {result}")  # Output: 2`,
    language: "python",
    tab: "binary_search.py",
  },
  {
    prompt: "Create a React hook for local storage",
    output: `function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Usage:
const [theme, setTheme] = useLocalStorage("theme", "dark");`,
    language: "typescript",
    tab: "useLocalStorage.ts",
  },
  {
    prompt: "Implement merge sort in JavaScript",
    output: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}

// O(n log n) guaranteed — no worst-case O(n²)`,
    language: "javascript",
    tab: "mergeSort.js",
  },
];

// ── Animated Terminal ──

function AnimatedTerminal() {
  const [demoIndex, setDemoIndex] = useState(0);
  const [terminalState, setTerminalState] = useState({
    displayedPrompt: "",
    displayedOutput: "",
    phase: "typing-prompt" as "typing-prompt" | "typing-output" | "waiting",
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const demo = TERMINAL_DEMOS[demoIndex];

  // Reset terminal state when demo changes — this is an intentional pattern for cycling demos
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional state reset for demo cycling
    setTerminalState({ displayedPrompt: "", displayedOutput: "", phase: "typing-prompt" });
    let pi = 0;
    const promptTimer = setInterval(() => {
      pi += 1;
      setTerminalState((prev) => ({ ...prev, displayedPrompt: demo.prompt.slice(0, pi) }));
      if (pi >= demo.prompt.length) {
        clearInterval(promptTimer);
        setTerminalState((prev) => ({ ...prev, phase: "typing-output" }));
        let oi = 0;
        // GODMODE FIX #5: Output typing speed 10→18ms for smoother, more readable output.
        // 10ms was too fast — text appeared as a blur. 18ms lets users follow along.
        const outputTimer = setInterval(() => {
          oi += 1;
          setTerminalState((prev) => ({ ...prev, displayedOutput: demo.output.slice(0, oi) }));
          if (oi >= demo.output.length) {
            clearInterval(outputTimer);
            setTerminalState((prev) => ({ ...prev, phase: "waiting" }));
          }
        }, 18);
        return () => clearInterval(outputTimer);
      }
    }, 35);
    return () => clearInterval(promptTimer);
  }, [demoIndex]);

  useEffect(() => {
    if (terminalState.phase === "waiting") {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [terminalState.phase]);

  useEffect(() => {
    if (terminalState.phase === "waiting") {
      const timer = setTimeout(() => {
        setDemoIndex((i) => (i + 1) % TERMINAL_DEMOS.length);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [terminalState.phase]);

  return (
    <div
      className="w-full max-w-[680px] mx-auto rounded-xl overflow-hidden shadow-2xl h-[240px] sm:h-[300px] flex flex-col"
      /* Fixed height prevents terminal from growing as content is typed, which causes
         flexbox justify-center to shift the entire hero section upward. */
    >
      {/* macOS traffic light + tab bar */}
      <div className="flex items-center gap-0 px-4 py-2.5 border-b border-border bg-bg-surface flex-shrink-0">
        <div className="flex items-center gap-1.5 mr-4">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
        </div>
        {/* Tab bar */}
        <div className="flex items-center gap-0 flex-1 min-w-0">
          {TERMINAL_DEMOS.map((d, i) => (
            <span
              key={d.tab}
              className={`px-3 py-1 text-[11px] font-mono rounded-t-md whitespace-nowrap transition-colors ${
                i === demoIndex
                  ? "bg-bg-code text-text-on-dark"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {d.tab}
            </span>
          ))}
        </div>
        <span className="ml-auto text-[10px] text-text-tertiary font-mono pl-3">{demo.language}</span>
      </div>
      {/* GODMODE FIX #Issue3: flex-1 fills remaining space within fixed-height container.
          overflow-y-auto handles scrolling when content exceeds the available space. */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 sm:p-4 font-mono text-[13px] sm:text-[14px] leading-[var(--leading-code)] overflow-y-auto bg-bg-code min-h-0"
        style={{ fontFamily: "var(--font-mono), monospace" }}
      >
        <div className="text-accent mb-1">$ codebeing</div>
        <div className="text-text-on-dark">
          <span className="text-success">❯ </span>
          {terminalState.displayedPrompt}
          {terminalState.phase === "typing-prompt" && (
            <span className="inline-block w-2 h-4 bg-accent ml-0.5 animate-[cursorBlink_1s_step-end_infinite]" />
          )}
        </div>
        {terminalState.displayedOutput && (
          <pre className="mt-2 text-text-on-dark whitespace-pre-wrap">
            {terminalState.displayedOutput}
            {terminalState.phase === "typing-output" && (
              <span className="inline-block w-2 h-4 bg-accent ml-0.5 animate-[cursorBlink_1s_step-end_infinite]" />
            )}
          </pre>
        )}
      </div>
    </div>
  );
}

// ── Feature Grid (Bento) ──

const BENTO_FEATURES = [
  {
    title: "CodeGround",
    description:
      "AI-powered code generation with prompt scoring, slash commands, JS sandbox, and offline fallback. Your creative coding playground.",
    href: "/codeground",
    icon: Terminal,
    span: 2,
  },
  {
    title: "Algorithm Lab",
    description:
      "Visualize sorting algorithms and graph traversals step by step. Works entirely offline.",
    href: "/algorithm-lab",
    icon: BarChart3,
    span: 1,
  },
  {
    title: "Templates",
    description:
      "55+ curated code starters across 9 languages. Search, filter, copy, and build.",
    href: "/templates",
    icon: Sparkles,
    span: 1,
  },
  {
    title: "Learn Mode",
    description:
      "Interactive micro-lessons with editable code sandboxes. Run and experiment live.",
    href: "/learn",
    icon: GraduationCap,
    span: 1,
  },
  {
    title: "JS Sandbox",
    description:
      "Run JavaScript code directly in the browser with terminal-like output. Instant feedback loop.",
    href: "/codeground",
    icon: Play,
    span: 1,
  },
  {
    title: "Diff Viewer",
    description:
      "Compare code versions with line-by-line diffs. See additions, removals, and unchanged lines at a glance.",
    href: "/codeground",
    icon: GitCompareArrows,
    span: 1,
  },
  {
    title: "Slash Commands",
    description:
      "Type / in CodeGround to access language shortcuts, refactoring tools, and action templates.",
    href: "/codeground",
    icon: Slash,
    span: 1,
  },
];

// ── Tech Ticker ──

const TECH_ROW_1 = [
  "Python", "TypeScript", "React", "Next.js", "Tailwind CSS", "PostgreSQL",
  "GraphQL", "Redis", "FastAPI", "Express", "Docker", "Go",
];
const TECH_ROW_2 = [
  "JavaScript", "Rust", "Node.js", "HuggingFace", "Prisma", "MongoDB",
  "WebSocket", "Git", "Vercel", "Figma", "Swift", "Kotlin",
];

function TechTicker() {
  return (
    <div className="relative overflow-hidden py-8 border-t border-b border-border">
      {/* Fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-bg-base to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-bg-base to-transparent pointer-events-none" />

      {/* Row 1 — scrolls left */}
      <div className="flex mb-3">
        <div className="flex animate-marquee ticker-row whitespace-nowrap">
          {[...TECH_ROW_1, ...TECH_ROW_1].map((name, i) => (
            <span
              key={`r1-${i}`}
              className="mx-2 px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-bg-surface text-text-secondary"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="flex">
        <div className="flex animate-marquee-reverse ticker-row whitespace-nowrap">
          {[...TECH_ROW_2, ...TECH_ROW_2].map((name, i) => (
            <span
              key={`r2-${i}`}
              className="mx-2 px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-bg-surface text-text-secondary"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Team Members ──

const TEAM_MEMBERS = [
  {
    name: "Abhishek Shah",
    role: "Creator & Full-Stack Dev",
    bio: "Architect of CodeBeing. Passionate about developer tools, AI, and making coding accessible to everyone.",
    initials: "AS",
    gradient: "from-accent to-purple-500",
    github: "https://github.com/abhiverse01",
    email: "abhishek.aimarine@gmail.com",
  },
  {
    name: "Aachal Kumari",
    role: "Frontend Developer",
    bio: "Crafts pixel-perfect interfaces with modern frameworks. Focused on performance and delightful user experiences.",
    initials: "AK",
    gradient: "from-pink-500 to-rose-400",
    github: "",
    email: "",
  },
  {
    name: "Chandan Sah",
    role: "Backend Developer",
    bio: "Builds robust server architectures and APIs. Expert in databases, security, and scalable systems.",
    initials: "CS",
    gradient: "from-success to-teal-400",
    github: "",
    email: "",
  },
  {
    name: "Aman Poddar",
    role: "UI/UX Designer",
    bio: "Designs intuitive interfaces grounded in user research. Believes great design is invisible.",
    initials: "AP",
    gradient: "from-warning to-orange-400",
    github: "",
    email: "",
  },
];

// ── Animation Variants ──

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

// ── Home Page ──

export default function HomePage() {
  return (
    <div>
      {/* ═══ Hero Section ═══ */}
      {/* GODMODE FIX #Issue2: Removed justify-center — it clips content at the top when total
          content height exceeds available space, hiding the badge behind the navbar.
          pt-[var(--navbar-height)] reserves space for the navbar.
          my-auto on content provides SAFE centering — centers when space allows, but pushes
          content down (never up past the top edge) when space is tight. overflow-hidden
          clips the mesh gradient circles, not the content. */}
      <section className="relative h-[100dvh] flex flex-col items-center px-4 overflow-hidden pt-[var(--navbar-height)]">
        {/* Animated mesh gradient background — GODMODE FIX #6: responsive circle sizes.
            Fixed pixel sizes (w-[400px]/w-[500px]) don't scale on small viewports,
            causing overflow and wasted GPU. Now use vw-relative sizing with max constraints. */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top-left: accent-muted circle */}
          <div
            className="absolute -top-20 -left-20 w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full bg-accent-muted blur-[100px] sm:blur-[120px] opacity-60"
            style={{ animation: "meshFloat1 8s ease-in-out infinite" }}
          />
          {/* Top-right: purple circle */}
          <div
            className="absolute -top-10 -right-10 w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] rounded-full bg-purple-500/15 blur-[80px] sm:blur-[100px] opacity-50"
            style={{ animation: "meshFloat2 10s ease-in-out infinite" }}
          />
          {/* Bottom-center: pink circle */}
          <div
            className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full bg-pink-500/10 blur-[120px] sm:blur-[150px] opacity-40"
            style={{ animation: "meshFloat3 12s ease-in-out infinite" }}
          />
        </div>

        {/* Content — GODMODE FIX #Issue5/#Issue2: my-auto provides safe centering.
            When viewport is tall enough, content centers. When viewport is short,
            my-auto won't push past the top edge — content stays below the navbar.
            This fixes the badge-hidden-in-navbar bug that justify-center caused. */}
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 text-center max-w-3xl my-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-muted border border-accent/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-accent">
              AI-Powered &middot; 330+ Rules &middot; Offline-Ready
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-heading font-semibold text-text-primary leading-[1.1] tracking-[-0.02em] mb-2">
            Code at the speed of{" "}
            <span className="text-gradient">thought.</span>
          </h1>
          <h1 className="hero-heading font-semibold text-text-primary leading-[1.1] tracking-[-0.02em] mb-4">
            Your developer{" "}
            <span className="font-serif-accent text-accent">studio.</span>
          </h1>

          {/* GODMODE FIX #6: Subheadline responsive size — 18px fixed is too large on mobile */}
          <p className="text-base sm:text-[18px] text-text-secondary max-w-[520px] mx-auto mb-8 leading-[1.7]">
            Think, explore, learn, and build. The developer studio where ideas
            become working code — powered by AI when you need it, fully
            functional when you don&apos;t.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/codeground"
              className="btn-primary btn-press gap-2 text-sm"
            >
              <Zap className="w-4 h-4" />
              Open CodeGround
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/algorithm-lab" className="btn-ghost btn-press gap-2 text-sm">
              Explore tools
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 text-sm text-text-tertiary">
            {[
              "55+ Templates",
              "12 Dev Tools",
              "330+ Rules",
              "Free Forever",
            ].map((stat, i) => (
              <span key={stat} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-border">·</span>}
                {stat}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Animated Terminal — GODMODE FIX #Issue3/#Issue5: Fixed height instead of max-h prevents
            layout shift as terminal content grows during typing. flex-shrink-0 ensures terminal
            doesn't get squeezed by flexbox. Smoother entrance with scale + reduced delay. */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 w-full max-w-[680px] mx-auto mt-6 flex-shrink-0"
        >
          <AnimatedTerminal />
        </motion.div>
      </section>

      {/* ═══ Tech Ticker ═══ */}
      <TechTicker />

      {/* ═══ Feature Grid (Bento) ═══ */}
      <section className="py-[var(--space-section-mobile)] sm:py-[var(--space-section)] px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight mb-2">
              Everything you need to build
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Powerful modules that work independently or together. Every feature
              is fully functional — no stubs, no placeholders.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bento-grid"
          >
            {BENTO_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={item}
                  className={feature.span === 2 ? "sm:col-span-2" : ""}
                >
                  <Link
                    href={feature.href}
                    className="group glass-card block p-5 h-full transition-all duration-200 hover:shadow-md"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-1.5">
                      {feature.title}
                      <ArrowRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all duration-200" />
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══ Developer Section ═══ */}
      <section className="py-[var(--space-section-mobile)] sm:py-[var(--space-section)] px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight mb-2">
              Built by developers, for developers.
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              A small team with a big mission — making world-class developer
              tools free and accessible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Text + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              <p className="text-text-secondary text-sm leading-[var(--leading-body)] mb-6">
                CodeBeing was born from a simple idea: developer tools should be
                powerful, beautiful, and free. No paywalls, no feature gates, no
                compromises. Every feature is built with care, tested
              thoroughly, and designed to feel delightful.
              </p>
              <p className="text-text-secondary text-sm leading-[var(--leading-body)] mb-6">
                We believe in open-source, community-driven development. Whether
                you&apos;re learning your first language or shipping production code,
                CodeBeing grows with you.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="https://github.com/abhiverse01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost btn-press gap-2 text-sm"
                >
                  <Github className="w-4 h-4" />
                  Star on GitHub
                </Link>
                <a
                  href="mailto:abhishek.aimarine@gmail.com"
                  className="btn-ghost btn-press gap-2 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Contact Us
                </a>
              </div>
            </motion.div>

            {/* Right: Team cards */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-2 gap-3 bento-grid"
            >
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.name}
                  className="glass-card p-4 flex flex-col items-center text-center"
                >
                  {/* Gradient avatar */}
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-sm mb-3 flex-shrink-0`}
                  >
                    {member.initials}
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary mb-0.5">
                    {member.name}
                  </h4>
                  <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent-muted text-accent mb-2">
                    {member.role}
                  </span>
                  <p className="text-[11px] text-text-tertiary leading-relaxed">
                    {member.bio}
                  </p>
                  {/* Contact links */}
                  {(member.github || member.email) && (
                    <div className="flex items-center gap-2 mt-2">
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-tertiary hover:text-accent transition-colors"
                          aria-label={`${member.name} GitHub`}
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="text-text-tertiary hover:text-accent transition-colors"
                          aria-label={`${member.name} email`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
