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
import { useChannel } from "@/hooks/use-channel";

export function DeleteChannelModal() {
  const { close, isOpen, type, data } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "delete-channel";

  const { deleteChannel, isChannelDeleting } = useChannel();
  const { channel } = data;
  if (!channel) {
    return;
  }

  const onLeaveServer = async () => {
    try {
      const res = await deleteChannel(channel?._id?.toString());
      if (res?.success) {
        close();
        router.refresh();

        toast.success(res.message || "Channel deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete channel");
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to delete channel");
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
          <DialogTitle>Delete Channel</DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to delete{" "}
            <strong className="font-semibold">#{channel.name}</strong>? This
            action cannot be undone.
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
            disabled={isChannelDeleting}
            onClick={onLeaveServer}
            className={"h-10 py-2 text-base font-medium"}>
            {isChannelDeleting ? (
              <>
                <Spinner /> Deleting...
              </>
            ) : (
              "Delete Channel"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
