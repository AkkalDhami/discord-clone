"use client";

import { useModal } from "@/hooks/use-modal-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { FieldGroup } from "@/components/ui/field";

import { useForm } from "react-hook-form";
import { ChatInputSchema, ChatInputType } from "@/validators/chat";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmojiInput } from "@/components/common/emoji-input";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useMessage } from "@/hooks/use-message";
import toast from "react-hot-toast";
import { useEffect } from "react";

export function EditMessageModal() {
  const { data, isOpen, type, close } = useModal();

  const { updateMessage, isMessageUpdating } = useMessage();

  const isModalOpen = isOpen && type === "edit-message";

  const form = useForm<ChatInputType>({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: {
      content: ""
    }
  });

  useEffect(() => {
    if (isModalOpen && data.message) {
      form.reset({
        content: data.message.content
      });
    }
  }, [isModalOpen, data.message, form]);

  if (!isModalOpen || !data.message) return null;

  const { message } = data;

  const handleClose = () => {
    form.reset();
    close();
  };

  async function onSubmit(values: ChatInputType) {
    try {
      const res = await updateMessage({
        messageId: message._id,
        content: values.content
      });

      if (res.success) {
        handleClose();
      } else {
        toast.error(res.message || "Failed to update message");
      }
    } catch (error) {
      toast.error("Failed to update message");
      console.error(error);
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
          <DialogDescription>Edit your message</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} id="edit-message-form">
          <FieldGroup>
            <EmojiInput
              control={form.control}
              name="content"
              label="Message"
              type="textarea"
            />
          </FieldGroup>
        </form>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            onClick={() => {
              close();
              form.reset();
            }}
            variant={"outline"}
            className={"h-10 w-full py-2 text-base font-medium"}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant={"primary"}
            form="edit-message-form"
            className="h-10 w-full py-2"
            disabled={isMessageUpdating || !form.formState.isDirty}>
            {isMessageUpdating ? (
              <>
                <Spinner />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
