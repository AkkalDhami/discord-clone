import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  name: string;
  email: string;

  avatarUrl?: string;
  servers: mongoose.Types.ObjectId[];
  channels: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    avatarUrl: {
      type: String,
      default: null
    },
    servers: {
      type: [Schema.Types.ObjectId],
      ref: "Server",
      default: []
    },
    channels: {
      type: [Schema.Types.ObjectId],
      ref: "Channel",
      default: []
    }
  },
  {
    timestamps: true
  }
);


const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", profileSchema);

export default Profile;