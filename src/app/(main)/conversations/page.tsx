import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";
import Conversation from "@/models/conversation.model";
import { Types } from "mongoose";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const currentUser = await currentAuthUser();

  if (!currentUser) {
    return redirect("/signin");
  }

  await dbConnect();

  const [conversations] = await Conversation.aggregate([
    {
      $match: {
        participants: new Types.ObjectId(currentUser.id),
        type: "direct",
        deleted: false
      }
    },
    {
      $sort: { updatedAt: -1 }
    },
    {
      $limit: 1
    }
    // {
    //   $project: {
    //     _id: 1
    //   }
    // }
  ]);

  const friendId = conversations?.participants?.find(
    (p: Types.ObjectId) => p.toString() !== currentUser.id
  );

  if (conversations && friendId) {
    return redirect(`/conversations/${friendId.toString()}`);
  }

  return redirect("/friends/all");
}
