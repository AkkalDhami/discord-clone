import { ConversationType } from "@/app/(main)/conversations/[friendId]/page";
import dbConnect from "@/configs/db";
import Conversation, { ConversationTypes } from "@/models/conversation.model";
import Profile from "@/models/profile.model";
import { Types } from "mongoose";

export async function getFriendConversation({
  participants,
  type,
  cId,
  participantsKey
}: {
  cId?: string;
  participantsKey?: string;
  participants: string[];
  type: ConversationTypes;
}) {
  try {
    const conversation = cId
      ? await Conversation.findOne({
          _id: cId,
          type,
          deleted: false
        })
      : await Conversation.findOne({
          type,
          participants: {
            $all: participants
          },
          participantsKey,
          deleted: false
        });

    const users = await Profile.find({
      _id: { $in: conversation?.participants }
    }).select("username _id email name avatar createdAt");

    return { conversation, users };
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function createFriendConversation({
  participants,
  type,
  name,
  participantsKey,
  admin
}: {
  participants: string[];
  admin: string;
  name?: string;
  type: ConversationTypes;
  participantsKey: string;
}) {
  try {
    const conversation = await Conversation.create({
      participants,
      type,
      admin,
      name,
      participantsKey
    });
    return conversation;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getOrCreateFriendConversation({
  participants,
  type,
  admin,
  name,
  cId
}: {
  participants: string[];
  admin: string;
  name?: string;
  type: ConversationTypes;
  cId?: string;
}): Promise<ConversationType | null> {
  await dbConnect();

  if (!participants.every(id => Types.ObjectId.isValid(id))) {
    console.log("Invalid participants:", participants);
    return null;
  }

  if (!Types.ObjectId.isValid(admin)) {
    console.log("Invalid admin:", admin);
    return null;
  }

  const participantObjectIds = participants
    .map(id => new Types.ObjectId(id))
    .sort((a, b) => a.toString().localeCompare(b.toString()));

  const participantsKey = participantObjectIds
    .map(id => id.toString())
    .join("_");

  const result = await getFriendConversation({
    cId,
    participants: participantObjectIds.map(id => id.toString()),
    type,
    participantsKey
  });

  const users = result?.users;
  let conversation = result?.conversation;

  if (!conversation) {
    conversation = await createFriendConversation({
      participants: participantObjectIds.map(id => id.toString()),
      admin,
      type,
      name,
      participantsKey
    });
  }

  if (!conversation || !users) return null;

  return {
    _id: conversation._id.toString(),
    participants: users.map(u => ({
      _id: u._id.toString(),
      name: u.name,
      username: u.username,
      email: u.email,
      avatar: u.avatar
    })),
    logo: conversation.logo,
    name: conversation.name,
    admin: conversation.admin.toString(),
    type: conversation.type,
    lastMessage: conversation.lastMessage?.toString()
  };
}

export async function getOrCreateConversation({
  participants,
  serverId,
  channelId,
  type,
  admin,
  name
}: {
  participants: string[];
  admin: string;
  serverId: string;
  channelId: string;
  name?: string;
  type: ConversationTypes;
}) {
  await dbConnect();

  if (!participants.every(id => Types.ObjectId.isValid(id))) {
    console.log("Invalid participants:", participants);
    return null;
  }

  if (!Types.ObjectId.isValid(admin)) {
    console.log("Invalid admin:", admin);
    return null;
  }

  const participantObjectIds = participants
    .map(id => new Types.ObjectId(id))
    .sort((a, b) => a.toString().localeCompare(b.toString()));

  const participantsKey = participantObjectIds
    .map(id => id.toString())
    .join("_");

  const result = await getConversation({
    participants: participantObjectIds.map(id => id.toString()),
    type,
    participantsKey,
    serverId,
    channelId
  });

  const users = result?.users;
  let conversation = result?.conversation;

  if (!conversation) {
    conversation = await createConversation({
      participants: participantObjectIds.map(id => id.toString()),
      admin,
      type,
      name,
      participantsKey,
      serverId,
      channelId
    });
  }

  if (!conversation || !users) return null;

  return {
    _id: conversation._id.toString(),
    participants: users.map(u => ({
      _id: u._id.toString(),
      name: u.name,
      username: u.username,
      email: u.email,
      avatar: u.avatar
    })),
    logo: conversation.logo,
    name: conversation.name,
    admin: conversation.admin.toString(),
    type: conversation.type,
    lastMessage: conversation.lastMessage?.toString()
  };
}

export async function getConversation({
  participants,
  type,
  cId,
  participantsKey,
  serverId,
  channelId
}: {
  cId?: string;
  participantsKey?: string;
  participants: string[];
  type: ConversationTypes;
  serverId: string;
  channelId: string;
}) {
  try {
    const conversation = cId
      ? await Conversation.findOne({
          _id: cId,
          type,
          serverId,
          channelId,
          deleted: false
        })
      : await Conversation.findOne({
          serverId,
          channelId,
          type,
          participants: {
            $all: participants
          },
          participantsKey,
          deleted: false
        });

    const users = await Profile.find({
      _id: { $in: conversation?.participants }
    });
    // .select("username _id email name avatar createdAt");

    return { conversation, users };
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function createConversation({
  participants,
  type,
  name,
  participantsKey,
  admin,
  channelId,
  serverId
}: {
  participants: string[];
  admin: string;
  name?: string;
  type: ConversationTypes;
  participantsKey: string;
  serverId: string;
  channelId: string;
}) {
  try {
    const conversation = await Conversation.create({
      participants,
      type,
      serverId,
      channelId,
      admin,
      name,
      participantsKey
    });
    return conversation;
  } catch (error) {
    console.log(error);
    return null;
  }
}
