import Link from "next/link";
import {
  ArrowUpRight,
  Code2,
  Webhook,
  Key,
  BookOpen,
  Puzzle,
  Zap,
  Shield,
  Globe,
  Terminal,
  MessageSquare,
  Bot,
} from "lucide-react";

export const dynamic = "force-dynamic";

const DEV_URL = "https://developers.zaptick.io";

const FEATURES = [
  {
    icon: <Webhook className="h-5 w-5" />,
    title: "Webhooks",
    detail: "Real-time events for messages, contacts, campaigns & more. Subscribe to exactly what you need.",
    color: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
  {
    icon: <Key className="h-5 w-5" />,
    title: "REST APIs",
    detail: "Full CRUD access to contacts, conversations, templates, broadcasts, and automations.",
    color: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Messaging APIs",
    detail: "Send text, media, interactive, template & session messages programmatically via WhatsApp.",
    color: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: "AI Agent SDK",
    detail: "Build and deploy custom AI agents with the Zaptick Agent framework. Full RAG + tool-calling support.",
    color: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    icon: <Puzzle className="h-5 w-5" />,
    title: "Integrations",
    detail: "Connect Shopify, WooCommerce, Razorpay, Google Sheets, Zapier, and 200+ services.",
    color: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Workflow Builder API",
    detail: "Programmatically create, update, and trigger automation workflows.",
    color: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "OAuth & API Keys",
    detail: "Secure API key management, scoped permissions, and OAuth 2.0 flows for third-party apps.",
    color: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Multi-channel",
    detail: "WhatsApp, Instagram DM, and more channels — same unified API surface.",
    color: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  {
    icon: <Terminal className="h-5 w-5" />,
    title: "SDKs & Libraries",
    detail: "Official SDKs for Node.js, Python, and REST — plus community-built wrappers.",
    color: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  },
];

export default function DeveloperPlatformPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950">
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative p-7 sm:p-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/25">
              <Code2 className="h-5 w-5 text-white" />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-extrabold text-emerald-300">
                Zaptick
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Developer Platform
              </h1>
            </div>
          </div>

          <p className="text-white/70 leading-relaxed max-w-2xl text-sm sm:text-[15px]">
            Build custom integrations, extend Zaptick with webhooks and APIs, deploy AI agents,
            and automate everything. The developer platform gives you full programmatic access
            to the Zaptick marketing OS.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <a
              href={DEV_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl h-12 px-6 text-sm font-extrabold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 ring-1 ring-emerald-400/60 shadow-[0_10px_28px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_18px_42px_-12px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-0.5"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
              <BookOpen className="relative h-4 w-4" />
              <span className="relative">Open developer docs</span>
              <ArrowUpRight className="relative h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-500 mb-4">
          What you can build
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-200 hover:shadow-sm transition-all"
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${f.color}`}
              >
                {f.icon}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-3">{f.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Ready to build?</h3>
          <p className="text-xs text-slate-600 mt-1">
            Head over to the developer docs to get your API keys and start integrating.
          </p>
        </div>
        <a
          href={DEV_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl h-11 px-5 text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shrink-0"
        >
          <Code2 className="h-4 w-4" />
          developers.zaptick.io
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
