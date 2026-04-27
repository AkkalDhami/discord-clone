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
import { useRouter } from "next/navigation";
import { useConversation } from "@/hooks/use-conversaton";

export function DeleteConversationModal() {
  const { close, isOpen, type, data } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "delete-conversation";

  const { deleteConversation, isDeletingConversation } = useConversation();

  const { conversation } = data;
  if (!conversation) {
    return;
  }

  const onLeaveServer = async () => {
    try {
      const res = await deleteConversation({
        conversationId: conversation._id
      });

      if (res?.success) {
        close();
        router.refresh();
        toast.success(res.message || "Group conversation deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete group conversation");
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to delete group conversation");
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
          <DialogTitle>
            Delete &lsquo;{conversation?.name || "Group Conversation"}&rsquo;
          </DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to delete{" "}
            <strong className="text-muted-primary font-medium">
              &lsquo;{conversation?.name || "Group"}&rsquo;
            </strong>{" "}
          </DialogDescription>

          <p className="text-base">
            All messages, users, and related data in the group will be
            permanently deleted. This action cannot be undone.
          </p>
        </DialogHeader>
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
            disabled={isDeletingConversation}
            onClick={onLeaveServer}
            className={"h-10 py-2 text-base font-medium"}>
            {isDeletingConversation ? (
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
