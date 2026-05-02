import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Progress from "@/models/Progress";
import { CURRICULUM, totalLessons } from "@/lib/curriculum";
import { getTotalXp } from "@/lib/engine";
import { levelFromXp } from "@/lib/xp";
import { CertificationClient } from "./_client";

export const dynamic = "force-dynamic";

const MAX_LEVEL = 10;

export default async function CertificationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();
  const uid = new mongoose.Types.ObjectId(user.id);

  const [progressRows, totalXp] = await Promise.all([
    Progress.find({ userId: uid }).lean<{ weekSlug: string; lessonSlug: string; quizPassedAt?: Date }[]>(),
    getTotalXp(uid),
  ]);

  const level = levelFromXp(totalXp);
  const total = totalLessons();
  const passedSet = new Set(
    progressRows.filter((p) => p.quizPassedAt).map((p) => `${p.weekSlug}::${p.lessonSlug}`)
  );

  const weekProgress = CURRICULUM.map((w) => {
    const completed = w.lessons.filter((l) => passedSet.has(`${w.slug}::${l.slug}`)).length;
    return { slug: w.slug, title: w.title, total: w.lessons.length, completed };
  });

  const completedLessons = passedSet.size;
  const courseComplete = completedLessons >= total;
  const topLevel = level.level >= MAX_LEVEL;
  const eligible = courseComplete && topLevel;

  return (
    <CertificationClient
      userName={user.name || user.email}
      userEmail={user.email}
      eligible={eligible}
      courseComplete={courseComplete}
      topLevel={topLevel}
      currentLevel={level.level}
      currentLevelTitle={level.title}
      maxLevel={MAX_LEVEL}
      completedLessons={completedLessons}
      totalLessons={total}
      totalXp={totalXp}
      weekProgress={weekProgress}
    />
  );
}
