import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/common/user-avatar";
import { PopulatedConversation } from "@/components/chat/direct-chat-section";

export function GroupChatItem({ c }: { c: PopulatedConversation }) {
  const params = useParams();
  const participants = c?.participants ?? [];

  if (c.type !== "group" || participants.length === 0) {
    return null;
  }

  const displayName = c?.name
    ? c.name
    : "@" + participants.map(member => member.username).join(", @");

  return (
    <div key={c._id} className="px-3">
      <Link
        href={`/conversations/${c._id}`}
        className={cn(
          "hover:bg-secondary relative flex w-full items-center rounded-md p-2",
          params.friendId === c._id && "bg-secondary"
        )}>
        <GroupChatLogo conversation={c} />

        <div className="ml-0">
          <h3 className="text-sm font-medium line-clamp-1">{displayName}</h3>
          <p className="text-muted-foreground text-xs">
            {participants.length + 1} Members
          </p>
        </div>
      </Link>
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
    <div className="relative flex gap-0">
      {conversation?.participants?.slice(0, 2).map((participant, index) => (
        <UserAvatar
          key={participant._id}
          src={participant?.avatar?.url}
          name={participant?.name}
          className={cn(
            "border-background size-7 border-2",
            index === 0 && "z-10 -translate-y-2",
            index === 1 && "z-20 -translate-x-3 translate-y-2",
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
    <div className="px-3">
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
          <h3 className="text-sm font-medium line-clamp-1">{participant?.name}</h3>
          <p className="text-muted-foreground text-xs">
            @{participant?.username}
          </p>
        </div>
      </Link>
    </div>
  );
}
