"use client";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  EditServerSchemaType,
  ServerSchema,
  ServerSchemaType
} from "@/validators/server";
import { FileUpload } from "@/components/uploads/file-upload";
import { useServer } from "@/hooks/use-server";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { EmojiInput } from "@/components/common/emoji-input";

export function EditServerModal() {
  const { close, isOpen, type, data } = useModal();

  const isModalOpen = isOpen && type === "edit-server";
  const { server } = data;

  const { isEditing, editServer } = useServer();
  const router = useRouter();

  const form = useForm<ServerSchemaType>({
    resolver: zodResolver(ServerSchema),
    defaultValues: {
      name: "",
      logo: ""
    }
  });

  useEffect(() => {
    if (server) {
      form.setValue("name", server.name);
      form.setValue("logo", server.logo || "");
    }
  }, [server, form]);

  async function onSubmit(data: EditServerSchemaType) {
    try {
      const res = await editServer({
        serverId: server?._id?.toString() as string,
        data
      });

      if (res.success) {
        toast.success(res.message);
        form.reset();
        router.refresh();
        close();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to edit server");
    }
  }

  const isLoading = form.formState.isSubmitting || isEditing;

  const handleClose = () => {
    form.reset();
    close();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize your server</DialogTitle>
          <p className="text-muted-foreground">
            Update your server&apos;s name and logo to make it truly yours.
          </p>
          <form id="edit-server-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="logo"
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

              <EmojiInput
                label="Server name"
                control={form.control}
                name="name"
                placeholder="Enter server name"
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
              form="edit-server-form"
              className="h-10 w-full py-2"
              disabled={isLoading || !form.formState.isDirty}>
              {isLoading ? (
                <>
                  <Spinner />
                  Updating...
                </>
              ) : (
                "Update Server"
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
