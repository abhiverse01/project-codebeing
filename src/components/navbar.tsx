// PHASE7: Complete navbar rebuild — sticky, split logo, 6 nav items, accent underline, Framer Motion mobile menu
// GODMODE v2: 21 issues fixed — hydration flash, scroll lock, ARIA pattern correction, focus trap,
//   backdrop overlay, inert on main content, external theme sync, glass-card-flat, theme transition, etc.
"use client";

import { useState, useEffect, useCallback, useRef, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Terminal,
  BookOpen,
  Newspaper,
  BarChart3,
  Sparkles,
  Menu,
  X,
  Trophy,
  Sun,
  Moon,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/codeground", label: "CodeGround", icon: Terminal },
  { href: "/algorithm-lab", label: "Algorithm Lab", icon: BarChart3 },
  { href: "/templates", label: "Templates", icon: Sparkles },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/challenge", label: "Challenge", icon: Trophy },
  { href: "/blog", label: "Blog", icon: Newspaper },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // FIX #1: Hydration guard — isDark defaults to true (renders dark icon on SSR),
  //   but the layout inline script defaults to light mode. Without `mounted`, light-mode
  //   users would see a brief Sun→Moon flash on first paint.
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Unique ID for ARIA linking
  const menuId = useId();
  // Focus management refs
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Theme transition timeout cleanup
  const themeTransitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Hydration-safe theme read ──
  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // ── External theme sync (cross-component + cross-tab) ──
  useEffect(() => {
    const handler = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("theme-change", handler);
    const storageHandler = (e: StorageEvent) => {
      if (e.key === "cb-theme") {
        setIsDark(e.newValue === "dark");
      }
    };
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("theme-change", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  // GODMODE FIX #Issue2: Scroll-time guard — prevents mobile menu from closing instantly
  // when opened. Without this guard, opening the menu triggers scroll-locked (overflow:hidden
  // on html), which fires a scroll event in some browsers. If scrollY > 50, the menu closed
  // immediately — the "flash open then close" bug. Now we ignore scroll events for 400ms
  // after the menu opens, giving the browser time to settle.
  const mobileOpenTimeRef = useRef(0);

  // ── Combined scroll listener (glass effect + auto-close mobile) ──
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      if (window.scrollY > 50 && Date.now() - mobileOpenTimeRef.current > 400) {
        setMobileOpen((prev) => {
          if (prev) {
            requestAnimationFrame(() => hamburgerRef.current?.focus());
          }
          return false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GODMODE FIX #2: Close mobile menu when viewport crosses the lg breakpoint (1024px).
  // Without this, resizing from mobile→desktop leaves mobileOpen=true but the menu DOM
  // is hidden by lg:hidden. Resizing back re-renders it open, then scroll/route effects
  // close it instantly — causing the "flash open then close" bug.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024 && mobileOpen) {
        setMobileOpen(false);
        requestAnimationFrame(() => hamburgerRef.current?.focus());
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileOpen]);

  // ── Body scroll lock + inert on main content ──
  // FIX #17: When mobile menu opens, we lock body scroll AND mark main/footer as inert.
  //   `inert` removes elements from the tab order AND the accessibility tree, so screen
  //   readers and keyboard users can't accidentally reach content behind the menu.
  useEffect(() => {
    const html = document.documentElement;
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    if (mobileOpen) {
      html.classList.add("scroll-locked");
      if (main) main.setAttribute("inert", "");
      if (footer) footer.setAttribute("inert", "");
    } else {
      html.classList.remove("scroll-locked");
      if (main) main.removeAttribute("inert");
      if (footer) footer.removeAttribute("inert");
    }
    return () => {
      html.classList.remove("scroll-locked");
      if (main) main.removeAttribute("inert");
      if (footer) footer.removeAttribute("inert");
    };
  }, [mobileOpen]);

  // ── Focus trap ──
  // FIX #18: When mobile menu is open, Tab and Shift+Tab cycle within the menu's
  //   focusable elements. This prevents focus from escaping to inert page content.
  //   On reaching the last focusable element and pressing Tab, focus wraps to the first.
  //   On Shift+Tab at the first element, focus wraps to the last.
  useEffect(() => {
    if (!mobileOpen) return;

    const menu = menuRef.current;
    if (!menu) return;

    const FOCUSABLE_SELECTOR =
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = () =>
      Array.from(menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute("aria-hidden") && el.offsetParent !== null
      );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        // Shift+Tab: if at first element, wrap to last
        if (active === first || !menu.contains(active as Node)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if at last element, wrap to first
        if (active === last || !menu.contains(active as Node)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Also handle Tab from hamburger (which is outside the menu container)
    const handleHamburgerTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || e.shiftKey) return;
      if (document.activeElement === hamburgerRef.current) {
        e.preventDefault();
        const focusable = getFocusableElements();
        if (focusable.length > 0) focusable[0].focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    hamburgerRef.current?.addEventListener("keydown", handleHamburgerTab);

    // Auto-focus first item when menu opens
    requestAnimationFrame(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) focusable[0].focus();
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      hamburgerRef.current?.removeEventListener("keydown", handleHamburgerTab);
    };
  }, [mobileOpen]);

  // ── Theme toggle ──
  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const isCurrentlyDark = html.classList.contains("dark");
    html.classList.remove("light", "dark");
    const newTheme = isCurrentlyDark ? "light" : "dark";
    html.classList.add(newTheme);
    html.setAttribute("data-theme", newTheme);

    // Smooth theme transition (350ms)
    html.classList.add("theme-transitioning");
    if (themeTransitionRef.current) clearTimeout(themeTransitionRef.current);
    themeTransitionRef.current = setTimeout(() => {
      html.classList.remove("theme-transitioning");
      themeTransitionRef.current = null;
    }, 350);

    setIsDark(!isCurrentlyDark);
    try {
      localStorage.setItem("cb-theme", newTheme);
    } catch {
      /* ignore private browsing */
    }
    window.dispatchEvent(new CustomEvent("theme-change"));
  }, []);

  // Cleanup theme transition timeout
  useEffect(() => {
    return () => {
      if (themeTransitionRef.current) clearTimeout(themeTransitionRef.current);
    };
  }, []);

  // ── Zustand store refs (React 19 compatible) ──
  const toggleCommandPaletteRef = useRef(useAppStore.getState().toggleCommandPalette);
  const toggleKeyboardShortcutsRef = useRef(useAppStore.getState().toggleKeyboardShortcuts);

  useEffect(() => {
    const unsub1 = useAppStore.subscribe((state) => {
      toggleCommandPaletteRef.current = state.toggleCommandPalette;
    });
    const unsub2 = useAppStore.subscribe((state) => {
      toggleKeyboardShortcutsRef.current = state.toggleKeyboardShortcuts;
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  // ── Close mobile menu + return focus to hamburger ──
  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    requestAnimationFrame(() => {
      hamburgerRef.current?.focus();
    });
  }, []);

  // ── Global keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPaletteRef.current();
      }
      if (e.shiftKey && (e.key === "?" || e.key === "/") && !isInputFocused) {
        e.preventDefault();
        toggleKeyboardShortcutsRef.current();
      }
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeMobile]);

  // GODMODE FIX #Issue1-ROOT: Close mobile menu ONLY on actual route change.
  // PREVIOUS BUG: `mobileOpen` was in the dependency array, so when the user opened the menu
  // (mobileOpen changed to true), this effect immediately fired and called closeMobile().
  // The menu appeared for exactly 1 render cycle then vanished — the "split second flash".
  // FIX: Track previous pathname in a ref. Only close if pathname actually changed.
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (mobileOpen) closeMobile();
    }
  }, [pathname, mobileOpen, closeMobile]);

  // ── Logo click: scroll to top if already on home ──
  const handleLogoClick = useCallback(() => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    closeMobile();
  }, [pathname, closeMobile]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className={`sticky top-0 z-50 h-[var(--navbar-height)] flex items-center justify-center ${
        scrolled ? "glass-card-flat" : "navbar-base"
      } transition-shadow duration-200`}
      aria-label="Main navigation"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-full">
        {/* Logo — split: "Code" + "Being" in accent */}
        {/* GODMODE FIX #Issue1: flex-shrink-0 ensures logo never squishes during resize */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex-shrink-0 text-text-primary font-semibold flex items-center gap-2.5 tracking-tight hover:opacity-80 active:scale-[0.97] transition-all duration-150"
        >
          <Image
            src="/logo.png"
            alt="CodeBeing logo"
            width={32}
            height={32}
            className="rounded-md logo-sharp"
          />
          <span className="text-[15px] font-bold">
            Code<span className="text-accent">Being</span>
          </span>
        </Link>

        {/* Desktop Nav — GODMODE FIX #1: Two-tier responsive.
            lg (1024px): icon-only nav for tight viewports — no label wrapping.
            xl (1280px): icon + label nav with full text.
            < lg: hamburger menu handles mobile. */}
        {/* Desktop Nav — two-tier responsive: icon-only at lg, icon+label at xl. */}
        {/* GODMODE FIX #Issue2: Removed overflow-hidden/flex-shrink/min-w-0 that caused nav items
            to collapse at certain viewport widths. Items have flex-shrink-0 and whitespace-nowrap
            so they won't wrap or shrink. If they overflow, the ul scrolls gracefully. */}
        <ul className="hidden lg:flex items-center gap-0.5" role="list">
          {NAV_ITEMS.map((navItem) => {
            const Icon = navItem.icon;
            const active = isActive(navItem.href);
            return (
              <li key={navItem.href} className="flex-shrink-0">
                <Link
                  href={navItem.href}
                  title={navItem.label}
                  className={`relative flex items-center gap-1.5 px-1.5 xl:px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-150 whitespace-nowrap ${
                    active
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden xl:inline">{navItem.label}</span>
                  {active && (
                    <span className="absolute -bottom-px left-1 xl:left-2 right-1 xl:right-2 h-[2px] rounded-full bg-accent" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        {/* GODMODE FIX #Issue1: flex-shrink-0 prevents right-side controls from competing for
            space with nav items during resize. Without this, the Search button could squeeze
            nav items, causing labels to wrap below icons. */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Command palette trigger — ⌘K */}
          <button
            onClick={() => toggleCommandPaletteRef.current()}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-text-tertiary text-[12px] hover:border-border-hover hover:text-text-secondary hover:bg-bg-surface/50 transition-all duration-150 cursor-pointer bg-transparent"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="ml-3 px-1.5 py-0.5 rounded-md bg-bg-hover text-[10px] font-mono text-text-tertiary">
              &#8984;K
            </kbd>
          </button>

          {/* Theme toggle — hydration-safe */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover active:scale-[0.93] transition-all duration-150 bg-transparent border-none cursor-pointer"
            aria-label={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
            title={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
          >
            {mounted ? (
              isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )
            ) : (
              <div className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          {/* Sign Up CTA */}
          <Link
            href="/sign-up"
            onClick={closeMobile}
            className="btn-primary btn-press hidden sm:inline-flex text-[12px] font-medium px-4 py-1.5 rounded-lg"
          >
            Sign Up
          </Link>

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer active:scale-[0.93] transition-all duration-150"
            onClick={() => {
              setMobileOpen((prev) => {
                const next = !prev;
                if (next) mobileOpenTimeRef.current = Date.now();
                return next;
              });
            }}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls={menuId}
          >
            {mobileOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Sidebar — Professional right-edge drawer with spring animation ── */}
      {/* GODMODE FIX: Redesigned from dropdown to full-height right-edge drawer.
          Industry-standard pattern (used by Linear, Vercel, Raycast). Full viewport height,
          slide-from-right with spring physics, backdrop covers everything including navbar.
          Proper visual hierarchy: header, scrollable nav, fixed bottom CTA. */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop — covers entire viewport including navbar */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              aria-hidden="true"
              onClick={closeMobile}
            />

            {/* Drawer panel — slides from right edge with depth shadow */}
            <motion.div
              ref={menuRef}
              id={menuId}
              aria-label="Navigation menu"
              aria-modal="true"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.85 }}
              className="lg:hidden fixed inset-y-0 right-0 w-[280px] max-w-[82vw] z-[101] flex flex-col overflow-hidden"
              style={{
                background: 'var(--bg-surface)',
                boxShadow: '-8px 0 32px rgba(0,0,0,0.18), -2px 0 8px rgba(0,0,0,0.08)',
                borderLeft: '1px solid var(--border-strong)',
              }}
            >
              {/* Header — close button + branding */}
              <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
                  Menu
                </span>
                <button
                  onClick={closeMobile}
                  className="p-2 -mr-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover active:scale-[0.92] transition-all duration-150 bg-transparent border-none cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* Subtle divider below header */}
              <div className="mx-4 border-t border-border" />

              {/* Scrollable navigation items */}
              <nav className="flex-1 overflow-y-auto px-3 pt-2" aria-label="Main navigation">
                <ul className="space-y-0.5" role="list">
                  {NAV_ITEMS.map((navItem) => {
                    const Icon = navItem.icon;
                    const active = isActive(navItem.href);
                    return (
                      <li key={navItem.href}>
                        <Link
                          href={navItem.href}
                          onClick={closeMobile}
                          className={`group flex items-center gap-3 px-3 py-[10px] rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                            active
                              ? "text-accent bg-accent-muted/70 shadow-sm shadow-accent/5"
                              : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-150 ${
                            active ? "text-accent" : "text-text-tertiary group-hover:text-text-secondary"
                          }`} />
                          <span className="truncate">{navItem.label}</span>
                          {active && (
                            <span className="ml-auto w-[3px] h-4 rounded-full bg-accent flex-shrink-0" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Divider */}
                <div className="my-2.5 mx-3 border-t border-border" />

                {/* Utility actions — Search + Theme */}
                <ul className="space-y-0.5" role="list">
                  <li>
                    <button
                      onClick={() => {
                        toggleCommandPaletteRef.current();
                        closeMobile();
                      }}
                      className="group flex items-center gap-3 px-3 py-[10px] rounded-lg text-[13.5px] font-medium transition-all duration-150 text-text-secondary hover:text-text-primary hover:bg-bg-hover w-full bg-transparent border-none cursor-pointer"
                    >
                      <Search className="w-4 h-4 flex-shrink-0 text-text-tertiary group-hover:text-text-secondary transition-colors duration-150" />
                      <span className="truncate">Search</span>
                      <kbd className="ml-auto text-[10px] font-mono text-text-tertiary/60 px-1.5 py-[2px] rounded-md bg-bg-hover">
                        &#8984;K
                      </kbd>
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => {
                        toggleTheme();
                        closeMobile();
                      }}
                      className="group flex items-center gap-3 px-3 py-[10px] rounded-lg text-[13.5px] font-medium transition-all duration-150 text-text-secondary hover:text-text-primary hover:bg-bg-hover w-full bg-transparent border-none cursor-pointer"
                    >
                      {mounted ? (
                        isDark ? (
                          <Sun className="w-4 h-4 flex-shrink-0 text-text-tertiary group-hover:text-text-secondary transition-colors duration-150" />
                        ) : (
                          <Moon className="w-4 h-4 flex-shrink-0 text-text-tertiary group-hover:text-text-secondary transition-colors duration-150" />
                        )
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      )}
                      <span className="truncate">
                        {mounted ? (isDark ? "Light Mode" : "Dark Mode") : "Toggle Theme"}
                      </span>
                    </button>
                  </li>
                </ul>
              </nav>

              {/* Fixed bottom CTA — always visible with elevated surface */}
              <div
                className="px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 mt-auto"
                style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, var(--bg-surface))', borderTop: '1px solid var(--border-strong)' }}
              >
                <Link
                  href="/sign-up"
                  onClick={closeMobile}
                  className="btn-primary btn-press flex items-center justify-center w-full text-[13px] font-medium py-2.5 rounded-xl"
                >
                  Get Started — Free
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
