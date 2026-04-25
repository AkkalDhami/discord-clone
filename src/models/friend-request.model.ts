import mongoose, { Schema, Types, Model } from "mongoose";

const FRIEND_REQUEST_STATUS = ["pending", "accepted", "ignored"] as const;

export type FriendRequestStatus = (typeof FRIEND_REQUEST_STATUS)[number];

interface IFriendRequest {
  _id: Types.ObjectId;

  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: FriendRequestStatus;
  pairKey: string;

  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    pairKey: {
      type: String,
      required: true
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    status: {
      type: String,
      enum: FRIEND_REQUEST_STATUS,
      default: "pending"
    }
  },
  { timestamps: true }
);

friendRequestSchema.index({ receiver: 1, status: 1 });
friendRequestSchema.index({ sender: 1, status: 1 });
friendRequestSchema.index({ pairKey: 1 }, { unique: true });

const FriendRequest: Model<IFriendRequest> =
  mongoose.models.FriendRequest ||
  mongoose.model<IFriendRequest>("FriendRequest", friendRequestSchema);

export default FriendRequest;
