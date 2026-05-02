"use client";

import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { type BadgeDef, TIER_STYLE } from "@/lib/badges";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  def: BadgeDef;
  earned?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function BadgeCard({ def, earned = false, size = "md" }: BadgeCardProps) {
  const tier = TIER_STYLE[def.tier];
  const dim = size === "lg" ? "h-20 w-20 text-4xl" : size === "sm" ? "h-12 w-12 text-2xl" : "h-16 w-16 text-3xl";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "group relative flex flex-col items-center text-center gap-2 rounded-2xl border p-4 transition-all",
        earned
          ? "border-slate-200 bg-white"
          : "border-dashed border-slate-200 bg-slate-50/40"
      )}
    >
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-2xl ring-2 bg-gradient-to-br shadow-sm",
          tier.ring,
          tier.bg,
          dim,
          !earned && "grayscale opacity-60"
        )}
      >
        <span className="select-none">{def.emoji}</span>
        {!earned && (
          <span className="absolute -bottom-1.5 -right-1.5 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 p-1 shadow">
            <Lock className="h-3 w-3 text-slate-500" />
          </span>
        )}
      </div>
      <div>
        <div className={cn("text-sm font-bold", earned ? "text-slate-900" : "text-slate-500")}>
          {def.name}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500">
          {earned ? def.description : def.hint}
        </div>
      </div>
      <div className={cn("mt-1 text-[10px] uppercase tracking-widest font-bold rounded-md px-1.5 py-0.5 border", tier.chip)}>
        {def.tier}
      </div>
    </motion.div>
  );
}
