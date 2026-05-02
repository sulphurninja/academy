"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  channel: string;
  status: string;
  color: string;
}

const CHANNELS = ["whatsapp", "email", "rcs", "instagram", "voice", "other"] as const;
const STATUSES = ["draft", "scheduled", "live", "completed"] as const;
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const CHANNEL_EMOJI: Record<string, string> = {
  whatsapp: "💬",
  email: "📧",
  rcs: "📱",
  instagram: "📸",
  voice: "🎙️",
  other: "📌",
};
const STATUS_DOT: Record<string, string> = {
  draft: "bg-slate-400",
  scheduled: "bg-blue-500",
  live: "bg-emerald-500",
  completed: "bg-amber-500",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CampaignCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    date: string;
    event?: CalEvent;
  } | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspace/events?month=${month}&year=${year}`);
      if (res.ok) setEvents(await res.json());
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const eventsForDay = (day: number) =>
    events.filter((e) => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
        <h3 className="text-lg font-black text-slate-900">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button onClick={nextMonth} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-7">
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dayEvents = day ? eventsForDay(day) : [];
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[80px] sm:min-h-[100px] border-b border-r border-slate-100 p-1 transition-colors",
                  day ? "cursor-pointer hover:bg-emerald-50/30" : "bg-slate-50/50",
                  i % 7 === 6 && "border-r-0"
                )}
                onClick={() => {
                  if (day) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    setModal({ mode: "create", date: dateStr });
                  }
                }}
              >
                {day && (
                  <>
                    <div className={cn(
                      "text-xs font-bold mb-0.5 text-right pr-1",
                      isToday(day) ? "text-white bg-emerald-600 rounded-full h-5 w-5 flex items-center justify-center ml-auto text-[10px]" : "text-slate-500"
                    )}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ mode: "edit", date: ev.date.split("T")[0], event: ev });
                          }}
                          className="w-full text-left rounded px-1 py-0.5 text-[10px] font-bold truncate transition-opacity hover:opacity-80"
                          style={{ backgroundColor: ev.color + "20", color: ev.color }}
                        >
                          {CHANNEL_EMOJI[ev.channel] || "📌"} {ev.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] text-slate-400 font-bold px-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
        </div>
      )}

      {/* Modal */}
      {modal && (
        <EventModal
          mode={modal.mode}
          date={modal.date}
          event={modal.event}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchEvents(); }}
        />
      )}
    </div>
  );
}

function EventModal({
  mode,
  date,
  event,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  date: string;
  event?: CalEvent;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [channel, setChannel] = useState(event?.channel || "whatsapp");
  const [status, setStatus] = useState(event?.status || "draft");
  const [color, setColor] = useState(event?.color || "#10b981");
  const [dateVal, setDateVal] = useState(date);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (mode === "create") {
        await fetch("/api/workspace/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, date: dateVal, channel, status, color }),
        });
      } else {
        await fetch("/api/workspace/events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: event!.id, title, description, date: dateVal, channel, status, color }),
        });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!event) return;
    setSaving(true);
    try {
      await fetch("/api/workspace/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">
            {mode === "create" ? "New Campaign" : "Edit Campaign"}
          </h3>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Campaign title"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <input
            type="date"
            value={dateVal}
            onChange={(e) => setDateVal(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{CHANNEL_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Color</label>
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-all",
                    color === c ? "border-slate-900 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={save}
            disabled={saving || !title.trim()}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : mode === "create" ? "Create" : "Save"}
          </button>
          {mode === "edit" && (
            <button
              onClick={remove}
              disabled={saving}
              className="h-10 w-10 rounded-xl border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
