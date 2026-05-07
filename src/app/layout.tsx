// PHASE7: [T1] Font migration — Plus Jakarta Sans + JetBrains Mono + Fraunces replace Geist
// PHASE7: [H5] Comprehensive SEO metadata with Open Graph + Twitter cards
// PHASE7: [MOB4] viewport-fit=cover for notched devices
// PHASE7: [PERF1] Font preconnect hints
// PHASE5: [U9] Added visibleToasts={3} to cap simultaneous toast count
import type { Metadata, Viewport } from "next";
// PHASE7: T1 — Replace Geist with Plus Jakarta Sans + JetBrains Mono + Fraunces
import { Plus_Jakarta_Sans, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CommandPalette } from "@/components/command-palette";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { Toaster } from "@/components/ui/sonner";
import { OfflineBanner } from "@/components/offline-banner";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { ErrorBoundary } from "@/components/error-boundary";

// PHASE7: T1 — Primary body + UI font: Plus Jakarta Sans
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

// PHASE7: T1 — Monospace code + terminal: JetBrains Mono
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// PHASE7: T1 — Editorial accent (hero taglines only): Fraunces italic
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
});

// PHASE7: H5 — Full SEO metadata
// PHASE7: Add metadataBase to resolve social image URLs in production
export const metadata: Metadata = {
  metadataBase: new URL("https://codebeing.vercel.app"),
  title: "CodeBeing — AI Developer Studio | Code, Learn, Explore",
  description:
    "CodeBeing is an AI-powered developer studio with code generation, interactive algorithm visualization, 55+ templates, 12 developer tools, and offline-first intelligence. Free forever.",
  keywords: [
    "AI code generator",
    "developer tools",
    "algorithm visualizer",
    "code templates",
    "learn programming",
    "online IDE",
    "CodeBeing",
  ],
  authors: [
    { name: "Abhishek Shah" },
    { name: "Aachal Kumari" },
    { name: "Chandan Sah" },
    { name: "Aman Poddar" },
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "CodeBeing — AI Developer Studio",
    description:
      "Generate code, visualize algorithms, explore 55+ templates, and learn with interactive lessons. Powered by AI, works offline.",
    type: "website",
    url: "https://codebeing.vercel.app",
    siteName: "CodeBeing",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeBeing — AI Developer Studio",
    description:
      "AI code generation, algorithm visualization, and developer tools — all in one place.",
  },
  alternates: {
    canonical: "https://codebeing.vercel.app",
  },
};

// PHASE7: MOB4 — viewport-fit=cover for notched devices
export const viewport: Viewport = {
  themeColor: "#5b5ef7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PHASE7: PERF1 — Font preconnect hints for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* PHASE5: Inline theme script — use stored preference, else system, else default to light */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cb-theme');if(t){document.documentElement.classList.add(t);document.documentElement.setAttribute('data-theme',t);}else{var p=window.matchMedia('(prefers-color-scheme:dark)');if(p.matches){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.classList.add('light');document.documentElement.setAttribute('data-theme','light');}}}catch(e){document.documentElement.classList.add('light');document.documentElement.setAttribute('data-theme','light');}})()`,
          }}
        />
      </head>
      {/* PHASE7: T1 — Apply all three font CSS variables to <html> */}
      <body
        className={`${jakarta.variable} ${mono.variable} ${fraunces.variable} antialiased min-h-dvh flex flex-col`}
      >
        <ServiceWorkerRegister />
        <Navbar />
        <OfflineBanner />
        <ErrorBoundary>
          <main className="flex-1">{children}</main>
        </ErrorBoundary>
        <Footer />
        <CommandPalette />
        <KeyboardShortcuts />
        <Toaster position="bottom-right" richColors visibleToasts={3} />
      </body>
    </html>
  );
}
