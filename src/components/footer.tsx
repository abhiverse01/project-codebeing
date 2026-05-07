// PHASE7: [D3] Eliminated 16 hardcoded hex colors — replaced with CSS variable-based Tailwind classes
// PHASE5: [R2] Migrated raw localStorage to safeStorage for Safari private browsing safety
// PHASE5: [FOOTER] Full redesign — gradient CTA section, developer card, social links, powered-up layout
// PHASE3: Replaced all hardcoded dark colors with theme-aware Tailwind classes
// PHASE3: Newsletter form now validates email with regex, stores to localStorage, shows toast
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, ExternalLink, Mail, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { safeStorage } from "@/lib/utils";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "CodeGround", href: "/codeground" },
      { label: "Algorithm Lab", href: "/algorithm-lab" },
      { label: "Templates", href: "/templates" },
      { label: "Learn", href: "/learn" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Team", href: "/team" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/team" },
      { label: "Contact", href: "mailto:abhishek.aimarine@gmail.com" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/abhiverse01", icon: Github },
  { label: "Portfolio", href: "https://abhishekshah.vercel.app", icon: ExternalLink },
  { label: "Email", href: "mailto:abhishek.aimarine@gmail.com", icon: Mail },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const pathname = usePathname();

  // Full-screen app pages should not show the footer — they use the entire viewport.
  const isFullPage = pathname === "/codeground" || pathname.startsWith("/playground");

  if (isFullPage) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email.trim())) {
      try {
        const existing = JSON.parse(safeStorage.get("cb-newsletter") || "[]");
        if (!existing.includes(email.trim())) {
          existing.push(email.trim());
          safeStorage.set("cb-newsletter", JSON.stringify(existing));
        }
      } catch { /* ignore */ }
      setSubscribed(true);
      setEmail("");
      toast.success("You're on the list!");
    }
  };

  return (
    <footer className="mt-auto">
      {/* Gradient CTA banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-accent via-accent-hover to-accent">
        {/* PHASE7: [D3] CTA shimmer overlays — white on accent background works in both themes */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 20% 50%, var(--cta-shimmer, rgba(255,255,255,0.1)), transparent)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 60% at 80% 50%, var(--cta-shimmer-subtle, rgba(255,255,255,0.08)), transparent)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-white/90" />
                <span className="text-[11px] font-medium text-white/70 uppercase tracking-wider">Built by developers, for developers</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                Start building something amazing today.
              </h3>
              <p className="text-white/70 text-sm mt-2 max-w-md">
                CodeBeing is free, open-source, and ready for your next project. No signup required to get started.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/codeground"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-accent bg-white rounded-lg hover:bg-white/90 active:scale-[0.97] transition-all duration-150 shadow-lg shadow-black/10"
              >
                Try CodeGround
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 active:scale-[0.97] transition-all duration-150"
              >
                Browse Templates
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="border-t border-border bg-bg-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          {/* Developer card */}
          <div className="flex flex-col sm:flex-row items-start gap-5 mb-10 p-5 rounded-xl bg-bg-surface border border-border">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              AS
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text-primary">Abhishek Shah</h4>
              <p className="text-[11px] text-text-secondary mt-0.5">Full-Stack Developer &amp; Creator of CodeBeing</p>
              <div className="flex flex-wrap items-center gap-3 mt-2.5">
                {SOCIAL_LINKS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-text-tertiary hover:text-accent transition-colors"
                    >
                      <Icon className="w-3 h-3" />
                      {social.label === "Email" ? "abhishek.aimarine@gmail.com" : social.label}
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {SOCIAL_LINKS.slice(0, 2).map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-tertiary hover:text-accent hover:border-accent-muted hover:bg-accent-muted transition-all duration-150"
                    aria-label={social.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mb-10">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title}>
                <h4 className="text-text-primary text-xs font-medium mb-3 uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link
                          href={link.href}
                          className="text-text-secondary text-xs hover:text-text-primary transition-colors duration-150"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-text-secondary text-xs hover:text-text-primary transition-colors duration-150"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter */}
            <div>
              <h4 className="text-text-primary text-xs font-medium mb-3 uppercase tracking-wider">Stay Updated</h4>
              <p className="text-text-tertiary text-[11px] mb-3 leading-relaxed">Get notified about new features and updates.</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 border-none cursor-pointer ${
                    subscribed
                      ? "bg-success-muted text-success"
                      : "bg-accent text-white hover:bg-accent-hover active:scale-[0.97]"
                  }`}
                >
                  {subscribed ? "Subscribed" : "Subscribe"}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border">
            <div className="flex items-center gap-1.5 text-text-tertiary text-[11px]">
              <span>&copy; {new Date().getFullYear()} CodeBeing.</span>
              <span className="hidden sm:inline">Built with</span>
              <Heart className="w-3 h-3 text-error hidden sm:inline" />
              <span className="hidden sm:inline">by Abhishek Shah.</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/abhiverse01"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-text-tertiary text-[11px] hover:text-text-primary transition-colors"
              >
                <Github className="w-3 h-3" />
                github.com/abhiverse01
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
