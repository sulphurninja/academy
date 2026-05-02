"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  X,
  Trash2,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: string;
  dueDate: string | null;
  status: string;
  createdAt: string;
}

const CATEGORIES = [
  { id: "marketing", label: "Marketing", color: "bg-emerald-100 text-emerald-700" },
  { id: "content", label: "Content", color: "bg-blue-100 text-blue-700" },
  { id: "client", label: "Client Work", color: "bg-amber-100 text-amber-700" },
  { id: "admin", label: "Admin", color: "bg-slate-100 text-slate-700" },
];

const PRIORITIES = [
  { id: "low", label: "Low", color: "text-slate-400", dot: "bg-slate-300" },
  { id: "medium", label: "Medium", color: "text-blue-500", dot: "bg-blue-400" },
  { id: "high", label: "High", color: "text-amber-500", dot: "bg-amber-400" },
  { id: "urgent", label: "Urgent", color: "text-red-500", dot: "bg-red-500" },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Circle className="h-4 w-4 text-slate-300" />,
  in_progress: <Clock className="h-4 w-4 text-blue-500" />,
  done: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
};

export default function TaskBoard() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("marketing");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCat) params.set("category", filterCat);
      if (filterPriority) params.set("priority", filterPriority);
      const res = await fetch(`/api/workspace/tasks?${params}`);
      if (res.ok) setTasks(await res.json());
    } finally {
      setLoading(false);
    }
  }, [filterCat, filterPriority]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          priority: newPriority,
          dueDate: newDueDate || undefined,
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDueDate("");
        setAddOpen(false);
        fetchTasks();
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (task: TaskItem) => {
    const next = task.status === "done" ? "pending" : task.status === "pending" ? "in_progress" : "done";
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    await fetch("/api/workspace/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: next }),
    });
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch("/api/workspace/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const pending = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-4">
      {/* Filters + Add */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setAddOpen(!addOpen)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New Task
        </button>

        <div className="flex items-center gap-1 ml-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-white"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-white"
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* New task form */}
      {addOpen && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-white"
            >
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={addTask}
              disabled={saving || !newTitle.trim()}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add Task"}
            </button>
            <button
              onClick={() => setAddOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <p className="text-sm font-bold text-slate-900">No tasks yet</p>
          <p className="text-xs text-slate-500 mt-1">Create your first task to start planning</p>
        </div>
      ) : (
        <>
          {/* Active tasks */}
          {pending.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                Active ({pending.length})
              </h4>
              {pending.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={toggleStatus} onDelete={deleteTask} />
              ))}
            </div>
          )}

          {/* Done tasks */}
          {done.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                Completed ({done.length})
              </h4>
              {done.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={toggleStatus} onDelete={deleteTask} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: TaskItem;
  onToggle: (t: TaskItem) => void;
  onDelete: (id: string) => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === task.category);
  const pri = PRIORITIES.find((p) => p.id === task.priority);
  const isDone = task.status === "done";

  return (
    <div className={cn(
      "rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3 group hover:shadow-sm transition-all",
      isDone && "opacity-60"
    )}>
      <button
        type="button"
        onClick={() => onToggle(task)}
        className="shrink-0 transition-transform hover:scale-110"
      >
        {STATUS_ICONS[task.status]}
      </button>

      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-bold truncate", isDone ? "line-through text-slate-400" : "text-slate-900")}>
          {task.title}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {cat && (
            <span className={cn("inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold", cat.color)}>
              {cat.label}
            </span>
          )}
          {pri && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold">
              <span className={cn("h-1.5 w-1.5 rounded-full", pri.dot)} />
              <span className={pri.color}>{pri.label}</span>
            </span>
          )}
          {task.dueDate && (
            <span className="text-[9px] text-slate-400 font-bold">
              {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 transition-all"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
