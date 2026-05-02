import mongoose, { Schema, Document } from "mongoose";

/**
 * Community feed post. Authored from inside the academy. Optionally attaches
 * a single external link (LinkedIn / Twitter / Instagram / blog) so members
 * can share wins from other platforms back into the cohort.
 */

export interface IPostAttachment {
  url: string;
  /** "linkedin" | "twitter" | "instagram" | "youtube" | "blog" | "image" */
  type?: string;
  title?: string;
  imageUrl?: string;
}

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  body: string;
  attachment?: IPostAttachment;
  /** Optional context tag — pin a post to a lesson/week. */
  weekSlug?: string;
  lessonSlug?: string;
  /** Pre-computed counters — kept in sync via $inc. */
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  isHidden: boolean;
  hiddenAt?: Date;
  hiddenBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: { type: String, required: true, maxlength: 5000 },
    attachment: {
      url: String,
      type: String,
      title: String,
      imageUrl: String,
    },
    weekSlug: String,
    lessonSlug: String,
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false, index: true },
    isHidden: { type: Boolean, default: false, index: true },
    hiddenAt: Date,
    hiddenBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ weekSlug: 1, lessonSlug: 1, createdAt: -1 });

export default (mongoose.models.AcademyPost as mongoose.Model<IPost>) ||
  mongoose.model<IPost>("AcademyPost", PostSchema);
