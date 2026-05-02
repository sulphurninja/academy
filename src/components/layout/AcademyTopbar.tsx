"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Flame,
  ChevronDown,
  LogOut,
  ExternalLink,
  Trophy,
  GraduationCap,
  Zap,
  Megaphone,
  ShieldCheck,
  Award,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { fmtNumber, cn } from "@/lib/utils";
import GlobalSearch from "@/components/academy/GlobalSearch";
import NotificationsBell from "@/components/academy/NotificationsBell";
import { SpotifyTopbarPill } from "@/components/academy/SpotifyPlayer";
import { type LevelInfo } from "@/lib/xp";

interface AcademyTopbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    companyName?: string | null;
    avatarUrl?: string | null;
    companyLogoUrl?: string | null;
  };
  xp: number;
  level: LevelInfo;
  streak: number;
}

export default function AcademyTopbar({ user, xp, level, streak }: AcademyTopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function close(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    }
    if (profileOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [profileOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  const xpPct = Math.round(level.progress * 100);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-5">
        <GlobalSearch />

        {/* Live cohort pill */}
        <Link
          href="/curriculum"
          className="hidden lg:inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
        >
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-emerald-500 ping-soft" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Cohort #001 · Live
        </Link>

        <div className="flex-1" />

        <SpotifyTopbarPill onClick={() => {
          const el = document.querySelector('[data-spotify-fab]') as HTMLButtonElement | null;
          el?.click();
        }} />

        {/* XP / streak / level — compact pills */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/levels"
            className="group relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer"
            title={`${xpPct}% to L${level.level + 1} — view roadmap`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-[10px] font-black">
              {level.level}
            </span>
            <div className="leading-tight">
              <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                {level.title}
              </div>
              <div className="text-xs font-extrabold text-amber-600 inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {fmtNumber(xp)}
              </div>
            </div>
            <div className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-emerald-100 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </Link>
          <div
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5"
            title="Login streak"
          >
            <Flame className="h-3.5 w-3.5 text-amber-500 flame-breath" />
            <span className="text-xs font-extrabold text-amber-700">{streak}d</span>
          </div>
        </div>

        {/* Showdown CTA */}
        <a
          href={
            (process.env.NEXT_PUBLIC_ZAPTICK_URL || "https://zaptick.io") +
            "/zapacademy/showdown"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 h-9 rounded-xl px-3 text-[11px] font-extrabold uppercase tracking-widest text-[#1a1100] bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 ring-1 ring-amber-300 hover:from-amber-200 hover:via-amber-300 hover:to-amber-400 gold-glow"
        >
          <Trophy className="h-3.5 w-3.5" />
          Showdown · ₹1L
        </a>

        <NotificationsBell />

        {/* Profile menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white pl-1.5 pr-2 py-1.5 hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <Avatar
              name={user.name}
              email={user.email}
              src={user.avatarUrl || undefined}
              overlayUrl={user.avatarUrl ? undefined : user.companyLogoUrl || undefined}
              size={28}
            />
            <div className="hidden md:block leading-tight text-left max-w-[120px]">
              <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
              <div className="text-[10px] text-slate-500 truncate">
                {user.companyName || "Founder"}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl z-30">
              <div className="px-4 py-4 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={user.name}
                    email={user.email}
                    src={user.avatarUrl || undefined}
                    overlayUrl={user.avatarUrl ? undefined : user.companyLogoUrl || undefined}
                    size={44}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="text-center rounded-lg bg-white border border-slate-200 px-1.5 py-1.5">
                    <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400">XP</div>
                    <div className="text-xs font-extrabold text-amber-600">{fmtNumber(xp)}</div>
                  </div>
                  <div className="text-center rounded-lg bg-white border border-slate-200 px-1.5 py-1.5">
                    <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Lvl</div>
                    <div className="text-xs font-extrabold text-emerald-700">{level.level}</div>
                  </div>
                  <div className="text-center rounded-lg bg-white border border-slate-200 px-1.5 py-1.5">
                    <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400">🔥</div>
                    <div className="text-xs font-extrabold text-amber-700">{streak}d</div>
                  </div>
                </div>
              </div>
              <nav className="py-1">
                <Link
                  href={`/u/${user.id}`}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  My profile
                </Link>
                <Link
                  href="/levels"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Sparkles className="h-4 w-4 text-slate-400" />
                  Level arenas
                </Link>
                <Link
                  href="/badges"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Trophy className="h-4 w-4 text-slate-400" />
                  Badges
                </Link>
                <Link
                  href="/streaks"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Flame className="h-4 w-4 text-slate-400" />
                  Streaks
                </Link>
                <Link
                  href="/certification"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Award className="h-4 w-4 text-slate-400" />
                  Certification
                </Link>
                {user.isAdmin && (
                  <>
                    <div className="my-1 border-t border-slate-100" />
                    <div className="px-3 py-1 text-[9px] uppercase tracking-widest font-bold text-rose-500">
                      Admin
                    </div>
                    <Link
                      href="/admin/lessons"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Zap className="h-4 w-4 text-slate-400" />
                      Lessons
                    </Link>
                    <Link
                      href="/admin/announcements"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Megaphone className="h-4 w-4 text-slate-400" />
                      Announcements
                    </Link>
                    <Link
                      href="/admin/community"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <ShieldCheck className="h-4 w-4 text-slate-400" />
                      Moderation
                    </Link>
                  </>
                )}
                <div className="my-1 border-t border-slate-100" />
                <a
                  href={process.env.NEXT_PUBLIC_ZAPTICK_URL || "https://zaptick.io"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                  Open Zaptick
                </a>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
