"use client";

import { PopulatedConversation } from "@/components/chat/direct-chat-section";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconHammer, IconPencil, IconUsersPlus } from "@tabler/icons-react";
import { useUser } from "@/hooks/use-user-store";
import { useModal } from "@/hooks/use-modal-store";
import { PartialFriendship, PartialProfile } from "@/types/friend";
import { useFriend } from "@/hooks/use-friend";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";

export function GroupChatWelcome({
  conversation
}: {
  conversation: PopulatedConversation;
}) {
  const { open } = useModal();
  const { user } = useUser();
  const isAdmin = user?.id && conversation.admin === user.id;

  const displayName = conversation?.name
    ? conversation.name
    : "@" +
      conversation?.participants
        ?.slice(0, 2)
        ?.map(member => member.username)
        .join(", @") +
      "...";

  return (
    <div className="flex flex-col py-4 space-y-3">
      {conversation?.logo?.url ? (
        <UserAvatar
          src={conversation?.logo?.url}
          name={conversation?.name}
          className={"size-12"}
        />
      ) : (
        <div className="relative ml-4 h-18 w-14">
          {conversation?.participants?.slice(0, 3).map((participant, index) => (
            <UserAvatar
              key={participant._id}
              src={participant?.avatar?.url}
              name={participant?.name}
              className={cn(
                "border-background absolute size-14 border-4",
                index === 0 && "top-2 -left-2 z-10",
                index === 1 && "-top-2 left-8 z-20",
                index === 2 && "top-8 left-8 z-30"
              )}
            />
          ))}
        </div>
      )}
      <h2 className="mt-2 text-3xl font-medium">{displayName}</h2>
      <p className="text-muted-primary text-lg">
        Welcome to the beginning of{" "}
        <span className="text-accent-foreground">{displayName}</span> group.
      </p>

      <div className="flex items-center gap-4">
        <Button
          variant={"primary"}
          onClick={() => {
            open("add-group-members", { conversation });
          }}>
          <IconUsersPlus className={"size-4"} /> Invite Friends
        </Button>
        <Button
          variant={"outline"}
          onClick={() => {
            open("edit-group", { conversation });
          }}>
          <IconPencil className={"size-4"} /> Edit Group
        </Button>
        {isAdmin && (
          <Button
            variant={"destructive"}
            onClick={() => {
              open("kick-group-members", { conversation });
            }}>
            <IconHammer className="size-4" /> Kick Members
          </Button>
        )}
      </div>
    </div>
  );
}

export function DirectChatWelcome({
  friend,
  friendship
}: {
  friend: PartialProfile;
  friendship: Omit<PartialFriendship, "friend">;
}) {
  const { open } = useModal();

  const { unBlockFriend, isunBlockingFriend } = useFriend();
  const router = useRouter();

  const { user } = useUser();

  async function onUnBlock() {
    try {
      const res = await unBlockFriend(friend?._id);
      if (res.success) {
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
    <div className="flex flex-col space-y-3">
      <UserAvatar
        src={friend?.avatar?.url}
        name={friend?.name}
        className={"size-14"}
      />

      <h2 className="mt-2 text-3xl font-medium">{friend?.name}</h2>
      <h2 className="text-xl font-normal">@{friend?.username}</h2>
      <p className="text-muted-primary text-lg">
        This is the beginning of your direct message history with{" "}
        <span className="text-accent-foreground">@{friend.username}</span>.
      </p>

      <div className="flex items-center gap-4">
        <Button
          variant={"outline"}
          onClick={() => {
            open("remove-friend", {
              friend: {
                ...friend
              }
            });
          }}>
          Remove Friend
        </Button>

        {friendship.status === "active" ? (
          <Button
            variant={"outline"}
            onClick={() => {
              open("block-friend", {
                friend: {
                  ...friend
                }
              });
            }}>
            Block
          </Button>
        ) : friendship.blockedBy.toString() === user?.id ? (
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
          <p className="inline-block px-2 text-xs text-red-600">
            This user has blocked you
          </p>
        )}
      </div>
    </div>
  );
}
