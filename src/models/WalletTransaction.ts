/**
 * Mirror of the main app's WalletTransaction. We append-only here when the
 * academy spends AI credits — never read it back. strict:false because the
 * main collection has more fields.
 */
import mongoose, { Schema, Document } from "mongoose";

export interface IWalletTransaction extends Document {
  companyId: mongoose.Types.ObjectId;
  amount: number;
  type: "credit" | "debit";
  status: "completed" | "pending" | "failed";
  description: string;
  reference: string;
  referenceType?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    companyId: { type: Schema.Types.ObjectId, required: true, ref: "Company" },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
    description: { type: String, required: true },
    reference: { type: String, required: true, unique: false },
    referenceType: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true, strict: false }
);

export default (mongoose.models.WalletTransaction as mongoose.Model<IWalletTransaction>) ||
  mongoose.model<IWalletTransaction>("WalletTransaction", WalletTransactionSchema);
