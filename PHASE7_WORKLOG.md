
---
## Session 3 — Review Round 2: 6 UI/UX Issues Fixed

### Issues Addressed

**Issue 1: Navbar labels drop below icons on resize**
- Root cause: Nav items had no `flex-shrink-0`, so when the viewport shrank between lg (1024px) and xl (1280px), flexbox could squeeze items, causing labels to wrap below icons. The right-side controls (Search, Theme, Sign Up) also competed for horizontal space.
- Fix: Added `flex-shrink-0` to logo, all nav `<li>` items, and right-side controls div. Added `overflow-hidden flex-shrink min-w-0` to the nav `<ul>`. Reduced nav item padding from `px-2` to `px-1.5` at lg breakpoint.
- Files: `src/components/navbar.tsx`

**Issue 2: Mobile navbar appears split second then closes instantly**
- Root cause: When the hamburger was clicked, `scroll-locked` class was added to `<html>`, changing `overflow` to `hidden`. This triggered a scroll event in some browsers. The scroll handler checked `scrollY > 50` and immediately closed the menu — the "flash open then close" bug.
- Fix: Added `mobileOpenTimeRef` timestamp guard. When the menu opens, the current timestamp is recorded. The scroll handler now ignores scroll events for 400ms after opening, giving the browser time to settle after the overflow change.
- Files: `src/components/navbar.tsx`

**Issue 3: Homepage coding animation causes upward shift, touching navbar**
- Root cause: The `AnimatedTerminal` used `max-h-[200px] sm:max-h-[280px]`, so the terminal started short and grew as typing animation added content. Since the hero section uses `justify-center`, this growth shifted ALL centered content (badge, headings, CTAs) upward. When total content exceeded 100dvh, the badge touched/overlapped the navbar.
- Fix: Changed terminal from `max-h` to fixed `h-[240px] sm:h-[300px]` with `flex flex-col`. Terminal content area uses `flex-1 min-h-0 overflow-y-auto` to scroll within the fixed container. Added `pt-[var(--navbar-height)]` to the hero section for guaranteed navbar clearance. Added `flex-shrink-0` to the terminal wrapper.
- Files: `src/components/home-page.tsx`

**Issue 4: Input box auto-highlighted (focus ring) on open**
- Root cause: Command palette used `setTimeout(() => inputRef.current?.focus(), 50)` without suppressing the visible focus ring. Learn page used `autoFocus` HTML attribute which shows a focus ring on page load. CodeGround already had the fix from a prior session.
- Fix: Command palette now applies `focus-soft` CSS class (which sets `outline:none !important; box-shadow:none !important`) before calling `.focus()`, then removes the class after 150ms. Learn page: replaced `autoFocus` attribute with programmatic focus using `requestAnimationFrame` + `focus-soft` class + delayed removal.
- Files: `src/components/command-palette.tsx`, `src/app/learn/page.tsx`

**Issue 5: Homepage animation redesign for smoother appearance**
- Root cause: Original animations used plain `y` offset (12px/16px) which felt mechanical. No scale or depth.
- Fix: Hero content entrance now includes `scale: 0.98 → 1` for a subtle cinematic zoom-in. Terminal entrance uses `scale: 0.97 → 1` with `y: 12` and reduced delay (0.15s). Duration reduced from 0.4-0.5s to 0.35-0.45s for snappier feel. Content `y` offset reduced from 12px to 8px to minimize perceived shift.
- Files: `src/components/home-page.tsx`

**Issue 6: Elements don't dynamically adjust on window resize**
- Root cause: Discrete responsive breakpoints (grid-cols-1 → grid-cols-2 at exactly 640px) caused sudden visual jumps when slowly resizing. No transition smoothing on grid or flex layout changes.
- Fix: Added `.bento-grid` CSS class with `transition: grid-template-columns 150ms var(--ease-out)` for smooth column count changes. Applied to feature grid and team grid on homepage. Added `nav [role="list"] > li` transition for smooth nav item appearance during resize.
- Files: `src/app/globals.css`, `src/components/home-page.tsx`

### Build Status: ✅ Zero errors, all 15 routes generated successfully

---
## Session 4 — Review Round 3: Root Cause Fixes

### Issues Addressed

**Issue 1 (CRITICAL): Mobile navbar flash-close — ROOT CAUSE FOUND AND FIXED**
- Root cause: `useEffect(() => { if (mobileOpen) closeMobile(); }, [pathname, mobileOpen, closeMobile])` — the "close on route change" effect had `mobileOpen` in its dependency array. When the user clicked the hamburger, `mobileOpen` changed to `true`, which triggered this effect, which immediately called `closeMobile()`, setting `mobileOpen` back to `false`. The menu existed for exactly 1 render cycle — the "split second flash" bug. The previous scroll-time guard (mobileOpenTimeRef) was a red herring — it addressed a secondary symptom, not the root cause.
- Fix: Used a `prevPathnameRef` to track the previous pathname. The effect now only closes the menu when `pathname` actually changes (i.e., real navigation), not when `mobileOpen` toggles.
- File: `src/components/navbar.tsx` (line 290-301)

**Issue 2: Element hidden permanently inside navbar**
- Root cause: Previous session added `overflow-hidden flex-shrink min-w-0` to the desktop nav `<ul>`. `flex-shrink` (not `-0`) allowed the ul to shrink under flexbox pressure. `min-w-0` removed the minimum width constraint. Combined with `overflow-hidden`, at certain viewport widths the entire nav list collapsed to zero width, hiding all items permanently.
- Fix: Removed `overflow-hidden flex-shrink min-w-0` from the `<ul>`. Items already have `flex-shrink-0` and `whitespace-nowrap`, which is sufficient to prevent wrapping and shrinking.
- File: `src/components/navbar.tsx` (line 345-349)

**Issue 3: Auto-focus ring still visible — ROOT CAUSE FOUND AND FIXED**
- Root cause: The `.focus-soft:focus` CSS class only targeted the `:focus` pseudo-class. However, programmatic `.focus()` calls trigger `:focus-visible` in Chrome, Safari, and Edge (browsers treat programmatic focus as keyboard-initiated). The global `:focus-visible { outline: 2px solid var(--accent) }` rule has higher specificity than `:focus` alone, so the accent ring leaked through the suppression.
- Fix: Changed `.focus-soft:focus` to `.focus-soft:focus, .focus-soft:focus-visible` — both pseudo-classes are now suppressed with `!important`.
- File: `src/app/globals.css` (line 581-591)

### Build Status: ✅ Zero errors, all 15 routes generated successfully

---
## Session 5 — Review Round 4: 3 Issues Fixed

### Issues Addressed

**Issue 1: Mobile menu (sidebar) CSS totally unprofessional — thorough redesign**
- Root cause: Mobile menu was a plain `bg-bg-surface` panel with `border-b`, basic `rounded-lg` items, flat icons, no visual hierarchy. Looked like a default dropdown, not a polished product.
- Fix: Complete visual redesign of the mobile dropdown menu:
  - Backdrop: Changed from flat `bg-bg-overlay` to `bg-black/40 backdrop-blur-sm` for depth
  - Panel: Added `rounded-b-2xl mx-2 shadow-2xl` for floating card feel instead of full-width bar
  - Animation: Changed from `height: 0 → auto` (causes reflow) to `y: -8 → 0` (GPU-accelerated slide-down)
  - Section label: Added "NAVIGATION" uppercase tracking-widest label for professional hierarchy
  - Nav items: Each icon now sits in a `w-8 h-8 rounded-lg bg-bg-hover` tile, giving a structured grid feel
  - Active state: Changed from subtle `bg-bg-hover` to `bg-accent-muted text-accent` with accent dot indicator
  - Typography: `text-[13px] font-medium` with `rounded-xl` hover areas for softer, modern feel
  - Actions section: Search now shows `⌘K` keyboard shortcut. Theme toggle has icon tile. Sign Up has `rounded-xl`
  - Spacing: Consistent `px-2 py-2.5` padding with proper `pt-4 pb-3` section breathing room
- File: `src/components/navbar.tsx` (lines 443-567)

**Issue 2: Homepage AI-Powered badge hidden inside navbar — ROOT CAUSE FOUND**
- Root cause: Hero section used `justify-center` inside `h-[100dvh]` with `pt-[var(--navbar-height)]`. With `justify-center`, when total content (badge + headings + subtext + CTAs + stats + terminal at 300px) exceeded available height `(100dvh - 56px)`, the TOP portion got clipped by `overflow-hidden`. The badge (at the top of the content stack) was pushed behind the navbar. The previous fix of adding `pt-[var(--navbar-height)]` didn't help because `justify-center` distributes space symmetrically — it pushes content UP past the padding when content is tall.
- Fix: Removed `justify-center` from the section. Added `my-auto` to the content `<motion.div>`. `my-auto` provides **safe centering** — it centers when viewport is tall, but clamps to the top edge (never pushes past it) when viewport is short. This guarantees the badge always stays below the navbar.
- File: `src/components/home-page.tsx` (line 389, 419)

**Issue 3: Input auto-focus highlight on page open — TRUE ROOT CAUSE FOUND**
- Root cause: The auto-focus effect `useEffect(() => { if (!loading) { focus } }, [loading])` had a logic flaw — `loading` starts as `false` on mount, so the condition `if (!loading)` was TRUE on initial render. This caused the effect to fire immediately when navigating to codeground, focusing the input and triggering `focus-within:border-accent/50` on the wrapper div. The `focus-soft` class suppressed the outline ring but NOT the `focus-within` border change on the parent wrapper.
- Fix (two parts):
  1. Added `hasGeneratedRef` (starts `false`, set to `true` when `setLoading(true)` is called in `sendPrompt`). The auto-focus effect now checks `if (!loading && hasGeneratedRef.current)` — only fires after a real generation completes, never on initial mount.
  2. Replaced `focus-within:border-accent/50` on the textarea wrapper with JS-driven `.input-wrapper-focused` class applied via `onFocus`/`onBlur` handlers on the textarea. This ensures the accent border only shows on real user interaction (click/tap/Tab), never on programmatic focus. Added matching `.input-wrapper-focused` CSS rule with accent border + subtle box-shadow.
- Files: `src/app/codeground/page.tsx` (lines 209-228, 394-395, 1028, 1038-1039), `src/app/globals.css` (lines 581-588)

### Build Status: ✅ Zero errors, all 15 routes generated successfully
