"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, Users, ArrowRight, Wand2 } from "lucide-react";
import UserCard from "./UserCard";
import type { AcademyMember } from "@/lib/profile";

interface SuggestedResponse {
  members: AcademyMember[];
  rationale?: string | null;
  ai?: boolean;
}

interface Props {
  initial?: AcademyMember[];
  initialRationale?: string | null;
  initialAi?: boolean;
  limit?: number;
  /**
   * `grid` — dashboard-style member cards (wider areas).
   * `sidebar` — single-column compact rows for narrow rails (e.g. /community).
   */
  variant?: "grid" | "sidebar";
}

export default function SuggestedMembers({
  initial,
  initialRationale,
  initialAi,
  limit = 6,
  variant = "grid",
}: Props) {
  const [members, setMembers] = useState<AcademyMember[]>(initial || []);
  const [rationale, setRationale] = useState<string | null>(
    initialRationale || null
  );
  const [aiPowered, setAiPowered] = useState<boolean>(!!initialAi);
  const [aiRanking, setAiRanking] = useState(!!initial?.length); // refining in background
  const [loading, setLoading] = useState(!initial?.length);

  // Always fetch the AI-ranked version. If we already have SSR `initial`, we
  // keep showing it while AI re-ranks behind the scenes — no flicker, no
  // skeleton — and swap the list once the ranker returns.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/users/suggested?limit=${limit}`);
        const j: SuggestedResponse = await r.json();
        if (cancelled) return;
        setMembers(j.members || []);
        setRationale(j.rationale || null);
        setAiPowered(!!j.ai);
      } catch {
        // keep organic SSR results on failure
      } finally {
        if (!cancelled) {
          setLoading(false);
          setAiRanking(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (!members.length && !loading) return null;

  const isSidebar = variant === "sidebar";
  const skeletonCount = Math.min(limit, isSidebar ? 5 : 6);

  return (
    <section
      className={
        isSidebar
          ? "rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5"
          : "rounded-2xl border border-slate-200 bg-white p-5"
      }
    >
      <div
        className={
          isSidebar
            ? "flex items-center justify-between gap-2 mb-3"
            : "flex items-start justify-between gap-3 mb-4"
        }
      >
        <div className={isSidebar ? "flex items-center gap-2 min-w-0" : "flex items-start gap-2"}>
          <span
            className={
              isSidebar
                ? "inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-emerald-700 ring-1 ring-emerald-200/80 shrink-0 shadow-sm"
                : "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shrink-0"
            }
          >
            <Sparkles className={isSidebar ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3
                className={
                  isSidebar
                    ? "text-[13px] font-extrabold text-slate-900 tracking-tight"
                    : "text-sm font-extrabold text-slate-900"
                }
              >
                Suggested
              </h3>
              {aiRanking ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 border border-emerald-200/80 px-1.5 py-0.5 text-[8px] uppercase tracking-widest font-extrabold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ranking…
                </span>
              ) : aiPowered ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 border border-emerald-200/80 px-1.5 py-0.5 text-[8px] uppercase tracking-widest font-extrabold text-emerald-700">
                  <Wand2 className="h-2 w-2" />
                  AI
                </span>
              ) : null}
            </div>
            {!isSidebar && (
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                {rationale ||
                  "Founders, agencies, and operators ranked by what you build."}
              </p>
            )}
            {isSidebar && rationale && (
              <p className="text-[10px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{rationale}</p>
            )}
          </div>
        </div>
        <Link
          href="/members"
          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 shrink-0"
        >
          All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {loading && members.length === 0 ? (
        isSidebar ? (
          <div className="space-y-2">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="h-[52px] rounded-xl border border-slate-200/80 bg-white animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse"
              />
            ))}
          </div>
        )
      ) : isSidebar ? (
        <ul className="space-y-2">
          {members.slice(0, limit).map((m) => (
            <li key={m.id}>
              <UserCard member={m} layout="row" compact />
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.slice(0, limit).map((m) => (
            <UserCard key={m.id} member={m} />
          ))}
        </div>
      )}

      {!isSidebar && (
        <Link
          href="/members"
          className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
        >
          <Users className="h-3.5 w-3.5" />
          Browse all members & search
        </Link>
      )}
    </section>
  );
}
