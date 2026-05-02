import mongoose, { Schema, Document } from "mongoose";

/**
 * Append-only XP ledger. Source of truth for the leaderboard, level math,
 * and the user's XP timeline. We never mutate or delete rows here.
 */

export interface IXpEvent extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  kind: string; // "videoComplete" | "quizPass" | "perfectQuiz" | "streak7" | …
  weekSlug?: string;
  lessonSlug?: string;
  meta?: Record<string, any>;
  createdAt: Date;
}

const XpEventSchema = new Schema<IXpEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    kind: { type: String, required: true },
    weekSlug: String,
    lessonSlug: String,
    meta: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

XpEventSchema.index({ userId: 1, createdAt: -1 });
XpEventSchema.index({ userId: 1, kind: 1, weekSlug: 1, lessonSlug: 1 });

export default (mongoose.models.AcademyXpEvent as mongoose.Model<IXpEvent>) ||
  mongoose.model<IXpEvent>("AcademyXpEvent", XpEventSchema);
