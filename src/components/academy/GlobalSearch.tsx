"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Command, X, Sparkles, BookOpen, Users, Trophy } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CURRICULUM } from "@/lib/curriculum";

interface MemberHit {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  avatarUrl?: string | null;
  companyLogoUrl?: string | null;
}

const QUICK_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Sparkles, hint: "Home" },
  { href: "/curriculum", label: "Curriculum", icon: BookOpen, hint: "8-week plan" },
  { href: "/community", label: "Community feed", icon: Users, hint: "Posts & wins" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, hint: "Top members" },
  { href: "/members", label: "Members directory", icon: Users, hint: "Find & follow" },
  { href: "/badges", label: "Badges", icon: Trophy, hint: "Your gallery" },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [members, setMembers] = useState<MemberHit[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((s) => !s);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    if (!q.trim()) {
      setMembers([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/users/search?q=${encodeURIComponent(q)}&limit=6`);
        const j = await r.json();
        setMembers(j.members || []);
      } catch {
        setMembers([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const lessonHits = q.trim()
    ? CURRICULUM.flatMap((wk) =>
        wk.lessons
          .filter((l) =>
            (l.title + " " + l.summary + " " + wk.title)
              .toLowerCase()
              .includes(q.toLowerCase())
          )
          .map((l) => ({
            href: `/curriculum/${wk.slug}/${l.slug}`,
            label: l.title,
            sub: wk.title,
          }))
      ).slice(0, 6)
    : [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2.5 w-72 max-w-full rounded-xl border border-slate-200 bg-white text-slate-500 px-3 py-2 text-sm hover:border-emerald-300 hover:text-slate-700 transition"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search lessons, members…</span>
        <kbd className="hidden xl:inline-flex items-center gap-1 rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
      >
        <Search className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center p-4 pt-[10vh]">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search lessons, members, weeks…"
                className="flex-1 bg-transparent outline-none text-base placeholder:text-slate-400"
              />
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto scrollbar-soft">
              {!q && (
                <div className="p-2">
                  <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    Quick navigate
                  </div>
                  {QUICK_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-emerald-50"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                        <l.icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">{l.label}</div>
                        <div className="text-[11px] text-slate-500">{l.hint}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {q && (lessonHits.length > 0 || members.length > 0) && (
                <div className="p-2">
                  {lessonHits.length > 0 && (
                    <>
                      <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                        Lessons
                      </div>
                      {lessonHits.map((h) => (
                        <Link
                          key={h.href}
                          href={h.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-emerald-50"
                        >
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            <BookOpen className="h-4 w-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {h.label}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">{h.sub}</div>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                  {members.length > 0 && (
                    <>
                      <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                        Members
                      </div>
                      {members.map((m) => (
                        <Link
                          key={m.id}
                          href={`/u/${m.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-emerald-50"
                        >
                          <Avatar
                            name={m.name}
                            email={m.email}
                            src={m.avatarUrl || undefined}
                            overlayUrl={m.avatarUrl ? undefined : m.companyLogoUrl || undefined}
                            size={32}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {m.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {m.companyName || m.email}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}

              {q && lessonHits.length === 0 && members.length === 0 && (
                <div className="px-6 py-12 text-center text-slate-500 text-sm">
                  No results for &ldquo;{q}&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
