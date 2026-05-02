/**
 * Badge catalogue. Earning is recorded in the `BadgeEarned` collection so
 * we can show a flaunt-worthy gallery on the user's profile + on socials.
 */

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "legendary";
  hint: string;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first_blood",
    name: "First Lesson",
    description: "Watched your first ZapAcademy lesson.",
    emoji: "🎬",
    tier: "bronze",
    hint: "Complete any lesson",
  },
  {
    id: "quiz_master_5",
    name: "Quiz Master · 5",
    description: "Passed 5 quizzes.",
    emoji: "🧠",
    tier: "silver",
    hint: "Pass 5 quizzes",
  },
  {
    id: "perfect_score",
    name: "Perfect Score",
    description: "Aced a quiz with 100% on first try.",
    emoji: "🎯",
    tier: "gold",
    hint: "Get 100% on any quiz first try",
  },
  {
    id: "streak_7",
    name: "On Fire",
    description: "Logged in 7 days in a row.",
    emoji: "🔥",
    tier: "silver",
    hint: "Build a 7-day streak",
  },
  {
    id: "streak_30",
    name: "Unstoppable",
    description: "Logged in 30 days in a row.",
    emoji: "⚡",
    tier: "gold",
    hint: "Build a 30-day streak",
  },
  {
    id: "week_finisher",
    name: "Week Finisher",
    description: "Completed all lessons in a week.",
    emoji: "🏁",
    tier: "silver",
    hint: "Finish every lesson in any week",
  },
  {
    id: "cohort_champion",
    name: "Cohort Champion",
    description: "Top 3 on the cohort leaderboard.",
    emoji: "🏆",
    tier: "platinum",
    hint: "Land in the top 3 of any cohort",
  },
  {
    id: "showdown_winner",
    name: "Showdown Winner",
    description: "Won a Zaptick Showdown cash prize.",
    emoji: "💎",
    tier: "legendary",
    hint: "Win the Zaptick Showdown",
  },
  {
    id: "agency_builder",
    name: "Agency Builder",
    description: "Closed your first paying client.",
    emoji: "🤝",
    tier: "gold",
    hint: "Mark your first signed client",
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Followed 10 cohort members.",
    emoji: "🦋",
    tier: "bronze",
    hint: "Follow 10 members",
  },
  {
    id: "thought_leader",
    name: "Thought Leader",
    description: "Posted 5 community posts that earned 10+ likes.",
    emoji: "💭",
    tier: "gold",
    hint: "Publish 5 well-liked posts",
  },
  {
    id: "graduated",
    name: "Graduated",
    description: "Completed all 8 weeks. Certified AI Marketing Specialist.",
    emoji: "🎓",
    tier: "platinum",
    hint: "Finish the full curriculum",
  },
];

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

/** Light-mode tier styles. */
export const TIER_STYLE: Record<
  BadgeDef["tier"],
  { ring: string; bg: string; text: string; chip: string }
> = {
  bronze: {
    ring: "ring-amber-300/40",
    bg: "from-amber-50 to-orange-50",
    text: "text-amber-700",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
  },
  silver: {
    ring: "ring-slate-300/50",
    bg: "from-slate-50 to-white",
    text: "text-slate-700",
    chip: "bg-slate-50 text-slate-700 border-slate-200",
  },
  gold: {
    ring: "ring-amber-400/50",
    bg: "from-amber-100/60 to-amber-50",
    text: "text-amber-700",
    chip: "bg-amber-100 text-amber-800 border-amber-300",
  },
  platinum: {
    ring: "ring-emerald-300/60",
    bg: "from-emerald-50 to-cyan-50",
    text: "text-emerald-700",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  legendary: {
    ring: "ring-fuchsia-300/60",
    bg: "from-fuchsia-50 to-amber-50",
    text: "text-fuchsia-700",
    chip: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
};
