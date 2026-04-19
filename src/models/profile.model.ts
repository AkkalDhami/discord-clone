import { IFile } from "@/interface";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProfile extends Document {
  _id: mongoose.Types.ObjectId;

  name: string;
  username: string;
  bio?: string;

  email: string;
  password?: string;

  isEmailVerified: boolean;

  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;

  provider: "google" | "github" | "local";
  providerAccountId?: string;

  isDeleted: boolean;
  deletedAt?: Date;
  reActivateAvailableAt?: Date;

  avatar?: IFile;

  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    bio: {
      type: String,
      trim: true
    },

    provider: {
      type: String,
      enum: ["google", "github", "local"],
      required: true,
      default: "local"
    },

    providerAccountId: {
      type: String,
      unique: true,
      sparse: true
    },

    password: {
      type: String,
      trim: true,
      select: false
    },

    avatar: {
      public_id: String,
      url: String,
      size: Number
    },
    failedLoginAttempts: {
      type: Number,
      required: true,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    reActivateAvailableAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", profileSchema);

export default Profile;
