"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Trophy,
  Flame,
  BookOpen,
  Users,
  Award,
  Play,
  Video,
  Bot,
  Target,
  Zap,
  Timer,
  Music,
  Briefcase,
  Calendar,
  BarChart3,
  StickyNote,
  ArrowRight,
  CheckCircle2,
  Crown,
  GraduationCap,
  Star,
  Lock,
  Shield,
  ChevronRight,
  ExternalLink,
  Headphones,
  MessageCircle,
  FileText,
  Layers,
  Globe,
  Rocket,
  Heart,
  TrendingUp,
} from "lucide-react";

const ZAPTICK_URL = process.env.NEXT_PUBLIC_ZAPTICK_URL || "https://zaptick.io";

const PARTNERS = [
  { name: "AI Fiesta", domain: "aifiesta.ai", tagline: "All premium AIs · one chat" },
  { name: "Internet Lifestyle Hub", domain: "internetlifestylehub.com", tagline: "Build your digital coaching biz" },
  { name: "OceanLinux", domain: "oceanlinux.com", tagline: "Premium Linux VPS hosting" },
  { name: "TagMango", domain: "tagmango.com", tagline: "Creator platform · 6,749+ creators" },
  { name: "Makers3D", domain: "makers3d.in", tagline: "3D printing & prototyping" },
  { name: "Jio", domain: "jio.com", tagline: "India's largest digital ecosystem" },
  { name: "BumbleDry", domain: "bumbledry.com", tagline: "On-demand laundry · DTC ops" },
  { name: "Nyrah Beauty", domain: "nyrahbeauty.com", tagline: "Irish skincare · 80,000+ buyers" },
  { name: "Daily.ai", domain: "daily.ai", tagline: "AI newsletters · 40-60% open rate" },
];

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: Video,
    title: "40+ Video Lessons",
    description: "8-week structured curriculum with professional video content across 4 phases",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "Premium Playbooks",
    description: "Battle-tested written guides with rich formatting, checklists, and step-by-step walkthroughs",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Zap,
    title: "Quiz Engine",
    description: "Test your knowledge after every lesson with scored quizzes and instant feedback",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Bot,
    title: "AI Study Buddy",
    description: "GPT-4 powered tutor that understands your current lesson context and answers questions instantly",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Timer,
    title: "Pomodoro Focus Timer",
    description: "Built-in focus timer with session tracking to keep you in deep work mode",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Headphones,
    title: "Spotify Integration",
    description: "Floating music player with curated focus playlists or connect your own Spotify",
    color: "from-green-500 to-emerald-600",
    customIcon: true,
  },
  {
    icon: Trophy,
    title: "XP & Levels",
    description: "Earn XP for everything you do — watch, quiz, comment, post. Level up through 10 arenas",
    color: "from-amber-400 to-yellow-600",
  },
  {
    icon: Flame,
    title: "Daily Streaks",
    description: "Login every day to maintain your streak. Consistency builds champions",
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Award,
    title: "Badges & Achievements",
    description: "Unlock badges for milestones — from Inbox Operator to Certified AI Agency Owner",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: BarChart3,
    title: "Live Leaderboard",
    description: "Compete with fellow learners. Top the leaderboard and win real prizes",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Target,
    title: "Daily Challenges",
    description: "5 rotating challenges every day across learning, social, and productivity categories",
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    icon: Star,
    title: "Level Rewards",
    description: "Earn free AI credits, wallet top-ups, and exclusive partner promo codes as you level up",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: Users,
    title: "Community Feed",
    description: "Post wins, share frameworks, comment on others' posts, and build your network",
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: Heart,
    title: "Follow System",
    description: "Follow other learners, get AI-powered profile suggestions based on your industry",
    color: "from-rose-500 to-red-600",
  },
  {
    icon: MessageCircle,
    title: "Discussion Threads",
    description: "Comment on every lesson. Learn from others, share insights, earn XP",
    color: "from-indigo-500 to-violet-600",
  },
  {
    icon: Globe,
    title: "Member Profiles",
    description: "Customize your profile with cover images, bio, social links, showcase, and pinned posts",
    color: "from-teal-500 to-cyan-600",
  },
  {
    icon: Calendar,
    title: "Campaign Calendar",
    description: "Plan your marketing campaigns with a visual monthly calendar. Color-coded by channel",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Layers,
    title: "Content Planner",
    description: "Kanban board for content lifecycle — from ideas to published. Drag-and-drop cards",
    color: "from-violet-500 to-fuchsia-600",
  },
  {
    icon: Briefcase,
    title: "Task Board",
    description: "Organize your work with categories, priorities, due dates, and status tracking",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: StickyNote,
    title: "Workspace Notes",
    description: "Auto-saving notes editor for brainstorming and planning. Your ideas, always synced",
    color: "from-amber-500 to-yellow-600",
  },
  {
    icon: Lock,
    title: "Exclusive Access",
    description: "Founder calls, networking lounge, client workshops, mentorship, and co-marketing opportunities",
    color: "from-slate-600 to-slate-800",
  },
  {
    icon: GraduationCap,
    title: "Certification",
    description: "Graduate with a digital certificate co-presented with Meta. Share it everywhere",
    color: "from-emerald-600 to-teal-700",
  },
  {
    icon: TrendingUp,
    title: "Shareable Progress",
    description: "Generate beautiful progress cards with your stats and share them on social media",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Shield,
    title: "Reach Out System",
    description: "Request contact info from other members. Mutual acceptance reveals details privately",
    color: "from-emerald-500 to-emerald-700",
  },
];

const STATS = [
  { value: "40+", label: "Video Lessons" },
  { value: "40", label: "Premium Playbooks" },
  { value: "10", label: "Level Arenas" },
  { value: "24+", label: "Platform Features" },
  { value: "12", label: "Badges to Earn" },
  { value: "₹1L", label: "Showdown Prize" },
];

const CURRICULUM_PHASES = [
  {
    phase: "Foundation",
    weeks: "Week 0–2",
    color: "from-violet-500 to-fuchsia-500",
    modules: ["Onboarding & Mindset", "Inbox & Conversations", "Templates That Get Approved"],
  },
  {
    phase: "Build",
    weeks: "Week 3–4",
    color: "from-emerald-500 to-teal-500",
    modules: ["Workflow Automation", "AI Agents & Voice AI"],
  },
  {
    phase: "Scale",
    weeks: "Week 5–6",
    color: "from-amber-500 to-orange-500",
    modules: ["Campaigns & Broadcasts", "WhatsApp Pay + Commerce"],
  },
  {
    phase: "Launch",
    weeks: "Week 7–8",
    color: "from-rose-500 to-pink-500",
    modules: ["Webinars & Creator Stack", "Sales, Pricing, Demo Day"],
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#030a07] text-white overflow-hidden">
      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#030a07]/90 backdrop-blur-xl border-b border-white/5 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/zapzap.png" alt="Zaptick" width={120} height={38} priority className="h-7 w-auto" />
            <span className="inline-flex items-center rounded-md bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest">
              Academy
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-white/60 hover:text-white font-semibold transition-colors">Features</a>
            <a href="#curriculum" className="text-sm text-white/60 hover:text-white font-semibold transition-colors">Curriculum</a>
            <a href="#partners" className="text-sm text-white/60 hover:text-white font-semibold transition-colors">Partners</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <a
              href={`${ZAPTICK_URL}/signup`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-400 hover:to-emerald-600 transition-all"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-5 sm:px-8">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-600/15 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Cohort #001 · Live now
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
            The gamified academy{" "}
            <br className="hidden sm:block" />
            that turns you into a{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              marketing machine.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            40+ video lessons. Premium playbooks. AI tutor. Daily challenges.
            Live leaderboard. Spotify integration. Marketing workspace.
            <span className="text-white/80 font-semibold"> All in one platform.</span>
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 text-base font-bold text-white shadow-xl shadow-emerald-600/25 hover:from-emerald-400 hover:to-emerald-600 hover:shadow-emerald-600/40 transition-all hover:scale-[1.02]"
            >
              <Play className="h-4 w-4" />
              Start learning
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-white/5 border border-white/10 text-base font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all"
            >
              Explore features
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-white/40 font-bold">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Included with Growth plans
            </span>
            <span className="hidden sm:inline w-px h-3 bg-white/10" />
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              No extra cost
            </span>
            <span className="hidden sm:inline w-px h-3 bg-white/10" />
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Co-presented with Meta
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative py-12 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 sm:gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{s.value}</div>
                <div className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative py-20 sm:py-32 px-5 sm:px-8">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-600/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-violet-600/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">
                24+ Platform Features
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Everything you need.{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Nothing you don't.
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/40 max-w-2xl mx-auto">
              From video lessons and AI tutoring to marketing workspaces and Spotify — ZapAcademy is the most feature-rich learning platform for marketers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} mb-4 shadow-lg`}>
                  {f.customIcon ? (
                    <SpotifyIcon className="h-5 w-5 text-white" />
                  ) : (
                    <f.icon className="h-5 w-5 text-white" />
                  )}
                </div>
                <h3 className="text-sm font-black text-white mb-1.5 group-hover:text-emerald-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curriculum ── */}
      <section id="curriculum" className="relative py-20 sm:py-32 px-5 sm:px-8 border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-600/8 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
              <BookOpen className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                8-Week Curriculum
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              From zero to{" "}
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                certified.
              </span>
            </h2>
            <p className="mt-4 text-base text-white/40 max-w-xl mx-auto">
              4 phases. 9 modules. 40+ lessons. Real deliverables every week.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {CURRICULUM_PHASES.map((phase) => (
              <div
                key={phase.phase}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 hover:border-emerald-500/20 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${phase.color} text-[10px] font-black text-white uppercase tracking-widest`}>
                    {phase.phase}
                  </div>
                  <span className="text-xs font-bold text-white/30">{phase.weeks}</span>
                </div>
                <div className="space-y-2.5">
                  {phase.modules.map((mod) => (
                    <div key={mod} className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-sm text-white/70 font-semibold">{mod}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gamification showcase ── */}
      <section className="relative py-20 sm:py-32 px-5 sm:px-8 border-t border-white/5">
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-5">
              <Trophy className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">
                Gamification Engine
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Learn. Compete.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Earn real rewards.
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {/* XP & Levels */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-900/50 to-emerald-950/50 border border-emerald-500/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">10 Level Arenas</h3>
                  <p className="text-xs text-emerald-400/70 font-bold">Clash Royale-style progression</p>
                </div>
              </div>
              <div className="space-y-2">
                {["Apprentice", "Hustler", "Strategist", "Legendary Operator"].map((level, i) => (
                  <div key={level} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-[9px] font-black text-white flex items-center justify-center">
                        {[1, 4, 7, 10][i]}
                      </span>
                      <span className="text-xs font-bold text-white/80">{level}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400/60 font-bold">
                      {["100 XP", "1,500 XP", "6,000 XP", "20,000 XP"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-900/30 to-amber-950/30 border border-amber-500/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Real Rewards</h3>
                  <p className="text-xs text-amber-400/70 font-bold">Credited to your Zaptick wallet</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { icon: "🤖", label: "AI Credits", desc: "Free AI credits every level" },
                  { icon: "💰", label: "Wallet Credits", desc: "Auto-credited to your wallet" },
                  { icon: "🎫", label: "Partner Promos", desc: "AiFiesta, OceanLinux, Makers3D" },
                  { icon: "🏆", label: "₹1L Prize", desc: "Showdown cash prize pool" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
                    <span className="text-lg">{r.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white/80">{r.label}</div>
                      <div className="text-[10px] text-white/40">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streaks & Badges */}
            <div className="rounded-2xl bg-gradient-to-br from-rose-900/30 to-rose-950/30 border border-rose-500/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Streaks & Badges</h3>
                  <p className="text-xs text-rose-400/70 font-bold">Consistency builds champions</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["🔥 7d", "🔥 14d", "🔥 30d", "🔥 60d", "🔥 90d", "🔥 365d"].map((s) => (
                  <div key={s} className="text-center rounded-lg bg-white/5 py-2">
                    <div className="text-xs font-black text-white/70">{s}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Inbox Op", "AI Architect", "Commerce Op", "Funnel Arch", "Streak Master", "Community Hero"].map((b) => (
                  <span key={b} className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-300/80">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workspace showcase ── */}
      <section className="relative py-20 sm:py-32 px-5 sm:px-8 border-t border-white/5">
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[400px] bg-violet-600/8 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-5">
              <Briefcase className="h-3 w-3 text-violet-400" />
              <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">
                Marketing Workspace
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Plan. Create.{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Execute.
              </span>
            </h2>
            <p className="mt-4 text-base text-white/40 max-w-2xl mx-auto">
              A full marketing workspace built right into the academy. Campaign calendars, content planners, task boards, and notes — everything you need to go from learning to doing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Calendar, title: "Campaign Calendar", desc: "Visual monthly calendar for marketing campaigns. Color-coded by channel.", color: "from-emerald-500 to-teal-600" },
              { icon: Layers, title: "Content Planner", desc: "Kanban board with drag-and-drop. Ideas → Drafts → Published.", color: "from-violet-500 to-purple-600" },
              { icon: Target, title: "Task Board", desc: "Filterable todos with categories, priorities, and due dates.", color: "from-blue-500 to-cyan-600" },
              { icon: StickyNote, title: "Notes", desc: "Auto-saving editor for brainstorming and planning.", color: "from-amber-500 to-orange-600" },
            ].map((w) => (
              <div key={w.title} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-violet-500/20 transition-all">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${w.color} mb-3`}>
                  <w.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-black text-white mb-1">{w.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Spotify + Focus ── */}
      <section className="relative py-20 sm:py-28 px-5 sm:px-8 border-t border-white/5">
        <div className="relative max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/20 mb-5">
                <SpotifyIcon className="h-3 w-3 text-[#1DB954]" />
                <span className="text-[10px] font-black text-[#1DB954] uppercase tracking-[0.2em]">
                  Focus Mode
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Study with{" "}
                <span className="text-[#1DB954]">Spotify.</span>
                <br />
                Focus with{" "}
                <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Pomodoro.</span>
              </h2>
              <p className="mt-4 text-base text-white/40 leading-relaxed">
                A floating Spotify player with curated focus playlists — or paste any Spotify link. Combined with a built-in Pomodoro timer to keep you in deep work mode. The topbar shows what's playing.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Lo-Fi Focus", "Deep Focus", "Peaceful Piano", "Chill Beats", "Brain Food", "Coding Mode"].map((p) => (
                  <span key={p} className="px-2.5 py-1 rounded-lg bg-[#282828] text-[10px] font-bold text-[#b3b3b3] border border-[#333]">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#1DB954]/10 to-rose-500/5 blur-3xl rounded-3xl pointer-events-none" />
              <div className="relative space-y-4">
                {/* Spotify widget preview */}
                <div className="rounded-2xl bg-[#121212] border border-[#282828] p-4 shadow-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <SpotifyIcon className="h-5 w-5 text-[#1DB954]" />
                    <span className="text-xs font-bold text-white">Study Music</span>
                    <span className="relative ml-auto inline-flex h-1.5 w-1.5">
                      <span className="absolute inset-0 rounded-full bg-[#1DB954] animate-ping opacity-50" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1DB954]" />
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["Lo-Fi Focus", "Deep Focus", "Brain Food"].map((p) => (
                      <div key={p} className="rounded-lg bg-[#282828] px-2.5 py-1.5 text-[10px] font-bold text-[#b3b3b3] text-center">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pomodoro widget preview */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Timer className="h-4 w-4 text-rose-400" />
                    <span className="text-xs font-bold text-white">Pomodoro Timer</span>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-white tabular-nums tracking-wider">25:00</div>
                    <div className="text-[10px] text-white/40 font-bold mt-1">Session 1 · Ready to focus</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section id="partners" className="relative py-20 sm:py-32 px-5 sm:px-8 border-t border-white/5">
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-emerald-500/8 border border-amber-500/20 mb-5">
              <Crown className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-[0.2em]">
                Exclusive Partner Network
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Backed by India's most{" "}
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                ambitious operators.
              </span>
            </h2>
            <p className="mt-4 text-base text-white/40 max-w-2xl mx-auto">
              Exclusive perks, warm intros, and direct lines into every brand in our network. Available to enrolled members.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 text-center hover:border-amber-500/20 hover:bg-white/[0.06] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 shadow-md overflow-hidden">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=128`}
                    alt={p.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xs font-black text-white">{p.name}</h3>
                <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{p.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-20 sm:py-32 px-5 sm:px-8 border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-600/15 blur-[150px] rounded-full" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Rocket className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
              Start Today
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Ready to become a{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              marketing machine?
            </span>
          </h2>

          <p className="mt-5 text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
            ZapAcademy is included free with your Zaptick Growth plan. No extra cost. No limits. Just pure learning power.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 h-13 px-10 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 text-lg font-bold text-white shadow-xl shadow-emerald-600/25 hover:from-emerald-400 hover:to-emerald-600 hover:shadow-emerald-600/40 transition-all hover:scale-[1.02]"
            >
              Sign in & start learning
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <p className="mt-6 text-xs text-white/30">
            New to Zaptick?{" "}
            <a
              href={`${ZAPTICK_URL}/signup`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 decoration-emerald-400/30"
            >
              Create your free account
            </a>{" "}
            on the main platform, then upgrade to a Growth plan.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/zapzap.png" alt="Zaptick" width={80} height={25} className="h-5 w-auto opacity-50" />
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              Academy
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-white/30 font-semibold">
            <a href={ZAPTICK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors inline-flex items-center gap-1">
              Zaptick <ExternalLink className="h-3 w-3" />
            </a>
            <a href={`${ZAPTICK_URL}/zapacademy`} target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
              Plans & Pricing
            </a>
            <a href={`${ZAPTICK_URL}/zapacademy/showdown`} target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
              Showdown
            </a>
          </div>
          <p className="text-[10px] text-white/15 font-bold">
            © {new Date().getFullYear()} Zaptick · Co-presented with Meta
          </p>
        </div>
      </footer>
    </div>
  );
}
