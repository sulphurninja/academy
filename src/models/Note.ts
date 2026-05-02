import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  weekSlug: string;
  lessonSlug: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekSlug: { type: String, required: true },
    lessonSlug: { type: String, required: true },
    body: { type: String, default: "", maxlength: 10000 },
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1, weekSlug: 1, lessonSlug: 1 }, { unique: true });

export default (mongoose.models.AcademyNote as mongoose.Model<INote>) ||
  mongoose.model<INote>("AcademyNote", NoteSchema);
