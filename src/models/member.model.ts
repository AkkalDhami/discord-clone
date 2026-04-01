import MemberRole from "@/enums/role.enum";
import mongoose, { Document, Model, Schema } from "mongoose";


export interface IMember extends Document {
  _id: mongoose.Types.ObjectId;

  role: MemberRole;
  profileId: mongoose.Types.ObjectId;
  serverId: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    role: {
      type: String,
      enum: [MemberRole.ADMIN, MemberRole.MODERATOR, MemberRole.MEMBER],
      default: MemberRole.MEMBER
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "Profile ID is required"]
    },
    serverId: {
      type: Schema.Types.ObjectId,
      ref: "Server",
      required: [true, "Server ID is required"]
    }
  },
  {
    timestamps: true
  }
);

// Indexes
memberSchema.index({ profileId: 1 });
memberSchema.index({ serverId: 1 });

const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>("Member", memberSchema);

export default Member;