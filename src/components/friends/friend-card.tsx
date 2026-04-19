"use client";

import { UserAvatar } from "@/components/common/user-avatar";
import {
  FriendWithRecieverAndSender,
  PopulatedFriendship
} from "@/types/friend";
import { Button } from "../ui/button";
import { useFriend } from "@/hooks/use-friend";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function FriendCard({ friend }: { friend: PopulatedFriendship }) {
  return (
    <div className="hover:bg-secondary/60 flex items-center justify-between rounded-lg p-3.5">
      <div className="w-full space-y-3">
        <div className="flex w-full items-center gap-1.5">
          <UserAvatar
            name={friend.friend.name}
            src={friend.friend.avatar?.url}
            className="size-12"
          />
          <div className="flex w-full flex-col">
            <h3 className="f">{friend.friend.name}</h3>

            <p className="text-muted-foreground text-sm">
              @{friend.friend.username}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlockedFriendCard({
  friend
}: {
  friend: FriendWithRecieverAndSender;
}) {
  const { unBlockFriendRequest, isunBlockingFriendRequest } = useFriend();
  const router = useRouter();

  async function onUnBlock() {
    try {
      const res = await unBlockFriendRequest({ requestId: friend._id });
      if (res.success) {
        toast.success(res.message || "Unblocked friend request successfully");
        close();
        router.refresh();
      } else {
        toast.error(res.message || "Failed to unblock friend request");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to unblock friend request");
    }
  }

  return (
    <div className="bg-secondary/30 hover:bg-secondary/60 flex items-center justify-between rounded-lg p-3.5">
      <div className="w-full space-y-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <UserAvatar
              name={friend.sender.name}
              src={friend.sender.avatar?.url}
              className="size-12"
            />
            <div className="flex w-full flex-col">
              <h3 className="f">{friend.sender.name}</h3>

              <p className="text-muted-foreground text-sm">
                @{friend.sender.username}
              </p>
            </div>
          </div>

          <Button
            variant={"success"}
            onClick={onUnBlock}
            disabled={isunBlockingFriendRequest}>
            {isunBlockingFriendRequest ?"Unblocking.." :"Unblock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
