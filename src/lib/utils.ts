// PHASE5: Added safeStorage utility for Safari private browsing and iframe contexts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// PHASE5: Safe localStorage wrapper for Safari private browsing and iframe contexts
export const safeStorage = {
  get: (key: string): string | null => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set: (key: string, value: string): void => {
    try { localStorage.setItem(key, value); } catch { /* silent */ }
  },
  remove: (key: string): void => {
    try { localStorage.removeItem(key); } catch { /* silent */ }
  },
};

