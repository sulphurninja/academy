import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function fmtRelative(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

/**
 * Stable hash → deterministic gradient avatar. Same input always returns
 * the same gradient, so a user keeps the same avatar across the app.
 */
const AVATAR_GRADS = [
  "from-emerald-400 to-emerald-600",
  "from-cyan-400 to-emerald-500",
  "from-amber-400 to-rose-500",
  "from-fuchsia-400 to-amber-400",
  "from-blue-500 to-emerald-500",
  "from-orange-400 to-pink-500",
  "from-violet-500 to-emerald-500",
  "from-emerald-500 to-cyan-400",
  "from-rose-500 to-amber-500",
  "from-indigo-500 to-emerald-500",
];

export function gradientFor(seed: string | undefined | null): string {
  if (!seed) return AVATAR_GRADS[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_GRADS[Math.abs(h) % AVATAR_GRADS.length];
}

/**
 * "yourcompany.com" → "https://www.google.com/s2/favicons?domain=yourcompany.com&sz=128"
 * Used to pull a free brand mark for any company that has a website domain.
 */
export function faviconFor(domain?: string | null): string | null {
  if (!domain) return null;
  const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!clean.includes(".")) return null;
  return `https://www.google.com/s2/favicons?domain=${clean}&sz=128`;
}

/** Best-effort: derive a domain from an email (e.g. "you@nyrahbeauty.com" → "nyrahbeauty.com") */
export function domainFromEmail(email?: string | null): string | null {
  if (!email) return null;
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  const d = email.slice(at + 1).toLowerCase();
  // skip common public providers — they aren't a "company" brand
  const PUBLIC = new Set([
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "live.com",
    "proton.me",
    "protonmail.com",
    "rediffmail.com",
    "aol.com",
  ]);
  if (PUBLIC.has(d)) return null;
  return d;
}

export function pluralize(n: number, singular: string, plural?: string): string {
  return `${n} ${n === 1 ? singular : plural || singular + "s"}`;
}

export function shortNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
