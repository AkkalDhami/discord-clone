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
import { useFriend } from "@/hooks/use-friend";

export function BlockFriendModal() {
  const { close, isOpen, type, data } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "block-friend";

  const { blockFriend, isBlockingFriend } = useFriend();

  const { friend } = data;
  if (!friend) {
    return;
  }

  const onLeaveServer = async () => {
    try {
      const res = await blockFriend(friend?._id);
      if (res?.success) {
        close();
        router.refresh();
        toast.success(res.message || "Friend blocked successfully");
      } else {
        toast.error(res.message || "Failed to block friend");
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to block friend");
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
          <DialogTitle>Block &lsquo;{friend.name}&rsquo;</DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to block{" "}
            <strong className="text-muted-primary font-medium">
              &lsquo;@{friend.username}&rsquo;
            </strong>{" "}
            from your friends?
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
            disabled={isBlockingFriend}
            onClick={onLeaveServer}
            className={"h-10 py-2 text-base font-medium"}>
            {isBlockingFriend ? (
              <>
                <Spinner /> Blocking...
              </>
            ) : (
              "Block Friend"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
