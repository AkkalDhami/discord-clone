import { IconHash, IconLockFilled } from "@tabler/icons-react";
import { UserAvatar } from "@/components/common/user-avatar";

type ChatHeaderProps = {
  serverId: string;
  name: string;
  type: "channel" | "member";
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
    <div className="border-edge mt-4 flex items-center border-y px-4 py-3.5">
      {/* <div className="border-edge fixed top-6 z-10 flex w-[calc(100vw-20rem)] items-center border-y bg-neutral-100 px-4 py-3 pr-110 dark:bg-neutral-950"> */}
      <div className="relative flex items-center gap-2">
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
        {type === "member" && (
          <UserAvatar name={name} src={imageUrl} className="size-6" />
        )}
        <span className="text-md font-medium">{name}</span>
      </div>
    </div>
  );
}
