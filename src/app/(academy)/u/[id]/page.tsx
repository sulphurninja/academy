import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import {
  Award,
  CheckCircle2,
  Sparkles,
  Trophy,
  Mail,
  Building2,
  ArrowLeft,
  Flame,
  MapPin,
  Pencil,
  Globe,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  Github,
  ExternalLink,
  Pin,
  ShoppingBag,
  Megaphone,
  FileText,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getMember, type AcademyMember } from "@/lib/profile";
import dbConnect from "@/lib/db";
import BadgeEarned from "@/models/BadgeEarned";
import Streak from "@/models/Streak";
import Progress from "@/models/Progress";
import Post from "@/models/Post";
import User from "@/models/User";
import Company from "@/models/Company";
import Like from "@/models/Like";
import { Avatar } from "@/components/ui/avatar";
import FollowButton from "@/components/academy/FollowButton";
import ReachButton from "@/components/academy/ReachButton";
import PostCard from "@/components/academy/PostCard";
import { BADGES, TIER_STYLE } from "@/lib/badges";
import XpBar from "@/components/academy/XpBar";
import { fmtNumber } from "@/lib/utils";
import { totalLessons } from "@/lib/curriculum";
import ReachRequest from "@/models/ReachRequest";
import ProfilePosts from "./_posts";
import InlineCoverEditor from "@/components/academy/InlineCoverEditor";
import InlineAvatarEditor from "@/components/academy/InlineAvatarEditor";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  const viewer = await getCurrentUser();
  if (!viewer) redirect("/login");

  const member = await getMember(id, viewer.id);
  if (!member) notFound();

  await dbConnect();
  const me = new mongoose.Types.ObjectId(id);
  const viewerOid = new mongoose.Types.ObjectId(viewer.id);

  const pinIds = (member.profile?.pinnedPostIds || [])
    .filter((s) => mongoose.Types.ObjectId.isValid(s))
    .map((s) => new mongoose.Types.ObjectId(s));

  const isMe = viewerOid.equals(me);

  const [earned, streak, passedCount, pinnedRaw, viewerLikes, reachSent, reachReceived] = await Promise.all([
    BadgeEarned.find({ userId: me }).select("badgeId").lean<{ badgeId: string }[]>(),
    Streak.findOne({ userId: me }).lean<{ current: number; longest: number }>(),
    Progress.countDocuments({ userId: me, quizPassedAt: { $exists: true } }),
    pinIds.length
      ? Post.find({ _id: { $in: pinIds }, isHidden: { $ne: true } })
          .lean<any[]>()
      : [],
    pinIds.length
      ? Like.find({ userId: viewerOid, postId: { $in: pinIds } })
          .select("postId")
          .lean<{ postId: any }[]>()
      : [],
    isMe ? null : ReachRequest.findOne({ fromUserId: viewerOid, toUserId: me, status: "accepted" }).lean(),
    isMe ? null : ReachRequest.findOne({ fromUserId: me, toUserId: viewerOid, status: "accepted" }).lean(),
  ]);

  const isMutuallyConnected = !!(reachSent || reachReceived);

  // Hydrate pinned posts in the order the user pinned them
  const pinnedMap = new Map(pinnedRaw.map((p: any) => [p._id.toString(), p]));
  const orderedPinned = pinIds
    .map((oid) => pinnedMap.get(oid.toString()))
    .filter(Boolean) as any[];

  // Fetch authors for pinned posts (could be just `member` if all are theirs,
  // but Post.userId may differ — stay defensive)
  const authorIds = Array.from(
    new Set(orderedPinned.map((p) => p.userId.toString()))
  );
  const [authors, authorCompanies] = await Promise.all([
    User.find({ _id: { $in: authorIds } })
      .select("_id name email companyId")
      .lean<{ _id: any; name: string; email: string; companyId?: any }[]>(),
    Company.find({
      _id: {
        $in: (
          await User.find({ _id: { $in: authorIds } })
            .select("companyId")
            .lean<{ companyId?: any }[]>()
        )
          .map((u) => u.companyId)
          .filter(Boolean),
      },
    })
      .select("name whatsappProfile.profilePictureUrl")
      .lean<{ _id: any; name?: string; whatsappProfile?: { profilePictureUrl?: string } }[]>(),
  ]);

  const authorMap = new Map(authors.map((a: any) => [a._id.toString(), a]));
  const companyMap = new Map(
    authorCompanies.map((c: any) => [c._id.toString(), c])
  );
  const likedSet = new Set(
    (viewerLikes as any[]).map((l) => l.postId.toString())
  );

  const earnedSet = new Set(earned.map((b) => b.badgeId));
  const earnedDefs = BADGES.filter((b) => earnedSet.has(b.id));
  const lessonPct = Math.round((passedCount / Math.max(1, totalLessons())) * 100);

  const profile = member.profile;
  const socials = profile?.socials || {};
  const showcase = (profile?.showcase || []).slice().sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const socialChips = [
    { url: socials.website, icon: <Globe className="h-3.5 w-3.5" />, label: "Website" },
    { url: socials.instagram, icon: <Instagram className="h-3.5 w-3.5" />, label: "Instagram" },
    { url: socials.linkedin, icon: <Linkedin className="h-3.5 w-3.5" />, label: "LinkedIn" },
    { url: socials.twitter, icon: <SvgX />, label: "X" },
    { url: socials.youtube, icon: <Youtube className="h-3.5 w-3.5" />, label: "YouTube" },
    { url: socials.facebook, icon: <Facebook className="h-3.5 w-3.5" />, label: "Facebook" },
    { url: socials.tiktok, icon: <SvgTikTok />, label: "TikTok" },
    { url: socials.threads, icon: <SvgThreads />, label: "Threads" },
    { url: socials.github, icon: <Github className="h-3.5 w-3.5" />, label: "GitHub" },
    { url: socials.whatsapp, icon: <SvgWA />, label: "WhatsApp" },
  ].filter((s) => !!s.url);

  const customSocials = (socials.custom || []).filter((c) => c.url && c.label);

  return (
    <div className="space-y-6">
      <Link
        href="/members"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-bold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All members
      </Link>

      {/* ── Cover hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div
          className="relative h-44 sm:h-60 bg-gradient-to-br from-emerald-100 via-cyan-50 to-amber-50 bg-cover bg-center"
          style={
            profile?.coverUrl
              ? { backgroundImage: `url(${profile.coverUrl})` }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          <InlineCoverEditor
            editable={!!member.isMe}
            hasCover={!!profile?.coverUrl}
          />
        </div>

        <div className="px-6 sm:px-8 -mt-14 sm:-mt-16 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <div className="relative inline-block">
              <Avatar
                name={member.name}
                email={member.email}
                src={member.avatarUrl || undefined}
                overlayUrl={member.avatarUrl ? undefined : member.companyLogoUrl || undefined}
                size={112}
                ring
                className="ring-4 ring-white shadow-md"
              />
              <InlineAvatarEditor editable={!!member.isMe} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {member.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  <Sparkles className="h-2.5 w-2.5" />
                  L{member.level.level} · {member.level.title}
                </span>
              </div>
              {profile?.headline && (
                <div className="mt-1 text-sm text-slate-700 font-medium">
                  {profile.headline}
                </div>
              )}
              <div className="mt-1.5 flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                {member.companyName && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {member.companyName}
                  </span>
                )}
                {profile?.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {profile.location}
                  </span>
                )}
                {(isMe || isMutuallyConnected) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {member.email}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm">
                <Link href={`/u/${member.id}/connections?tab=followers`} className="hover:text-emerald-700 transition-colors">
                  <span className="font-extrabold text-slate-900">{fmtNumber(member.followers)}</span>
                  <span className="text-slate-500 ml-1">followers</span>
                </Link>
                <Link href={`/u/${member.id}/connections?tab=following`} className="hover:text-emerald-700 transition-colors">
                  <span className="font-extrabold text-slate-900">{fmtNumber(member.following)}</span>
                  <span className="text-slate-500 ml-1">following</span>
                </Link>
                <div>
                  <span className="font-extrabold text-slate-900">{fmtNumber(earnedDefs.length)}</span>
                  <span className="text-slate-500 ml-1">badges</span>
                </div>
              </div>

              {/* Social chips */}
              {(socialChips.length > 0 || customSocials.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {socialChips.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 px-2.5 h-7 text-[11px] font-bold text-slate-700"
                    >
                      <span className="text-slate-500">{s.icon}</span>
                      {s.label}
                    </a>
                  ))}
                  {customSocials.map((c) => (
                    <a
                      key={c.id}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 px-2.5 h-7 text-[11px] font-bold text-slate-700"
                    >
                      <Link2 className="h-3 w-3 text-slate-500" />
                      {c.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {member.isMe ? (
                <Link
                  href="/settings/profile"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 px-3 h-10 text-xs font-bold text-slate-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit profile
                </Link>
              ) : (
                <>
                  <FollowButton userId={member.id} initialIsFollowing={member.isFollowing} />
                  <ReachButton userId={member.id} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────── */}
      {profile?.bio && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-extrabold text-slate-900 mb-2">About</h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {profile.bio}
          </p>
        </section>
      )}

      <div className="grid lg:grid-cols-[1fr,360px] gap-6">
        <div className="space-y-6">
          {/* ── Showcase ────────────────────────────────────────── */}
          {showcase.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Showcase</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Products, posts, and links {member.isMe ? "you" : member.name.split(" ")[0]} {member.isMe ? "want" : "wants"} to share.
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-bold">
                  {showcase.length} {showcase.length === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {showcase.map((it) => (
                  <ShowcaseCard key={it.id} item={it} />
                ))}
              </div>
            </section>
          )}

          {/* ── Pinned posts ────────────────────────────────────── */}
          {orderedPinned.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Pinned posts</h3>
              </div>
              <div className="space-y-3">
                {orderedPinned.map((p: any) => {
                  const author = authorMap.get(p.userId.toString());
                  const company = author?.companyId
                    ? companyMap.get(author.companyId.toString())
                    : null;
                  const wabaPic = company?.whatsappProfile?.profilePictureUrl || null;
                  return (
                    <PostCard
                      key={p._id.toString()}
                      post={{
                        id: p._id.toString(),
                        body: p.body,
                        attachment: p.attachment || null,
                        createdAt: p.createdAt,
                        likeCount: p.likeCount || 0,
                        commentCount: p.commentCount || 0,
                        isPinned: true,
                        liked: likedSet.has(p._id.toString()),
                        isMine: p.userId.toString() === viewer.id,
                        author: {
                          id: author?._id?.toString() || p.userId.toString(),
                          name: author?.name || "Member",
                          email: author?.email || "",
                          companyName: company?.name || undefined,
                          avatarUrl: wabaPic || undefined,
                        },
                      }}
                      isAdmin={!!viewer.isAdmin}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Posts feed ──────────────────────────────────────── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">Posts</h3>
            <ProfilePosts userId={member.id} viewerIsAdmin={!!viewer.isAdmin} />
          </section>

          {/* ── Badges ──────────────────────────────────────────── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900">Badges earned</h3>
              <span className="text-[11px] text-slate-500">
                {earnedDefs.length} / {BADGES.length}
              </span>
            </div>
            {earnedDefs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No badges yet.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {earnedDefs.slice(0, 12).map((b) => {
                  const t = TIER_STYLE[b.tier];
                  return (
                    <div
                      key={b.id}
                      className={`rounded-xl bg-gradient-to-br ring-2 ${t.ring} ${t.bg} p-3 text-center`}
                    >
                      <div className="text-2xl">{b.emoji}</div>
                      <div className="text-[11px] font-bold text-slate-800 mt-1">{b.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <XpBar xp={member.xp} level={member.level} />
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-2">
              Snapshot
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-slate-500 inline-flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5" /> Total XP
                </span>
                <span className="font-extrabold text-amber-600">{fmtNumber(member.xp)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-500 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Lessons aced
                </span>
                <span className="font-bold text-slate-900">{passedCount}/{totalLessons()}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-500 inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Curriculum
                </span>
                <span className="font-bold text-emerald-700">{lessonPct}%</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-500 inline-flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-500" /> Streak
                </span>
                <span className="font-bold text-amber-700">
                  {streak?.current || 0}d · best {streak?.longest || 0}d
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-500 inline-flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" /> Badges
                </span>
                <span className="font-bold text-slate-900">{earnedDefs.length}</span>
              </li>
            </ul>
          </section>

          {member.isMe && showcase.length === 0 && !profile?.bio && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div className="text-sm font-extrabold text-slate-900 mb-1">
                Your profile is empty
              </div>
              <p className="text-xs text-slate-600">
                Add a bio, your socials, and a showcase of your work — this is what
                everyone sees first.
              </p>
              <Link
                href="/settings/profile"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 h-9 text-xs font-extrabold text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
                Set up profile
              </Link>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ─── Showcase card ─────────────────────────────────────────────── */

function ShowcaseCard({
  item,
}: {
  item: NonNullable<AcademyMember["profile"]>["showcase"][number];
}) {
  const kindIcon: Record<string, React.ReactNode> = {
    product: <ShoppingBag className="h-3.5 w-3.5" />,
    affiliate: <Megaphone className="h-3.5 w-3.5" />,
    post: <FileText className="h-3.5 w-3.5" />,
    link: <Link2 className="h-3.5 w-3.5" />,
  };
  const cta = item.cta || (item.kind === "product" ? "Shop" : item.kind === "post" ? "Read" : "Open");

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col"
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-36 w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-24 w-full bg-gradient-to-br from-emerald-50 via-cyan-50 to-amber-50 flex items-center justify-center text-emerald-600">
          {kindIcon[item.kind]}
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-600">
            {kindIcon[item.kind]}
            {item.kind}
          </span>
          {item.badge && (
            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-700">
              {item.badge}
            </span>
          )}
        </div>
        <div className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
          {item.title}
        </div>
        {item.description && (
          <div className="text-[12px] text-slate-500 mt-1 line-clamp-2 leading-snug">
            {item.description}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
          <span className="truncate">{safeHost(item.url)}</span>
          <span className="inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            {cta}
            <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </a>
  );
}

function safeHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 32);
  }
}

/* ─── Brand SVGs not in lucide ─────────────────────────────────── */
function SvgX() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M18.244 2H21.5l-7.453 8.514L23 22h-6.84l-5.353-6.997L4.7 22H1.44l7.96-9.105L1 2h6.99l4.84 6.4L18.243 2Zm-2.398 18h1.806L7.273 4H5.34l10.506 16Z" />
    </svg>
  );
}
function SvgTikTok() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M16.5 3a4.5 4.5 0 0 0 4.5 4.5v3a7.5 7.5 0 0 1-4.5-1.5v6.75a6.75 6.75 0 1 1-6.75-6.75c.255 0 .505.014.75.04V12a3.75 3.75 0 1 0 3 3.675V3h3Z" />
    </svg>
  );
}
function SvgThreads() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M12 2C6.5 2 2 6 2 11.4c0 5.5 3.6 10.6 10 10.6 5.5 0 9.6-3.7 9.6-9.4 0-5.5-3.4-8.4-7.7-8.4-3.6 0-6 2-6.7 4.5l1.7.6c.5-1.7 2.1-3 4.8-3 3 0 5 2.1 5 5.6 0 4-2.7 6.5-7.1 6.5-4.4 0-7.5-3.5-7.5-8.2C4.1 6.4 7.5 4 12 4c2.7 0 5.1.9 7.1 2.7l1-1.4C17.8 3.1 15 2 12 2Z" />
    </svg>
  );
}
function SvgWA() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.412 3.488 11.82 11.82 0 0 1 3.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}
