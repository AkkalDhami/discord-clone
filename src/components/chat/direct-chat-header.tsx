"use client";

import { IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddFriendButton } from "@/components/common/add-friend-button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { NotificationBadge } from "@/components/common/notification-badge";

export function DirectChatHeader() {
  const pathname = usePathname();
  return (
    <div className="border-edge mt-4 flex w-full items-center justify-between gap-6 border-y px-4 py-2">
      <div className="item-center flex gap-4">
        <div className="flex items-center gap-1 font-medium">
          <IconUsers className="size-4" />
          Friends
        </div>
        <div className="flex items-center gap-6">
          <Button
            variant={"ghost"}
            className={cn(
              "text-muted-foreground hover:bg-secondary hover:text-accent-foreground relative px-3",
              pathname.includes("/friends/requests") &&
                "bg-secondary text-accent-foreground"
            )}
            render={
              <Link href={"/friends/requests"}>
                Friend Requests
                <NotificationBadge stat={1} />
              </Link>
            }></Button>
          <Button
            variant={"ghost"}
            className={cn(
              "text-muted-foreground hover:bg-secondary hover:text-accent-foreground px-3",
              pathname.includes("/friends/all") &&
                "bg-secondary text-accent-foreground"
            )}
            render={<Link href={"/friends/all"}>All Friends</Link>}></Button>
          <Button
            variant={"ghost"}
            className={cn(
              "text-muted-foreground hover:bg-secondary hover:text-accent-foreground px-3",
              pathname.includes("/friends/blocked") &&
                "bg-secondary text-accent-foreground"
            )}
            render={
              <Link href={"/friends/blocked"}>Blocked Friends</Link>
            }></Button>
        </div>
      </div>
      <AddFriendButton variant="icon" />
    </div>
  );
}
