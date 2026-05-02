"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  Circle,
  Loader2,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  completed: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  learn: "bg-blue-100 text-blue-700",
  social: "bg-violet-100 text-violet-700",
  work: "bg-amber-100 text-amber-700",
};

export default function DailyChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/challenges");
        if (res.ok) {
          const data = await res.json();
          setChallenges(data.challenges);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const complete = async (id: string) => {
    setCompleting(id);
    try {
      const res = await fetch("/api/challenges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: id }),
      });
      if (res.ok) {
        setChallenges((prev) =>
          prev.map((c) => (c.id === id ? { ...c, completed: true } : c))
        );
      }
    } finally {
      setCompleting(null);
    }
  };

  const doneCount = challenges.filter((c) => c.completed).length;
  const allDone = doneCount === challenges.length && challenges.length > 0;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900">Daily Challenges</h3>
              <p className="text-[10px] text-slate-500 font-bold">
                {doneCount}/{challenges.length} completed today
              </p>
            </div>
          </div>
          {allDone && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
              <Star className="h-3 w-3 fill-emerald-600" /> All done!
            </span>
          )}
        </div>

        <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${challenges.length > 0 ? (doneCount / challenges.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {challenges.map((ch) => (
          <div
            key={ch.id}
            className={cn(
              "px-5 py-3 flex items-center gap-3 transition-colors",
              ch.completed && "bg-emerald-50/30"
            )}
          >
            <button
              type="button"
              onClick={() => !ch.completed && complete(ch.id)}
              disabled={ch.completed || completing === ch.id}
              className="shrink-0 transition-transform hover:scale-110 disabled:hover:scale-100"
            >
              {completing === ch.id ? (
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              ) : ch.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300 hover:text-emerald-400 transition-colors" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className={cn(
                "text-sm font-bold",
                ch.completed ? "text-slate-400 line-through" : "text-slate-900"
              )}>
                {ch.title}
              </div>
              <div className="text-[10px] text-slate-500">{ch.description}</div>
            </div>

            <span className={cn(
              "inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0",
              TYPE_COLORS[ch.type] || "bg-slate-100 text-slate-500"
            )}>
              {ch.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
