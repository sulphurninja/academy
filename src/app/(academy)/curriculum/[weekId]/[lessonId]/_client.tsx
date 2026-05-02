"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  MessageCircle,
  Sparkles,
  Wrench,
  StickyNote,
  Bookmark,
  Share2,
  CheckCircle2,
  BookOpen,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Bot,
  Send,
  Loader2,
} from "lucide-react";
import VideoPlayer, { VideoActions } from "@/components/academy/VideoPlayer";
import QuizPanel, { type QuizSummary } from "@/components/academy/QuizPanel";
import CommentThread from "@/components/academy/CommentThread";
import { cn } from "@/lib/utils";

type Tab = "quiz" | "comments" | "challenge" | "resources" | "notes" | "focus" | "ai";

interface Props {
  userId: string;
  weekSlug: string;
  lessonSlug: string;
  title: string;
  videoUrl?: string;
  videoProvider?: "youtube" | "vimeo" | "mp4" | "hls" | string;
  videoCompleted: boolean;
  bookmarked?: boolean;
  quiz: QuizSummary | null;
  quizAlreadyPassed: boolean;
  quizBestScore?: number;
  challenge?: string;
  resources: { label: string; url: string }[];
  hasGuide?: boolean;
  initialNote?: string;
}

export function LessonClient(props: Props) {
  const [tab, setTab] = useState<Tab>("quiz");
  const [completed, setCompleted] = useState(props.videoCompleted);
  const [noteDraft, setNoteDraft] = useState(props.initialNote || "");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  // Pomodoro state
  const [pomoDuration, setPomoDuration] = useState(25);
  const [pomoSecondsLeft, setPomoSecondsLeft] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoSessions, setPomoSessions] = useState(0);
  const pomoRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (pomoRunning && pomoSecondsLeft > 0) {
      pomoRef.current = setInterval(() => {
        setPomoSecondsLeft((s) => {
          if (s <= 1) {
            setPomoRunning(false);
            setPomoSessions((c) => c + 1);
            if (pomoRef.current) clearInterval(pomoRef.current);
            try { new Audio("/notification.mp3").play().catch(() => {}); } catch {}
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (pomoRef.current) clearInterval(pomoRef.current); };
  }, [pomoRunning, pomoSecondsLeft]);

  const resetPomo = (mins: number) => {
    setPomoRunning(false);
    setPomoDuration(mins);
    setPomoSecondsLeft(mins * 60);
    if (pomoRef.current) clearInterval(pomoRef.current);
  };

  // AI Study Buddy state
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [aiDraft, setAiDraft] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiEndRef = useRef<HTMLDivElement>(null);

  const sendAiMessage = useCallback(async () => {
    if (!aiDraft.trim() || aiLoading) return;
    const userMsg = aiDraft.trim();
    setAiDraft("");
    setAiMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/study-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: props.title,
          weekSlug: props.weekSlug,
          lessonSlug: props.lessonSlug,
          message: userMsg,
          history: aiMessages.slice(-6),
        }),
      });
      if (res.ok) {
        const { reply } = await res.json();
        setAiMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      } else {
        setAiMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I couldn't process that. Please try again." }]);
      }
    } catch {
      setAiMessages((prev) => [...prev, { role: "assistant", text: "Connection error. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiDraft, aiLoading, aiMessages, props.title, props.weekSlug, props.lessonSlug]);

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const onVideoComplete = async () => {
    if (completed) return;
    setCompleted(true);
    try {
      await fetch("/api/me/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekSlug: props.weekSlug,
          lessonSlug: props.lessonSlug,
          videoCompleted: true,
        }),
      });
    } catch {
      /* swallow */
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "quiz", label: "Quiz", icon: <Sparkles className="h-3.5 w-3.5" /> },
    ...(props.challenge
      ? [{ id: "challenge" as Tab, label: "Challenge", icon: <Wrench className="h-3.5 w-3.5" /> }]
      : []),
    { id: "comments", label: "Discussion", icon: <MessageCircle className="h-3.5 w-3.5" /> },
    { id: "notes", label: "Notes", icon: <StickyNote className="h-3.5 w-3.5" /> },
    { id: "focus", label: "Focus", icon: <Timer className="h-3.5 w-3.5" /> },
    { id: "ai", label: "AI Buddy", icon: <Bot className="h-3.5 w-3.5" /> },
    ...(props.resources.length
      ? [{ id: "resources" as Tab, label: "Resources", icon: <FileText className="h-3.5 w-3.5" /> }]
      : []),
  ];

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-4">
        <VideoPlayer
          url={props.videoUrl}
          provider={props.videoProvider}
          completed={completed}
          onComplete={onVideoComplete}
        />
        <VideoActions
          weekSlug={props.weekSlug}
          lessonSlug={props.lessonSlug}
          title={props.title}
          initialBookmarked={!!props.bookmarked}
          onAddNote={() => setTab("notes")}
        />

        {!props.videoUrl && (
          <button
            onClick={onVideoComplete}
            className="text-[11px] text-slate-500 hover:text-slate-700 underline-offset-4 hover:underline"
          >
            Pretend-mark video as watched (dev only) →
          </button>
        )}

        {props.hasGuide && (
          <Link
            href={`/playbooks/${props.weekSlug}/${props.lessonSlug}`}
            className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 hover:shadow-md hover:border-emerald-300 transition-all group"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200 transition-colors">
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900">Read the Playbook</div>
              <div className="text-xs text-slate-500">The full tactical playbook for this lesson — read, apply, dominate.</div>
            </div>
            <ExternalLink className="h-4 w-4 text-emerald-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {/* Lesson summary card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              Lesson summary
            </h4>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Take 2 minutes to jot down your one-line takeaway in <strong>Notes</strong>. Then drop a
            question in <strong>Discussion</strong> — comments earn +10 XP.
          </p>
          <div className="mt-3 flex items-center gap-2">
            {completed ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Video watched
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
                Watch ≥ 90% to unlock the quiz
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator
                    .share({ title: props.title, url: window.location.href })
                    .catch(() => {});
                } else if (typeof navigator !== "undefined") {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center gap-1 p-2 border-b border-slate-100 overflow-x-auto scrollbar-soft">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors",
                  tab === t.id
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto scrollbar-soft">
            {tab === "quiz" &&
              (props.quiz && props.quiz.questions.length > 0 ? (
                <QuizPanel
                  weekSlug={props.weekSlug}
                  lessonSlug={props.lessonSlug}
                  quiz={props.quiz}
                  videoCompleted={completed}
                  alreadyPassed={props.quizAlreadyPassed}
                  bestScore={props.quizBestScore}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm font-bold text-slate-900">Quiz coming soon</p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Your founder will publish the quiz before the cohort starts. Check back soon.
                  </p>
                </div>
              ))}

            {tab === "challenge" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="h-4 w-4 text-amber-600" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-amber-700">
                      Interactive challenge · {props.challenge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Build it. Earn +400 XP.</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    This lesson has a hands-on build. In the next drop we&apos;ll render the actual Zaptick
                    surface (workflow builder, broadcast composer, AI agent brief, …) right here, validate
                    your work, and award XP automatically.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" /> Coming soon
                  </div>
                </div>
              </div>
            )}

            {tab === "comments" && (
              <CommentThread
                weekSlug={props.weekSlug}
                lessonSlug={props.lessonSlug}
                currentUserId={props.userId}
              />
            )}

            {tab === "notes" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Personal notes for this lesson. Saved to your account — accessible from any device.
                </p>
                <textarea
                  value={noteDraft}
                  onChange={(e) => {
                    setNoteDraft(e.target.value);
                    setNoteSaved(false);
                  }}
                  placeholder="One-line takeaway, copy ideas, screenshots URLs, etc."
                  rows={6}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <div className="flex items-center justify-end gap-2">
                  {noteSaved && (
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Saved
                    </span>
                  )}
                  <button
                    disabled={noteSaving}
                    onClick={async () => {
                      setNoteSaving(true);
                      try {
                        const r = await fetch("/api/notes", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            weekSlug: props.weekSlug,
                            lessonSlug: props.lessonSlug,
                            body: noteDraft,
                          }),
                        });
                        if (r.ok) setNoteSaved(true);
                      } finally {
                        setNoteSaving(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    {noteSaving ? "Saving…" : "Save note"}
                  </button>
                </div>
              </div>
            )}

            {tab === "focus" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle
                        cx="80" cy="80" r="70" fill="none"
                        stroke={pomoSecondsLeft === 0 ? "#10b981" : "#3b82f6"}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 70}
                        strokeDashoffset={2 * Math.PI * 70 * (1 - pomoSecondsLeft / (pomoDuration * 60))}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-900 tabular-nums">
                        {String(Math.floor(pomoSecondsLeft / 60)).padStart(2, "0")}:{String(pomoSecondsLeft % 60).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {pomoSecondsLeft === 0 ? "Done!" : pomoRunning ? "Focusing" : "Paused"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPomoRunning(!pomoRunning)}
                    disabled={pomoSecondsLeft === 0}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {pomoRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {pomoRunning ? "Pause" : "Start"}
                  </button>
                  <button
                    onClick={() => resetPomo(pomoDuration)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  {[15, 25, 45, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => resetPomo(m)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-[10px] font-bold transition-colors",
                        pomoDuration === m
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sessions today</div>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">{pomoSessions}</div>
                </div>
              </div>
            )}

            {tab === "ai" && (
              <div className="flex flex-col h-[50vh]">
                <div className="flex-1 overflow-y-auto scrollbar-soft space-y-3 pb-3">
                  {aiMessages.length === 0 && (
                    <div className="text-center py-6">
                      <Bot className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900">AI Study Buddy</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Ask anything about &ldquo;{props.title}&rdquo; — I&apos;ll help you understand it better.
                      </p>
                      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                        {["Explain the key concepts", "Give me a real-world example", "What are common mistakes?"].map((q) => (
                          <button
                            key={q}
                            onClick={() => { setAiDraft(q); }}
                            className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                        msg.role === "user"
                          ? "bg-emerald-600 text-white rounded-br-md"
                          : "bg-slate-100 text-slate-700 rounded-bl-md"
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-3 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      </div>
                    </div>
                  )}
                  <div ref={aiEndRef} />
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={aiDraft}
                    onChange={(e) => setAiDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAiMessage(); } }}
                    placeholder="Ask about this lesson…"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    disabled={aiLoading}
                  />
                  <button
                    onClick={sendAiMessage}
                    disabled={aiLoading || !aiDraft.trim()}
                    className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 transition-colors shrink-0"
                  >
                    {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {tab === "resources" && (
              <div className="space-y-2">
                {props.resources.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40 px-3 py-2.5 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span className="text-sm text-slate-900 flex-1 truncate font-semibold">{r.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
