import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import WorkspaceClient from "./_client";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <Suspense fallback={<div className="animate-pulse rounded-2xl bg-slate-100 h-96" />}>
      <WorkspaceClient />
    </Suspense>
  );
}
