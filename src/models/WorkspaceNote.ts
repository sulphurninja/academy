import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceNote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceNoteSchema = new Schema<IWorkspaceNote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Untitled", maxlength: 200 },
    body: { type: String, default: "", maxlength: 50000 },
  },
  { timestamps: true }
);

WorkspaceNoteSchema.index({ userId: 1, updatedAt: -1 });

export default (mongoose.models.AcademyWorkspaceNote as mongoose.Model<IWorkspaceNote>) ||
  mongoose.model<IWorkspaceNote>("AcademyWorkspaceNote", WorkspaceNoteSchema);
