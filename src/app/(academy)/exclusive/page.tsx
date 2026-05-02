import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ExclusiveClient from "./_client";

export const dynamic = "force-dynamic";

export default async function ExclusivePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <ExclusiveClient plan={user.plan} planAllowed={user.planAllowed} />;
}
