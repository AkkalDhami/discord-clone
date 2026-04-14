import { IFile } from "@/interface";
import mongoose, { Document, Model, Schema } from "mongoose";

const MESSAGE_TYPES = ["TEXT", "FILE", "IMAGE"];

type MessageType = (typeof MESSAGE_TYPES)[number];

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;

  conversationId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;

  content: string;
  attachments?: IFile[];

  type: MessageType;

  mentions: mongoose.Types.ObjectId[];
  readBy: mongoose.Types.ObjectId[];
  replyTo?: mongoose.Types.ObjectId;
  edited: boolean;

  channelId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;

  deleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: function () {
        return !this.channelId;
      }
    },
    content: {
      type: String,
      trim: true
    },
    attachments: [
      {
        public_id: String,
        url: String,
        size: Number
      }
    ],
    type: {
      type: String,
      enum: MESSAGE_TYPES,
      default: "TEXT"
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: function () {
        return !this.conversationId;
      }
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    deleted: {
      type: Boolean,
      default: false
    },
    edited: {
      type: Boolean,
      default: false
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member"
      }
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member"
      }
    ]
  },
  {
    timestamps: true
  }
);

messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;
