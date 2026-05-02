"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  Kanban,
  ListTodo,
  StickyNote,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CampaignCalendar from "@/components/academy/CampaignCalendar";
import ContentBoard from "@/components/academy/ContentBoard";
import TaskBoard from "@/components/academy/TaskBoard";
import WorkspaceNotes from "@/components/academy/WorkspaceNotes";

type Tab = "calendar" | "content" | "tasks" | "notes";

const TABS: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "calendar",
    label: "Campaign Calendar",
    icon: <CalendarDays className="h-4 w-4" />,
    description: "Plan and schedule your marketing campaigns",
  },
  {
    id: "content",
    label: "Content Planner",
    icon: <Kanban className="h-4 w-4" />,
    description: "Organize content ideas from draft to published",
  },
  {
    id: "tasks",
    label: "Task Board",
    icon: <ListTodo className="h-4 w-4" />,
    description: "Track your marketing tasks and deadlines",
  },
  {
    id: "notes",
    label: "Notes",
    icon: <StickyNote className="h-4 w-4" />,
    description: "Quick notes and marketing ideas",
  },
];

export default function WorkspaceClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as Tab) || "calendar";
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.id === initialTab) ? initialTab : "calendar");

  const switchTab = (t: Tab) => {
    setTab(t);
    router.replace(`/workspace?tab=${t}`, { scroll: false });
  };

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <header className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg shadow-indigo-500/25">
              <Briefcase className="h-5 w-5 text-white" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Marketing Workspace
              </h1>
              <p className="text-sm text-slate-400">
                Plan campaigns, organize content, track tasks — all in one place.
              </p>
            </div>
          </div>

          {/* Tab pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all",
                  tab === t.id
                    ? "bg-white text-slate-900 shadow-lg"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Active tab description */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500">{activeTab.icon}</span>
        <h2 className="text-lg font-black text-slate-900">{activeTab.label}</h2>
        <span className="text-xs text-slate-400 hidden sm:inline">— {activeTab.description}</span>
      </div>

      {/* Tab content */}
      <div>
        {tab === "calendar" && <CampaignCalendar />}
        {tab === "content" && <ContentBoard />}
        {tab === "tasks" && <TaskBoard />}
        {tab === "notes" && <WorkspaceNotes />}
      </div>
    </div>
  );
}
