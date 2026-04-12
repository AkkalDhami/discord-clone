import ChannelType from "@/enums/channel.enum";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChannel extends Document {
  _id: mongoose.Types.ObjectId;

  name: string;
  type: ChannelType;
  serverId: mongoose.Types.ObjectId;
  profileId: mongoose.Types.ObjectId;

  categoryId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true
    },
    type: {
      type: String,
      enum: [ChannelType.TEXT, ChannelType.AUDIO, ChannelType.VIDEO],
      default: ChannelType.TEXT
    },
    serverId: {
      type: Schema.Types.ObjectId,
      ref: "Server",
      required: [true, "Server ID is required"]
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "Profile ID is required"]
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category"
    }
  },
  {
    timestamps: true
  }
);

channelSchema.index({ serverId: 1 });

channelSchema.index({ profileId: 1 });

const Channel: Model<IChannel> =
  mongoose.models.Channel || mongoose.model<IChannel>("Channel", channelSchema);

export default Channel;
