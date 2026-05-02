/**
 * Enriched profile fetcher: joins User + Company + XP + follower counts
 * + badge counts. The "academy member card" / profile page uses this.
 *
 * Membership filter: we only surface users who actually have a connected
 * WhatsApp Business Account (`wabaAccounts.0.wabaId` is set). These members
 * are real Zaptick customers, are likely to have a WABA profile picture, and
 * are the ones the academy is built around.
 */

import mongoose from "mongoose";
import dbConnect from "./db";
import User from "@/models/User";
import Company from "@/models/Company";
import XpEvent from "@/models/XpEvent";
import Follow from "@/models/Follow";
import BadgeEarned from "@/models/BadgeEarned";
import AcademyProfile, {
  type IAcademyProfile,
  type ProfileSocials,
  type ShowcaseItem,
} from "@/models/AcademyProfile";
import { domainFromEmail, faviconFor } from "./utils";
import { levelFromXp, type LevelInfo } from "./xp";

export type { ProfileSocials, ShowcaseItem } from "@/models/AcademyProfile";

export interface AcademyMember {
  id: string;
  name: string;
  email: string;
  /** Company display name from the Company collection. */
  companyName?: string;
  /** Industry / category — useful for "similar member" matchmaking. */
  companyIndustry?: string;
  companyCategory?: string;
  /** WhatsApp profile category & description. Used for AI ranking. */
  businessCategory?: string;
  businessDescription?: string;
  /**
   * Primary avatar to render. Prefer the WhatsApp Business profile picture
   * (the same image that appears in Zaptick → Dashboard → limit card). Falls
   * back to the company website favicon, then to nothing (initials chip).
   */
  avatarUrl?: string | null;
  /** Optional secondary brand mark (favicon) — used when avatar is initials. */
  companyLogoUrl?: string | null;
  companyDomain?: string | null;
  /** True if the user has a connected WABA. */
  hasWaba?: boolean;
  xp: number;
  level: LevelInfo;
  badgeCount: number;
  followers: number;
  following: number;
  isFollowing?: boolean; // relative to viewer
  isMe?: boolean;
  /** Set by the AI suggestion ranker — short reason this person matches you. */
  suggestionReason?: string | null;
  /** Member-controlled creator profile (cover, bio, socials, showcase). */
  profile?: AcademyMemberProfile;
}

export interface AcademyMemberProfile {
  headline?: string;
  bio?: string;
  coverUrl?: string;
  avatarOverrideUrl?: string;
  location?: string;
  socials: ProfileSocials;
  showcase: ShowcaseItem[];
  pinnedPostIds: string[];
}

function shapeProfile(doc: Partial<IAcademyProfile> | null | undefined): AcademyMemberProfile {
  return {
    headline: doc?.headline,
    bio: doc?.bio,
    coverUrl: doc?.coverUrl,
    avatarOverrideUrl: doc?.avatarOverrideUrl,
    location: doc?.location,
    socials: (doc?.socials as ProfileSocials) || {},
    showcase: ((doc?.showcase as ShowcaseItem[]) || []).slice().sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    ),
    pinnedPostIds: ((doc?.pinnedPostIds as any[]) || []).map((p) => p.toString()),
  };
}

const COMPANY_SELECT =
  "name brandConfig website industry category whatsappProfile";

interface CompanyDoc {
  _id: any;
  name?: string;
  website?: string;
  industry?: string;
  category?: string;
  whatsappProfile?: {
    profilePictureUrl?: string;
    businessCategory?: string;
    businessDescription?: string;
  };
}

function shape(
  user: { _id: any; name: string; email: string; companyId?: any },
  company: CompanyDoc | null,
  hasWaba: boolean,
  ctx: {
    xp: number;
    badgeCount: number;
    followers: number;
    following: number;
    isFollowing: boolean;
    viewerOid?: mongoose.Types.ObjectId | null;
  }
): AcademyMember {
  const domain =
    company?.website?.replace(/^https?:\/\//, "").replace(/\/.*$/, "") ||
    domainFromEmail(user.email);
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    companyName: company?.name,
    companyIndustry: company?.industry,
    companyCategory: company?.category,
    businessCategory: company?.whatsappProfile?.businessCategory,
    businessDescription: company?.whatsappProfile?.businessDescription,
    companyDomain: domain,
    avatarUrl: company?.whatsappProfile?.profilePictureUrl || null,
    companyLogoUrl: faviconFor(domain),
    hasWaba,
    xp: ctx.xp,
    level: levelFromXp(ctx.xp),
    badgeCount: ctx.badgeCount,
    followers: ctx.followers,
    following: ctx.following,
    isFollowing: ctx.isFollowing,
    isMe: ctx.viewerOid ? ctx.viewerOid.equals(user._id) : false,
  };
}

export async function getMember(
  userId: string | mongoose.Types.ObjectId,
  viewerId?: string | mongoose.Types.ObjectId
): Promise<AcademyMember | null> {
  await dbConnect();
  const oid = new mongoose.Types.ObjectId(userId.toString());

  const user = await User.findById(oid).lean<{
    _id: any;
    name: string;
    email: string;
    companyId?: any;
    wabaAccounts?: { wabaId?: string }[];
  }>();
  if (!user) return null;
  const hasWaba = !!user.wabaAccounts?.some((w) => !!w.wabaId);

  const [company, xpAgg, badgeCount, followers, following, isFollowing, profileDoc] =
    await Promise.all([
      user.companyId
        ? Company.findById(user.companyId)
            .select(COMPANY_SELECT)
            .lean<CompanyDoc>()
        : null,
      XpEvent.aggregate([
        { $match: { userId: oid } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      BadgeEarned.countDocuments({ userId: oid }),
      Follow.countDocuments({ followingId: oid }),
      Follow.countDocuments({ followerId: oid }),
      viewerId
        ? Follow.exists({
            followerId: new mongoose.Types.ObjectId(viewerId.toString()),
            followingId: oid,
          })
        : null,
      AcademyProfile.findOne({ userId: oid }).lean<IAcademyProfile>(),
    ]);

  const xp = xpAgg[0]?.total || 0;
  const member = shape(user, company || null, hasWaba, {
    xp,
    badgeCount,
    followers,
    following,
    isFollowing: !!isFollowing,
    viewerOid: viewerId
      ? new mongoose.Types.ObjectId(viewerId.toString())
      : null,
  });
  member.profile = shapeProfile(profileDoc);
  // If the member uploaded a custom avatar override, prefer it over WABA pic.
  if (member.profile.avatarOverrideUrl) {
    member.avatarUrl = member.profile.avatarOverrideUrl;
  }
  return member;
}

/**
 * Bulk-load member cards. Used for /members directory + suggested widget.
 *
 * - Filters to users with a connected WABA by default (`requireWaba`).
 * - Searches across user name/email AND company name.
 * - Returns enriched business context (industry, category, WhatsApp business
 *   description) so the suggested-members AI ranker can do its thing.
 */
export async function listMembers(opts: {
  viewerId?: string | mongoose.Types.ObjectId;
  search?: string;
  limit?: number;
  skip?: number;
  excludeIds?: string[];
  /** Default true — only include users with a wabaId. */
  requireWaba?: boolean;
}): Promise<{ members: AcademyMember[]; total: number }> {
  await dbConnect();
  const {
    viewerId,
    search,
    limit = 24,
    skip = 0,
    excludeIds = [],
    requireWaba = true,
  } = opts;

  const baseMatch: any = { isActive: { $ne: false } };
  if (requireWaba) {
    baseMatch["wabaAccounts.0.wabaId"] = { $exists: true, $ne: "" };
  }
  if (excludeIds.length) {
    baseMatch._id = {
      $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)),
    };
  }

  // Two-stage search: if `search` is set, we also match on company name. We
  // resolve company name → matching companyIds first, then OR with user fields.
  let companyIdsForSearch: mongoose.Types.ObjectId[] = [];
  if (search?.trim()) {
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const matchingCompanies = await Company.find({ name: re })
      .select("_id")
      .limit(200)
      .lean<{ _id: any }[]>();
    companyIdsForSearch = matchingCompanies.map((c: any) => c._id);
  }

  const filter: any = { ...baseMatch };
  if (search?.trim()) {
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { name: re },
      { email: re },
      ...(companyIdsForSearch.length
        ? [{ companyId: { $in: companyIdsForSearch } }]
        : []),
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("_id name email companyId wabaAccounts")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<{
        _id: any;
        name: string;
        email: string;
        companyId?: any;
        wabaAccounts?: { wabaId?: string }[];
      }[]>(),
    User.countDocuments(filter),
  ]);

  if (users.length === 0) return { members: [], total };

  const userIds = users.map((u) => u._id);
  const companyIds = users.map((u) => u.companyId).filter(Boolean);

  const [companies, xpRows, followerRows, followingRows, viewerFollows] =
    await Promise.all([
      companyIds.length
        ? Company.find({ _id: { $in: companyIds } })
            .select(COMPANY_SELECT)
            .lean<CompanyDoc[]>()
        : [],
      XpEvent.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: "$userId", total: { $sum: "$amount" } } },
      ]),
      Follow.aggregate([
        { $match: { followingId: { $in: userIds } } },
        { $group: { _id: "$followingId", c: { $sum: 1 } } },
      ]),
      Follow.aggregate([
        { $match: { followerId: { $in: userIds } } },
        { $group: { _id: "$followerId", c: { $sum: 1 } } },
      ]),
      viewerId
        ? Follow.find({
            followerId: new mongoose.Types.ObjectId(viewerId.toString()),
            followingId: { $in: userIds },
          })
            .select("followingId")
            .lean<{ followingId: any }[]>()
        : [],
    ]);

  const companyMap = new Map(
    companies.map((c: any) => [c._id.toString(), c])
  );
  const xpMap = new Map(xpRows.map((r: any) => [r._id.toString(), r.total]));
  const followerMap = new Map(
    followerRows.map((r: any) => [r._id.toString(), r.c])
  );
  const followingMap = new Map(
    followingRows.map((r: any) => [r._id.toString(), r.c])
  );
  const viewerFollowingSet = new Set(
    (viewerFollows as any[]).map((f) => f.followingId.toString())
  );
  const viewerOid = viewerId
    ? new mongoose.Types.ObjectId(viewerId.toString())
    : null;

  const members: AcademyMember[] = users.map((u: any) => {
    const xp = xpMap.get(u._id.toString()) || 0;
    const company = u.companyId
      ? companyMap.get(u.companyId.toString()) || null
      : null;
    const hasWaba = !!u.wabaAccounts?.some((w: any) => !!w?.wabaId);
    return shape(u, company, hasWaba, {
      xp,
      badgeCount: 0, // joined on the profile page; skipped here for perf
      followers: followerMap.get(u._id.toString()) || 0,
      following: followingMap.get(u._id.toString()) || 0,
      isFollowing: viewerFollowingSet.has(u._id.toString()),
      viewerOid,
    });
  });

  return { members, total };
}
