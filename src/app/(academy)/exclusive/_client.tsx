"use client";

import { useState } from "react";
import {
  Lock,
  Phone,
  Users,
  Target,
  Send,
  UserCheck,
  Megaphone,
  Crown,
  Sparkles,
  ExternalLink,
  Star,
  Shield,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ZAPTICK_URL = process.env.NEXT_PUBLIC_ZAPTICK_URL || "https://zaptick.io";

interface ExclusiveFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tier: string;
  highlights: string[];
}

const FEATURES: ExclusiveFeature[] = [
  {
    id: "founder-calls",
    title: "Founder Strategy Calls",
    description:
      "Weekly live calls with Zaptick founders Shubhodeep & Aditya. Get direct answers, strategy reviews, and insider knowledge.",
    icon: <Phone className="h-6 w-6" />,
    tier: "Foundations",
    highlights: ["Fridays 6 PM IST", "Live Q&A", "Recording access"],
  },
  {
    id: "networking",
    title: "Networking Lounge",
    description:
      "Connect with fellow agency founders, share deals, find co-founders. Private WhatsApp cohort group + lifetime alumni network.",
    icon: <Users className="h-6 w-6" />,
    tier: "Foundations",
    highlights: ["Private cohort group", "Alumni network", "Deal sharing"],
  },
  {
    id: "client-workshop",
    title: "Client Acquisition Workshop",
    description:
      "Hands-on workshop on landing your first 3 clients. Sales scripts, pricing playbooks, 2 office hours + 1:1 instructor reviews.",
    icon: <Target className="h-6 w-6" />,
    tier: "Agency Founder",
    highlights: ["Sales scripts", "Pricing playbooks", "1:1 reviews"],
  },
  {
    id: "lead-routing",
    title: "Inbound Lead Routing",
    description:
      "Top performers get listed on Zaptick's partner directory and receive inbound leads routed from Zaptick's own pipeline.",
    icon: <Send className="h-6 w-6" />,
    tier: "Agency Founder",
    highlights: ["Listed on /partners", "Inbound leads", "Zaptick pipeline"],
  },
  {
    id: "mentorship",
    title: "1:1 Mentorship",
    description:
      "Personal mentorship sessions with industry experts. Strategy calls, business reviews, and dedicated instructor support.",
    icon: <UserCheck className="h-6 w-6" />,
    tier: "Agency Founder",
    highlights: ["Monthly 1:1s", "Strategy reviews", "Expert mentors"],
  },
  {
    id: "co-marketing",
    title: "Co-Marketing with Zaptick",
    description:
      "Joint case studies, featured on Zaptick's channels, co-branding opportunities. Build your reputation alongside ours.",
    icon: <Megaphone className="h-6 w-6" />,
    tier: "Builder Track",
    highlights: ["Case studies", "Featured placement", "Co-branding"],
  },
];

interface Partner {
  name: string;
  domain: string;
  perk: string;
  featured?: boolean;
}

const PARTNERS: Partner[] = [
  { name: "Meta", domain: "meta.com", perk: "Official Meta Business Partner — Summit access & co-branded certification", featured: true },
  { name: "AI Fiesta", domain: "aifiesta.ai", perk: "Pro access for cohort members" },
  { name: "Internet Lifestyle Hub", domain: "internetlifestylehub.com", perk: "Coach mentorship invite" },
  { name: "OceanLinux", domain: "oceanlinux.com", perk: "Free hosting credits" },
  { name: "TagMango", domain: "tagmango.com", perk: "Launch credits + warm intros" },
  { name: "Jio", domain: "jio.com", perk: "Enterprise deal pipeline access" },
  { name: "BumbleDry", domain: "bumbledry.com", perk: "DTC ops case studies" },
  { name: "Nyrah Beauty", domain: "nyrahbeauty.com", perk: "Beauty brand partnership" },
  { name: "Renu Therapy", domain: "renutherapy.com", perk: "Recovery brand collab" },
  { name: "Daily.ai", domain: "daily.ai", perk: "Newsletter AI access" },
];

const TIER_COLORS: Record<string, string> = {
  Foundations: "bg-blue-50 text-blue-700 border-blue-200",
  "Agency Founder": "bg-amber-50 text-amber-700 border-amber-200",
  "Builder Track": "bg-purple-50 text-purple-700 border-purple-200",
};

export default function ExclusiveClient({
  plan,
  planAllowed,
}: {
  plan?: string;
  planAllowed: boolean;
}) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const isEnrolled = planAllowed;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/25">
              <Crown className="h-6 w-6 text-white" />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                <Sparkles className="h-3 w-3" /> Exclusive Access
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl">
            Unlock the full
            <span className="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
              {" "}ZapAcademy{" "}
            </span>
            experience
          </h1>
          <p className="text-lg text-slate-300 mt-4 max-w-xl leading-relaxed">
            Founder calls, private networking, client workshops, inbound leads, and our exclusive partner
            network — all unlocked when you enroll in a ZapAcademy cohort.
          </p>

          {!isEnrolled && (
            <a
              href={`${ZAPTICK_URL}/zapacademy`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:brightness-110 transition-all"
            >
              <Zap className="h-4 w-4" />
              Enroll in ZapAcademy
              <ArrowRight className="h-4 w-4" />
            </a>
          )}

          {isEnrolled && (
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 text-sm font-bold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              You have access — features unlocking soon
            </div>
          )}
        </div>
      </div>

      {/* Feature cards */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-xl font-black text-slate-900">Exclusive Features</h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isEnrolled ? "Coming soon" : "Locked"}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={cn(
                "relative rounded-2xl border p-5 transition-all duration-300",
                isEnrolled
                  ? "border-slate-200 bg-white hover:border-emerald-200 hover:shadow-lg"
                  : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
              )}
            >
              {!isEnrolled && (
                <div className="absolute top-3 right-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
              )}

              <div
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-xl mb-3 transition-colors",
                  isEnrolled
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {feature.icon}
              </div>

              <h3 className={cn(
                "text-sm font-bold mb-1.5",
                isEnrolled ? "text-slate-900" : "text-slate-600"
              )}>
                {feature.title}
              </h3>

              <p className={cn(
                "text-xs leading-relaxed mb-3",
                isEnrolled ? "text-slate-600" : "text-slate-400"
              )}>
                {feature.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {feature.highlights.map((h) => (
                  <span
                    key={h}
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                      isEnrolled
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    )}
                  >
                    {h}
                  </span>
                ))}
              </div>

              <div
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest",
                  TIER_COLORS[feature.tier] || "bg-slate-50 text-slate-500 border-slate-200"
                )}
              >
                {feature.tier}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Network */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-900">Exclusive Partner Network</h2>
            <p className="text-xs text-slate-500">
              Network with industry leaders. Warm intros, exclusive perks, direct lines.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PARTNERS.map((partner) => (
            <div
              key={partner.domain}
              className={cn(
                "rounded-2xl border p-4 transition-all",
                partner.featured
                  ? "border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${partner.domain}&sz=64`}
                  alt={partner.name}
                  className="h-8 w-8 rounded-lg object-contain"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {partner.name}
                    {partner.featured && (
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    )}
                  </h3>
                </div>
                {!isEnrolled && <Lock className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{partner.perk}</p>
              {!isEnrolled && (
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Lock className="h-2.5 w-2.5" /> Enroll to network
                </div>
              )}
              {isEnrolled && (
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  <Sparkles className="h-2.5 w-2.5" /> Access coming soon
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA footer */}
      {!isEnrolled && (
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 sm:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Ready to go exclusive?
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-6">
            Choose a ZapAcademy cohort — Foundations, Agency Founder, or Builder Track —
            and unlock everything above, plus the full marketing OS.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`${ZAPTICK_URL}/zapacademy`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:brightness-110 transition-all"
            >
              <Crown className="h-4 w-4" />
              View Plans & Enroll
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={`${ZAPTICK_URL}/zapacademy/showdown`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-600 px-6 py-3 text-sm font-bold text-slate-300 hover:text-white hover:border-slate-400 transition-colors"
            >
              Or enter the Showdown
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
