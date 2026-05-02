import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { chatText } from "@/lib/ai";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });
  if (!user.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

  const { lessonTitle, weekSlug, lessonSlug, message, history } = await req.json();
  if (!message?.trim())
    return NextResponse.json({ error: "Message required" }, { status: 400 });

  const historyStr = (history || [])
    .slice(-6)
    .map((m: { role: string; text: string }) => `${m.role}: ${m.text}`)
    .join("\n");

  const systemPrompt = `You are the ZapAcademy AI Study Buddy — a friendly, knowledgeable tutor for the Zaptick marketing platform.

Current lesson: "${lessonTitle}" (${weekSlug}/${lessonSlug})

Your job:
- Help the student understand this lesson's concepts
- Give practical examples using real Zaptick features (WhatsApp API, workflows, AI agents, broadcasts, templates, etc.)
- Be concise (2-4 sentences per response unless asked for detail)
- Use a motivating, supportive tone
- If asked something outside the lesson scope, briefly answer and guide them back

You have deep knowledge of: WhatsApp Business API, RCS messaging, email marketing, voice AI, workflow automation, AI chatbots, campaign analytics, team inbox, template management, landing pages, webinars, and agency pricing models.`;

  const userPrompt = historyStr
    ? `Previous conversation:\n${historyStr}\n\nStudent: ${message.trim()}`
    : message.trim();

  const result = await chatText({
    companyId: user.companyId,
    description: `AI Study Buddy: ${lessonTitle}`,
    systemPrompt,
    userPrompt,
    maxTokens: 400,
    temperature: 0.5,
  });

  if (result.error && !result.data) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    reply: result.data || "I couldn't generate a response. Please try again.",
    creditsCharged: result.creditsCharged,
  });
}
