// PHASE7: [D3] Eliminated hardcoded colors — replaced hex values with CSS variable-based Tailwind classes
// PHASE5: [R2] Migrated raw localStorage to safeStorage for Safari private browsing safety
// PHASE5: [U7] Added signedUpAt timestamp to localStorage and Try CodeGround CTA on success page
"use client";

import { useState, useMemo } from "react";
import { safeStorage } from "@/lib/utils";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shake, setShake] = useState(false);

  const passwordStrength = useMemo(() => {
    const p = form.password;
    if (!p) return { score: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { score, label: "Weak", color: "bg-error" };
    if (score <= 3) return { score, label: "Fair", color: "bg-warning" };
    return { score, label: "Strong", color: "bg-success" };
  }, [form.password]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    // Store in localStorage for demo
    if (typeof window !== "undefined") {
      safeStorage.set("cb-user", JSON.stringify({ name: form.name, email: form.email, signedUpAt: Date.now() }));
    }
    setSubmitted(true);
    toast.success("Account created successfully! Welcome to CodeBeing.");
  };

  if (submitted) {
    return (
      // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow)
      <div className="min-h-dvh flex items-center justify-center px-4 bg-bg-base">
        <div className="text-center animate-fade-up max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-success-muted border border-success/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-7 h-7 text-success" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Welcome aboard!</h1>
          <p className="text-text-secondary text-sm mb-6">
            Thanks for signing up, <span className="text-text-primary font-medium">{form.name}</span>.
            <br />We&apos;ve saved your profile locally.
          </p>
          <Link href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Go to Home
          </Link>
          <Link href="/codeground"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-bg-hover border border-border text-text-primary hover:bg-bg-elevated transition-all">
            Try CodeGround
          </Link>
        </div>
      </div>
    );
  }

  return (
    // PHASE7: [BUG 3 FIX] Removed pt-14 — navbar is sticky (in-flow)
    <div className="min-h-dvh flex items-center justify-center px-4 bg-bg-base">
      <div className={`w-full max-w-sm animate-fade-up ${shake ? "animate-shake" : ""}`}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Create Account</h1>
          <p className="text-text-secondary text-sm">Join CodeBeing and start building.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6 rounded-xl bg-bg-surface border border-border">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Name</label>
            <input type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)}
              placeholder="John Doe"
              className={`w-full px-3 py-2.5 rounded-lg bg-bg-hover border text-text-primary text-sm placeholder:text-text-tertiary outline-none transition-colors ${
                errors.name ? "border-error focus:border-error" : "border-border focus:border-accent/50"
              }`} autoComplete="name" />
            {errors.name && <span className="text-[10px] text-error mt-1 block">{errors.name}</span>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)}
              placeholder="you@example.com"
              className={`w-full px-3 py-2.5 rounded-lg bg-bg-hover border text-text-primary text-sm placeholder:text-text-tertiary outline-none transition-colors ${
                errors.email ? "border-error focus:border-error" : "border-border focus:border-accent/50"
              }`} autoComplete="email" />
            {errors.email && <span className="text-[10px] text-error mt-1 block">{errors.email}</span>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password}
                onChange={(e) => handleChange("password", e.target.value)} placeholder="Min. 6 characters"
                className={`w-full px-3 py-2.5 pr-9 rounded-lg bg-bg-hover border text-text-primary text-sm placeholder:text-text-tertiary outline-none transition-colors ${
                  errors.password ? "border-error focus:border-error" : "border-border focus:border-accent/50"
                }`} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary bg-transparent border-none cursor-pointer p-0.5">
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {/* Strength meter */}
            {form.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-bg-hover overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                </div>
                <span className="text-[9px] text-text-tertiary">{passwordStrength.label}</span>
              </div>
            )}
            {errors.password && <span className="text-[10px] text-error mt-1 block">{errors.password}</span>}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Confirm Password</label>
            <input type="password" value={form.confirm} onChange={(e) => handleChange("confirm", e.target.value)}
              placeholder="Confirm password"
              className={`w-full px-3 py-2.5 rounded-lg bg-bg-hover border text-text-primary text-sm placeholder:text-text-tertiary outline-none transition-colors ${
                errors.confirm ? "border-error focus:border-error" : "border-border focus:border-accent/50"
              }`} autoComplete="new-password" />
            {errors.confirm && <span className="text-[10px] text-error mt-1 block">{errors.confirm}</span>}
          </div>

          <button type="submit"
            className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover active:scale-[0.97] transition-all duration-150 cursor-pointer border-none">
            Create Account
          </button>
        </form>

        <p className="text-center text-text-tertiary text-xs mt-4">
          Already have an account? <Link href="/" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
