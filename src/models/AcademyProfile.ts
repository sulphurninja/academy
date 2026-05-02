/**
 * AcademyProfile — the *creator side* of a member's public profile.
 *
 * Stores everything the member chooses to publish on /u/[id]:
 *   - Cover image, bio, headline
 *   - Social handles (Instagram, LinkedIn, X, YouTube, Facebook, TikTok, etc.)
 *   - Personal website + custom links (socials free-form)
 *   - "Showcase" cards — promo posts, products, affiliate links, with images
 *   - Pinned community-post IDs
 *
 * One document per User, keyed by `userId`. Created lazily on first save.
 */

import mongoose, { Schema, Document } from "mongoose";

export type ShowcaseKind = "product" | "affiliate" | "post" | "link";

export interface ShowcaseItem {
  /** stable id (uuid-like). Lets the editor reorder/edit/delete items.  */
  id: string;
  kind: ShowcaseKind;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  /** Optional CTA label (defaults: "Shop", "Read", "Open"). */
  cta?: string;
  /** Optional badge (e.g. "10% off", "New", "Free trial"). */
  badge?: string;
  /** Free-form tag — used for filtering on the profile page. */
  tag?: string;
  /** Sort order — lower first. */
  order?: number;
}

export interface ProfileSocials {
  website?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string; // X / Twitter handle
  youtube?: string;
  facebook?: string;
  tiktok?: string;
  github?: string;
  whatsapp?: string;
  threads?: string;
  /** Free-form additional links {label, url}. */
  custom?: { id: string; label: string; url: string; icon?: string }[];
}

export interface IAcademyProfile extends Document {
  userId: mongoose.Types.ObjectId;
  /** Short hero line under the name (e.g. "Founder, Bloomroom · D2C Beauty"). */
  headline?: string;
  /** Long-form bio — markdown allowed but rendered as plain text for safety. */
  bio?: string;
  /** Cover image URL (1500×500-ish recommended). */
  coverUrl?: string;
  /** Override the WABA picture with a custom avatar (rare; we prefer WABA). */
  avatarOverrideUrl?: string;
  /** Where in the world they're based, free text. */
  location?: string;
  socials: ProfileSocials;
  showcase: ShowcaseItem[];
  /** Post IDs pinned to the top of their /u/[id] feed. */
  pinnedPostIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ShowcaseSchema = new Schema<ShowcaseItem>(
  {
    id: { type: String, required: true },
    kind: {
      type: String,
      enum: ["product", "affiliate", "post", "link"],
      default: "link",
    },
    title: { type: String, required: true, maxlength: 120 },
    description: { type: String, maxlength: 400 },
    url: { type: String, required: true },
    imageUrl: String,
    cta: { type: String, maxlength: 32 },
    badge: { type: String, maxlength: 32 },
    tag: { type: String, maxlength: 32 },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const SocialsSchema = new Schema<ProfileSocials>(
  {
    website: String,
    instagram: String,
    linkedin: String,
    twitter: String,
    youtube: String,
    facebook: String,
    tiktok: String,
    github: String,
    whatsapp: String,
    threads: String,
    custom: [
      new Schema(
        {
          id: { type: String, required: true },
          label: { type: String, required: true, maxlength: 40 },
          url: { type: String, required: true },
          icon: String,
        },
        { _id: false }
      ),
    ],
  },
  { _id: false }
);

const AcademyProfileSchema = new Schema<IAcademyProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    headline: { type: String, maxlength: 140 },
    bio: { type: String, maxlength: 2000 },
    coverUrl: String,
    avatarOverrideUrl: String,
    location: { type: String, maxlength: 80 },
    socials: { type: SocialsSchema, default: () => ({}) },
    showcase: { type: [ShowcaseSchema], default: [] },
    pinnedPostIds: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

export default (mongoose.models.AcademyProfile as mongoose.Model<IAcademyProfile>) ||
  mongoose.model<IAcademyProfile>("AcademyProfile", AcademyProfileSchema);
