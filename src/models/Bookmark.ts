/**
 * Bookmark — a user's saved-for-later lesson reference.
 * Compound index on (userId, weekSlug, lessonSlug) so toggling is O(1).
 */
import mongoose, { Schema, Document } from "mongoose";

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  weekSlug: string;
  lessonSlug: string;
  /** Optional cached lesson title — saves a curriculum lookup on the list page. */
  title?: string;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekSlug: { type: String, required: true },
    lessonSlug: { type: String, required: true },
    title: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

BookmarkSchema.index(
  { userId: 1, weekSlug: 1, lessonSlug: 1 },
  { unique: true }
);
BookmarkSchema.index({ userId: 1, createdAt: -1 });

export default (mongoose.models.Bookmark as mongoose.Model<IBookmark>) ||
  mongoose.model<IBookmark>("Bookmark", BookmarkSchema);
