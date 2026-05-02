"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Sparkles,
  Lock,
  CheckCircle2,
  Gift,
  ArrowDown,
  Crown,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { type LevelInfo, ARENA_LEVELS, xpFloorForLevel, type ArenaLevel, type LevelPerk } from "@/lib/xp";
import { fmtNumber, cn } from "@/lib/utils";

interface Props {
  xp: number;
  level: LevelInfo;
}

export default function LevelsClient({ xp, level }: Props) {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const arenas = ARENA_LEVELS;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <header className="text-center pt-4 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-amber-700 mb-4">
          <Crown className="h-3.5 w-3.5" />
          Level Arenas
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          Your Roadmap
        </h1>
        <p className="mt-2 text-slate-600 max-w-md mx-auto text-[15px] leading-relaxed">
          Climb through 10 arenas. Each level unlocks exclusive perks, credits, and
          partner discounts. Earn XP to advance.
        </p>

        {/* Current position */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-5 py-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black text-lg shadow-lg">
            {level.level}
          </span>
          <div className="text-left">
            <div className="text-xs text-slate-500 font-bold">You are</div>
            <div className="text-lg font-black text-slate-900">
              {level.title}{" "}
              <span className="text-amber-600 text-sm font-extrabold">
                · {fmtNumber(xp)} XP
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          Scroll to explore all arenas
        </div>
      </header>

      {/* The roadmap path — BOTTOM to TOP rendering (reversed) */}
      <div className="relative">
        {/* Center spine */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-300 via-emerald-300 to-slate-200 rounded-full"
          aria-hidden
        />

        <div className="relative space-y-0">
          {arenas
            .slice()
            .reverse()
            .map((arena, idx) => {
              const reversedIdx = arenas.length - 1 - idx;
              const isUnlocked = level.level >= arena.level;
              const isCurrent = level.level === arena.level;
              const isExpanded = expandedLevel === arena.level;
              const isLeft = reversedIdx % 2 === 0;
              const nextFloor = xpFloorForLevel(arena.level + 1);
              const progressInArena = isCurrent
                ? Math.round(level.progress * 100)
                : isUnlocked
                  ? 100
                  : 0;

              return (
                <div
                  key={arena.level}
                  ref={isCurrent ? currentRef : undefined}
                  className="relative"
                >
                  {/* Connector node on spine */}
                  <div
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 top-6 z-10",
                      "h-5 w-5 rounded-full border-[3px] transition-all duration-500",
                      isUnlocked
                        ? isCurrent
                          ? "border-emerald-500 bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.5)] scale-125"
                          : "border-emerald-400 bg-emerald-400"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {isCurrent && (
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                    )}
                  </div>

                  {/* Card — alternates left/right */}
                  <div
                    className={cn(
                      "flex items-start gap-0 py-4",
                      isLeft
                        ? "flex-row pr-[52%] pl-4"
                        : "flex-row-reverse pl-[52%] pr-4"
                    )}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="w-full"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedLevel(isExpanded ? null : arena.level)
                        }
                        className={cn(
                          "group relative w-full text-left rounded-2xl border-2 p-4 transition-all duration-300",
                          isCurrent
                            ? "border-emerald-400 bg-white shadow-xl shadow-emerald-100/60 ring-2 ring-emerald-200/50"
                            : isUnlocked
                              ? "border-emerald-200 bg-white hover:shadow-md hover:border-emerald-300"
                              : "border-slate-200 bg-slate-50/80 hover:bg-white hover:shadow-sm"
                        )}
                      >
                        {isCurrent && (
                          <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-sm">
                            <Sparkles className="h-2.5 w-2.5" />
                            You are here
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {/* Arena emblem */}
                            <div
                              className={cn(
                                "relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-black shadow-inner transition-transform group-hover:scale-105",
                                arena.color,
                                arena.colorTo,
                                isUnlocked ? "opacity-100" : "opacity-40"
                              )}
                            >
                              <span className="drop-shadow-sm">{arena.emoji}</span>
                              <span
                                className={cn(
                                  "absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black text-white shadow-sm",
                                  `bg-gradient-to-br ${arena.color} ${arena.colorTo}`
                                )}
                              >
                                {arena.level}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3
                                  className={cn(
                                    "text-base font-extrabold",
                                    isUnlocked
                                      ? "text-slate-900"
                                      : "text-slate-400"
                                  )}
                                >
                                  {arena.title}
                                </h3>
                                {isUnlocked && !isCurrent && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                )}
                                {!isUnlocked && (
                                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                                )}
                              </div>
                              <p
                                className={cn(
                                  "text-[12px] italic mt-0.5",
                                  isUnlocked
                                    ? "text-slate-500"
                                    : "text-slate-400"
                                )}
                              >
                                &ldquo;{arena.tagline}&rdquo;
                              </p>
                              <div className="mt-1 text-[11px] font-bold text-slate-500">
                                {fmtNumber(arena.xpFloor)} XP
                                {arena.level < 10 && (
                                  <span className="text-slate-400">
                                    {" "}
                                    → {fmtNumber(nextFloor)} XP
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 mt-1">
                            {arena.perks.length > 0 && (
                              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-amber-700">
                                <Gift className="h-2.5 w-2.5" />
                                {arena.perks.length} perk
                                {arena.perks.length !== 1 && "s"}
                              </span>
                            )}
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 text-slate-400 transition-transform duration-200",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </div>
                        </div>

                        {/* Progress bar for current arena */}
                        {isCurrent && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                              <span>{progressInArena}% through this arena</span>
                              <span>
                                {fmtNumber(level.xpInLevel)} /{" "}
                                {fmtNumber(level.xpForNext)} XP
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressInArena}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                className={cn(
                                  "h-full rounded-full bg-gradient-to-r relative",
                                  arena.color,
                                  arena.colorTo
                                )}
                              >
                                <span className="absolute inset-0 xp-shimmer rounded-full" />
                              </motion.div>
                            </div>
                          </div>
                        )}
                      </button>

                      {/* Expandable perks */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 space-y-2">
                              {arena.perks.map((perk, pi) => (
                                <PerkRow
                                  key={pi}
                                  perk={perk}
                                  unlocked={isUnlocked}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8 pb-4">
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Complete lessons, pass quizzes, post in community, and maintain your
          streak to earn XP and climb the arenas.
        </p>
      </div>
    </div>
  );
}

function PerkRow({ perk, unlocked }: { perk: LevelPerk; unlocked: boolean }) {
  const [copied, setCopied] = useState(false);

  const typeColor: Record<string, string> = {
    credits: "bg-emerald-50 border-emerald-200 text-emerald-700",
    promo: "bg-cyan-50 border-cyan-200 text-cyan-700",
    discount: "bg-violet-50 border-violet-200 text-violet-700",
    perk: "bg-amber-50 border-amber-200 text-amber-700",
  };

  function copyPromo() {
    if (!perk.promoCode) return;
    navigator.clipboard?.writeText(perk.promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasLogo = !!perk.logoUrl;
  const hasLink = !!perk.url;
  const hasPromo = !!perk.promoCode;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-all",
        unlocked
          ? "bg-white border-slate-200"
          : "bg-slate-50 border-slate-100 opacity-60"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Logo or emoji */}
        {hasLogo ? (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={perk.logoUrl}
              alt=""
              className="h-6 w-6 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) parent.textContent = perk.emoji;
              }}
            />
          </span>
        ) : (
          <span className="text-xl shrink-0">{perk.emoji}</span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-[13px] font-bold",
                unlocked ? "text-slate-900" : "text-slate-500"
              )}
            >
              {perk.label}
            </span>
            <span
              className={cn(
                "inline-flex rounded-md border px-1.5 py-0.5 text-[8px] uppercase tracking-widest font-extrabold",
                typeColor[perk.type] || typeColor.perk
              )}
            >
              {perk.type}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{perk.detail}</p>
        </div>

        {/* Status icon */}
        {unlocked ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        ) : (
          <Lock className="h-4 w-4 text-slate-300 shrink-0" />
        )}
      </div>

      {/* Promo code + link row — only when unlocked */}
      {unlocked && (hasPromo || hasLink) && (
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          {hasPromo && (
            <button
              type="button"
              onClick={copyPromo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/70 px-3 py-1.5 text-xs font-mono font-bold text-amber-800 hover:bg-amber-100 transition-colors"
              title="Copy promo code"
            >
              <span className="tracking-widest">{perk.promoCode}</span>
              {copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3 text-amber-600" />
              )}
            </button>
          )}
          {hasLink && (
            <a
              href={perk.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
            >
              Redeem
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Locked promo teaser */}
      {!unlocked && hasPromo && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
          <Lock className="h-3 w-3" />
          Promo code unlocks at this level
        </div>
      )}
    </div>
  );
}
