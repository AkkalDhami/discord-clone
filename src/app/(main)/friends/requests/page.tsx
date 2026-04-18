import {
  FriendRequestCard,
  SentFriendRequestCard
} from "@/components/friends/friend-request-card";
import { currentAuthUser } from "@/helpers/auth.helper";
import FriendRequest from "@/models/friend-request.model";
import { FriendWithReciever, FriendWithSender } from "@/types/friend";
import { redirect } from "next/navigation";

export default async function Page() {
  const currentUser = await currentAuthUser();

  if (!currentAuthUser) {
    return redirect("/friends");
  }

  const incomingFriendRequests = await FriendRequest.find({
    receiver: currentUser?.id,
    status: "pending"
  })
    .populate("sender", "username name email _id avatar")
    .sort({ createdAt: -1 })
    .lean();

  const outgoingFriendRequests = await FriendRequest.find({
    sender: currentUser?.id
  })
    .populate("receiver", "username name email _id avatar")
    .sort({ createdAt: -1 })
    .lean();

  const mappedOutgoingFriendRequests: FriendWithReciever[] =
    outgoingFriendRequests?.map(f => ({
      _id: f._id.toString(),
      status: f.status,
      receiver: {
        ...f.receiver,
        _id: f.receiver._id.toString()
      },
      createdAt: f.createdAt.toDateString(),
      updatedAt: f.updatedAt.toDateString(),
      pairKey: f.pairKey
    }));

  const mappedIncomingFriendRequests: FriendWithSender[] =
    incomingFriendRequests?.map(f => ({
      _id: f._id.toString(),
      status: f.status,
      sender: {
        ...f.sender,
        _id: f.sender._id.toString()
      },
      createdAt: f.createdAt.toDateString(),
      updatedAt: f.updatedAt.toDateString(),
      pairKey: f.pairKey
    }));

  return (
    <section className="grid h-full grid-cols-1 pb-3 lg:grid-cols-2">
      <div className="border-edge border-b">
        <h2 className="text-muted-primary border-edge mb-2 border-b p-3.5 font-normal">
          Friend Requests - {incomingFriendRequests.length}
        </h2>
        <div className="grid space-y-2 px-2">
          {mappedIncomingFriendRequests.map(f => (
            <FriendRequestCard key={f._id.toString()} friendReq={f} />
          ))}
        </div>
      </div>
      <div className="border-edge border-b pb-3 lg:border-l">
        <h2 className="text-muted-primary border-edge mb-2 border-b p-3.5 font-normal">
          Sent Requests - {outgoingFriendRequests.length}
        </h2>

        <div className="grid space-y-2 px-2">
          {mappedOutgoingFriendRequests.map(f => (
            <SentFriendRequestCard key={f._id.toString()} friendReq={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
