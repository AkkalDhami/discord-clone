import mongoose, { Model, Schema, Types } from "mongoose";

interface IFriendship {
  _id: Types.ObjectId;

  user: Types.ObjectId;
  friend: Types.ObjectId;
  createdAt: Date;
}

const friendshipSchema = new Schema<IFriendship>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    friend: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
friendshipSchema.index({ user: 1, friend: 1 }, { unique: true });

const Friendship: Model<IFriendship> =
  mongoose.models.Friendship ||
  mongoose.model<IFriendship>("Friendship", friendshipSchema);

export default Friendship;
