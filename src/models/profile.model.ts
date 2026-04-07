import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProfile extends Document {
  _id: mongoose.Types.ObjectId;

  name: string;
  username: string;
  bio?: string;

  email: string;
  password: string;

  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;

  isDeleted: boolean;
  deletedAt?: Date;
  reActivateAvailableAt?: Date;

  avatar?: {
    public_id: string;
    url: string;
    size: number;
  };

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

    bio: {
      type: String,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
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
