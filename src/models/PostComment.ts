import mongoose, { Schema, Document } from "mongoose";

export interface IPostComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  body: string;
  parentId?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostCommentSchema = new Schema<IPostComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "AcademyPost", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: { type: String, required: true, maxlength: 4000 },
    parentId: { type: Schema.Types.ObjectId, ref: "AcademyPostComment" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PostCommentSchema.index({ postId: 1, createdAt: -1 });

export default (mongoose.models.AcademyPostComment as mongoose.Model<IPostComment>) ||
  mongoose.model<IPostComment>("AcademyPostComment", PostCommentSchema);
