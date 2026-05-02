import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Like from "@/models/Like";
import User from "@/models/User";
import Company from "@/models/Company";
import Follow from "@/models/Follow";
import { getCurrentUser } from "@/lib/auth";
import { awardXp } from "@/lib/engine";
import { domainFromEmail, faviconFor } from "@/lib/utils";

/**
 * GET /api/posts?cursor=<id>&scope=feed|following|me
 * Cursor pagination by `_id`. 20 posts per page.
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const scope = (searchParams.get("scope") || "feed").toLowerCase();
  const userIdParam = searchParams.get("userId");
  const weekSlug = searchParams.get("weekSlug");
  const lessonSlug = searchParams.get("lessonSlug");
  const limit = Math.min(50, Number(searchParams.get("limit") || 20));

  const filter: any = { isHidden: { $ne: true } };
  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
    filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }
  if (scope === "following") {
    const me = new mongoose.Types.ObjectId(user.id);
    const follows = await Follow.find({ followerId: me }).select("followingId").lean<{
      followingId: any;
    }[]>();
    filter.userId = { $in: [me, ...follows.map((f) => f.followingId)] };
  }
  if (scope === "me") {
    filter.userId = new mongoose.Types.ObjectId(user.id);
  }
  if (userIdParam && mongoose.Types.ObjectId.isValid(userIdParam)) {
    filter.userId = new mongoose.Types.ObjectId(userIdParam);
  }
  if (weekSlug) filter.weekSlug = weekSlug;
  if (lessonSlug) filter.lessonSlug = lessonSlug;

  const rows = await Post.find(filter)
    .sort({ isPinned: -1, _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);

  const userIds = Array.from(new Set(items.map((p: any) => p.userId.toString())));
  const [authors, likedRows, companies] = await Promise.all([
    User.find({ _id: { $in: userIds } })
      .select("_id name email companyId")
      .lean<{ _id: any; name: string; email: string; companyId?: any }[]>(),
    items.length
      ? Like.find({
          userId: new mongoose.Types.ObjectId(user.id),
          postId: { $in: items.map((p: any) => p._id) },
        })
          .select("postId")
          .lean<{ postId: any }[]>()
      : [],
    User.find({ _id: { $in: userIds } })
      .select("companyId")
      .lean<{ _id: any; companyId?: any }[]>(),
  ]);

  const authorMap = new Map(authors.map((u: any) => [u._id.toString(), u]));
  const likedSet = new Set(likedRows.map((l: any) => l.postId.toString()));

  const companyIds = Array.from(
    new Set(
      companies
        .map((c: any) => c.companyId?.toString())
        .filter(Boolean) as string[]
    )
  );
  const companyDocs = companyIds.length
    ? await Company.find({
        _id: { $in: companyIds.map((id) => new mongoose.Types.ObjectId(id)) },
      })
        .select("name website whatsappProfile")
        .lean<{
          _id: any;
          name?: string;
          website?: string;
          whatsappProfile?: { profilePictureUrl?: string };
        }[]>()
    : [];
  const companyMap = new Map(
    companyDocs.map((c: any) => [c._id.toString(), c])
  );

  const posts = items.map((p: any) => {
    const author = authorMap.get(p.userId.toString());
    const company = author?.companyId ? companyMap.get(author.companyId.toString()) : null;
    const domain =
      company?.website?.replace(/^https?:\/\//, "").replace(/\/.*$/, "") ||
      domainFromEmail(author?.email || "");
    return {
      id: p._id.toString(),
      body: p.body,
      attachment: p.attachment || null,
      weekSlug: p.weekSlug,
      lessonSlug: p.lessonSlug,
      likeCount: p.likeCount || 0,
      commentCount: p.commentCount || 0,
      isPinned: !!p.isPinned,
      createdAt: p.createdAt,
      author: author
        ? {
            id: author._id.toString(),
            name: author.name,
            email: author.email,
            companyName: company?.name,
            avatarUrl: company?.whatsappProfile?.profilePictureUrl || null,
            companyLogoUrl: faviconFor(domain),
          }
        : null,
      liked: likedSet.has(p._id.toString()),
      isMine: p.userId.toString() === user.id,
    };
  });

  return NextResponse.json({
    posts,
    nextCursor: hasMore ? items[items.length - 1]._id.toString() : null,
  });
}

/**
 * POST /api/posts — author a new post.
 * Body: { body: string, attachment?: { url, type?, title?, imageUrl? }, weekSlug?, lessonSlug? }
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  await dbConnect();
  const { body, attachment, weekSlug, lessonSlug } = await req.json();
  const text = (body || "").trim();
  if (!text) return NextResponse.json({ error: "Body is required" }, { status: 400 });

  let cleanAttachment: any = undefined;
  if (attachment?.url) {
    try {
      const u = new URL(attachment.url);
      const host = u.hostname.toLowerCase();
      let type = attachment.type;
      if (!type) {
        if (host.includes("linkedin.com")) type = "linkedin";
        else if (host.includes("twitter.com") || host.includes("x.com")) type = "twitter";
        else if (host.includes("instagram.com")) type = "instagram";
        else if (host.includes("youtube.com") || host.includes("youtu.be")) type = "youtube";
        else type = "blog";
      }
      cleanAttachment = {
        url: u.toString(),
        type,
        title: attachment.title?.slice(0, 240),
        imageUrl: attachment.imageUrl?.slice(0, 1024),
      };
    } catch {
      return NextResponse.json({ error: "Invalid attachment URL" }, { status: 400 });
    }
  }

  const post = await Post.create({
    userId: user.id,
    body: text.slice(0, 5000),
    attachment: cleanAttachment,
    weekSlug,
    lessonSlug,
  });

  // Reward authoring (capped via daily ceiling enforced inside engine; here simple +20)
  await awardXp({
    userId: user.id,
    amount: 20,
    kind: "postPublished",
    weekSlug,
    lessonSlug,
    meta: { postId: post._id.toString() },
  });

  return NextResponse.json({ ok: true, id: post._id.toString() });
}
