"use client";

import { ActionTooltip } from "@/components/common/action-tooltip";
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
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCheck,
  IconCopy,
  IconMoodSmile,
  IconPencil,
  IconPin,
  IconPinnedOff,
  IconTrash
} from "@tabler/icons-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard.ts";

import { IMessage } from "@/interface";
import { useUser } from "@/hooks/use-user-store";
import { useModal } from "@/hooks/use-modal-store";
import { useMessage } from "@/hooks/use-message";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useReply } from "@/hooks/use-reply-store";

export function MessageAction({ message }: { message: IMessage }) {
  const { user } = useUser();
  const { copied, copy } = useCopyToClipboard();

  const setReplyingTo = useReply(state => state.setReplyingTo);

  const { open } = useModal();

  const {
    togglePinMessage,
    isMessageTogglingPin,
    reactMessage,
    isMessageReacting
  } = useMessage();

  const { sender, content, pinned, _id, visibleTo } = message;

  const isAdmin = sender._id === user?.id;

  const onCopyText = () => {
    copy(content || "");
  };

  async function onTogglePin() {
    try {
      const res = await togglePinMessage({
        messageId: _id,
        pinned: !pinned
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }
    } catch (error) {
      console.error("Error pinning/unpinning message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to pin/unpin message."
      );
    }
  }

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
    <div className="flex flex-wrap items-center gap-1.5">
      <Popover>
        <ActionTooltip label="Add Reaction" size="sm" side="top">
          <PopoverTrigger
            nativeButton={false}
            render={
              <IconMoodSmile
                onMouseDown={e => e.preventDefault()}
                className={cn(
                  "text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1",
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
      {isAdmin && (
        <>
          <ActionTooltip label="Edit" size="sm" side="top">
            <IconPencil
              onClick={() =>
                open("edit-message", {
                  message
                })
              }
              className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
            />
          </ActionTooltip>
          <ActionTooltip label="Delete" size="sm" side="top">
            <IconTrash
              onClick={() =>
                open("delete-message", {
                  message
                })
              }
              className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
            />
          </ActionTooltip>
        </>
      )}
      <ActionTooltip label="Reply" size="sm" side="top">
        <IconArrowBackUp
          onClick={() =>
            setReplyingTo({
              _id: message._id,
              content: message.content,
              sender: {
                _id: message.sender._id,
                name: message.sender.name,
                username: message.sender.username
              }
            })
          }
          className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
        />
      </ActionTooltip>
      <ActionTooltip label="Forward" size="sm" side="top">
        <IconArrowForwardUp className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
      </ActionTooltip>

      {!visibleTo?.length && (
        <ActionTooltip label={pinned ? "Unpin" : "Pin"} size="sm" side="top">
          {!pinned ? (
            <IconPin
              onClick={onTogglePin}
              className={cn(
                "text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1",
                isMessageTogglingPin && "cursor-not-allowed opacity-50"
              )}
            />
          ) : (
            <IconPinnedOff
              onClick={onTogglePin}
              className={cn(
                "text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1",
                isMessageTogglingPin && "cursor-not-allowed opacity-50"
              )}
            />
          )}
        </ActionTooltip>
      )}
      <ActionTooltip label={copied ? "Copied" : "Copy"} size="sm" side="top">
        {copied ? (
          <IconCheck className="size-7 cursor-default p-1 text-green-600" />
        ) : (
          <IconCopy
            onClick={onCopyText}
            className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
          />
        )}
      </ActionTooltip>
    </div>
  );
}
