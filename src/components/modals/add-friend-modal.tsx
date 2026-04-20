"use client";

import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useModal } from "@/hooks/use-modal-store";

import {
  SendFriendRequestSchema,
  SendFriendRequestType
} from "@/validators/friends";
import { useFriend } from "@/hooks/use-friend";
import { useRouter } from "next/navigation";

export function AddFriendModal() {
  const { close, isOpen, type } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "add-friend";

  const { isSendingFriendRequest, sendFriendRequest } = useFriend();

  const form = useForm<SendFriendRequestType>({
    resolver: zodResolver(SendFriendRequestSchema),
    defaultValues: {
      receiverUsername: ""
    }
  });

  const isLoading = form.formState.isSubmitting || isSendingFriendRequest;

  async function onSubmit(data: SendFriendRequestType) {
    try {
      const res = await sendFriendRequest(data);
      if (res.success) {
        toast.success(res.message || "Friend request sent successfully");
        form.reset();
        close();
        router.refresh();
      } else {
        toast.error(res.message || "Failed to send friend request");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to send friend request");
    }
  }

  const handleClose = () => {
    form.reset();
    close();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            You can add friends with their usernames.
          </DialogDescription>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-3"
            id="add-friend-form">
            <FieldGroup>
              <Controller
                name="receiverUsername"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="h-10"
                      placeholder="Enter username"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <div className="mt-2 grid grid-cols-2 gap-2">
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
              form="add-friend-form"
              variant="primary"
              className="h-10 w-full"
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner /> Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
