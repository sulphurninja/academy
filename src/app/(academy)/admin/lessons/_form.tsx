"use client";

import { useState, useCallback } from "react";
import {
  Check,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Loader2,
  CheckCircle2,
  Type,
  ListChecks,
  MessageSquare,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Types ── */

interface QuizOption {
  id: string;
  label: string;
}

interface QuizQuestion {
  id: string;
  type: "mcq" | "multi" | "short";
  prompt: string;
  options: QuizOption[];
  correct: string[];
  explain: string;
  points: number;
}

interface QuizData {
  passScore: number;
  xpOnPass: number;
  xpOnPerfect: number;
  questions: QuizQuestion[];
}

interface Initial {
  videoUrl: string;
  videoProvider: "youtube" | "vimeo" | "mp4" | "hls";
  isPublished: boolean;
  xpVideoComplete: number;
  quizJson: string;
  content: string;
}

interface Props {
  weekSlug: string;
  lessonSlug: string;
  title: string;
  initial: Initial;
}

/* ── Helpers ── */

function newId(): string {
  return "q" + Math.random().toString(36).slice(2, 8);
}

function newOptId(): string {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26)) + Math.random().toString(36).slice(2, 5);
}

function emptyQuestion(): QuizQuestion {
  return {
    id: newId(),
    type: "mcq",
    prompt: "",
    options: [
      { id: "a", label: "" },
      { id: "b", label: "" },
    ],
    correct: [],
    explain: "",
    points: 10,
  };
}

function parseQuizJson(json: string): QuizData | null {
  try {
    const obj = JSON.parse(json);
    return {
      passScore: obj.passScore ?? 0.7,
      xpOnPass: obj.xpOnPass ?? 100,
      xpOnPerfect: obj.xpOnPerfect ?? 250,
      questions: (obj.questions || []).map((q: any) => ({
        id: q.id || newId(),
        type: q.type || "mcq",
        prompt: q.prompt || "",
        options: (q.options || []).map((o: any) =>
          typeof o === "string" ? { id: newOptId(), label: o } : { id: o.id || newOptId(), label: o.label || o }
        ),
        correct: q.correct || [],
        explain: q.explain || "",
        points: q.points ?? 10,
      })),
    };
  } catch {
    return null;
  }
}

function serializeQuiz(quiz: QuizData): string {
  return JSON.stringify(
    {
      passScore: quiz.passScore,
      xpOnPass: quiz.xpOnPass,
      xpOnPerfect: quiz.xpOnPerfect,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        ...(q.type !== "short" ? { options: q.options.map((o) => ({ id: o.id, label: o.label })) } : {}),
        correct: q.correct,
        ...(q.explain ? { explain: q.explain } : {}),
        points: q.points,
      })),
    },
    null,
    2
  );
}

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
  mcq: {
    icon: <HelpCircle className="h-3.5 w-3.5" />,
    label: "Single choice",
    description: "Pick one correct answer",
  },
  multi: {
    icon: <ListChecks className="h-3.5 w-3.5" />,
    label: "Multi-select",
    description: "Pick all correct answers",
  },
  short: {
    icon: <Type className="h-3.5 w-3.5" />,
    label: "Short answer",
    description: "Type the answer (text match)",
  },
};

/* ── Main component ── */

export function AdminLessonForm({ weekSlug, lessonSlug, title, initial }: Props) {
  const [state, setState] = useState<Initial>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialQuiz = initial.quizJson ? parseQuizJson(initial.quizJson) : null;
  const [quiz, setQuiz] = useState<QuizData>(
    initialQuiz || { passScore: 0.7, xpOnPass: 100, xpOnPerfect: 250, questions: [] }
  );
  const [showBuilder, setShowBuilder] = useState(!!initialQuiz?.questions?.length);

  const updateQuestion = useCallback(
    (qid: string, patch: Partial<QuizQuestion>) => {
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
      }));
    },
    []
  );

  const moveQuestion = useCallback((idx: number, dir: -1 | 1) => {
    setQuiz((prev) => {
      const next = [...prev.questions];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prev, questions: next };
    });
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const quizPayload = quiz.questions.length > 0 ? JSON.parse(serializeQuiz(quiz)) : undefined;
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekSlug,
          lessonSlug,
          videoUrl: state.videoUrl,
          videoProvider: state.videoProvider,
          isPublished: state.isPublished,
          xpVideoComplete: state.xpVideoComplete,
          quiz: quizPayload,
          content: state.content || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      setSavedAt(Date.now());
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const hasValidationIssues = quiz.questions.some(
    (q) => !q.prompt.trim() || q.correct.length === 0 || (q.type !== "short" && q.options.some((o) => !o.label.trim()))
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 truncate">{title}</h3>
          <p className="text-[10px] text-slate-400 font-mono">
            {weekSlug} / {lessonSlug}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-bold">
            <input
              type="checkbox"
              className="accent-emerald-600"
              checked={state.isPublished}
              onChange={(e) => setState((s) => ({ ...s, isPublished: e.target.checked }))}
            />
            Published
          </label>
          {state.videoUrl && (
            <a
              href={state.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
            >
              Preview <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Video row */}
      <div className="grid sm:grid-cols-12 gap-2">
        <div className="sm:col-span-7">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
            Video URL
          </label>
          <Input
            placeholder="https://www.youtube.com/watch?v=…"
            value={state.videoUrl}
            onChange={(e) => setState((s) => ({ ...s, videoUrl: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
            Provider
          </label>
          <select
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            value={state.videoProvider}
            onChange={(e) =>
              setState((s) => ({ ...s, videoProvider: e.target.value as Initial["videoProvider"] }))
            }
          >
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="mp4">MP4</option>
            <option value="hls">HLS</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
            Video XP
          </label>
          <Input
            type="number"
            min={0}
            max={500}
            value={state.xpVideoComplete}
            onChange={(e) =>
              setState((s) => ({ ...s, xpVideoComplete: Number(e.target.value || 0) }))
            }
          />
        </div>
        <div className="sm:col-span-1 flex items-end">
          <Button
            onClick={save}
            disabled={saving}
            size="default"
            className="w-full"
            variant={savedAt && Date.now() - savedAt < 2500 ? "outline" : "default"}
          >
            {savedAt && Date.now() - savedAt < 2500 ? (
              <>
                <Check className="h-3.5 w-3.5" /> Saved
              </>
            ) : saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Written Guide Content ── */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("content-editor");
            if (el) el.classList.toggle("hidden");
          }}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold text-slate-700"
        >
          <span className="inline-flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5 text-emerald-700" />
            Written Guide Content
            {state.content && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-extrabold">
                {Math.ceil(state.content.length / 1200)} min read
              </span>
            )}
          </span>
          <span className="text-slate-400">▾</span>
        </button>
        <div id="content-editor" className={state.content ? "" : "hidden"}>
          <div className="border-t border-slate-200 p-4">
            <p className="text-[10px] text-slate-500 mb-2">
              Rich markup: **bold**, *italic*, `code`, [link](url). Blocks: :::tip, :::warning, :::info, :::steps, :::checklist, :::highlight, :::cta url text. Headings: # ## ###
            </p>
            <Textarea
              value={state.content}
              onChange={(e) => setState((s) => ({ ...s, content: e.target.value }))}
              placeholder="Write your lesson guide content here using the markup syntax..."
              rows={16}
              className="font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* ── Quiz Builder ── */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => setShowBuilder((s) => !s)}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold text-slate-700"
        >
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
            Quiz Builder
            {quiz.questions.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-extrabold">
                {quiz.questions.length} Q{quiz.questions.length > 1 ? "s" : ""}
              </span>
            )}
          </span>
          <span className={cn("transition-transform text-slate-400", showBuilder && "rotate-180")}>▾</span>
        </button>

        {showBuilder && (
          <div className="border-t border-slate-200 p-4 space-y-4">
            {/* Quiz settings */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
                  Pass score
                </label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(quiz.passScore * 100)}
                    onChange={(e) =>
                      setQuiz((q) => ({ ...q, passScore: Number(e.target.value || 70) / 100 }))
                    }
                  />
                  <span className="text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
                  XP on pass
                </label>
                <Input
                  type="number"
                  min={0}
                  value={quiz.xpOnPass}
                  onChange={(e) => setQuiz((q) => ({ ...q, xpOnPass: Number(e.target.value || 0) }))}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
                  XP on perfect
                </label>
                <Input
                  type="number"
                  min={0}
                  value={quiz.xpOnPerfect}
                  onChange={(e) => setQuiz((q) => ({ ...q, xpOnPerfect: Number(e.target.value || 0) }))}
                />
              </div>
            </div>

            {/* Validation warning */}
            {quiz.questions.length > 0 && hasValidationIssues && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 font-bold">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Some questions have empty prompts, options, or no correct answer marked
              </div>
            )}

            {/* Questions */}
            <div className="space-y-4">
              {quiz.questions.map((q, idx) => (
                <QuestionEditor
                  key={q.id}
                  question={q}
                  index={idx}
                  total={quiz.questions.length}
                  onChange={(patch) => updateQuestion(q.id, patch)}
                  onMove={(dir) => moveQuestion(idx, dir)}
                  onRemove={() =>
                    setQuiz((prev) => ({
                      ...prev,
                      questions: prev.questions.filter((x) => x.id !== q.id),
                    }))
                  }
                />
              ))}
            </div>

            {/* Add question */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setQuiz((prev) => ({
                    ...prev,
                    questions: [...prev.questions, emptyQuestion()],
                  }))
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add question
              </button>
              <div className="flex-1" />
              <span className="text-[10px] text-slate-400 font-mono">
                {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""} ·{" "}
                {quiz.questions.reduce((s, q) => s + q.points, 0)} pts total
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}

/* ── Single question editor ── */

function QuestionEditor({
  question: q,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  onChange: (patch: Partial<QuizQuestion>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const meta = TYPE_META[q.type];

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Question header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <GripVertical className="h-3.5 w-3.5 text-slate-300 shrink-0" />
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold ring-1 ring-emerald-200 shrink-0">
          {index + 1}
        </span>

        {/* Type selector */}
        <div className="flex items-center gap-1">
          {(["mcq", "multi", "short"] as const).map((t) => {
            const m = TYPE_META[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  const patch: Partial<QuizQuestion> = { type: t };
                  if (t === "short") patch.options = [];
                  else if (q.options.length === 0)
                    patch.options = [
                      { id: "a", label: "" },
                      { id: "b", label: "" },
                    ];
                  patch.correct = [];
                  onChange(patch);
                }}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors",
                  q.type === t
                    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
                title={m.description}
              >
                {m.icon}
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Points */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={100}
            value={q.points}
            onChange={(e) => onChange({ points: Number(e.target.value || 10) })}
            className="w-12 h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-center font-bold text-slate-700 focus:border-emerald-300 focus:outline-none"
          />
          <span className="text-[10px] text-slate-400 font-bold">pts</span>
        </div>

        {/* Move / delete */}
        <div className="flex items-center gap-0.5 ml-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            className="h-6 w-6 inline-flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            className="h-6 w-6 inline-flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="h-6 w-6 inline-flex items-center justify-center rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Question body */}
      <div className="p-4 space-y-3">
        {/* Prompt */}
        <Textarea
          value={q.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
          placeholder="Type your question here…"
          rows={2}
          className="text-sm font-semibold"
        />

        {/* Options (MCQ / Multi) */}
        {q.type !== "short" && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              {q.type === "mcq" ? "Options (click to mark correct)" : "Options (click to mark all correct)"}
            </div>
            {q.options.map((opt, oi) => {
              const isCorrect = q.correct.includes(opt.id);
              return (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (q.type === "mcq") {
                        onChange({ correct: isCorrect ? [] : [opt.id] });
                      } else {
                        onChange({
                          correct: isCorrect
                            ? q.correct.filter((c) => c !== opt.id)
                            : [...q.correct, opt.id],
                        });
                      }
                    }}
                    className={cn(
                      "shrink-0 h-6 w-6 inline-flex items-center justify-center rounded-lg border-2 transition-all",
                      isCorrect
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                        : "border-slate-300 bg-white hover:border-emerald-400"
                    )}
                    title={isCorrect ? "Unmark as correct" : "Mark as correct"}
                  >
                    {isCorrect && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                  <Input
                    value={opt.label}
                    onChange={(e) => {
                      const newOpts = q.options.map((o, j) =>
                        j === oi ? { ...o, label: e.target.value } : o
                      );
                      onChange({ options: newOpts });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    className="flex-1"
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange({
                          options: q.options.filter((_, j) => j !== oi),
                          correct: q.correct.filter((c) => c !== opt.id),
                        });
                      }}
                      className="h-6 w-6 inline-flex items-center justify-center rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
            {q.options.length < 8 && (
              <button
                type="button"
                onClick={() =>
                  onChange({ options: [...q.options, { id: newOptId(), label: "" }] })
                }
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
              >
                <Plus className="h-3 w-3" /> Add option
              </button>
            )}
          </div>
        )}

        {/* Short answer accepted values */}
        {q.type === "short" && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Accepted answers (one per line, case-insensitive match)
            </div>
            <Textarea
              value={q.correct.join("\n")}
              onChange={(e) =>
                onChange({ correct: e.target.value.split("\n").filter((l) => l.trim()) })
              }
              placeholder={"answer 1\nanswer 2\n…"}
              rows={3}
              className="font-mono text-xs"
            />
          </div>
        )}

        {/* Explanation (optional) */}
        <div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById(`explain-${q.id}`);
              if (el) el.classList.toggle("hidden");
            }}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <MessageSquare className="h-3 w-3" /> Explanation (optional)
          </button>
          <div id={`explain-${q.id}`} className={q.explain ? "" : "hidden"}>
            <Textarea
              value={q.explain}
              onChange={(e) => onChange({ explain: e.target.value })}
              placeholder="Shown to the student after they submit…"
              rows={2}
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
