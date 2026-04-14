import ChannelType from "@/enums/channel.enum";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChannel extends Document {
  _id: mongoose.Types.ObjectId;

  name: string;
  type: ChannelType;
  serverId: mongoose.Types.ObjectId;
  profileId: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {},
  {
    timestamps: true
  }
);

const Channel: Model<IChannel> =
  mongoose.models.Channel || mongoose.model<IChannel>("Channel", channelSchema);

export default Channel;
