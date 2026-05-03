import { EmptyFriend } from "@/components/friend/empty-friend";
import {
  FriendRequestCard,
  SentFriendRequestCard
} from "@/components/friend/friend-request-card";
import { FriendSearch } from "@/components/friend/friend-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";

import FriendRequest from "@/models/friend-request.model";
import { FriendWithReciever, FriendWithSender } from "@/types/friend";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page(props: PageProps<"/friends/requests">) {
  const currentUser = await currentAuthUser();
  await dbConnect();

  if (!currentUser) {
    return redirect("/signin");
  }

  const searchParams: { q?: string } = await props.searchParams;

  const q = searchParams?.q?.trim() || "";

  const searchMatch = q
    ? {
        $or: [
          { username: { $regex: q, $options: "i" } },
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } }
        ]
      }
    : {};

  const [incomingRaw, outgoingRaw] = await Promise.all([
    FriendRequest.find({
      receiver: currentUser.id,
      status: "pending"
    })
      .populate({
        path: "sender",
        match: searchMatch,
        select: "username name email _id avatar"
      })
      .sort({ createdAt: -1 })
      .lean(),

    FriendRequest.find({
      sender: currentUser.id
    })
      .populate({
        path: "receiver",
        match: searchMatch,
        select: "username name email _id avatar"
      })
      .sort({ createdAt: -1 })
      .lean()
  ]);

  const incoming = incomingRaw.filter(
    i => i.sender !== null
  ) as unknown as FriendWithSender[];

  const outgoing = outgoingRaw.filter(
    i => i.receiver !== null
  ) as unknown as FriendWithReciever[];

  return (
    <section className={"grid h-full w-full pb-3"}>
      {incoming.length > 0 || outgoing.length > 0 ? (
        <>
          <div className="border-edge border-b px-2 py-2">
            <FriendSearch />
          </div>
          {(incoming.length > 0 || outgoing.length > 0) && (
            <Tabs defaultValue="incoming" className="w-full">
              <TabsList
                variant={"line"}
                className={"flex flex-wrap items-center gap-12 p-2"}>
                <TabsTrigger
                  value="incoming"
                  className={"h-8 p-0 text-lg font-normal"}>
                  Pending Requests - {incoming.length}
                </TabsTrigger>
                <TabsTrigger
                  value="outgoing"
                  className={"h-8 p-0 text-lg font-normal"}>
                  Sent Requests - {outgoing.length}
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="incoming"
                className={"border-edge border-t py-3"}>
                <div className="space-y-2">
                  {incoming.map(f => (
                    <FriendRequestCard
                      key={f._id.toString()}
                      friend={JSON.stringify(f)}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent
                value="outgoing"
                className={"border-edge border-t py-3"}>
                <div className="space-y-2">
                  {outgoing.map(f => (
                    <SentFriendRequestCard
                      key={f._id.toString()}
                      friend={JSON.stringify(f)}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </>
      ) : (
        <EmptyFriend type="request" />
      )}
    </section>
  );
}
