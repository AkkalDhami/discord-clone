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
import { useServer } from "@/hooks/use-server";
import { useRouter } from "next/navigation";

export function LeaveServerModal() {
  const { close, isOpen, type, data } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "leave-server";

  const { leaveServer, isLeaving } = useServer();
  const { server } = data;
  if (!server) {
    return;
  }

  const onLeaveServer = async () => {
    try {
      const res = await leaveServer(server?._id?.toString());
      if (res?.success) {
        close();
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to leave server");
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
          <DialogTitle>Leave &apos;{server.name}&apos;</DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to leave <strong>{server.name}</strong>? You
            won&apos;t be able to re-join this server unless you are re-invited.
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
            disabled={isLeaving}
            onClick={onLeaveServer}
            className={"h-10 py-2 text-base font-medium"}>
            {isLeaving ? (
              <>
                <Spinner /> Leaving...
              </>
            ) : (
              "Leave Server"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
