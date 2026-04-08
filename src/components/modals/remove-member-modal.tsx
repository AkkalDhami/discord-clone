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
import { useCategory } from "@/hooks/use-category";

export function RemoveMemberModal() {
  const { close, isOpen, type, data, open } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "remove-member";

  const { updateMember, isMemberUpdating } = useCategory();
  const { member, category } = data;
  if (!member || !category) {
    // close();
    return;
  }

  async function onRemoveMember() {
    try {
      const res = await updateMember({
        categoryId: category?._id as string,
        memberIds: [member?._id as string],
        serverId: category?.serverId as string,
        type: "remove"
      });
      if (res.success) {
        toast.success(res.message || "Member removed successfully");
        router.refresh();
        close();
      } else {
        toast.error(res.message || "Failed to remove member");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove member");
    }
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={open => {
        if (!open) close();
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Permission Settings</DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to delete{" "}
            <strong className="font-semibold">{member.profile.name}</strong>{" "}
            permissions? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            onClick={() => {
              close();
              open("edit-category", {
                category
              });
            }}
            variant={"outline"}
            className={"h-10 py-2 text-base font-medium"}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={"destructive"}
            disabled={isMemberUpdating}
            onClick={onRemoveMember}
            className={"h-10 py-2 text-base font-medium"}>
            {isMemberUpdating ? (
              <>
                <Spinner /> Removing...
              </>
            ) : (
              "Remove Member"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
