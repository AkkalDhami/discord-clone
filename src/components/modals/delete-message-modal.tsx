"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { useModal } from "@/hooks/use-modal-store";
import toast from "react-hot-toast";
import { useMessage } from "@/hooks/use-message";
import { UserAvatar } from "@/components/common/user-avatar";

export function DeleteMessageModal() {
  const { close, isOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === "delete-message";

  const { deleteMessage, isMessageDeleting } = useMessage();

  const { message } = data;
  if (!message) {
    return;
  }

  const onDelete = async () => {
    try {
      const res = await deleteMessage(message._id);
      if (res?.success) {
        close();
      } else {
        toast.error(res.message || "Failed to delete message");
      }
    } catch (error) {
      console.log({ error });
      toast.error(
        error instanceof Error ? error.message : "Failed to delete message"
      );
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={open => {
        if (!open) close();
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Message</DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to delete this message?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-secondary flex items-start gap-2 rounded-lg p-2">
          <UserAvatar
            src={message.sender.avatar?.url}
            name={message.sender.name}
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span>{message.sender.name}</span>
              <span>{new Date(message?.createdAt || "").toLocaleString()}</span>
            </div>
            <p className="font-normal">{message.content}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            onClick={close}
            variant={"outline"}
            className={"h-10 py-2 text-base font-medium"}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={"destructive"}
            disabled={isMessageDeleting}
            onClick={onDelete}
            className={"h-10 py-2 text-base font-medium"}>
            {isMessageDeleting ? (
              <>
                <Spinner /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
