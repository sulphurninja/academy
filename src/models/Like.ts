import mongoose, { Schema, Document } from "mongoose";

export interface ILike extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "AcademyPost", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });
LikeSchema.index({ postId: 1 });

export default (mongoose.models.AcademyLike as mongoose.Model<ILike>) ||
  mongoose.model<ILike>("AcademyLike", LikeSchema);
