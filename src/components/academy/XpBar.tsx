"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { fmtNumber } from "@/lib/utils";
import { type LevelInfo } from "@/lib/xp";

interface XpBarProps {
  xp: number;
  level: LevelInfo;
  compact?: boolean;
}

export default function XpBar({ xp, level, compact }: XpBarProps) {
  const pct = Math.round(level.progress * 100);
  return (
    <div
      className={`relative rounded-2xl border border-slate-200 bg-white p-${
        compact ? "3" : "4"
      } shadow-[0_1px_2px_rgba(15,23,42,0.04)]`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black text-xs">
            {level.level}
          </span>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-bold">
              Level {level.level}
            </div>
            <div className="text-sm font-bold text-slate-900">{level.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-amber-600 text-sm font-extrabold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{fmtNumber(xp)} XP</span>
        </div>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 relative"
        >
          <span className="absolute inset-0 xp-shimmer rounded-full" />
        </motion.div>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          {fmtNumber(level.xpInLevel)} / {fmtNumber(level.xpForNext)} XP to next
        </span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
