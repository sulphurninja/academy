import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  weekSlug: string;
  lessonSlug: string;
  body: string;
  parentId?: mongoose.Types.ObjectId; // for replies
  likes: mongoose.Types.ObjectId[];
  isPinned?: boolean;
  isHidden?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekSlug: { type: String, required: true },
    lessonSlug: { type: String, required: true },
    body: { type: String, required: true, maxlength: 4000 },
    parentId: { type: Schema.Types.ObjectId, ref: "AcademyComment" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isPinned: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ weekSlug: 1, lessonSlug: 1, createdAt: -1 });

export default (mongoose.models.AcademyComment as mongoose.Model<IComment>) ||
  mongoose.model<IComment>("AcademyComment", CommentSchema);
