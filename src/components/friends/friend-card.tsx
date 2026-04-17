"use client";

import { UserAvatar } from "@/components/common/user-avatar";
import { timeAgo } from "@/utils/date";
import { Friendship } from "@/interface";

export function FriendCard({ friend }: { friend: Friendship }) {
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
