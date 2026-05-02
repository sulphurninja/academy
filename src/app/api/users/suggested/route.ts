import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import { listMembers, getMember, type AcademyMember } from "@/lib/profile";
import Follow from "@/models/Follow";
import dbConnect from "@/lib/db";
import { chatJson } from "@/lib/ai";

/**
 * GET /api/users/suggested?limit=6
 *
 * Returns members the viewer doesn't already follow, ranked by *business
 * relevance* using OpenAI gpt-4o-mini:
 *  - same WhatsApp business category > similar industry > general
 *  - similar business descriptions / GTM motions
 *  - prefers active members (XP, followers) as a tiebreaker
 *
 * Heavy lifting:
 *  1. Pull a candidate pool of WABA-registered members (max 60).
 *  2. Send compact "business cards" to the LLM along with the viewer's card.
 *  3. LLM returns top N ids + a short reason.
 *  4. Hydrate AcademyMember objects in that order. AI credits deducted
 *     atomically from the viewer's company wallet.
 *
 * Falls back to organic ranking (followers/xp) when:
 *  - no AI key configured
 *  - viewer's company has insufficient AI credits
 *  - LLM returns malformed JSON
 *  - candidate pool < 3
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const limit = Math.min(20, Number(searchParams.get("limit") || 6));

  const me = new mongoose.Types.ObjectId(user.id);
  const follows = await Follow.find({ followerId: me })
    .select("followingId")
    .lean<{ followingId: any }[]>();

  const exclude = [user.id, ...follows.map((f) => f.followingId.toString())];

  // Candidate pool — 60 most-recent WABA-registered members minus already-following
  const pool = await listMembers({
    viewerId: user.id,
    limit: 60,
    excludeIds: exclude,
    requireWaba: true,
  });

  if (pool.members.length === 0) {
    return NextResponse.json({ members: [], rationale: null, ai: false });
  }

  if (pool.members.length < 3) {
    return NextResponse.json({
      members: pool.members.slice(0, limit),
      rationale: null,
      ai: false,
    });
  }

  // Viewer's own profile = the "match against" anchor
  const viewer = await getMember(user.id);
  if (!viewer) {
    return NextResponse.json({
      members: pool.members.slice(0, limit),
      rationale: null,
      ai: false,
    });
  }

  if (!process.env.OPENAI_API_KEY || !user.companyId) {
    return NextResponse.json({
      members: rankOrganically(pool.members).slice(0, limit),
      rationale: null,
      ai: false,
    });
  }

  // ── AI ranking ───────────────────────────────────────────────────────────
  const meCard = compactCard(viewer);
  const candidatesPayload = pool.members.map((m, idx) => ({
    rank_index: idx,
    id: m.id,
    ...compactCard(m),
  }));

  const systemPrompt = `You are the relevance engine behind ZapAcademy's "Suggested members" widget.

ZapAcademy is a private community of B2B founders, marketers, agency owners, and ecommerce operators who use Zaptick (a WhatsApp Business marketing OS).

Your job: given the viewer's business profile and a list of candidate members, pick the top ${limit} candidates the viewer would most benefit from connecting with.

Rank by, in order of priority:
  1. Same / closely-related WhatsApp business category (e.g. "Beauty" matches "Personal Care", "Apparel" matches "Fashion & Apparel").
  2. Same industry vertical (D2C beauty, fintech, edtech, agencies, etc).
  3. Complementary GTM motion (an agency that serves brands like the viewer's, or a brand whose category the viewer's agency targets).
  4. Same maturity stage (XP / level as a soft proxy).
  5. Higher follower count and more activity as a tiebreaker.

Hard exclusions:
  - Never suggest a candidate whose business looks identical (same domain, same name).
  - Skip candidates with empty or generic descriptions if better-described candidates exist.

Respond ONLY with JSON in this exact shape:
{
  "picks": [
    { "id": "<candidate id>", "reason": "<8-14 word, specific, second-person reason>" }
  ],
  "summary": "<one short sentence describing the overall match strategy>"
}

Pick exactly ${limit} ids (or fewer only if there genuinely aren't ${limit} good matches). All ids MUST be from the candidates list. Keep reasons concrete (mention the candidate's category, industry, or what the viewer can learn / collaborate on).`;

  const userPrompt = `VIEWER:
${JSON.stringify(meCard, null, 2)}

CANDIDATES (${candidatesPayload.length}):
${JSON.stringify(candidatesPayload, null, 2)}`;

  type Pick = { id: string; reason?: string };
  type AiResp = { picks?: Pick[]; summary?: string };

  const ai = await chatJson<AiResp>({
    companyId: user.companyId,
    description: "ZapAcademy · Suggested members ranking",
    systemPrompt,
    userPrompt,
    temperature: 0.2,
    maxTokens: 600,
    metadata: {
      feature: "suggested_members",
      candidateCount: candidatesPayload.length,
      requestedLimit: limit,
    },
  });

  if (ai.error || !ai.data?.picks?.length) {
    return NextResponse.json({
      members: rankOrganically(pool.members).slice(0, limit),
      rationale: null,
      ai: false,
      error: ai.error,
    });
  }

  const memberMap = new Map(pool.members.map((m) => [m.id, m]));
  const reasonMap = new Map<string, string>();
  const ordered: AcademyMember[] = [];
  for (const pick of ai.data.picks) {
    const m = memberMap.get(pick.id);
    if (!m || ordered.find((o) => o.id === m.id)) continue;
    ordered.push(m);
    if (pick.reason) reasonMap.set(m.id, pick.reason);
    if (ordered.length >= limit) break;
  }
  // Pad with organic ranks if AI returned fewer
  for (const m of rankOrganically(pool.members)) {
    if (ordered.length >= limit) break;
    if (!ordered.find((o) => o.id === m.id)) ordered.push(m);
  }

  return NextResponse.json({
    members: ordered.map((m) => ({ ...m, suggestionReason: reasonMap.get(m.id) || null })),
    rationale: ai.data.summary || null,
    ai: true,
    creditsCharged: ai.creditsCharged,
    balanceAfter: ai.balanceAfter,
  });
}

function compactCard(m: AcademyMember) {
  return {
    name: m.name,
    company: m.companyName || null,
    industry: m.companyIndustry || null,
    category_zaptick: m.companyCategory || null,
    whatsapp_business_category: m.businessCategory || null,
    whatsapp_business_description: m.businessDescription
      ? m.businessDescription.slice(0, 280)
      : null,
    domain: m.companyDomain || null,
    level: m.level.level,
    xp: m.xp,
    followers: m.followers,
  };
}

function rankOrganically(members: AcademyMember[]): AcademyMember[] {
  return [...members].sort((a, b) => {
    if (b.followers !== a.followers) return b.followers - a.followers;
    if (b.xp !== a.xp) return b.xp - a.xp;
    return b.level.level - a.level.level;
  });
}
