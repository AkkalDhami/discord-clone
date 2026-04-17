import { IconHash, IconLockFilled } from "@tabler/icons-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { ChatHeaderAction } from "@/components/chat/chat-header-action";

export type ChatHeaderType = "channel" | "member" | "friend";

type ChatHeaderProps = {
  serverId: string;
  name: string;
  type: ChatHeaderType;
  imageUrl?: string;
  isPrivate: boolean;
};

export function ChatHeader({
  serverId,
  name,
  type,
  imageUrl,
  isPrivate
}: ChatHeaderProps) {
  return (
    <div className="border-edge mt-3.75 flex items-center justify-between border-y px-4 pt-3 pb-3">
      {/* <div className="border-edge fixed top-6 z-10 flex w-[calc(100vw-20rem)] items-center border-y bg-neutral-100 px-4 py-3 pr-110 dark:bg-neutral-950"> */}
      <div className="relative flex items-center gap-2 px-8 md:px-0">
        {type === "channel" && (
          <>
            <IconHash className="text-muted-foreground size-5" />
            {isPrivate && (
              <IconLockFilled
                className={
                  "bg-background text-muted-foreground absolute top-0 left-3 z-1 size-3"
                }
              />
            )}
          </>
        )}
        {(type === "member" || type === "friend") && (
          <UserAvatar name={name} src={imageUrl} className="size-6" />
        )}
        <span className="text-md font-medium">{name}</span>
      </div>

      <ChatHeaderAction type={type} />
    </div>
  );
}
