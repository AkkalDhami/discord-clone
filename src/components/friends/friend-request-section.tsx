"use client";

import { EmptyFriend } from "@/components/friends/empty-friend";
import {
  FriendRequestCard,
  SentFriendRequestCard
} from "@/components/friends/friend-request-card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

export function FriendRequestSection() {
  return (
    <div className="">
      {incomingFriendRequests.length > 0 ||
      outgoingFriendRequests.length > 0 ? (
        <>
          <Collapsible className={"w-full"} defaultOpen>
            <CollapsibleTrigger className={"w-full text-start"}>
              <h2
                className={
                  "border-edge border-b px-3 py-3 text-lg font-normal"
                }>
                Friend Requests - {incomingFriendRequests.length}
              </h2>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2">
                {incomingFriendRequests.map(f => (
                  <FriendRequestCard key={f._id.toString()} friendReq={f} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible className={"w-full"} defaultOpen>
            <CollapsibleTrigger className={"w-full text-start"}>
              <h2
                className={
                  "border-edge cursor-pointer border-b px-3 py-3 text-lg font-normal"
                }>
                Sent Requests - {outgoingFriendRequests.length}
              </h2>
            </CollapsibleTrigger>
            <CollapsibleContent className={"w-full"}>
              <div className="mt-2 space-y-2">
                {outgoingFriendRequests.map(f => (
                  <SentFriendRequestCard
                    key={f._id.toString()}
                    friend={JSON.stringify(f)}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      ) : (
        <EmptyFriend type="request" />
      )}
    </div>
  );
}
