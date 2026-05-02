import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";
import dbConnect from "@/lib/db";
import { ConnectionsClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  const viewer = await getCurrentUser();
  if (!viewer) redirect("/login");

  await dbConnect();
  const target = await User.findById(id).select("name").lean<{ _id: any; name: string }>();
  if (!target) notFound();

  return (
    <ConnectionsClient
      userId={id}
      userName={target.name}
      viewerId={viewer.id}
      initialTab={(tab === "following" ? "following" : "followers") as "followers" | "following"}
    />
  );
}
