import MESSAGE_TYPE from "@/enums/message.enum";
import { IFile } from "@/interface";

import mongoose, { Document, Model, Schema } from "mongoose";

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;

  conversation: mongoose.Types.ObjectId;
  memberId?: mongoose.Types.ObjectId;
  channelId?: mongoose.Types.ObjectId;
  serverId?: mongoose.Types.ObjectId;

  sender: mongoose.Types.ObjectId;

  content?: string;
  attachments?: IFile[];
  edited: boolean;

  type: MessageType;
  pinned: boolean;
  visibleTo: mongoose.Types.ObjectId[];

  // mentions: mongoose.Types.ObjectId[];
  // readBy: mongoose.Types.ObjectId[];
  replyTo?: mongoose.Types.ObjectId;
  reactions?: {
    emoji: string;
    reactedByUserIds: mongoose.Types.ObjectId[];
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation"
    },
    visibleTo: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Profile",
      default: []
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
      enum: [MESSAGE_TYPE.FILE, MESSAGE_TYPE.IMAGE, MESSAGE_TYPE.TEXT],
      default: MESSAGE_TYPE.TEXT
    },
    pinned: {
      type: Boolean,
      default: false
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member"
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel"
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server"
    },

    edited: {
      type: Boolean,
      default: false
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    // mentions: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Member"
    //   }
    // ],
    // readBy: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Member"
    //   }
    // ],
    reactions: [
      {
        emoji: { type: String, required: true },
        reactedByUserIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile"
          }
        ]
      }
    ]
  },
  {
    timestamps: true
  }
);

messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, createdAt: -1 });

messageSchema.index({
  visibleTo: 1,
  sender: 1
});

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;
