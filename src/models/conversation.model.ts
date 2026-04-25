import { CONVERSATION_TYPES } from "@/constants";
import { IFile } from "@/interface";
import mongoose, { Document, Model, Schema } from "mongoose";

export type ConversationTypes = (typeof CONVERSATION_TYPES)[number];

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;

  serverId?: mongoose.Types.ObjectId;
  participantsKey: string;

  participants: mongoose.Types.ObjectId[];
  admin: mongoose.Types.ObjectId;
  type: ConversationTypes;

  name?: string;
  logo?: IFile;
  lastMessage?: mongoose.Types.ObjectId;

  deleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    name: {
      type: String,
      trim: true
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server"
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile"
    },
    logo: {
      public_id: String,
      url: String,
      size: Number
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member"
      }
    ],
    participantsKey: {
      type: String,
      required: true
    },
    deleted: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: CONVERSATION_TYPES,
      required: true
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    }
  },
  {
    timestamps: true
  }
);

conversationSchema.index(
  { participantsKey: 1, serverId: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "direct" }
  }
);

conversationSchema.index({ participants: 1, updatedAt: -1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", conversationSchema);

export default Conversation;
