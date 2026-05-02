import mongoose, { Schema, Document } from "mongoose";

/**
 * One row per quiz submission. Lets us show attempts history,
 * detect first-try perfect runs, and prevent grinding for XP.
 */

export interface IQuizAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  weekSlug: string;
  lessonSlug: string;
  answers: Record<string, string | string[]>;
  score: number; // 0..1
  passed: boolean;
  perfect: boolean;
  xpAwarded: number;
  createdAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekSlug: { type: String, required: true },
    lessonSlug: { type: String, required: true },
    answers: { type: Schema.Types.Mixed, default: {} },
    score: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    perfect: { type: Boolean, default: false },
    xpAwarded: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

QuizAttemptSchema.index({ userId: 1, weekSlug: 1, lessonSlug: 1, createdAt: -1 });

export default (mongoose.models.AcademyQuizAttempt as mongoose.Model<IQuizAttempt>) ||
  mongoose.model<IQuizAttempt>("AcademyQuizAttempt", QuizAttemptSchema);
