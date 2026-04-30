"use client";

import { cn } from "@/lib/utils";
import { IMessage } from "@/interface";
import { UserAvatar } from "@/components/common/user-avatar";
import { MessageAction } from "@/components/messages/message-action";
import { renderMessageLinks } from "@/components/common/message-link";
import { useUser } from "@/hooks/use-user-store";
import { IconPin } from "@tabler/icons-react";

export function MessageCard(message: IMessage) {
  const { user } = useUser();

  const {
    sender,
    content,
    createdAt = new Date().toISOString(),
    edited,
    pinned
  } = message;

  const { name, username, avatar } = sender || {
    ...user
  };

  return (
    <div
      className={cn("group hover:bg-secondary/70 relative py-2 duration-300")}>
      <div className="flex gap-3 px-4">
        <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-full">
          <UserAvatar src={avatar?.url} name={name} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-foreground text-[15px] font-medium">{name}</p>

            {username && (
              <p className="text-muted-foreground text-[13px]">@{username}</p>
            )}

            <span className="text-muted-foreground text-[13px]">
              {new Date(createdAt).toLocaleDateString([], {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "numeric",
                hour12: true
              })}
            </span>

            {pinned && <IconPin className="text-muted-foreground size-3.5" />}
          </div>

          {content && (
            <p className="text-muted-primary mt-0.5 text-base wrap-break-word whitespace-pre-wrap">
              {renderMessageLinks(content)}

              {edited && (
                <span className="text-muted-foreground ml-2 text-xs">
                  (edited)
                </span>
              )}
            </p>
          )}
        </div>

        <div className="bg-muted absolute -top-4 right-4 hidden items-start gap-2 rounded-lg border border-neutral-500/40 px-2 py-1 pt-1 group-hover:flex">
          <MessageAction message={message} />
        </div>
      </div>
    </div>
  );
}
