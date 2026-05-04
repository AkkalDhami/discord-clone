"use client";

import { cn } from "@/lib/utils";
import { IMessage } from "@/interface";
import { UserAvatar } from "@/components/common/user-avatar";
import { MessageAction } from "@/components/messages/message-action";
import { renderMessageLinks } from "@/components/common/message-link";
import { useUser } from "@/hooks/use-user-store";
import { IconMoodSmileFilled, IconPin } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch
} from "@/components/ui/emoji-picker";
import { useMessage } from "@/hooks/use-message";
import toast from "react-hot-toast";
import { ActionTooltip } from "../common/action-tooltip";
import { formatDateLabel } from "@/utils/date";

export function MessageCard(message: IMessage & { grouped?: boolean }) {
  const { user } = useUser();

  const {
    replyTo,
    sender,
    content,
    createdAt = new Date().toISOString(),
    edited,
    pinned,
    visibleTo,
    grouped,
    _id
  } = message;

  const { reactMessage, isMessageReacting } = useMessage();

  const { name, username, avatar } = sender || {
    ...user
  };

  async function onReact(emoji: string) {
    try {
      const res = await reactMessage({ messageId: _id, reaction: emoji });
      if (!res.success) {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error reacting to message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to react to message."
      );
    }
  }

  return (
    <div
      className={cn("group hover:bg-secondary/70 relative py-1 duration-300")}>
      <div className="flex gap-3 px-4">
        <div className="relative w-12 shrink-0">
          {!grouped ? (
            <div className="bg-muted size-10 overflow-hidden rounded-full">
              <UserAvatar src={avatar?.url} name={name} />
            </div>
          ) : (
            <span className="text-muted-foreground text-[10px] opacity-0 group-hover:opacity-100">
              {new Date(createdAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "numeric",
                hour12: true
              })}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            {!grouped && (
              <>
                <p className="text-foreground text-[15px] font-medium">
                  {name}
                </p>

                {username && (
                  <p className="text-muted-foreground text-[13px]">
                    @{username}
                  </p>
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
              </>
            )}

            {pinned && <IconPin className="text-muted-foreground size-3.5" />}

            {visibleTo && visibleTo.length > 1 && (
              <span className="text-[13px] text-purple-500">
                Visible to:{" "}
                {visibleTo
                  .filter(v => v._id !== user?.id)
                  .map(v => `@${v.username}`)
                  .join(", ")}
              </span>
            )}
          </div>

          {replyTo && (
            <div className="bg-muted/60 hover:bg-muted border-primary-500 mb-1 cursor-pointer rounded-md border-l-2 px-2 py-1 text-xs">
              <p className="text-muted-foreground font-medium">
                {replyTo.sender?.name || "Unknown"}
              </p>

              <p className="text-muted-foreground line-clamp-1">
                {replyTo.content || "Attachment"}
              </p>
            </div>
          )}

          {content && (
            <p
              className={cn(
                "text-muted-primary text-base wrap-break-word whitespace-pre-wrap",
                visibleTo && visibleTo.length > 1 && "text-purple-500 italic"
              )}>
              {renderMessageLinks(content)}

              {edited && (
                <span className="text-muted-foreground ml-2 text-xs">
                  (edited)
                </span>
              )}
            </p>
          )}

          {message.reactions?.length ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {message.reactions.map(reaction => {
                const reactedByMe = reaction.reactedByUserIds.some(
                  id => `${id}` === user?.id
                );
                return (
                  <span
                    key={reaction.emoji}
                    onClick={() => reactedByMe && onReact(reaction.emoji)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm",
                      reactedByMe
                        ? "border-primary-500 bg-primary-500/10 text-primary-500 cursor-pointer"
                        : "bg-muted text-muted-foreground border-transparent"
                    )}>
                    <span>{reaction.emoji}</span>
                    <span>{reaction.reactedByUserIds.length}</span>
                  </span>
                );
              })}

              <Popover>
                <ActionTooltip label="Add Reaction" size="sm" side="top">
                  <PopoverTrigger
                    nativeButton={false}
                    render={
                      <IconMoodSmileFilled
                        onMouseDown={e => e.preventDefault()}
                        className={cn(
                          "text-muted-foreground bg-muted hover:text-accent-foreground size-8 cursor-pointer rounded-lg p-1.5",
                          isMessageReacting && "cursor-not-allowed opacity-50"
                        )}
                      />
                    }
                  />
                </ActionTooltip>
                <PopoverContent className="h-100 w-fit p-0">
                  <EmojiPicker
                    onEmojiSelect={({ emoji }) => {
                      onReact(emoji);
                    }}>
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                  </EmojiPicker>
                </PopoverContent>
              </Popover>
            </div>
          ) : null}
          <div
            className={cn(
              "bg-muted mt-1 ml-auto w-fit gap-2 rounded-lg p-1",
              "pointer-events-none opacity-0 transition-opacity duration-200",
              "group-hover:pointer-events-auto group-hover:opacity-100",
              "absolute -top-6 right-2"
            )}>
            <MessageAction message={message} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShimmerMessageCard() {
  return (
    <div className="animate-pulse px-4 py-2">
      <div className="flex gap-3">
        <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-full" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="bg-muted h-4 w-24 rounded" />
            <p className="bg-muted h-3 w-16 rounded" />
          </div>

          <p className="bg-muted mt-2 h-3 w-full rounded" />
          <p className="bg-muted mt-1 h-3 w-[80%] rounded" />
        </div>
      </div>
    </div>
  );
}

export function DateSeparator({
  date = new Date().toLocaleDateString()
}: {
  date?: string;
}) {
  return (
    <div className="relative my-4 flex items-center">
      <div className="border-border grow border-t" />
      <span className="text-muted-foreground mx-2 text-xs font-medium">
        {formatDateLabel(date)}
      </span>
      <div className="border-border grow border-t" />
    </div>
  );
}
