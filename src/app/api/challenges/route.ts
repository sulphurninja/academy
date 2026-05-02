import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import DailyChallenge from "@/models/DailyChallenge";
import mongoose from "mongoose";

const CHALLENGE_POOL = [
  { id: "watch-lesson", title: "Watch a lesson", description: "Complete any video lesson", xp: 30, type: "learn" },
  { id: "take-quiz", title: "Ace a quiz", description: "Score 80%+ on any lesson quiz", xp: 40, type: "learn" },
  { id: "post-community", title: "Share with community", description: "Create a post in the community feed", xp: 25, type: "social" },
  { id: "comment", title: "Join the discussion", description: "Comment on a lesson or community post", xp: 15, type: "social" },
  { id: "read-playbook", title: "Read a playbook", description: "Open and read any playbook", xp: 20, type: "learn" },
  { id: "add-note", title: "Take notes", description: "Save a note on any lesson", xp: 15, type: "learn" },
  { id: "plan-campaign", title: "Plan a campaign", description: "Add a campaign to your workspace calendar", xp: 25, type: "work" },
  { id: "add-task", title: "Organize your tasks", description: "Create 3 tasks in the task board", xp: 20, type: "work" },
  { id: "add-content", title: "Plan content", description: "Add a card to your content planner", xp: 20, type: "work" },
  { id: "streak-keeper", title: "Keep the streak", description: "Maintain your daily login streak", xp: 10, type: "social" },
  { id: "reach-out", title: "Network", description: "Send a connection request to someone", xp: 20, type: "social" },
  { id: "explore-profile", title: "Explore profiles", description: "Visit 3 member profiles", xp: 15, type: "social" },
];

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function pickDailyChallenges(dateStr: string): typeof CHALLENGE_POOL {
  const seed = dateStr.split("-").reduce((acc, v) => acc + parseInt(v, 10), 0);
  const shuffled = [...CHALLENGE_POOL].sort((a, b) => {
    const ha = ((seed * 31 + a.id.charCodeAt(0)) % 100) - 50;
    const hb = ((seed * 31 + b.id.charCodeAt(0)) % 100) - 50;
    return ha - hb;
  });
  return shuffled.slice(0, 5);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = getTodayStr();
  await dbConnect();

  let doc = await DailyChallenge.findOne({
    userId: new mongoose.Types.ObjectId(user.id),
    date: today,
  }).lean();

  if (!doc) {
    const picks = pickDailyChallenges(today);
    doc = await DailyChallenge.create({
      userId: user.id,
      date: today,
      challenges: picks.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        xp: c.xp,
        type: c.type,
        completed: false,
      })),
    });
    doc = await DailyChallenge.findById(doc._id).lean();
  }

  return NextResponse.json({
    date: today,
    challenges: (doc as any).challenges,
    totalXpEarned: (doc as any).totalXpEarned,
  });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  const { challengeId } = await req.json();
  if (!challengeId) return NextResponse.json({ error: "challengeId required" }, { status: 400 });

  const today = getTodayStr();
  await dbConnect();

  const result = await DailyChallenge.findOneAndUpdate(
    {
      userId: new mongoose.Types.ObjectId(user.id),
      date: today,
      "challenges.id": challengeId,
      "challenges.completed": false,
    },
    {
      $set: {
        "challenges.$.completed": true,
        "challenges.$.completedAt": new Date(),
      },
    },
    { new: true }
  ).lean();

  if (!result) {
    return NextResponse.json({ error: "Challenge not found or already completed" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
