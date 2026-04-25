import { ConversationType } from "@/app/(main)/conversations/[friendId]/page";
import dbConnect from "@/configs/db";
import Conversation, { ConversationTypes } from "@/models/conversation.model";
import Profile from "@/models/profile.model";
import { Types } from "mongoose";

async function findConversation({
  memberOneId,
  memberTwoId,
  serverId,
  type
}: {
  memberOneId: string;
  memberTwoId: string;
  serverId?: string;
  type: ConversationTypes;
}) {
  try {
    // const [conversation] = await Conversation.aggregate([
    //   {
    //     $match: {
    //       type,
    //       ...(serverId && { serverId: new Types.ObjectId(serverId) }),
    //       participants: [
    //         new Types.ObjectId(memberOneId),
    //         new Types.ObjectId(memberTwoId)
    //       ]
    //     }
    //   },

    //   {
    //     $match: {
    //       $expr: { $eq: [{ $size: "$participants" }, 2] }
    //     }
    //   },

    //   {
    //     $lookup: {
    //       from: "members",
    //       let: { memberIds: "$participants" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: { $in: ["$_id", "$$memberIds"] }
    //           }
    //         },

    //         // 🔗 Join Profile using profileId
    //         {
    //           $lookup: {
    //             from: "profiles",
    //             localField: "profileId",
    //             foreignField: "_id",
    //             as: "profile"
    //           }
    //         },

    //         {
    //           $unwind: {
    //             path: "$profile",
    //             preserveNullAndEmptyArrays: true
    //           }
    //         }
    //       ],
    //       as: "participants"
    //     }
    //   }
    // ]);

    const participants = [memberOneId, memberTwoId]
      .map(id => new Types.ObjectId(id))
      .sort((a, b) => a.toString().localeCompare(b.toString()));

    const conversation = await Conversation.findOne({
      type,
      ...(serverId && { serverId: new Types.ObjectId(serverId) }),
      participants
    });

    return conversation;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getFriendConversation({
  participants,
  type,
  cId
}: {
  cId?: string;
  participants: string[];
  type: ConversationTypes;
}) {
  try {
    const conversation = cId
      ? await Conversation.findOne({
          _id: cId,
          type
        })
      : await Conversation.findOne({
          type,
          participants: {
            $all: participants
          }
        });

    const users = await Profile.find({
      _id: { $in: conversation?.participants }
    }).select("username _id email name avatar");

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
  admin
}: {
  participants: string[];
  admin: string;
  name?: string;
  type: ConversationTypes;
}) {
  try {
    const mappedIds = participants
      .map(id => new Types.ObjectId(id))
      .sort((a, b) => a.toString().localeCompare(b.toString()));

    const participantsKey = mappedIds.join("_");
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

  const result = await getFriendConversation({
    cId,
    participants,
    type
  });

  const users = result?.users;
  let conversation = result?.conversation;

  if (!conversation) {
    conversation = await createFriendConversation({
      participants,
      admin,
      type,
      name
    });
  }

  if (!conversation || !users) {
    return null;
  }

  return {
    _id: conversation?._id?.toString(),
    participants: users?.map(u => ({
      _id: u?._id.toString(),
      name: u?.name,
      username: u?.username,
      email: u?.email,
      avatar: u?.avatar
    })),
    logo: conversation?.logo,
    name: conversation?.name,
    admin: conversation?.admin?.toString(),
    type: conversation?.type,
    lastMessage: conversation.lastMessage?.toString()
  };
}

// export async function getOrCreateConversation2({
//   memberOneId,
//   memberTwoId,
//   serverId,
//   type
// }: {
//   memberOneId: string;
//   memberTwoId: string;
//   serverId?: string;
//   type: ConversationTypes;
// }) {
//   let conversation =
//     (await findConversation({ memberOneId, memberTwoId, serverId, type })) ||
//     (await createConversation({ memberOneId, memberTwoId, serverId, type }));

//   if (!conversation) {
//     conversation = await createConversation({
//       memberOneId,
//       memberTwoId,
//       serverId,
//       type
//     });
//   }

//   return conversation;
// }

export async function getOrCreateConversation({
  memberOneId,
  memberTwoId,
  serverId,
  type,
  name
}: {
  memberOneId: string;
  memberTwoId: string;
  serverId?: string;
  name?: string;
  type: ConversationTypes;
}) {
  let conversation;
  const participants = [memberOneId, memberTwoId]
    .map(id => new Types.ObjectId(id))
    .sort((a, b) => a.toString().localeCompare(b.toString()));

  const normalizedParticipants = participants.map(id => id.toString()).sort();

  const participantsKey = normalizedParticipants.join("_");
  try {
    conversation = await Conversation.findOneAndUpdate(
      {
        type,
        name,
        participantsKey,
        ...(serverId && { serverId: new Types.ObjectId(serverId) }),
        participants: normalizedParticipants
      },
      {
        $setOnInsert: {
          participants: normalizedParticipants,
          participantsKey,
          type,
          name,
          ...(serverId && { serverId: new Types.ObjectId(serverId) })
        }
      },
      {
        upsert: true,
        returnDocument: "after"
      }
    ).populate({
      path: "participants",
      populate: {
        path: "profileId",
        select: "name username avatar email _id"
      }
    });

    return conversation;
  } catch (error) {
    const err = error as { code: number };
    if (err.code === 11000) {
      conversation = await Conversation.findOne({
        type,
        participantsKey,
        ...(serverId && { serverId: new Types.ObjectId(serverId) })
      }).populate({
        path: "participants",
        populate: {
          path: "profileId",
          select: "name username avatar email _id"
        }
      });
    } else {
      console.log(error);
      return null;
    }
  }
}
