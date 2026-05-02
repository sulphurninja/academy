import mongoose, { Schema, Document } from "mongoose";

export interface ICampaignEvent extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  channel: string;
  status: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignEventSchema = new Schema<ICampaignEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    date: { type: Date, required: true },
    channel: {
      type: String,
      enum: ["whatsapp", "email", "rcs", "instagram", "voice", "other"],
      default: "whatsapp",
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "live", "completed"],
      default: "draft",
    },
    color: { type: String, default: "#10b981" },
  },
  { timestamps: true }
);

CampaignEventSchema.index({ userId: 1, date: 1 });

export default (mongoose.models.AcademyCampaignEvent as mongoose.Model<ICampaignEvent>) ||
  mongoose.model<ICampaignEvent>("AcademyCampaignEvent", CampaignEventSchema);
