// PHASE7: [D3] Replaced all hardcoded hex colors with design-system CSS variable classes
// PHASE4: Replaced hardcoded from-[#0a0a0f]/80 gradient with from-bg-base/80 for theme awareness
// PHASE3: Entire page used non-existent design tokens (bg-bg-base, bg-cb-glass, text-cb-muted, bg-cb-primary, border-cb-glass-border, etc.) → Replaced all with actual design system hex colors; also fixed pt-[70px] to pt-14
import Image from "next/image";

const CONTRIBUTORS = [
  {
    name: "Abhishek Shah",
    designation: "Lead Developer",
    image: "/images/abhishek_photo.jpg",
    description:
      "Abhishek has spearheaded the development process, ensuring high-quality code standards and architectural decisions throughout the project.",
  },
  {
    name: "Aachal Kumari",
    designation: "UI/UX Designer",
    image: "/images/aachal_photo.jpg",
    description:
      "Aachal has been instrumental in designing intuitive and user-friendly interfaces that make CodeBeing a pleasure to use.",
  },
  {
    name: "Chandan Sah",
    designation: "Front End Dev",
    image: "/images/chandan_photo.jpg",
    description:
      "Chandan has focused on implementing responsive front-end designs with a keen eye for detail, performance, and smooth interactions.",
  },
  {
    name: "Aman Poddar",
    designation: "Back End Dev",
    image: "/images/aman_photo.jpg",
    description:
      "Aman has developed robust back-end systems to support scalable applications and seamless API integrations.",
  },
];

const ROLE_COLORS: Record<string, string> = {
  "Lead Developer": "bg-accent-muted text-accent",
  "UI/UX Designer": "bg-accent-muted text-accent",
  "Front End Dev": "bg-success-muted text-success",
  "Back End Dev": "bg-warning-muted text-warning",
};

export default function ContributionsPage() {
  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow)
    <div className="min-h-dvh bg-bg-base">
      {/* Hero */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4 tracking-tight">
          Our Team
        </h1>
        <p className="text-text-secondary text-lg max-w-md mx-auto">
          Meet the engineers behind CodeBeing
        </p>
      </section>

      {/* Team Grid */}
      <section className="max-w-[1000px] mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CONTRIBUTORS.map((contributor) => (
            <div
              key={contributor.name}
              className="group bg-bg-surface border border-border rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-muted hover:border-accent/20 transition-all duration-300"
            >
              {/* Photo */}
              <div className="relative w-full aspect-square overflow-hidden">
                <Image
                  src={contributor.image}
                  alt={contributor.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 via-transparent to-transparent" />
              </div>

              {/* Info */}
              <div className="p-5">
                <h2 className="text-text-primary font-semibold text-lg mb-1">
                  {contributor.name}
                </h2>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold mb-3 ${
                    ROLE_COLORS[contributor.designation] || "bg-bg-hover text-text-secondary"
                  }`}
                >
                  {contributor.designation}
                </span>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {contributor.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collaboration Card */}
      <section className="max-w-[800px] mx-auto px-6 pb-24">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-accent-muted to-accent-muted border border-border text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            Project Collaboration
          </h2>
          <p className="text-text-secondary leading-relaxed max-w-lg mx-auto">
            This project is a joint collaboration of four passionate engineers
            working to build an integrated code generation system that simplifies
            the development workflow and empowers developers worldwide.
          </p>
        </div>
      </section>
    </div>
  );
}
