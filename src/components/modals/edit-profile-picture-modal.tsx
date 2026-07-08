"use client";

import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { FileUpload } from "@/components/uploads/file-upload";
import toast from "react-hot-toast";
import { useModal } from "@/hooks/use-modal-store";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/hooks/use-user-store";
import { useEffect } from "react";
import { UpdateUserProfile } from "@/types/auth";

type EditProfilePictureForm = {
  avatar: string;
};

export function EditProfilePictureModal() {
  const { close, isOpen, type } = useModal();
  const isModalOpen = isOpen && type === "edit-profile-picture";
  const { updateProfile, updateProfileLoading } = useAuth();
  const { user, setUser } = useUser();

  const form = useForm<EditProfilePictureForm>({
    defaultValues: {
      avatar: user?.avatar?.url || ""
    }
  });

  useEffect(() => {
    if (user?.avatar?.url) {
      form.setValue("avatar", user.avatar.url);
    }
  }, [user, form]);

  async function onSubmit(data: EditProfilePictureForm) {
    if (!data.avatar) {
      toast.error("Please upload a profile image.");
      return;
    }

    try {
      const res = await updateProfile({
        avatar: {
          url: data.avatar
        }
      } as UpdateUserProfile);

      if (res.success) {
        toast.success(res.message || "Profile picture updated successfully");
        setUser({
          id: res.data.user.id,
          name: res.data.user.name,
          username: res.data.user.username,
          email: res.data.user.email,
          avatar: res.data.user.avatar
        });
        form.reset({ avatar: res.data.user.avatar?.url || "" });
        close();
      } else {
        toast.error(res.message || "Failed to update profile picture");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile picture");
    }
  }

  const handleClose = () => {
    form.reset();
    close();
  };

  const isLoading = form.formState.isSubmitting || updateProfileLoading;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
          <p className="text-muted-foreground mb-4">
            Upload a new avatar for your profile.
          </p>
          <form
            id="edit-profile-picture-form"
            onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="avatar"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FileUpload
                      endpoint="serverImage"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="h-10 w-full py-2 text-base font-medium">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              form="edit-profile-picture-form"
              className="h-10 w-full py-2"
              disabled={isLoading || !form.formState.isDirty}>
              {isLoading ? (
                <>
                  <Spinner /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
