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

  },
  {
    timestamps: true
  }
);


const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>("Member", memberSchema);

export default Member;