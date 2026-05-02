import mongoose, { Schema, Document } from "mongoose";

export interface IContentCard extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  channel?: string;
  dueDate?: Date;
  column: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContentCardSchema = new Schema<IContentCard>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 2000 },
    channel: {
      type: String,
      enum: ["whatsapp", "email", "rcs", "instagram", "voice", "blog", "other"],
    },
    dueDate: { type: Date },
    column: {
      type: String,
      enum: ["ideas", "drafts", "review", "scheduled", "published"],
      default: "ideas",
    },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ContentCardSchema.index({ userId: 1, column: 1, position: 1 });

export default (mongoose.models.AcademyContentCard as mongoose.Model<IContentCard>) ||
  mongoose.model<IContentCard>("AcademyContentCard", ContentCardSchema);
