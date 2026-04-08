"use client";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";

import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { IconMoodSmile } from "@tabler/icons-react";

export function EditServerModal() {
  const { close, isOpen, type, data } = useModal();
  const [open, setOpen] = useState(false);

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

  const name = useWatch({
    control: form.control,
    name: "name"
  });

  const onEmojiClick = (emojiData: EmojiClickData) => {
    form.setValue("name", (name || "") + emojiData.emoji, {
      shouldDirty: true
    });
  };

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
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="server-name"
                        className="text-muted-primary font-medium uppercase">
                        Server name
                      </FieldLabel>

                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id="server-name"
                          placeholder="Enter server name"
                        />

                        <InputGroupAddon align="inline-end">
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger
                              render={
                                <button
                                  type="button"
                                  onMouseDown={e => e.preventDefault()}>
                                  <IconMoodSmile className="cursor-pointer" />
                                </button>
                              }></PopoverTrigger>

                            <PopoverContent className="w-auto p-0">
                              <EmojiPicker onEmojiClick={onEmojiClick} />
                            </PopoverContent>
                          </Popover>
                        </InputGroupAddon>
                      </InputGroup>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
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
