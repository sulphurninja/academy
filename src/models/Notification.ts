import mongoose, { Schema, Document } from "mongoose";

/**
 * Lightweight in-app notifications. Created server-side by post likes,
 * follows, comment replies, badge unlocks, and admin announcements.
 */

export type NotificationKind =
  | "follow"
  | "post_like"
  | "post_comment"
  | "comment_reply"
  | "badge_earned"
  | "level_up"
  | "announcement"
  | "lesson_published"
  | "reach_request"
  | "reach_accepted";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // recipient
  actorId?: mongoose.Types.ObjectId; // who did the thing (optional for system events)
  kind: NotificationKind;
  body: string;
  href?: string;
  meta?: Record<string, any>;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    kind: { type: String, required: true },
    body: { type: String, required: true, maxlength: 500 },
    href: String,
    meta: Schema.Types.Mixed,
    readAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, readAt: 1 });

export default (mongoose.models.AcademyNotification as mongoose.Model<INotification>) ||
  mongoose.model<INotification>("AcademyNotification", NotificationSchema);
