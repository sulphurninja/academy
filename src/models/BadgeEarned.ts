import mongoose, { Schema, Document } from "mongoose";

export interface IBadgeEarned extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: string;
  earnedAt: Date;
  meta?: Record<string, any>;
}

const BadgeEarnedSchema = new Schema<IBadgeEarned>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    badgeId: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
    meta: Schema.Types.Mixed,
  },
  { timestamps: false }
);

BadgeEarnedSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export default (mongoose.models.AcademyBadgeEarned as mongoose.Model<IBadgeEarned>) ||
  mongoose.model<IBadgeEarned>("AcademyBadgeEarned", BadgeEarnedSchema);
