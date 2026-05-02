import mongoose, { Schema, Document } from "mongoose";

/**
 * Reach-out requests. When user A wants to connect with user B:
 *  1. A sends a request (status: "pending")
 *  2. B receives a notification and can accept/reject
 *  3. If accepted → both can see each other's email + WhatsApp number
 *
 * A unique index on (fromUserId, toUserId) prevents duplicates.
 */

export type ReachStatus = "pending" | "accepted" | "rejected";

export interface IReachRequest extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  status: ReachStatus;
  message?: string;
  respondedAt?: Date;
  createdAt: Date;
}

const ReachRequestSchema = new Schema<IReachRequest>(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    message: { type: String, maxlength: 300 },
    respondedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReachRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
ReachRequestSchema.index({ toUserId: 1, status: 1, createdAt: -1 });

export default (mongoose.models.AcademyReachRequest as mongoose.Model<IReachRequest>) ||
  mongoose.model<IReachRequest>("AcademyReachRequest", ReachRequestSchema);
