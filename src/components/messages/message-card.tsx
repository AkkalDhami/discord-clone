"use client";

import { cn } from "@/lib/utils";
import { PartialProfile } from "@/types/friend";
import { IFile } from "@/interface";
import { MessageType } from "@/models/message.model";
import { UserAvatar } from "@/components/common/user-avatar";
import { renderMessageLinks } from "../common/message-link";

type MessageCardProps = {
  sender: PartialProfile;
  content?: string;
  createdAt?: string;
  edited?: boolean;
  isBot?: boolean;
  isAdmin?: boolean;
  attachments?: IFile[];
  type: MessageType;
};

export function MessageCard({
  sender,
  content,
  createdAt = Date.now().toLocaleString(),
  edited,
  isBot,
  isAdmin
}: MessageCardProps) {
  const { name, username, avatar } = sender || {};

  return (
    <div
      className={cn(
        "group hover:bg-secondary/70 relative py-2 duration-300",
        isAdmin && "bg-secondary/60"
      )}>
      <div className="flex gap-3 px-4">
        <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-full">
          <UserAvatar src={avatar?.url} name={name} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <p className="text-foreground text-sm font-semibold">{name}</p>

            {isBot && (
              <span className="rounded bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                BOT
              </span>
            )}

            {username && (
              <p className="text-muted-foreground text-xs">@{username}</p>
            )}

            <span className="text-muted-foreground text-xs">
              {new Date(createdAt).toLocaleDateString([], {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour12: true
              })}
            </span>

            <span className="text-muted-foreground text-xs">
              {new Date(createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "numeric"
              })}
            </span>
          </div>

          {content && (
            <p className="text-foreground/90 mt-0.5 text-sm wrap-break-word whitespace-pre-wrap">
              {renderMessageLinks(content)}
              {edited && (
                <span className="text-muted-foreground text-xs">(edited)</span>
              )}
            </p>
          )}
        </div>

        <div className="absolute top-0 right-0 hidden items-start gap-2 pt-1 group-hover:flex">
          <button className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-2 py-1 text-xs">
            Reply
          </button>
          <button className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-2 py-1 text-xs">
            ...
          </button>
        </div>
      </div>
    </div>
  );
}
