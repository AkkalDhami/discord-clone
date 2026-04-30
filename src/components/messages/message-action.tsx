"use client";

import { ActionTooltip } from "@/components/common/action-tooltip";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCheck,
  IconCopy,
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

export function MessageAction({ message }: { message: IMessage }) {
  const { user } = useUser();
  const { copied, copy } = useCopyToClipboard();

  const { open } = useModal();

  const { togglePinMessage, isMessageTogglingPin } = useMessage();

  const { sender, content, pinned, _id } = message;

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

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {isAdmin && (
        <>
          <ActionTooltip label="Edit" side="top">
            <IconPencil
              onClick={() =>
                open("edit-message", {
                  message
                })
              }
              className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
            />
          </ActionTooltip>
          <ActionTooltip label="Delete" side="top">
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
      <ActionTooltip label="Reply" side="top">
        <IconArrowBackUp className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
      </ActionTooltip>
      <ActionTooltip label="Forward" side="top">
        <IconArrowForwardUp className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
      </ActionTooltip>
      <ActionTooltip label={pinned ? "Unpin" : "Pin"} side="top">
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
      <ActionTooltip label={copied ? "Copied" : "Copy"} side="top">
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
