/**
 * Slim mirror of the main Company collection — read-only from ZapAcademy.
 * We only model the fields we read; `strict: false` means we don't fight with
 * everything else the main app stores there.
 *
 * `whatsappProfile.profilePictureUrl` is the brand picture each company sets
 * inside Zaptick → Settings → WhatsApp profile. We use it as the user's
 * avatar across the academy so they recognize each other instantly.
 */
import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  website?: string;
  industry?: string;
  category?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: Date;
  /** Same balance the main Zaptick app spends on AI features. */
  aiCredits?: number;
  /** Main Zaptick wallet balance (rupees). */
  walletBalance?: number;
  whatsappProfile?: {
    profilePictureUrl?: string;
    profilePictureHandle?: string;
    about?: string;
    email?: string;
    website?: string;
    address?: string;
    businessCategory?: string;
    businessDescription?: string;
  };
}

const CompanySchema = new Schema<ICompany>(
  {
    name: String,
    website: String,
    industry: String,
    category: String,
    subscriptionPlan: String,
    subscriptionStatus: String,
    subscriptionEndDate: Date,
    aiCredits: { type: Number, default: 0, min: 0 },
    walletBalance: { type: Number, default: 0 },
    whatsappProfile: {
      profilePictureUrl: String,
      profilePictureHandle: String,
      about: String,
      email: String,
      website: String,
      address: String,
      businessCategory: String,
      businessDescription: String,
    },
  },
  { timestamps: true, strict: false }
);

export default (mongoose.models.Company as mongoose.Model<ICompany>) ||
  mongoose.model<ICompany>("Company", CompanySchema);
