"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  Trophy,
  Flame,
  BookOpen,
  Users,
  Award,
  Eye,
  EyeOff,
  Gift,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VALUE_PROPS = [
  "8-week structured curriculum with video lessons & quizzes",
  "Earn free AI credits & wallet credits as you level up",
  "Exclusive partner discounts & promo codes at every arena",
  "Badges, streaks, leaderboards & a ₹1L cash Showdown prize",
  "Private founder community — post wins, share frameworks",
  "Certificate co-presented with Meta on graduation",
];

const PERKS = [
  { icon: Gift, label: "Free credits", color: "text-amber-600 bg-amber-50 ring-amber-200" },
  { icon: BookOpen, label: "Curriculum", color: "text-emerald-600 bg-emerald-50 ring-emerald-200" },
  { icon: Trophy, label: "₹1L prize", color: "text-violet-600 bg-violet-50 ring-violet-200" },
  { icon: Flame, label: "Streaks", color: "text-rose-600 bg-rose-50 ring-rose-200" },
  { icon: Users, label: "Network", color: "text-cyan-600 bg-cyan-50 ring-cyan-200" },
  { icon: Award, label: "Badges", color: "text-amber-600 bg-amber-50 ring-amber-200" },
  { icon: Wallet, label: "Wallet top-ups", color: "text-emerald-600 bg-emerald-50 ring-emerald-200" },
  { icon: Sparkles, label: "Partner offers", color: "text-violet-600 bg-violet-50 ring-violet-200" },
];

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planError, setPlanError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlanError(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json?.code === "PLAN_NOT_ALLOWED") {
          setPlanError(true);
          setError(json?.error || "Your plan doesn't include ZapAcademy yet.");
        } else {
          setError(json?.error || "Couldn't sign you in. Try again.");
        }
      } else {
        router.replace(search.get("next") || "/dashboard");
      }
    } catch {
      setError("Network glitch. Try again in a sec.");
    } finally {
      setLoading(false);
    }
  }

  const zaptickUrl =
    process.env.NEXT_PUBLIC_ZAPTICK_URL || "https://zaptick.io";

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Left brand panel — light, unique to Academy ── */}
      <div className="hidden lg:flex lg:w-[54%] relative bg-gradient-to-br from-emerald-50 via-white to-cyan-50 overflow-hidden flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-50 bg-grid-emerald"
          aria-hidden
        />
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-emerald-200/50 blur-3xl" />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/zapzap.png"
              alt="Zaptick"
              width={120}
              height={38}
              priority
              className="h-8 w-auto"
            />
            <span className="inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest">
              Academy
            </span>
          </Link>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center max-w-lg py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-5 w-fit">
              <Sparkles className="h-3 w-3" />
              Cohort #001 · Live now
            </div>

            <h1 className="text-4xl xl:text-[2.75rem] font-black text-slate-900 leading-[1.08] tracking-tight">
              Learn, compete &<br />
              <span className="text-emerald-600">earn real rewards.</span>
            </h1>

            <p className="mt-4 text-slate-600 leading-relaxed max-w-md text-[15px]">
              ZapAcademy is the gamified learning platform inside Zaptick.
              Level up to earn free AI credits, wallet top-ups, exclusive
              partner discounts, and compete for the ₹1L Showdown prize.
            </p>

            {/* Value props */}
            <ul className="mt-6 space-y-2.5">
              {VALUE_PROPS.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            {/* Perk chips */}
            <div className="mt-6 flex flex-wrap gap-1.5">
              {PERKS.map((p) => (
                <span
                  key={p.label}
                  className={`inline-flex items-center gap-1 rounded-full ring-1 px-2 py-0.5 text-[10px] font-bold ${p.color}`}
                >
                  <p.icon className="h-3 w-3" />
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              ZapAcademy by Zaptick · co-presented with Meta
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/zapzap.png"
                alt="Zaptick"
                width={120}
                height={38}
                priority
                className="h-8 w-auto"
              />
              <span className="inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest">
                Academy
              </span>
            </Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Sign in with your Zaptick credentials. ZapAcademy is included with{" "}
            <span className="font-bold text-emerald-700">Growth</span>,{" "}
            <span className="font-bold text-emerald-700">Growth+</span> &{" "}
            <span className="font-bold text-emerald-700">Advanced</span> plans.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-1.5">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">
                  Password
                </label>
                <a
                  href={`${zaptickUrl}/forgot-password`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your Zaptick password"
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className={`rounded-xl border px-4 py-3 text-[13px] leading-relaxed ${
                  planError
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {error}
                {planError && (
                  <div className="mt-2">
                    <a
                      href={`${zaptickUrl}/wallet/plans`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-amber-700 underline decoration-amber-400 underline-offset-2 hover:text-amber-900"
                    >
                      Upgrade your plan →
                    </a>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          {/* Rewards teaser */}
          <div className="mt-6 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-3">
            <div className="flex items-start gap-2.5">
              <Gift className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900">
                  Earn free AI credits & wallet top-ups
                </span>{" "}
                just by levelling up. Plus exclusive partner discounts & promo codes.
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs text-slate-500 text-center">
            New to Zaptick?{" "}
            <a
              href={`${zaptickUrl}/signup`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 decoration-emerald-200"
            >
              Create your free account
            </a>{" "}
            on the main platform first.
          </p>
        </div>
      </div>
    </div>
  );
}
