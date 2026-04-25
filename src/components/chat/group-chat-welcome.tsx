"use client";

import { PopulatedConversation } from "@/components/chat/direct-chat-section";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconHammer, IconPencil, IconUsersPlus } from "@tabler/icons-react";
import { useUser } from "@/hooks/use-user-store";
import { useModal } from "@/hooks/use-modal-store";

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
    <div className="flex flex-col space-y-3 p-5">
      {conversation?.logo?.url ? (
        <UserAvatar
          src={conversation?.logo?.url}
          name={conversation?.name}
          className={"size-12"}
        />
      ) : (
        <div className="relative h-18 w-14">
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
