"use client";

import { IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddFriendButton } from "@/components/common/add-friend-button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function DirectChatHeader() {
  const pathname = usePathname();
  return (
    <div className="border-edge mt-4 flex w-full items-center justify-between gap-6 border-y px-4 py-2">
      <div className="flex items-center gap-1 font-medium">
        <IconUsers className="size-4" />
        Friends
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={"secondary"}
          className={cn(
            "text-muted-foreground hover:bg-primary-500 px-3 hover:text-white",
            pathname.includes("/friends/requests") &&
              "bg-primary-500 text-white"
          )}
          render={
            <Link href={"/friends/requests"}>Friend Requests</Link>
          }></Button>
        <Button
          variant={"secondary"}
          className={cn(
            "text-muted-foreground hover:bg-primary-500 px-3 hover:text-white",
            pathname.includes("/friends/all") && "bg-primary-500 text-white"
          )}
          render={<Link href={"/friends/all"}>All Friends</Link>}></Button>
        <Button
          variant={"secondary"}
          className={cn(
            "text-muted-foreground hover:bg-primary-500 px-3 hover:text-white",
            pathname.includes("/friends/blocked") && "bg-primary-500 text-white"
          )}
          render={
            <Link href={"/friends/blocked"}>Blocked Friends</Link>
          }></Button>

        <AddFriendButton variant="icon" />
      </div>
    </div>
  );
}
