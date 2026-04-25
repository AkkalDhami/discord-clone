import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/common/user-avatar";
import { PopulatedConversation } from "@/components/chat/direct-chat-section";
import { IconX } from "@tabler/icons-react";
import { useModal } from "@/hooks/use-modal-store";

export function GroupChatItem({ c }: { c: PopulatedConversation }) {
  const params = useParams();

  const { open } = useModal();

  const participants = c?.participants ?? [];

  if (c.type !== "group" || participants.length === 0) {
    return null;
  }

  const displayName = c?.name
    ? c.name
    : "@" + participants.map(member => member.username).join(", @");

  return (
    <div
      key={c._id}
      className={cn(
        "hover:bg-secondary group relative flex w-full items-center justify-between rounded-md p-2",
        params.friendId === c._id && "bg-secondary"
      )}>
      <Link href={`/conversations/${c._id}`} className="w-full flex-1">
        <div className="relative flex items-center gap-2">
          <GroupChatLogo conversation={c} />

          <div className="ml-2">
            <h3 className="line-clamp-1 text-sm font-medium">{displayName}</h3>
            <p className="text-muted-foreground text-xs">
              {participants.length + 1} Members
            </p>
          </div>
        </div>
      </Link>
      <IconX
        onClick={() => {
          open("leave-group", {
            conversation: c
            // leftUser: participants[0]
          });
        }}
        className="text-muted-foreground hover:text-accent-foreground size-6 cursor-pointer p-1 opacity-0 group-hover:opacity-100"
      />
    </div>
  );
}

export function GroupChatLogo({
  conversation,
  className
}: {
  conversation: PopulatedConversation;
  className?: string;
}) {
  return conversation?.logo?.url ? (
    <UserAvatar
      src={conversation?.logo?.url}
      name={conversation?.name}
      className={cn("size-8", className)}
    />
  ) : (
    <div className="relative h-8 w-7">
      {conversation?.participants?.slice(0, 3).map((participant, index) => (
        <UserAvatar
          key={participant._id}
          src={participant?.avatar?.url}
          name={participant?.name}
          className={cn(
            "border-background absolute size-7 border-2",
            index === 0 && "top-2 -left-1 z-10",
            index === 1 && "-top-1 left-3 z-20",
            index === 2 && "top-3 left-3 z-30",
            className
          )}
        />
      ))}
    </div>
  );
}

export function FriendChatItem({ c }: { c: PopulatedConversation }) {
  const params = useParams();
  const participant = c?.participants?.[0];

  if (c.type !== "direct" || !participant?._id) {
    return null;
  }

  return (
    <div className="">
      <Link
        href={`/conversations/${participant._id}`}
        className={cn(
          "hover:bg-secondary relative flex w-full items-center rounded-md p-2",
          params.friendId === participant._id && "bg-secondary"
        )}>
        <UserAvatar
          src={participant?.avatar?.url}
          name={participant?.name}
          className="size-8"
        />
        <div className="ml-2">
          <h3 className="line-clamp-1 text-sm font-medium">
            {participant?.name}
          </h3>
          <p className="text-muted-foreground text-xs">
            @{participant?.username}
          </p>
        </div>
      </Link>
    </div>
  );
}
