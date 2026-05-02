"use client";

import { useRef, useState } from "react";
import {
  Share2,
  Download,
  Copy,
  CheckCircle2,
  Trophy,
  Flame,
  BookOpen,
  Award,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressData {
  name: string;
  level: number;
  levelTitle: string;
  xp: number;
  streak: number;
  lessonsCompleted: number;
  totalLessons: number;
  badges: number;
  rank?: number;
}

export default function ShareableProgress({
  data,
  trigger,
}: {
  data: ProgressData;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const progress = Math.round(
    (data.lessonsCompleted / Math.max(data.totalLessons, 1)) * 100
  );

  const shareText = `I'm Level ${data.level} (${data.levelTitle}) on ZapAcademy! ${data.lessonsCompleted}/${data.totalLessons} lessons completed, ${data.xp.toLocaleString()} XP earned, ${data.streak}-day streak. Join me at academy.zaptick.io`;

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://academy.zaptick.io";

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "My ZapAcademy Progress", text: shareText, url: shareUrl });
      } catch {}
    }
  };

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" /> Share Progress
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            {/* Card */}
            <div
              ref={cardRef}
              className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.1),transparent_50%)]" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">ZapAcademy</span>
                  </div>
                  <span className="text-[10px] text-slate-500">academy.zaptick.io</span>
                </div>

                {/* Name + Level */}
                <h2 className="text-xl font-black text-white">{data.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] font-bold text-amber-400">
                    <Trophy className="h-3 w-3" /> Level {data.level}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{data.levelTitle}</span>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                    <span className="text-slate-400">Course Progress</span>
                    <span className="text-emerald-400">{progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {data.lessonsCompleted} of {data.totalLessons} lessons
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-center">
                    <div className="text-lg font-black text-white">{data.xp.toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">XP</div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-center">
                    <div className="text-lg font-black text-white flex items-center justify-center gap-0.5">
                      <Flame className="h-4 w-4 text-amber-500" />
                      {data.streak}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Streak</div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-center">
                    <div className="text-lg font-black text-white flex items-center justify-center gap-0.5">
                      <Award className="h-4 w-4 text-violet-400" />
                      {data.badges}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Badges</div>
                  </div>
                </div>

                {data.rank && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                      <Trophy className="h-3 w-3" /> #{data.rank} on leaderboard
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button
                onClick={handleCopy}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
