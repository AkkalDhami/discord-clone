"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { FieldGroup } from "@/components/ui/field";
import { useModal } from "@/hooks/use-modal-store";
import { useConversation } from "@/hooks/use-conversaton";
import {
  ConversationUpdateSchema,
  type ConversationUpdateType
} from "@/validators/conversation";
import { EmojiInput } from "@/components/common/emoji-input";

export function EditGroupModal() {
  const router = useRouter();
  const { isOpen, type, close, data } = useModal();
  const isModalOpen = isOpen && type === "edit-group";
  const conversation = data?.conversation as
    | {
        _id: string;
        name?: string;
        type?: string;
      }
    | undefined;

  const { updateConversation, isConversationUpdating } = useConversation();

  const form = useForm<ConversationUpdateType>({
    resolver: zodResolver(ConversationUpdateSchema),
    defaultValues: {
      conversationId: conversation?._id ?? "",
      name: conversation?.name ?? ""
    }
  });

  useEffect(() => {
    if (isModalOpen && conversation) {
      form.reset({
        conversationId: conversation._id,
        name: conversation.name ?? ""
      });
    }
  }, [conversation, form, isModalOpen]);

  const handleClose = () => {
    close();
  };

  const onSubmit = async (values: ConversationUpdateType) => {
    if (!conversation?._id) {
      return toast.error("Unable to edit group");
    }

    try {
      const response = await updateConversation(values);

      if (response.success) {
        toast.success(response.message || "Group updated successfully");
        router.refresh();
        close();
        return;
      }

      toast.error(response.message || "Failed to update group");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update group");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="text-accent-foreground w-full max-w-md gap-0 p-0">
        <DialogHeader className="px-5 py-4">
          <DialogTitle className="text-base font-medium">
            Edit group
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Change the group chat name.
          </p>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-5 pb-5">
          <FieldGroup>
            <EmojiInput
              label="Group name"
              control={form.control}
              name="name"
              placeholder="Enter a new group name"
            />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isConversationUpdating || !form.formState.isDirty}>
              {isConversationUpdating ? (
                <>
                  <Spinner /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
