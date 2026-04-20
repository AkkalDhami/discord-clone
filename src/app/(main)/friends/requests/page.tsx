import {
  FriendRequestCard,
  SentFriendRequestCard
} from "@/components/friends/friend-request-card";
import { Separator } from "@/components/ui/separator";
import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";
import FriendRequest from "@/models/friend-request.model";
import { FriendWithReciever, FriendWithSender } from "@/types/friend";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const currentUser = await currentAuthUser();

  if (!currentAuthUser) {
    return redirect("/friends");
  }

  await dbConnect();

  const incomingFriendRequests = (await FriendRequest.find({
    receiver: currentUser?.id,
    status: "pending"
  })
    .populate("sender", "username name email _id avatar")
    .sort({ createdAt: -1 })
    .lean()) as unknown as FriendWithSender[];

  const outgoingFriendRequests = (await FriendRequest.find({
    sender: currentUser?.id
  })
    .populate("receiver", "username name email _id avatar")
    .sort({ createdAt: -1 })
    .lean()) as unknown as FriendWithReciever[];

  return (
    <section className="grid h-full pb-3 md:grid-cols-2">
      <div className="border-edge">
        <h2 className={"border-edge border-b px-3 py-3 text-lg font-normal"}>
          Friend Requests - {incomingFriendRequests.length}
        </h2>
        <div className="mt-2 space-y-2">
          {incomingFriendRequests.map(f => (
            <FriendRequestCard key={f._id.toString()} friendReq={f} />
          ))}
        </div>
      </div>

      <div className="border-edge border-l">
        <h2 className={"border-edge border-b px-3 py-3 text-lg font-normal"}>
          Sent Requests - {outgoingFriendRequests.length}
        </h2>

        <div className="mt-2 space-y-2">
          {outgoingFriendRequests.map(f => (
            <SentFriendRequestCard key={f._id.toString()} friendReq={f} />
          ))}
        </div>
      </div>
      {/* <Separator /> */}
    </section>
  );
}
