import mongoose, { Schema, Document } from "mongoose";

/**
 * One row per (userId, lesson). Idempotent — we upsert.
 * `videoCompletedAt` flips when video reaches 90%+. `quizPassedAt` flips when
 * the quiz is passed (best score is preserved).
 */

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  weekSlug: string;
  lessonSlug: string;
  videoCompletedAt?: Date;
  videoXpAwardedAt?: Date;
  quizPassedAt?: Date;
  quizPerfectAt?: Date;
  quizBestScore?: number; // 0..1
  quizAttempts: number;
  challengeCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekSlug: { type: String, required: true },
    lessonSlug: { type: String, required: true },
    videoCompletedAt: Date,
    videoXpAwardedAt: Date,
    quizPassedAt: Date,
    quizPerfectAt: Date,
    quizBestScore: Number,
    quizAttempts: { type: Number, default: 0 },
    challengeCompletedAt: Date,
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, weekSlug: 1, lessonSlug: 1 }, { unique: true });

export default (mongoose.models.AcademyProgress as mongoose.Model<IProgress>) ||
  mongoose.model<IProgress>("AcademyProgress", ProgressSchema);
