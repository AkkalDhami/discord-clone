import mongoose, { Document, Model, Schema } from "mongoose";

export interface IServer extends Document {
  _id: mongoose.Types.ObjectId;

  name: string;
  logo: string;
  inviteCode: string;

  profileId: mongoose.Types.ObjectId;
  // members: mongoose.Types.ObjectId[];

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
      type: String,
      default: null
    },
    inviteCode: {
      type: String,
      required: [true, "Invite code is required"],
      trim: true,
      unique: true
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "Profile ID is required"]
    },
    // members: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Member"
    //   }
    // ]
  },
  {
    timestamps: true
  }
);

// Indexes
serverSchema.index({ profileId: 1 });

const Server: Model<IServer> =
  mongoose.models.Server || mongoose.model<IServer>("Server", serverSchema);

export default Server;
