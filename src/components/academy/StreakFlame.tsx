"use client";

import { Flame } from "lucide-react";

interface StreakFlameProps {
  current: number;
  longest?: number;
  compact?: boolean;
}

export default function StreakFlame({ current, longest, compact }: StreakFlameProps) {
  const intensity = Math.min(1, current / 30);
  return (
    <div
      className={`relative inline-flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-${
        compact ? "2 px-3" : "3"
      }`}
    >
      <span className="relative">
        <Flame
          className="flame-breath h-5 w-5 text-amber-500"
          style={{ filter: `drop-shadow(0 0 ${4 + intensity * 6}px rgba(251,146,60,${0.4 + intensity * 0.4}))` }}
          strokeWidth={2}
        />
        {current >= 7 && (
          <span className="absolute inset-0 -z-10 rounded-full bg-amber-300/40 blur-md" />
        )}
      </span>
      <div className="leading-tight">
        <div className="text-[11px] uppercase tracking-widest text-amber-700/70 font-bold">
          Streak
        </div>
        <div className="text-sm font-extrabold text-amber-700">
          {current} day{current === 1 ? "" : "s"}
          {longest ? (
            <span className="ml-1.5 text-[11px] font-semibold text-amber-700/70">
              · best {longest}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
