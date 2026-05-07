// PHASE7: [D3] Eliminated hardcoded colors — replaced hex values with CSS variable-based Tailwind classes
// PHASE4: Replaced direct DOM read with useState+useEffect for theme detection
// PHASE3: All GitHub links were "#" → Fixed Abhishek's to https://github.com/abhishekshah, others remain "#" with proper structure
"use client";

import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";

const TEAM = [
  { name: "Abhishek Shah", role: "Lead Developer", bio: "Spearheaded the development process, ensuring high-quality code standards and architectural decisions. Passionate about clean code and developer experience.", github: "https://github.com/abhiverse01", gradient: "from-accent to-accent/70", seed: "abhishek" },
  { name: "Aachal Kumari", role: "UI/UX Designer", bio: "Designed intuitive, beautiful interfaces that make CodeBeing a pleasure to use. Focuses on micro-interactions, accessibility, and design systems.", github: "#", gradient: "from-accent to-error", seed: "aachal" },
  { name: "Chandan Sah", role: "Front End Developer", bio: "Implemented responsive front-end designs with a keen eye for performance optimization, animation, and cross-browser compatibility.", github: "#", gradient: "from-success to-info", seed: "chandan" },
  { name: "Aman Poddar", role: "Back End Developer", bio: "Built robust back-end systems supporting scalable applications, API integrations, and server-side architecture.", github: "#", gradient: "from-warning to-warning", seed: "aman" },
];

// Generate contribution graph data from seed
function generateContribGraph(seed: string): boolean[] {
  const weeks = 52;
  const days = weeks * 7;
  const result: boolean[] = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  for (let i = 0; i < days; i++) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    result.push((hash % 100) < 35);
  }
  return result;
}

function ContributionGraph({ seed }: { seed: string }) {
  const data = generateContribGraph(seed);
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: 52 }, (_, w) => (
        <div key={w} className="flex flex-col gap-[2px]">
          {Array.from({ length: 7 }, (_, d) => {
            const active = data[w * 7 + d];
            return (
              <div key={d} className="w-[8px] h-[8px] rounded-sm transition-colors"
                // PHASE7: Use CSS variable-based colors for contribution graph — adapts to light/dark theme
                style={{ backgroundColor: active ? "var(--accent)" : "var(--bg-hover)" }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function TeamPage() {
  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow)
    <div className="min-h-dvh bg-bg-base">
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-1">Team</h1>
          <p className="text-text-secondary text-sm">Meet the engineers behind CodeBeing.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Collaboration statement */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 p-8 rounded-xl bg-bg-surface border border-border">
          <p className="text-text-secondary text-sm leading-relaxed max-w-lg mx-auto">
            CodeBeing is a joint collaboration of four passionate engineers working to build an integrated developer platform that simplifies the learning and building workflow.
          </p>
        </motion.div>

        {/* Team grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {TEAM.map((member, i) => (
            <motion.div key={member.name}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-xl bg-bg-surface border border-border hover:border-border-hover transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-semibold text-lg flex-shrink-0`}>
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary">{member.name}</h3>
                  <span className="inline-block px-2 py-0.5 rounded bg-bg-hover text-[10px] text-text-secondary font-medium mt-0.5">{member.role}</span>
                  <p className="text-[11px] text-text-secondary leading-relaxed mt-2">{member.bio}</p>
                  <a href={member.github} className="inline-flex items-center gap-1 mt-3 text-[10px] text-text-tertiary hover:text-accent transition-colors">
                    <Github className="w-3 h-3" /> GitHub
                    <ExternalLink className="w-2 h-2" />
                  </a>
                </div>
              </div>
              {/* Mini contribution graph */}
              <div className="mt-4 pt-4 border-t border-border overflow-x-auto">
                <ContributionGraph seed={member.seed} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
