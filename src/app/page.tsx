// PHASE7: Server component wrapper — exports SEO metadata, delegates interactive UI to home-page.tsx client component
import type { Metadata } from "next";
import HomePage from "@/components/home-page";

export const metadata: Metadata = {
  title: "CodeBeing — Code at the Speed of Thought | AI Developer Studio",
  description:
    "CodeBeing is a free AI-powered developer studio with code generation, algorithm visualization, 55+ templates, 12 tools, and 330+ coding rules. Offline-ready, no signup required.",
};

export default function Page() {
  return <HomePage />;
}
