import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { NotificationsClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <NotificationsClient userId={user.id} userName={user.name} />;
}
