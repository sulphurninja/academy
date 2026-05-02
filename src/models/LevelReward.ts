import mongoose, { Schema, Document } from "mongoose";

export interface ILevelReward extends Document {
  userId: mongoose.Types.ObjectId;
  level: number;
  aiCredits: number;
  walletCredits: number;
  claimedAt: Date;
}

const LevelRewardSchema = new Schema<ILevelReward>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: Number, required: true },
    aiCredits: { type: Number, default: 0 },
    walletCredits: { type: Number, default: 0 },
    claimedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

LevelRewardSchema.index({ userId: 1, level: 1 }, { unique: true });

export default (mongoose.models.LevelReward as mongoose.Model<ILevelReward>) ||
  mongoose.model<ILevelReward>("LevelReward", LevelRewardSchema);
