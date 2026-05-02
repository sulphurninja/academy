/**
 * 8-week curriculum — same shape and order as on the marketing site
 * (zaptick.io/zapacademy). Lesson video URLs and quiz payloads are
 * loaded from the `lessons` MongoDB collection, which the admin panel
 * populates. The structure here is the *spine* — admins fill in flesh.
 */

export interface CurriculumLessonStub {
  /** Stable slug used in URLs and as the natural key on the Lesson collection. */
  slug: string;
  title: string;
  /** ~3-min summary of what the lesson covers. */
  summary: string;
  /**
   * Optional interactive challenge type. When set, the lesson page renders the
   * matching panel after the video. Phase 2 wires these up to real Zaptick
   * surfaces (workflow builder, broadcast composer, …).
   */
  challenge?: ChallengeKind;
  /** XP awarded for finishing the video (independent of quiz). */
  xpVideo?: number;
}

export type ChallengeKind =
  | "workflow_builder"
  | "template_compose"
  | "broadcast_segment"
  | "ai_agent_brief"
  | "icp_canvas"
  | "ad_brief"
  | "pricing_simulator"
  | "pitch_recorder";

export interface CurriculumWeek {
  weekIndex: number;
  slug: string;
  /** Short label like "WK 0". */
  label: string;
  /** Display title. */
  title: string;
  /** One-liner outcome for the week. */
  outcome: string;
  /** Approx hours to complete. */
  hours: number;
  /** Phase tier — used for color-coding. */
  phase: "foundation" | "build" | "launch" | "demo" | "monetize" | "scale";
  /** Lesson stubs in suggested order. */
  lessons: CurriculumLessonStub[];
}

export const CURRICULUM: CurriculumWeek[] = [
  {
    weekIndex: 0,
    slug: "wk0-onboarding",
    label: "WK 0",
    title: "Onboarding & ICP lock-in",
    outcome: "Workspace live · WABA connected · 3 ICPs documented",
    hours: 4,
    phase: "foundation",
    lessons: [
      {
        slug: "welcome-to-zapacademy",
        title: "Welcome to ZapAcademy",
        summary: "Why we built this, how the 8 weeks work, how to win the Showdown.",
      },
      {
        slug: "connect-your-waba",
        title: "Connect your WABA",
        summary: "Hook up Meta Business + WhatsApp Business API in under 10 minutes.",
      },
      {
        slug: "icp-canvas",
        title: "Your ICP, in one canvas",
        summary: "The exact 1-page ICP doc the Top 100 Showdown cohorts shipped.",
        challenge: "icp_canvas",
      },
      {
        slug: "set-up-team-inbox",
        title: "Configure your team inbox",
        summary: "Routing, agents, SLAs, working hours. Sub-2-min reply baseline.",
      },
      {
        slug: "founder-call-rituals",
        title: "Founder call rituals",
        summary: "How weekly founder calls work, what to bring, how to extract maximum value.",
      },
    ],
  },
  {
    weekIndex: 1,
    slug: "wk1-conversations",
    label: "WK 1",
    title: "Inbox + conversations on autopilot",
    outcome: "Templates approved · auto-routing live · sub-2-min reply time",
    hours: 6,
    phase: "build",
    lessons: [
      {
        slug: "templates-101",
        title: "Templates 101 — what gets approved",
        summary: "The 8 patterns Meta loves and the 4 it kills. Live walkthrough of approval.",
      },
      {
        slug: "compose-utility-template",
        title: "Compose your first utility template",
        summary: "Variables, buttons, footers, headers — every knob explained.",
        challenge: "template_compose",
      },
      {
        slug: "auto-routing-rules",
        title: "Auto-routing rules",
        summary: "Tag-based assignment, round-robin, business hours fallbacks.",
      },
      {
        slug: "saved-replies-canned",
        title: "Saved replies & canned scripts",
        summary: "Build a library every agent can use to never type the same line twice.",
      },
      {
        slug: "voice-notes-stickers",
        title: "Voice notes & stickers — the 3× engagement unlock",
        summary: "How to use rich media inside conversations to 3× engagement.",
      },
    ],
  },
  {
    weekIndex: 2,
    slug: "wk2-workflows",
    label: "WK 2",
    title: "Workflows + AI agents shipped",
    outcome: "9 workflows running · 3 AI agents deployed · 80% deflection",
    hours: 8,
    phase: "build",
    lessons: [
      {
        slug: "workflow-builder-fundamentals",
        title: "Workflow builder fundamentals",
        summary: "Triggers, actions, branching, delays, error handling.",
      },
      {
        slug: "build-your-first-workflow",
        title: "Build your first workflow — abandoned-cart recovery",
        summary: "Live build inside Zaptick's actual workflow canvas. Ship it.",
        challenge: "workflow_builder",
      },
      {
        slug: "ai-agents-fundamentals",
        title: "AI agents — when to use, when not to",
        summary: "Routing AI vs. orchestrating AI vs. answering AI. Pick the right shape.",
      },
      {
        slug: "deploy-faq-agent",
        title: "Deploy a 24/7 FAQ agent",
        summary: "From knowledge base → embeddings → agent live in 20 minutes.",
        challenge: "ai_agent_brief",
      },
      {
        slug: "measure-deflection",
        title: "Measure deflection & escalations",
        summary: "The 4 numbers that prove your bot is paying for itself.",
      },
    ],
  },
  {
    weekIndex: 3,
    slug: "wk3-campaigns",
    label: "WK 3",
    title: "Campaigns + landing pages",
    outcome: "30 templates · live broadcasts · 1 webinar booked",
    hours: 6,
    phase: "launch",
    lessons: [
      {
        slug: "broadcast-strategy",
        title: "Broadcast strategy — what actually works",
        summary: "Frequency caps, segments, send times, the 'one-message rule'.",
      },
      {
        slug: "build-broadcast-segment",
        title: "Build a broadcast segment",
        summary: "Use contact properties + behavior to ship a high-intent list.",
        challenge: "broadcast_segment",
      },
      {
        slug: "landing-pages-that-convert",
        title: "Landing pages that convert (CTWA)",
        summary: "Click-to-WhatsApp ads + pages that turn ad clicks into conversations.",
        challenge: "ad_brief",
      },
      {
        slug: "webinar-funnel",
        title: "The webinar funnel",
        summary: "Pre-show, show, replay — the 3 windows that drive 70% of conversions.",
      },
      {
        slug: "report-on-campaigns",
        title: "Report on campaigns like a CMO",
        summary: "What to share with stakeholders. The 3 numbers that matter.",
      },
    ],
  },
  {
    weekIndex: 4,
    slug: "wk4-demo-day",
    label: "WK 4",
    title: "Demo Day · pitch the agency",
    outcome: "Top 10 pitch live · winners co-marketed · ₹1.75L cash split",
    hours: 5,
    phase: "demo",
    lessons: [
      {
        slug: "pitch-deck-the-zaptick-way",
        title: "Pitch deck the Zaptick way",
        summary: "11 slides, 7 minutes, 1 ask. The exact template winners use.",
      },
      {
        slug: "record-your-pitch",
        title: "Record your 5-min pitch",
        summary: "Submission spec, scoring rubric, what reviewers look for.",
        challenge: "pitch_recorder",
      },
      {
        slug: "demo-day-live",
        title: "Demo Day — live stage",
        summary: "How the live judging works, who's on the panel, what to bring.",
      },
      {
        slug: "after-demo-day",
        title: "After Demo Day — winners & non-winners",
        summary: "Whether you place or not — the playbook to capitalize on the moment.",
      },
    ],
  },
  {
    weekIndex: 5,
    slug: "wk5-pricing",
    label: "WK 5",
    title: "Pricing, packaging & contracts",
    outcome: "Tiered offers built · contract template · payment links live",
    hours: 5,
    phase: "monetize",
    lessons: [
      {
        slug: "pricing-fundamentals",
        title: "Pricing fundamentals",
        summary: "Cost-plus, value-based, retainer. When to use which.",
      },
      {
        slug: "build-your-tiered-offer",
        title: "Build your tiered offer",
        summary: "Starter / Growth / Premium retainer — interactive simulator.",
        challenge: "pricing_simulator",
      },
      {
        slug: "msa-template",
        title: "MSA / SOW template (lawyer-reviewed)",
        summary: "Plug-and-play contracts that protect both sides.",
      },
      {
        slug: "payment-links",
        title: "Payment links + invoicing",
        summary: "Razorpay / Stripe setup, recurring billing, churn protection.",
      },
      {
        slug: "negotiation-101",
        title: "Negotiation 101 for new agencies",
        summary: "How to defend your rates. Proven scripts.",
      },
    ],
  },
  {
    weekIndex: 6,
    slug: "wk6-clients",
    label: "WK 6",
    title: "Sell to 3 paying clients",
    outcome: "3 retainers signed · onboarding playbook · ₹2.5L+ MRR",
    hours: 8,
    phase: "monetize",
    lessons: [
      {
        slug: "lead-machine",
        title: "The lead machine — outbound + inbound",
        summary: "How to fill your pipeline with 100 qualified prospects in 30 days.",
      },
      {
        slug: "discovery-call-script",
        title: "Discovery call script (line-by-line)",
        summary: "Open, qualify, diagnose, present, close — a script that converts.",
      },
      {
        slug: "objection-handling",
        title: "Objection handling for new agencies",
        summary: "Top 12 objections + the exact response.",
      },
      {
        slug: "client-onboarding",
        title: "Client onboarding — the first 30 days",
        summary: "How to set expectations and lock in the relationship.",
      },
      {
        slug: "case-study-engine",
        title: "Build a case-study engine",
        summary: "Capture wins, package them, use them to land the next 3 clients.",
      },
    ],
  },
  {
    weekIndex: 7,
    slug: "wk7-scale",
    label: "WK 7",
    title: "Scale & retain",
    outcome: "Reporting dashboard · referral loop · client NPS 9+",
    hours: 6,
    phase: "scale",
    lessons: [
      {
        slug: "reporting-dashboard",
        title: "Build your reporting dashboard",
        summary: "The 6 KPIs every WhatsApp agency must report monthly.",
      },
      {
        slug: "qbr-cadence",
        title: "QBRs that retain clients for 24+ months",
        summary: "Structure, prep, what to surface — by quarter.",
      },
      {
        slug: "referral-loop",
        title: "Build a referral loop",
        summary: "How to get every client to send you 2 more.",
      },
      {
        slug: "hiring-your-first-ops",
        title: "Hiring your first ops person",
        summary: "JD, comp, where to find them, how to test in week 1.",
      },
      {
        slug: "graduation-next-steps",
        title: "Graduation — your next 90 days",
        summary: "Cohort wraps. The roadmap from here to ₹1 Cr/year.",
      },
    ],
  },
];

export function findWeek(slug: string): CurriculumWeek | undefined {
  return CURRICULUM.find((w) => w.slug === slug);
}

export function findLesson(
  weekSlug: string,
  lessonSlug: string
): { week: CurriculumWeek; lesson: CurriculumLessonStub } | null {
  const week = findWeek(weekSlug);
  if (!week) return null;
  const lesson = week.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return null;
  return { week, lesson };
}

export function totalLessons(): number {
  return CURRICULUM.reduce((sum, w) => sum + w.lessons.length, 0);
}

export const PHASE_THEME: Record<
  CurriculumWeek["phase"],
  { label: string; bar: string; text: string; chip: string }
> = {
  foundation: {
    label: "Foundation",
    bar: "from-emerald-500 to-emerald-300",
    text: "text-emerald-700",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  build: {
    label: "Build",
    bar: "from-cyan-500 to-emerald-400",
    text: "text-cyan-700",
    chip: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  launch: {
    label: "Launch",
    bar: "from-violet-500 to-emerald-400",
    text: "text-violet-700",
    chip: "bg-violet-50 text-violet-700 border-violet-200",
  },
  demo: {
    label: "Demo Day",
    bar: "from-amber-400 to-amber-600",
    text: "text-amber-700",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
  },
  monetize: {
    label: "Monetize",
    bar: "from-emerald-500 to-amber-400",
    text: "text-emerald-700",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  scale: {
    label: "Scale",
    bar: "from-emerald-400 to-emerald-200",
    text: "text-emerald-700",
    chip: "bg-emerald-50/80 text-emerald-700 border-emerald-200",
  },
};
