"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  Lock,
  Shield,
  Sparkles,
  Trophy,
  Crown,
  Star,
} from "lucide-react";
import { cn, fmtNumber } from "@/lib/utils";

interface WeekProg {
  slug: string;
  title: string;
  total: number;
  completed: number;
}

interface Props {
  userName: string;
  userEmail: string;
  eligible: boolean;
  courseComplete: boolean;
  topLevel: boolean;
  currentLevel: number;
  currentLevelTitle: string;
  maxLevel: number;
  completedLessons: number;
  totalLessons: number;
  totalXp: number;
  weekProgress: WeekProg[];
}

const CEO_NAME = "Aditya Jaiswal";
const CTO_NAME = "Shubhodeep Mukherjee";

export function CertificationClient(props: Props) {
  const [showCert, setShowCert] = useState(false);
  const lessonPct = Math.round((props.completedLessons / props.totalLessons) * 100);
  const levelPct = Math.round((props.currentLevel / props.maxLevel) * 100);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50">
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="relative p-6 sm:p-8 md:p-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/25">
              <Award className="h-5 w-5 text-white" />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-extrabold text-amber-700">
                ZapAcademy
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Certification
              </h1>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed max-w-2xl">
            Complete the <strong>entire 8-week curriculum</strong> (pass every quiz) and reach{" "}
            <strong>Level {props.maxLevel} — Founder</strong> to earn your official ZapAcademy
            certification, co-signed by Zaptick&apos;s CEO & CTO.
          </p>

          {/* Requirements */}
          <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-2xl">
            <RequirementCard
              done={props.courseComplete}
              icon={<BookOpen className="h-4 w-4" />}
              title="Complete all lessons"
              detail={`${props.completedLessons} / ${props.totalLessons} quizzes passed (${lessonPct}%)`}
              progress={lessonPct}
              href="/curriculum"
            />
            <RequirementCard
              done={props.topLevel}
              icon={<Crown className="h-4 w-4" />}
              title={`Reach Level ${props.maxLevel} — Founder`}
              detail={`Currently Level ${props.currentLevel} · ${props.currentLevelTitle} (${fmtNumber(props.totalXp)} XP)`}
              progress={levelPct}
              href="/levels"
            />
          </div>

          {props.eligible ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowCert(true)}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl h-12 px-6 text-sm font-extrabold text-[#2a1a00] bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 ring-1 ring-amber-400/70 shadow-[0_10px_28px_-10px_rgba(245,158,11,0.65)] hover:shadow-[0_18px_42px_-12px_rgba(245,158,11,0.9)] transition-all hover:-translate-y-0.5"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                <Award className="relative h-4 w-4" />
                <span className="relative">View your certificate</span>
              </button>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> You&apos;re certified!
              </span>
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <Lock className="h-4 w-4 text-slate-400" />
              Complete both requirements to unlock your certification
            </div>
          )}
        </div>
      </div>

      {/* Week-by-week progress */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-500 mb-4">
          Curriculum progress
        </h2>
        <div className="space-y-3">
          {props.weekProgress.map((w) => {
            const pct = w.total === 0 ? 0 : Math.round((w.completed / w.total) * 100);
            const done = w.completed >= w.total;
            return (
              <Link
                key={w.slug}
                href={`/curriculum/${w.slug}`}
                className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-emerald-200 hover:bg-emerald-50/30 px-4 py-3 transition-colors group"
              >
                <span
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold shrink-0",
                    done
                      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                  )}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : `${pct}%`}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{w.title}</div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        done ? "bg-emerald-500" : "bg-amber-400"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 shrink-0">
                  {w.completed}/{w.total}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* What the cert includes */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-500 mb-4">
          What you get
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <PerkCard
            icon={<Award className="h-5 w-5 text-amber-600" />}
            title="Official certificate"
            detail="Co-signed by Zaptick CEO & CTO, verifiable with a unique credential ID"
          />
          <PerkCard
            icon={<Shield className="h-5 w-5 text-emerald-600" />}
            title="Founder badge"
            detail="Permanent profile badge marking you as Level 10 — Founder"
          />
          <PerkCard
            icon={<Star className="h-5 w-5 text-violet-600" />}
            title="Alumni network"
            detail="Priority access to future cohorts, beta features & partner deals"
          />
        </div>
      </div>

      {/* Certificate modal */}
      <AnimatePresence>
        {showCert && props.eligible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowCert(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl"
            >
              <CertificateView name={props.userName} onClose={() => setShowCert(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Requirement card ─── */

function RequirementCard({
  done,
  icon,
  title,
  detail,
  progress,
  href,
}: {
  done: boolean;
  icon: React.ReactNode;
  title: string;
  detail: string;
  progress: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-2xl border p-4 transition-all group",
        done
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg",
            done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          )}
        >
          {done ? <CheckCircle2 className="h-4 w-4" /> : icon}
        </span>
        <span className={cn("text-sm font-bold", done ? "text-emerald-700" : "text-slate-900")}>
          {title}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={cn("h-full rounded-full", done ? "bg-emerald-500" : "bg-amber-400")}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="mt-1.5 text-xs text-slate-500">{detail}</div>
    </Link>
  );
}

/* ─── Perk card ─── */

function PerkCard({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="mb-2">{icon}</div>
      <div className="text-sm font-bold text-slate-900">{title}</div>
      <div className="text-xs text-slate-500 mt-1 leading-relaxed">{detail}</div>
    </div>
  );
}

/* ─── The actual certificate ─── */

function CertificateView({ name, onClose }: { name: string; onClose: () => void }) {
  const credentialId = `ZAC-${Date.now().toString(36).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-3">
      <div
        id="certificate"
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

        {/* Corner ornaments */}
        <div className="pointer-events-none absolute top-6 left-6 h-16 w-16 border-t-2 border-l-2 border-emerald-300/40 rounded-tl-xl" />
        <div className="pointer-events-none absolute top-6 right-6 h-16 w-16 border-t-2 border-r-2 border-emerald-300/40 rounded-tr-xl" />
        <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-16 border-b-2 border-l-2 border-emerald-300/40 rounded-bl-xl" />
        <div className="pointer-events-none absolute bottom-6 right-6 h-16 w-16 border-b-2 border-r-2 border-emerald-300/40 rounded-br-xl" />

        <div className="relative p-8 sm:p-12 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Image
              src="/zapzap.png"
              alt="Zaptick"
              width={100}
              height={30}
              className="h-7 w-auto object-contain"
            />
            <span className="inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-widest">
              Academy
            </span>
          </div>

          {/* Title */}
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mb-2">
            Certificate of Completion
          </div>
          <div className="text-xs text-slate-500 mb-8">
            This certifies that
          </div>

          {/* Name */}
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {name}
          </div>
          <div className="mx-auto mt-2 h-px w-48 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Description */}
          <p className="mt-6 text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            has successfully completed the <strong>ZapAcademy 8-week curriculum</strong>, passed
            all quizzes, reached <strong>Level 10 — Founder</strong>, and demonstrated mastery of
            the Zaptick marketing platform.
          </p>

          {/* Signatures */}
          <div className="mt-10 grid grid-cols-2 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="h-px bg-slate-300 mb-2" />
              <div className="text-sm font-bold text-slate-900">{CEO_NAME}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                CEO & Co-founder
              </div>
            </div>
            <div className="text-center">
              <div className="h-px bg-slate-300 mb-2" />
              <div className="text-sm font-bold text-slate-900">{CTO_NAME}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                CTO & Co-founder
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-slate-400">
            <span>Date: {dateStr}</span>
            <span className="h-3 w-px bg-slate-200" />
            <span>Credential ID: {credentialId}</span>
          </div>

          {/* Seal */}
          <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-10">
            <div className="h-16 w-16 rounded-full border-2 border-amber-300/50 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center shadow-md">
              <Trophy className="h-7 w-7 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
        >
          Close
        </button>
        <button
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.share) {
              navigator.share({
                title: "ZapAcademy Certificate",
                text: `I just earned my ZapAcademy certification!`,
                url: window.location.href,
              }).catch(() => {});
            }
          }}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" /> Share
        </button>
      </div>
    </div>
  );
}
