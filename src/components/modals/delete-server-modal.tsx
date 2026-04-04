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

export function DeleteServerModal() {
  const { close, isOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === "delete-server";
  const router = useRouter();
  const { deleteServer, isDeleting } = useServer();
  const { server } = data;
  if (!server) {
    return;
  }

  const onDeleteServer = async () => {
    try {
      const res = await deleteServer({ serverId: server?._id?.toString() });
      if (res.success) {
        toast.success(res.message ?? "Server deleted successfully");
        close();
        router.push("/");
      } else {
        toast.error(res.message ?? "Failed to delete server");
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to delete server");
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
          <DialogTitle>Delete &apos;{server.name}&apos;</DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to delete <strong>{server.name}</strong>? All
            of your messages and channels will be permanently deleted.
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
            disabled={isDeleting}
            onClick={onDeleteServer}
            className={"h-10 py-2 text-base font-medium"}>
            {isDeleting ? (
              <>
                <Spinner /> Deleting...
              </>
            ) : (
              "Delete Server"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
