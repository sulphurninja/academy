import mongoose, { Schema, Document } from "mongoose";

/**
 * One row per user. We update this on every authenticated request via the
 * /api/me/streak endpoint. `lastActiveDay` is the user-local YYYY-MM-DD.
 */

export interface IStreak extends Document {
  userId: mongoose.Types.ObjectId;
  current: number;
  longest: number;
  lastActiveDay?: string; // ISO YYYY-MM-DD (UTC; we keep it simple)
  freezeTokens: number; // optional "skip a day" tokens
  updatedAt: Date;
}

const StreakSchema = new Schema<IStreak>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDay: String,
    freezeTokens: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default (mongoose.models.AcademyStreak as mongoose.Model<IStreak>) ||
  mongoose.model<IStreak>("AcademyStreak", StreakSchema);
