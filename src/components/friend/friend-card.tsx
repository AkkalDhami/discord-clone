"use client";

import { UserAvatar } from "@/components/common/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PartialFriendship } from "@/types/friend";
import { ActionTooltip } from "@/components/common/action-tooltip";
import {
  IconDotsVertical,
  IconMessageCircle2Filled,
  IconPhoneCall,
  IconUserExclamation,
  IconUserOff,
  IconVideo
} from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal-store";
import { useFriend } from "@/hooks/use-friend";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function FriendCard({ friend }: { friend: string }) {
  const friendData = JSON.parse(friend) as PartialFriendship;

  const { open } = useModal();

  return (
    <div className="hover:bg-secondary/60 border-edge flex items-center justify-between border-b p-3.5">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex w-full items-center gap-1.5">
          <UserAvatar
            name={friendData?.friend?.name}
            src={friendData?.friend?.avatar?.url}
            className="size-12"
          />
          <div className="flex w-full flex-col">
            <h3 className="f">{friendData?.friend?.name}</h3>

            <p className="text-muted-foreground text-sm">
              @{friendData?.friend?.username}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ActionTooltip label="Message" size="sm">
            <Link
              href={`/conversations/${friendData.friend._id}`}
              className="hover:text-accent-foreground bg-background text-muted-foreground flex items-center justify-center rounded-full p-2">
              <IconMessageCircle2Filled className="size-6" />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="More" size="sm">
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={false}
                render={
                  <IconDotsVertical className="hover:text-accent-foreground bg-background text-muted-foreground flex size-10 cursor-pointer items-center justify-center rounded-full p-2" />
                }></DropdownMenuTrigger>
              <DropdownMenuContent className={"min-w-50"}>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className={cn("flex items-center justify-between gap-3")}>
                    <span>Start Video Call</span>
                    <IconVideo className="text-muted-foreground size-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn("flex items-center justify-between gap-3")}>
                    <span>Start Voice Call</span>
                    <IconPhoneCall className="text-muted-foreground size-4" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      open("block-friend", {
                        friend: {
                          ...friendData?.friend
                        }
                      });
                    }}
                    className={cn("flex items-center justify-between gap-3")}>
                    <span>Block Friend</span>
                    <IconUserExclamation className="text-muted-foreground size-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      open("remove-friend", {
                        friend: {
                          ...friendData?.friend
                        }
                      });
                    }}
                    className={cn("flex items-center justify-between gap-3")}>
                    <span>Remove Friend</span>
                    <IconUserOff className="text-muted-foreground size-4" />
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ActionTooltip>
        </div>
      </div>
    </div>
  );
}

export function BlockedFriendCard({
  friend,
  userId
}: {
  friend: string;
  userId: string;
}) {
  const friendData = JSON.parse(friend) as PartialFriendship;

  const { unBlockFriend, isunBlockingFriend } = useFriend();
  const router = useRouter();

  async function onUnBlock() {
    try {
      const res = await unBlockFriend(friendData?.friend?._id);
      if (res.success) {
        toast.success(res.message || "Unblocked friend successfully");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to unblock friend");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to unblock friend");
    }
  }

  return (
    <div className="bg-secondary/30 hover:bg-secondary/60 border-edge flex items-center justify-between border-b p-3.5">
      <div className="w-full space-y-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <UserAvatar
              name={friendData?.friend?.name}
              src={friendData?.friend?.avatar?.url}
              className="size-12"
            />
            <div className="flex w-full flex-col">
              <h3 className="f">{friendData?.friend?.name}</h3>

              <p className="text-muted-foreground text-sm">
                @{friendData?.friend?.username}
              </p>
            </div>
          </div>

          {friendData.blockedBy.toString() === userId ? (
            <Button
              variant={"success"}
              onClick={onUnBlock}
              disabled={isunBlockingFriend}>
              {isunBlockingFriend ? (
                <>
                  <Spinner /> Unblocking..
                </>
              ) : (
                "Unblock"
              )}
            </Button>
          ) : (
            <p className="inline-block rounded-full border border-red-200 bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:border-red-900">
              This user has blocked you
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
