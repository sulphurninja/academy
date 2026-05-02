import { CalendarDays, Sparkles } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <header>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
          <CalendarDays className="h-3 w-3" /> Live calls
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          Cohort calendar
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl">
          Live AMAs, build-along sessions, and Demo Day all show up here. Block
          your calendar early — recordings drop within 24h.
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <Sparkles className="mx-auto h-7 w-7 text-emerald-500" />
        <div className="mt-2 text-sm font-bold text-slate-900">
          Cohort #001 calendar drops the week before kickoff.
        </div>
        <div className="text-xs text-slate-500 mt-1">
          We&apos;ll notify you in-app and via email when sessions are scheduled.
        </div>
      </div>
    </div>
  );
}
