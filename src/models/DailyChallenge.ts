import mongoose, { Schema, Document } from "mongoose";

export interface IDailyChallenge extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  challenges: {
    id: string;
    title: string;
    description: string;
    xp: number;
    type: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  totalXpEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailyChallengeSchema = new Schema<IDailyChallenge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    challenges: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        xp: { type: Number, default: 25 },
        type: { type: String },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
      },
    ],
    totalXpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DailyChallengeSchema.index({ userId: 1, date: 1 }, { unique: true });

export default (mongoose.models.AcademyDailyChallenge as mongoose.Model<IDailyChallenge>) ||
  mongoose.model<IDailyChallenge>("AcademyDailyChallenge", DailyChallengeSchema);
