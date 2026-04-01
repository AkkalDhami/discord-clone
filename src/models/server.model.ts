import mongoose, { Document, Model, Schema } from "mongoose";
import { IAvatar } from "./profile.model";


export interface IServer extends Document {
  _id: mongoose.Types.ObjectId;

  name: string;
  logo: IAvatar;
  inviteCode: string;

  profileId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  // channels: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const serverSchema = new Schema<IServer>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    logo: {
      public_id: String,
      url: String,
      size: Number
    },
    inviteCode: {
      type: String,
      required: [true, "Invite code is required"],
      trim: true
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "Profile ID is required"]
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member"
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes
serverSchema.index({ profileId: 1 });
serverSchema.index({ inviteCode: 1 });

const Server: Model<IServer> =
  mongoose.models.Server || mongoose.model<IServer>("Server", serverSchema);

export default Server;