import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTotalXp } from "@/lib/engine";
import { levelFromXp } from "@/lib/xp";
import dbConnect from "@/lib/db";
import LevelsClient from "./_client";

export const dynamic = "force-dynamic";

export default async function LevelsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await dbConnect();

  const xp = await getTotalXp(user.id);
  const level = levelFromXp(xp);

  return <LevelsClient xp={xp} level={level} />;
}
