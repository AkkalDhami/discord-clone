import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;

  name: string;
  private: boolean;

  serverId: mongoose.Types.ObjectId;
  profileId: mongoose.Types.ObjectId;

  privateMembers?: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true
    },
    private: {
      type: Boolean,
      default: false
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
    privateMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
        default: []
      }
    ]
  },
  {
    timestamps: true
  }
);

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);

export default Category;
