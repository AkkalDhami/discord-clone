import Conversation from "@/models/conversation.model";
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
  type: "direct" | "group";
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
    console.log({ c: conversation });

    return conversation;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function createConversation({
  memberOneId,
  memberTwoId,
  serverId,
  type
}: {
  memberOneId: string;
  memberTwoId: string;
  serverId?: string;
  type: "direct" | "group";
}) {
  try {
    const conversation = await Conversation.create({
      participants: [memberOneId, memberTwoId],
      type,
      serverId
    });
    return conversation;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getOrCreateConversation2({
  memberOneId,
  memberTwoId,
  serverId,
  type
}: {
  memberOneId: string;
  memberTwoId: string;
  serverId?: string;
  type: "direct" | "group";
}) {
  let conversation =
    (await findConversation({ memberOneId, memberTwoId, serverId, type })) ||
    (await createConversation({ memberOneId, memberTwoId, serverId, type }));

  if (!conversation) {
    conversation = await createConversation({
      memberOneId,
      memberTwoId,
      serverId,
      type
    });
  }

  return conversation;
}

export async function getOrCreateConversation({
  memberOneId,
  memberTwoId,
  serverId,
  type
}: {
  memberOneId: string;
  memberTwoId: string;
  serverId?: string;
  type: "direct" | "group";
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
        participantsKey,
        ...(serverId && { serverId: new Types.ObjectId(serverId) }),
        participants: normalizedParticipants
      },
      {
        $setOnInsert: {
          participants: normalizedParticipants,
          participantsKey,
          type,
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
