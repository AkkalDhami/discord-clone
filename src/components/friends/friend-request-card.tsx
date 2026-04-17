"use client";

import { FriendWithReciever, FriendWithSender } from "@/types/friend";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/utils/date";
import { useFriend } from "@/hooks/use-friend";
import toast from "react-hot-toast";
import { FriendRequestStatus } from "@/models/friend-request.model";
import { cn } from "@/lib/utils";

export const FriendRequestStatusMap: Record<FriendRequestStatus, string> = {
  accepted:
    "bg-green-500/10 text-green-500 border-green-300 dark:border-green-700",
  pending:
    "bg-amber-500/10 text-amber-600 border-green-300 dark:border-green-700",
  blocked: "bg-rose-500/10 text-rose-600 border-rose-300 dark:border-rose-700",
  rejected: "bg-red-500/10 text-red-600 border-red-300 dark:border-red-700"
};

export function SentFriendRequestCard({
  friendReq
}: {
  friendReq: FriendWithReciever;
}) {
  return (
    <div className="hover:bg-secondary/60 flex items-center justify-between rounded-lg p-3.5">
      <div className="w-full space-y-3">
        <div className="flex w-full items-center gap-1.5">
          <UserAvatar
            name={friendReq.receiver.name}
            src={friendReq.receiver.avatar?.url}
            className="size-12"
          />
          <div className="flex w-full flex-col">
            <div className="flex w-full items-center justify-between">
              <h3 className="f">{friendReq.receiver.name}</h3>
              <p className="text-muted-foreground text-xs">
                {timeAgo(friendReq.createdAt)}
              </p>
            </div>
            <div className="flex w-full items-center justify-between">
              <p className="text-muted-foreground text-sm">
                @{friendReq.receiver.username}
              </p>

              <p
                className={cn(
                  "rounded-full border px-2 py-0.5 text-sm font-normal",
                  FriendRequestStatusMap[friendReq.status]
                )}>
                {friendReq.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FriendRequestCard({
  friendReq
}: {
  friendReq: FriendWithSender;
}) {
  const { acceptFriendRequest, isAcceptingFriendRequest } = useFriend();

  async function onAccept() {
    try {
      const res = await acceptFriendRequest(friendReq._id);
      if (res.success) {
        toast.success(res.message || "Accepted friend request");
        close();
      } else {
        toast.error(res.message || "Failed to accept friend request");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to accept friend request");
    }
  }

  return (
    <div className="hover:bg-secondary flex items-center justify-between rounded-lg p-3.5">
      <div className="w-full space-y-3">
        <div className="flex w-full items-center gap-1.5">
          <UserAvatar
            name={friendReq.sender.name}
            src={friendReq.sender.avatar?.url}
            className="size-12"
          />
          <div className="flex w-full flex-col">
            <div className="flex w-full items-center justify-between">
              <h3 className="f">{friendReq.sender.name}</h3>
              <p className="text-muted-foreground text-xs">
                {timeAgo(friendReq.createdAt)}
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              @{friendReq.sender.username}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={"primary"}
            disabled={isAcceptingFriendRequest}
            onClick={onAccept}>
            {isAcceptingFriendRequest ? "Confirming..." : "Confirm"}
          </Button>
          <Button variant={"outline"}>Ignore</Button>
          <Button variant={"destructive"}>Block</Button>
        </div>
      </div>
    </div>
  );
}
