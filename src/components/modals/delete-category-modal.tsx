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
import { useCategory } from "@/hooks/use-category";
import { useRouter } from "next/navigation";

export function DeleteCategoryModal() {
  const { close, isOpen, type, data } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "delete-category";

  const { deleteCategory, isCategoryDeleting } = useCategory();
  const { category } = data;
  if (!category) {
    return;
  }

  const onLeaveServer = async () => {
    try {
      const res = await deleteCategory(category?._id?.toString());
      if (res?.success) {
        close();
        router.refresh();

        toast.success(res.message || "Category deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete category");
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to delete category");
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
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to delete <strong>{category.name}</strong>?
            This action cannot be undone.
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
            disabled={isCategoryDeleting}
            onClick={onLeaveServer}
            className={"h-10 py-2 text-base font-medium"}>
            {isCategoryDeleting ? (
              <>
                <Spinner /> Deleting...
              </>
            ) : (
              "Delete Category"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
