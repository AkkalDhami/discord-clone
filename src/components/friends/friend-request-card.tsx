"use client";

import { FriendWithReciever, FriendWithSender } from "@/types/friend";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/utils/date";
import { useFriend } from "@/hooks/use-friend";
import toast from "react-hot-toast";
import { FriendRequestStatus } from "@/models/friend-request.model";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ActionTooltip } from "../common/action-tooltip";
import { IconCheck, IconLoader2, IconSend, IconX } from "@tabler/icons-react";

export const FriendRequestStatusMap: Record<FriendRequestStatus, string> = {
  accepted:
    "bg-green-500/10 text-green-500 border-green-300 dark:border-green-700",
  pending:
    "bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-700",
  ignored: "bg-red-500/10 text-red-600 border-red-300 dark:border-red-700"
};

export function SentFriendRequestCard({
  friendReq
}: {
  friendReq: FriendWithReciever;
}) {
  const { isSendingFriendRequest, sendFriendRequest } = useFriend();
  const router = useRouter();
  async function onSend() {
    try {
      const res = await sendFriendRequest({
        receiverUsername: friendReq.receiver.username
      });
      if (res.success) {
        toast.success(res.message || "Friend request sent successfully");
        close();
        router.refresh();
      } else {
        toast.error(res.message || "Failed to send friend request");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to send friend request");
    }
  }

  return (
    <div className="hover:bg-secondary/60 border-edge flex items-center justify-between border-y p-3.5">
      <div className="w-full space-y-3">
        <div className="flex w-full items-center gap-1.5">
          <UserAvatar
            name={friendReq.receiver.name}
            src={friendReq.receiver.avatar?.url}
            className="size-13"
          />
          <div className="flex w-full items-center justify-between">
            <div className="flex w-full flex-col">
              <div className="flex w-full items-center gap-3">
                <h3 className="font-medium">{friendReq.receiver.name}</h3>
                <p className="text-muted-foreground text-xs">
                  {timeAgo(friendReq.createdAt)}
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                @{friendReq.receiver.username}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {friendReq.status === "ignored" && (
                <>
                  {isSendingFriendRequest ? (
                    <IconLoader2 className="text-accent-foreground size-10 animate-spin cursor-not-allowed rounded-full bg-neutral-500/10 p-2" />
                  ) : (
                    <ActionTooltip label="Send Request" size="sm">
                      <IconSend
                        onClick={onSend}
                        className="size-10 cursor-pointer rounded-full bg-green-500/10 p-2 text-green-600"
                      />
                    </ActionTooltip>
                  )}
                </>
              )}
              <div className="space-y-1">
                <p
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-center text-xs font-normal",
                    FriendRequestStatusMap[friendReq.status]
                  )}>
                  {friendReq.status}
                </p>
              </div>
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
  const {
    acceptFriendRequest,
    isAcceptingFriendRequest,
    isRejectingFriendRequest,
    ignoreFriendRequest
  } = useFriend();

  const router = useRouter();

  async function onAccept() {
    try {
      const res = await acceptFriendRequest(friendReq._id);
      if (res.success) {
        toast.success(res.message || "Accepted friend request successfully");
        close();
        router.refresh();
      } else {
        toast.error(res.message || "Failed to accept friend request");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to accept friend request");
    }
  }

  async function onReject() {
    try {
      const res = await ignoreFriendRequest({
        requestId: friendReq._id
      });
      if (res.success) {
        toast.success(res.message || "Ignored friend request successfully");
        close();
        router.refresh();
      } else {
        toast.error(res.message || "Failed to ignore friend request");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to ignore friend request");
    }
  }

  return (
    <div className="hover:bg-secondary/30 border-edge flex w-full items-center justify-between border-y p-3.5">
      <div className="w-full space-y-3">
        <div className="flex w-full items-center gap-1.5">
          <UserAvatar
            name={friendReq.sender.name}
            src={friendReq.sender.avatar?.url}
            className="size-13"
          />
          <div className="flex w-full items-center justify-between">
            <div className="flex w-full flex-col space-y-1">
              <div className="flex w-full items-center gap-3">
                <h3 className="font-medium">{friendReq.sender.name}</h3>
                <p className="text-muted-foreground text-xs">
                  {timeAgo(friendReq.createdAt)}
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                @{friendReq.sender.username}
              </p>
            </div>
            <div className="flex gap-2">
              {isAcceptingFriendRequest ? (
                <IconLoader2 className="text-accent-foreground size-10 animate-spin cursor-not-allowed rounded-full bg-neutral-500/10 p-2" />
              ) : (
                <ActionTooltip label="Accept" size="sm">
                  <IconCheck
                    onClick={onAccept}
                    className="size-10 cursor-pointer rounded-full bg-green-500/10 p-2 text-green-600"
                  />
                </ActionTooltip>
              )}
              {isRejectingFriendRequest ? (
                <IconLoader2 className="text-accent-foreground size-10 animate-spin cursor-not-allowed rounded-full bg-neutral-500/10 p-2" />
              ) : (
                <ActionTooltip label="Ignore" size="sm">
                  <IconX
                    onClick={onReject}
                    className="size-10 cursor-pointer rounded-full bg-red-500/10 p-2 text-red-600"
                  />
                </ActionTooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
<div className="hover:bg-secondary/50 border-edge flex items-center justify-between border-y p-3.5">
      <div className="w-full space-y-3">
        <div className="flex w-full items-center gap-1.5">
          <UserAvatar
            name={friendReq.sender.name}
            src={friendReq.sender.avatar?.url}
            className="size-13"
          />
          <div className="flex w-full items-center justify-between">
            <div className="flex w-full flex-col space-y-1">
              <h3 className="font-medium">{friendReq.sender.name}</h3>
              <p className="text-muted-foreground text-sm">
                @{friendReq.sender.username}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground w-17.5 text-xs">
                {timeAgo(friendReq.createdAt)}
              </p>
              <p
                className={cn(
                  "rounded-full border px-2 py-0.5 text-center text-xs font-normal",
                  FriendRequestStatusMap[friendReq.status]
                )}>
                {friendReq.status}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={"primary"}
            disabled={isAcceptingFriendRequest}
            onClick={onAccept}>
            {isAcceptingFriendRequest ? "Confirming..." : "Confirm"}
          </Button>
          <Button
            variant={"destructive"}
            disabled={isRejectingFriendRequest}
            onClick={onReject}>
            {isRejectingFriendRequest ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </div>
    </div>
    */
