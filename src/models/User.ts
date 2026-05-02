/**
 * Mirror of the main Zaptick User model — only the fields ZapAcademy reads.
 * Uses bcryptjs (same hash) for `comparePassword`. Same collection as the main app.
 *
 * `wabaAccounts` is mirrored so the academy can filter to *only* members who
 * actually have a connected WhatsApp Business account (those are the members
 * that have a real company brand mark + are most active in the platform).
 */
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface WabaAccount {
  wabaId?: string;
  phoneNumberId?: string;
  businessName?: string;
  phoneNumber?: string;
  status?: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role?: string;
  isActive?: boolean;
  isOwner?: boolean;
  isSuperAdmin?: boolean;
  companyId?: mongoose.Types.ObjectId;
  wabaAccounts?: WabaAccount[];
  failedLoginCount?: number;
  lastFailedLoginAt?: Date;
  lockedUntil?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String },
    isActive: { type: Boolean, default: true },
    isOwner: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false },
    companyId: { type: Schema.Types.ObjectId, ref: "Company" },
    wabaAccounts: [
      {
        wabaId: String,
        phoneNumberId: String,
        businessName: String,
        phoneNumber: String,
        status: String,
      },
    ],
    failedLoginCount: { type: Number, default: 0 },
    lastFailedLoginAt: { type: Date },
    lockedUntil: { type: Date },
  },
  { timestamps: true, strict: false } // strict:false — main app may add fields we don't model
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
