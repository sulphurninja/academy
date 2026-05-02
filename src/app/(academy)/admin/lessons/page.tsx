import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Lesson from "@/models/Lesson";
import { CURRICULUM, PHASE_THEME } from "@/lib/curriculum";
import { Settings, Sparkles, ShieldAlert } from "lucide-react";
import { AdminLessonForm } from "./_form";

export const dynamic = "force-dynamic";

export default async function AdminLessonsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-base font-bold text-rose-700 inline-flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Forbidden
        </h1>
        <p className="text-sm text-rose-700/80 mt-1">
          You need admin or super-admin privileges on the main Zaptick app to manage ZapAcademy
          lessons.
        </p>
      </div>
    );
  }

  await dbConnect();
  const dbLessons = await Lesson.find({})
    .select("weekSlug lessonSlug videoUrl videoProvider isPublished xpVideoComplete quiz content updatedAt")
    .lean<
      {
        weekSlug: string;
        lessonSlug: string;
        videoUrl?: string;
        videoProvider?: string;
        isPublished?: boolean;
        xpVideoComplete?: number;
        quiz?: any;
        content?: string;
        updatedAt?: Date;
      }[]
    >();
  const map = new Map(dbLessons.map((l) => [`${l.weekSlug}::${l.lessonSlug}`, l]));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-4 w-4 text-emerald-700" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700">
              Admin · lesson library
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Manage curriculum content
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            Upload video URLs and author quizzes (JSON). Curriculum structure is
            fixed in{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-[12px]">
              lib/curriculum.ts
            </code>
            .
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 uppercase tracking-widest">
          <Sparkles className="h-3 w-3" /> {dbLessons.filter((l) => l.isPublished).length} published
        </span>
      </header>

      <div className="space-y-6">
        {CURRICULUM.map((w) => {
          const t = PHASE_THEME[w.phase];
          return (
            <section
              key={w.slug}
              className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-widest ${t.chip}`}
                    >
                      Week {w.weekIndex + 1} · {t.label}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight mt-1">
                    {w.title}
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {w.lessons.map((l) => {
                  const existing = map.get(`${w.slug}::${l.slug}`);
                  return (
                    <AdminLessonForm
                      key={`${w.slug}-${l.slug}`}
                      weekSlug={w.slug}
                      lessonSlug={l.slug}
                      title={l.title}
                      initial={{
                        videoUrl: existing?.videoUrl || "",
                        videoProvider: (existing?.videoProvider as any) || "youtube",
                        isPublished: !!existing?.isPublished,
                        xpVideoComplete: existing?.xpVideoComplete ?? 50,
                        quizJson: existing?.quiz ? JSON.stringify(existing.quiz, null, 2) : "",
                        content: existing?.content || "",
                      }}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
