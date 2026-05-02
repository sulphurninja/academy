/**
 * XP / level economy for ZapAcademy.
 *
 * Levels are progressive: each level requires more XP than the last.
 * Curve: thresholds = base * (level-1)^1.4 (rounded to nearest 50)
 * The result feels rewarding early, then steepens.
 */

export interface LevelInfo {
  level: number;
  title: string;
  xpAtFloor: number;
  xpForNext: number;
  xpInLevel: number;
  progress: number; // 0..1
}

/**
 * Refined ladder — premium, ambitious labels (no "Operator").
 * Mirrors the way Zaptick talks about its customers: builders who own outcomes.
 */
export const LEVEL_TITLES: Record<number, string> = {
  1: "Apprentice",
  2: "Builder",
  3: "Strategist",
  4: "Architect",
  5: "Specialist",
  6: "Champion",
  7: "Maven",
  8: "Master",
  9: "Luminary",
  10: "Founder",
};

function xpRequired(level: number): number {
  if (level <= 1) return 0;
  const raw = 250 * Math.pow(level - 1, 1.4);
  return Math.round(raw / 50) * 50;
}

/** XP needed to *reach* this level (cumulative). */
export function xpFloorForLevel(level: number): number {
  let total = 0;
  for (let i = 2; i <= level; i++) total += xpRequired(i);
  return total;
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  while (xp >= xpFloorForLevel(level + 1) && level < 99) level += 1;
  const xpAtFloor = xpFloorForLevel(level);
  const xpForNext = xpFloorForLevel(level + 1) - xpAtFloor;
  const xpInLevel = xp - xpAtFloor;
  return {
    level,
    title: LEVEL_TITLES[Math.min(level, 10)] || "Founder",
    xpAtFloor,
    xpForNext,
    xpInLevel,
    progress: xpForNext === 0 ? 1 : Math.min(1, xpInLevel / xpForNext),
  };
}

/** Standard XP rewards — single source of truth. */
export const XP_REWARDS = {
  videoComplete: 50,
  quizPassFirstTry: 200,
  quizPass: 100,
  perfectQuiz: 250,
  weekComplete: 500,
  dailyLogin: 25,
  streak7: 350,
  streak30: 1500,
  comment: 10,
  postPublished: 20,
  postLiked: 5,
  helpful: 25,
  challengeSolved: 400,
  cohortFinished: 2500,
  followed: 5,
} as const;

export type XpEventKind = keyof typeof XP_REWARDS | "custom";

/* ------------------------------------------------------------------ */
/*  Level perks — unlockable rewards for each arena                   */
/* ------------------------------------------------------------------ */

export interface LevelPerk {
  emoji: string;
  label: string;
  detail: string;
  type: "credits" | "promo" | "discount" | "perk";
  /** External link (affiliate / partner page). */
  url?: string;
  /** Partner logo URL (favicon or hosted image). */
  logoUrl?: string;
  /** Promo code — only revealed when the level is unlocked. */
  promoCode?: string;
}

export interface ArenaLevel {
  level: number;
  title: string;
  xpFloor: number;
  color: string;         // tailwind gradient from
  colorTo: string;       // tailwind gradient to
  ring: string;          // ring color
  emoji: string;
  tagline: string;
  perks: LevelPerk[];
}

/* Partner constants */
const MAKERS3D_URL = "https://makers3d.in/products/69c40e5e027bfc54c4976802";
const MAKERS3D_LOGO = "https://makers3d.in/favicon.ico";
const OCEAN_URL = "https://oceanlinux.com/login";
const OCEAN_LOGO = "https://oceanlinux.com/favicon.ico";
const OCEAN_PROMO = "TOPUPBOOST";
const AIFIESTA_URL = "https://masterclass.aifiesta.ai/?dub_id=YvMEQkIGsYKId4WP";
const AIFIESTA_LOGO = "https://masterclass.aifiesta.ai/favicon.ico";
const ILH_URL = "https://internetlifestylehub.com";
const ILH_LOGO = "https://internetlifestylehub.com/favicon.ico";

/**
 * Credit amounts per level. These get auto-deposited into the user's
 * Zaptick wallet + AI-credit balance when they first reach a level.
 * Keep amounts conservative — they stack across levels.
 */
export const LEVEL_CREDIT_REWARDS: Record<number, { ai: number; wallet: number }> = {
  1: { ai: 0,  wallet: 0 },
  2: { ai: 5,  wallet: 0 },
  3: { ai: 10, wallet: 10 },
  4: { ai: 15, wallet: 15 },
  5: { ai: 20, wallet: 25 },
  6: { ai: 25, wallet: 35 },
  7: { ai: 30, wallet: 50 },
  8: { ai: 40, wallet: 60 },
  9: { ai: 50, wallet: 75 },
  10: { ai: 75, wallet: 100 },
};

export const ARENA_LEVELS: ArenaLevel[] = [
  {
    level: 1,
    title: "Apprentice",
    xpFloor: xpFloorForLevel(1),
    color: "from-slate-400",
    colorTo: "to-slate-500",
    ring: "ring-slate-300",
    emoji: "🌱",
    tagline: "Every journey starts with a single step",
    perks: [
      { emoji: "🎓", label: "Academy access", detail: "Full curriculum & community", type: "perk" },
      { emoji: "💬", label: "Community feed", detail: "Post, comment, and network", type: "perk" },
    ],
  },
  {
    level: 2,
    title: "Builder",
    xpFloor: xpFloorForLevel(2),
    color: "from-emerald-400",
    colorTo: "to-emerald-600",
    ring: "ring-emerald-300",
    emoji: "🔨",
    tagline: "Foundations laid — keep stacking",
    perks: [
      { emoji: "🤖", label: "5 AI credits", detail: "Auto-credited to your Zaptick wallet", type: "credits" },
      { emoji: "🖥️", label: "OceanLinux — ₹100 off", detail: "₹100 off across all orders on OceanLinux hosting", type: "promo", url: OCEAN_URL, logoUrl: OCEAN_LOGO, promoCode: OCEAN_PROMO },
      { emoji: "🏷️", label: "Makers3D — 10% off", detail: "10% off 3D printing & prototyping", type: "promo", url: MAKERS3D_URL, logoUrl: MAKERS3D_LOGO },
    ],
  },
  {
    level: 3,
    title: "Strategist",
    xpFloor: xpFloorForLevel(3),
    color: "from-cyan-400",
    colorTo: "to-cyan-600",
    ring: "ring-cyan-300",
    emoji: "🧠",
    tagline: "Now you're thinking in systems",
    perks: [
      { emoji: "🤖", label: "10 AI credits", detail: "Auto-credited to your Zaptick wallet", type: "credits" },
      { emoji: "💰", label: "₹10 wallet credits", detail: "Auto-deposited into your Zaptick wallet", type: "credits" },
      { emoji: "🏷️", label: "Makers3D — 20% off", detail: "20% off 3D printing & prototyping", type: "promo", url: MAKERS3D_URL, logoUrl: MAKERS3D_LOGO },
    ],
  },
  {
    level: 4,
    title: "Architect",
    xpFloor: xpFloorForLevel(4),
    color: "from-blue-400",
    colorTo: "to-blue-600",
    ring: "ring-blue-300",
    emoji: "📐",
    tagline: "Blueprints & precision execution",
    perks: [
      { emoji: "🤖", label: "15 AI credits", detail: "Auto-credited to your Zaptick wallet", type: "credits" },
      { emoji: "💰", label: "₹15 wallet credits", detail: "Auto-deposited into your Zaptick wallet", type: "credits" },
      { emoji: "🏷️", label: "Makers3D — 35% off", detail: "Premium prototyping discount", type: "promo", url: MAKERS3D_URL, logoUrl: MAKERS3D_LOGO },
    ],
  },
  {
    level: 5,
    title: "Specialist",
    xpFloor: xpFloorForLevel(5),
    color: "from-violet-400",
    colorTo: "to-violet-600",
    ring: "ring-violet-300",
    emoji: "⚡",
    tagline: "Deep expertise unlocked",
    perks: [
      { emoji: "🤖", label: "20 AI credits", detail: "Auto-credited to your Zaptick wallet", type: "credits" },
      { emoji: "💰", label: "₹25 wallet credits", detail: "Auto-deposited into your Zaptick wallet", type: "credits" },
      { emoji: "🏷️", label: "Makers3D — 49% off", detail: "Almost half off at Makers3D", type: "promo", url: MAKERS3D_URL, logoUrl: MAKERS3D_LOGO },
    ],
  },
  {
    level: 6,
    title: "Champion",
    xpFloor: xpFloorForLevel(6),
    color: "from-amber-400",
    colorTo: "to-amber-600",
    ring: "ring-amber-300",
    emoji: "🏆",
    tagline: "Top 25% of the cohort",
    perks: [
      { emoji: "🤖", label: "25 AI credits", detail: "Auto-credited to your Zaptick wallet", type: "credits" },
      { emoji: "💰", label: "₹35 wallet credits", detail: "Auto-deposited into your Zaptick wallet", type: "credits" },
      { emoji: "🏷️", label: "Makers3D — 59% off", detail: "Maximum Makers3D discount unlocked", type: "promo", url: MAKERS3D_URL, logoUrl: MAKERS3D_LOGO },
    ],
  },
  {
    level: 7,
    title: "Maven",
    xpFloor: xpFloorForLevel(7),
    color: "from-rose-400",
    colorTo: "to-rose-600",
    ring: "ring-rose-300",
    emoji: "🌟",
    tagline: "Recognized expert in the cohort",
    perks: [
      { emoji: "🤖", label: "30 AI credits", detail: "Auto-credited to your Zaptick wallet", type: "credits" },
      { emoji: "💰", label: "₹50 wallet credits", detail: "Auto-deposited into your Zaptick wallet", type: "credits" },
      { emoji: "🎨", label: "AiFiesta — 10% off", detail: "Discount on AI Fiesta masterclass", type: "discount", url: AIFIESTA_URL, logoUrl: AIFIESTA_LOGO },
    ],
  },
  {
    level: 8,
    title: "Master",
    xpFloor: xpFloorForLevel(8),
    color: "from-fuchsia-500",
    colorTo: "to-fuchsia-700",
    ring: "ring-fuchsia-300",
    emoji: "👑",
    tagline: "Mastery over the craft",
    perks: [
      { emoji: "🤖", label: "40 AI credits", detail: "Auto-credited to your Zaptick wallet", type: "credits" },
      { emoji: "💰", label: "₹60 wallet credits", detail: "Auto-deposited into your Zaptick wallet", type: "credits" },
      { emoji: "🎨", label: "AiFiesta — 22% off", detail: "Premium AI Fiesta masterclass discount", type: "discount", url: AIFIESTA_URL, logoUrl: AIFIESTA_LOGO },
      { emoji: "📚", label: "Internet Lifestyle Hub — 10% off", detail: "Course discount at ILH", type: "discount", url: ILH_URL, logoUrl: ILH_LOGO },
    ],
  },
  {
    level: 9,
    title: "Luminary",
    xpFloor: xpFloorForLevel(9),
    color: "from-orange-400",
    colorTo: "to-red-600",
    ring: "ring-orange-300",
    emoji: "🔥",
    tagline: "The cohort looks up to you",
    perks: [
      { emoji: "🤖", label: "50 AI credits", detail: "Auto-credited to your Zaptick wallet", type: "credits" },
      { emoji: "💰", label: "₹75 wallet credits", detail: "Auto-deposited into your Zaptick wallet", type: "credits" },
      { emoji: "🎨", label: "AiFiesta — 33% off", detail: "Top-tier AI Fiesta masterclass discount", type: "discount", url: AIFIESTA_URL, logoUrl: AIFIESTA_LOGO },
      { emoji: "📚", label: "Internet Lifestyle Hub — 15% off", detail: "Exclusive ILH deal", type: "discount", url: ILH_URL, logoUrl: ILH_LOGO },
    ],
  },
  {
    level: 10,
    title: "Founder",
    xpFloor: xpFloorForLevel(10),
    color: "from-yellow-300",
    colorTo: "to-amber-500",
    ring: "ring-yellow-400",
    emoji: "💎",
    tagline: "Legendary status — you built this",
    perks: [
      { emoji: "🤖", label: "75 AI credits", detail: "Auto-credited to your Zaptick wallet", type: "credits" },
      { emoji: "💰", label: "₹100 wallet credits", detail: "Auto-deposited into your Zaptick wallet", type: "credits" },
      { emoji: "🎨", label: "AiFiesta — 42% off", detail: "Maximum AI Fiesta masterclass discount", type: "discount", url: AIFIESTA_URL, logoUrl: AIFIESTA_LOGO },
      { emoji: "📚", label: "Internet Lifestyle Hub — 20% off", detail: "Premium ILH access discount", type: "discount", url: ILH_URL, logoUrl: ILH_LOGO },
      { emoji: "🏅", label: "Founder badge", detail: "Permanent profile badge + priority support", type: "perk" },
    ],
  },
];
