import { EmptyFriend } from "@/components/friend/empty-friend";
import {
  FriendRequestCard,
  SentFriendRequestCard
} from "@/components/friend/friend-request-card";
import { FriendSearch } from "@/components/friend/friend-search";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";

import FriendRequest from "@/models/friend-request.model";
import { FriendWithReciever, FriendWithSender } from "@/types/friend";
import { IconChevronDown } from "@tabler/icons-react";
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
          {incoming.length > 0 && (
            <Collapsible className={"w-full"} defaultOpen>
              <CollapsibleTrigger
                className={"w-full text-start"}
                render={
                  <Button
                    variant="ghost"
                    className="text-muted-primary w-full font-normal">
                    Friend Requests - {incoming.length}
                    <IconChevronDown className="ml-auto -rotate-90 group-data-panel-open/button:rotate-0" />
                  </Button>
                }>
                {/* <h2
                  className={
                    "border-edge text-muted-primary border-b px-3 text-lg font-normal"
                  }>
                  Friend Requests - {incoming.length}
                </h2> */}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2">
                  {incoming.map(f => (
                    <FriendRequestCard
                      key={f._id.toString()}
                      friend={JSON.stringify(f)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          {outgoing.length > 0 && (
            <Collapsible className={"w-full"} defaultOpen>
              <CollapsibleTrigger
                className={"w-full text-start"}
                render={
                  <Button
                    variant="ghost"
                    className="text-muted-primary w-full font-normal">
                    Sent Requests - {outgoing.length}
                    <IconChevronDown className="ml-auto -rotate-90 group-data-panel-open/button:rotate-0" />
                  </Button>
                }></CollapsibleTrigger>
              <CollapsibleContent className={"w-full"}>
                <div className="mt-2 space-y-2">
                  {outgoing.map(f => (
                    <SentFriendRequestCard
                      key={f._id.toString()}
                      friend={JSON.stringify(f)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      ) : (
        <EmptyFriend type="request" />
      )}
    </section>
  );
}
