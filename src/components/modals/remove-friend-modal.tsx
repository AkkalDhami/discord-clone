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

export function RemoveFriendModal() {
  const { close, isOpen, type, data } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "remove-friend";

  const { removeFriend, isRemovingFriend } = useFriend();

  const { friend } = data;
  if (!friend) {
    return;
  }

  const onLeaveServer = async () => {
    try {
      const res = await removeFriend(friend?._id);
      if (res?.success) {
        close();
        router.refresh();
        toast.success(res.message || "Friend removed successfully");
      } else {
        toast.error(res.message || "Failed to remove friend");
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to remove friend");
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
          <DialogTitle>Remove &lsquo;{friend.name}&rsquo;</DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to remove{" "}
            <strong className="text-muted-primary font-medium">
              &lsquo;@{friend.username}&rsquo;
            </strong>{" "}
            from your friends?
          </DialogDescription>

          <ul className="text-muted-foreground list-disc list-inside mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-500" />
              <span>
                If you remove this friend, your{" "}
                <span className="text-foreground font-medium">
                  chat history
                </span>{" "}
                will be deleted.
              </span>
            </li>

            <li className="flex items-start gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-500" />
              <span>
                All{" "}
                <span className="text-foreground font-medium">
                  messages and media
                </span>{" "}
                shared will be permanently removed.
              </span>
            </li>

            <li className="flex items-start gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-500" />
              <span>
                You will no longer be able to{" "}
                <span className="text-foreground font-medium">
                  send messages
                </span>{" "}
                to each other.
              </span>
            </li>

            <li className="flex items-start gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-500" />
              <span>
                You can add them again later, but{" "}
                <span className="text-foreground font-medium">
                  previous conversations won&apos;t be restored
                </span>
                .
              </span>
            </li>
          </ul>
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
            disabled={isRemovingFriend}
            onClick={onLeaveServer}
            className={"h-10 py-2 text-base font-medium"}>
            {isRemovingFriend ? (
              <>
                <Spinner /> Removing...
              </>
            ) : (
              "Remove Friend"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
