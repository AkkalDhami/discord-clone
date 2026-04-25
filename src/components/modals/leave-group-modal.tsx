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

export function LeaveGroupModal() {
  const { close, isOpen, type, data } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "leave-group";

  const { removeGroupMembers, isRemovingGroupMembers } = useConversation();
  const { conversation, leftUser } = data;
  if (!conversation) {
    return;
  }

  const onLeaveServer = async () => {
    try {
      const res = await removeGroupMembers({
        conversationId: conversation?._id?.toString(),
        participants: [leftUser?._id as string]
      });
      if (res?.success) {
        close();
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to leave conversation");
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
          <DialogTitle>Leave &apos;{conversation?.name}&apos;</DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to leave <strong>{conversation?.name}</strong>? You
            won&apos;t be able to re-join this conversation unless you are re-invited.
          </DialogDescription>
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
            disabled={isRemovingGroupMembers}
            onClick={onLeaveServer}
            className={"h-10 py-2 text-base font-medium"}>
            {isRemovingGroupMembers ? (
              <>
                <Spinner /> Leaving...
              </>
            ) : (
              "Leave Group"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
