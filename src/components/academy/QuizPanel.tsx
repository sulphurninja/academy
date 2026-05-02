"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Check,
  X,
  Sparkles,
  Loader2,
  RefreshCcw,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Flame,
  Zap,
  Clock,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: "mcq" | "multi" | "short";
  options?: { id: string; label: string }[];
  points?: number;
}

export interface QuizSummary {
  passScore: number;
  xpOnPass: number;
  xpOnPerfect: number;
  questions: QuizQuestion[];
}

interface QuizResult {
  score: number;
  passed: boolean;
  perfect: boolean;
  xpAwarded: number;
  totalXp: number;
  perQuestion: { id: string; correct: boolean }[];
}

interface QuizPanelProps {
  weekSlug: string;
  lessonSlug: string;
  quiz: QuizSummary;
  videoCompleted: boolean;
  alreadyPassed: boolean;
  bestScore?: number;
  onPassed?: () => void;
}

export default function QuizPanel({
  weekSlug,
  lessonSlug,
  quiz,
  videoCompleted,
  alreadyPassed,
  bestScore,
  onPassed,
}: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const total = quiz.questions.length;
  const passThresholdPct = Math.round(quiz.passScore * 100);
  const answered = Object.keys(answers).length;
  const current = quiz.questions[step];

  // Timer
  useEffect(() => {
    if (!started || result) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [started, result]);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  function setSingle(qid: string, optId: string) {
    setAnswers((prev) => ({ ...prev, [qid]: optId }));
  }
  function toggleMulti(qid: string, optId: string) {
    setAnswers((prev) => {
      const cur = (prev[qid] as string[]) || [];
      const next = cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId];
      return { ...prev, [qid]: next };
    });
  }
  function setShort(qid: string, val: string) {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekSlug, lessonSlug, answers }),
      });
      const json = await r.json();
      if (!r.ok) {
        setError(json?.error || "Submission failed");
      } else {
        setResult(json);
        if (json.passed) {
          onPassed?.();
          if (json.perfect || json.xpAwarded > 0) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
          }
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setAnswers({});
    setStep(0);
    setStarted(false);
    setElapsed(0);
    setShowCelebration(false);
  }

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  if (!videoCompleted) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <Sparkles className="mx-auto h-7 w-7 text-emerald-500" />
        <div className="mt-2 text-sm font-bold text-slate-900">Watch the video to unlock the quiz</div>
        <div className="mt-1 text-xs text-slate-500">
          Reach 90% of the video and the quiz unlocks instantly.
        </div>
      </div>
    );
  }

  // Pre-start splash
  if (!started && !result) {
    return (
      <div className="space-y-4">
        {alreadyPassed && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-bold">
            <Check className="h-4 w-4" />
            You&apos;ve aced this{bestScore ? ` — best ${Math.round(bestScore * 100)}%` : ""}. Re-take to flex.
          </div>
        )}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 mb-4">
            <Target className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Ready for the quiz?</h3>
          <p className="mt-2 text-sm text-slate-600 max-w-xs mx-auto">
            {total} question{total !== 1 ? "s" : ""} · Pass at ≥{passThresholdPct}% · First-try pass = double XP
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 max-w-xs mx-auto text-center">
            <div className="rounded-xl bg-white border border-slate-200 px-2 py-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pass</div>
              <div className="text-sm font-bold text-amber-600">+{quiz.xpOnPass} XP</div>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 px-2 py-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Perfect</div>
              <div className="text-sm font-bold text-emerald-600">+{quiz.xpOnPerfect} XP</div>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 px-2 py-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total pts</div>
              <div className="text-sm font-bold text-slate-700">
                {quiz.questions.reduce((s, q) => s + (q.points || 10), 0)}
              </div>
            </div>
          </div>
          <Button
            onClick={() => setStarted(true)}
            className="mt-5 gap-2"
            size="lg"
          >
            <Zap className="h-4 w-4" /> Start quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar + timer */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              result
                ? result.passed
                  ? "bg-emerald-500"
                  : "bg-rose-400"
                : "bg-gradient-to-r from-emerald-400 to-emerald-600"
            )}
            initial={{ width: 0 }}
            animate={{ width: result ? "100%" : `${((step + 1) / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 shrink-0">
          <Clock className="h-3 w-3" />
          {fmtTime(elapsed)}
        </div>
        <div className="text-[11px] font-bold text-slate-500 shrink-0">
          {answered}/{total}
        </div>
      </div>

      {/* Question dots */}
      <div className="flex items-center gap-1 flex-wrap">
        {quiz.questions.map((q, i) => {
          const hasAnswer = !!answers[q.id] && (typeof answers[q.id] === "string" ? (answers[q.id] as string).trim() : (answers[q.id] as string[]).length > 0);
          const verdict = result?.perQuestion.find((p) => p.id === q.id);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => !result && setStep(i)}
              className={cn(
                "h-7 w-7 rounded-lg text-[10px] font-bold transition-all",
                i === step && !result && "ring-2 ring-emerald-400 ring-offset-1",
                result && verdict?.correct && "bg-emerald-100 text-emerald-700 border border-emerald-200",
                result && verdict && !verdict.correct && "bg-rose-100 text-rose-700 border border-rose-200",
                !result && hasAnswer && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                !result && !hasAnswer && i !== step && "bg-slate-100 text-slate-400 border border-slate-200"
              )}
            >
              {result ? (
                verdict?.correct ? (
                  <Check className="h-3 w-3 mx-auto" />
                ) : (
                  <X className="h-3 w-3 mx-auto" />
                )
              ) : (
                i + 1
              )}
            </button>
          );
        })}
      </div>

      {/* Current question */}
      {!result && current && (
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold ring-1 ring-emerald-200">
                {step + 1}
              </span>
              <div>
                <p className="text-sm text-slate-900 font-semibold leading-snug">{current.prompt}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                  {current.type === "mcq" && "Select one"}
                  {current.type === "multi" && "Select all that apply"}
                  {current.type === "short" && "Type your answer"}
                  {" · "}{current.points || 10} pts
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {current.type !== "short" &&
                current.options?.map((opt) => {
                  const selected =
                    current.type === "mcq"
                      ? answers[current.id] === opt.id
                      : ((answers[current.id] as string[]) || []).includes(opt.id);

                  return (
                    <motion.button
                      type="button"
                      key={opt.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        current.type === "mcq"
                          ? setSingle(current.id, opt.id)
                          : toggleMulti(current.id, opt.id)
                      }
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all text-left",
                        selected
                          ? "border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-500/10"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center shrink-0 transition-all",
                          current.type === "multi" ? "rounded-md" : "rounded-full",
                          selected
                            ? "border-2 border-emerald-500 bg-emerald-500"
                            : "border-2 border-slate-300"
                        )}
                      >
                        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </span>
                      <span className="flex-1">{opt.label}</span>
                    </motion.button>
                  );
                })}
              {current.type === "short" && (
                <textarea
                  value={(answers[current.id] as string) || ""}
                  onChange={(e) => setShort(current.id, e.target.value)}
                  placeholder="Type your answer…"
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Result view (after submit) */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Score card */}
            <div
              className={cn(
                "rounded-2xl border p-5 text-center",
                result.passed ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50" : "border-rose-200 bg-rose-50"
              )}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                className={cn(
                  "inline-flex h-20 w-20 items-center justify-center rounded-full mx-auto mb-3",
                  result.passed ? "bg-emerald-100 ring-4 ring-emerald-200" : "bg-rose-100 ring-4 ring-rose-200"
                )}
              >
                {result.perfect ? (
                  <Trophy className="h-9 w-9 text-amber-500" />
                ) : result.passed ? (
                  <Check className="h-9 w-9 text-emerald-600" />
                ) : (
                  <X className="h-9 w-9 text-rose-500" />
                )}
              </motion.div>
              <div className={cn("text-4xl font-black", result.passed ? "text-emerald-700" : "text-rose-700")}>
                {Math.round(result.score * 100)}%
              </div>
              <div className={cn("text-sm font-bold mt-1", result.passed ? "text-emerald-600" : "text-rose-600")}>
                {result.perfect
                  ? "Perfect score — absolute beast!"
                  : result.passed
                  ? "Passed — well played!"
                  : `Need ≥${passThresholdPct}% to pass`}
              </div>

              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-1 text-2xl font-black text-amber-600">
                    <Sparkles className="h-5 w-5" />+{result.xpAwarded}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    XP earned
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-700">
                    {fmtTime(elapsed)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Time taken
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-700">
                    {result.perQuestion.filter((p) => p.correct).length}/{total}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Correct
                  </div>
                </div>
              </div>
            </div>

            {/* Per-question breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">
                Question breakdown
              </div>
              <div className="space-y-1.5">
                {quiz.questions.map((q, i) => {
                  const v = result.perQuestion.find((p) => p.id === q.id);
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                        v?.correct ? "bg-emerald-50" : "bg-rose-50"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-md text-white text-[10px] font-bold shrink-0",
                          v?.correct ? "bg-emerald-500" : "bg-rose-400"
                        )}
                      >
                        {v?.correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </span>
                      <span className="text-slate-700 truncate flex-1">Q{i + 1}: {q.prompt}</span>
                      <span className="text-slate-400 font-bold shrink-0">{q.points || 10} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <X className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Nav / submit */}
      <div className="flex items-center justify-between gap-2">
        {!result ? (
          <>
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={step === 0}
              size="sm"
              className="gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
            <div className="flex items-center gap-2">
              {step < total - 1 ? (
                <Button onClick={goNext} size="sm" className="gap-1">
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={submit}
                  disabled={submitting || answered === 0}
                  className="gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit quiz
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 w-full justify-end">
            <Button variant="outline" onClick={reset} className="gap-1.5">
              <RefreshCcw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        )}
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, times: [0, 0.6, 1] }}
              className="text-center"
            >
              <div className="text-7xl mb-2">
                {result?.perfect ? "🏆" : "🎉"}
              </div>
              <div className="text-2xl font-black text-white drop-shadow-lg">
                {result?.perfect ? "PERFECT!" : "PASSED!"}
              </div>
              <div className="inline-flex items-center gap-1 text-lg font-bold text-amber-300 drop-shadow-md mt-1">
                <Sparkles className="h-5 w-5" /> +{result?.xpAwarded} XP
              </div>
            </motion.div>
            {/* Particle emojis */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: -200 - Math.random() * 150,
                  x: (Math.random() - 0.5) * 300,
                  scale: [0, 1, 0.5],
                }}
                transition={{ duration: 2, delay: Math.random() * 0.5 }}
                className="absolute text-2xl"
                style={{ top: "50%", left: "50%" }}
              >
                {["⭐", "🔥", "💎", "✨", "🏅", "🎯"][i % 6]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
