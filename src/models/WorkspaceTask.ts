import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceTask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  priority: string;
  dueDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceTaskSchema = new Schema<IWorkspaceTask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, maxlength: 300 },
    category: {
      type: String,
      enum: ["marketing", "content", "client", "admin"],
      default: "marketing",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
    },
  },
  { timestamps: true }
);

WorkspaceTaskSchema.index({ userId: 1, status: 1 });

export default (mongoose.models.AcademyWorkspaceTask as mongoose.Model<IWorkspaceTask>) ||
  mongoose.model<IWorkspaceTask>("AcademyWorkspaceTask", WorkspaceTaskSchema);
