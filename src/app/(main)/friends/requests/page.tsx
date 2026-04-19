import {
  FriendRequestCard,
  SentFriendRequestCard
} from "@/components/friends/friend-request-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentAuthUser } from "@/helpers/auth.helper";
import FriendRequest from "@/models/friend-request.model";
import { FriendWithReciever, FriendWithSender } from "@/types/friend";
import { redirect } from "next/navigation";

export default async function Page() {
  const currentUser = await currentAuthUser();

  if (!currentAuthUser) {
    return redirect("/friends");
  }

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
    <section className="grid h-full grid-cols-1 pb-3">
      <Tabs defaultValue="friend-request" className="w-full py-2">
        <TabsList variant={"line"} className={"border-edge"}>
          <TabsTrigger value="friend-request" className={"text-lg font-normal"}>
            Friend Requests - {incomingFriendRequests.length}
          </TabsTrigger>
          <TabsTrigger value="sent-request" className={"text-lg font-normal"}>
            Sent Requests - {outgoingFriendRequests.length}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="friend-request">
          <div className="grid space-y-2">
            {incomingFriendRequests.map(f => (
              <FriendRequestCard key={f._id.toString()} friendReq={f} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="sent-request">
          <div className="grid space-y-2">
            {outgoingFriendRequests.map(f => (
              <SentFriendRequestCard key={f._id.toString()} friendReq={f} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
