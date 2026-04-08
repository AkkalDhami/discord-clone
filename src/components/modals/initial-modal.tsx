"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldSeparator
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ServerSchema, ServerSchemaType } from "@/validators/server";
import { FileUpload } from "@/components/uploads/file-upload";
import { useServer } from "@/hooks/use-server";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { EmojiClickData } from "emoji-picker-react";
import { EmojiInput } from "@/components/common/emoji-input";

export function InitialModal() {
  const { createServer, createServerLoading } = useServer();

  const form = useForm<ServerSchemaType>({
    resolver: zodResolver(ServerSchema),
    defaultValues: {
      name: "",
      logo: ""
    }
  });

  function onEmojiClick(emojiData: EmojiClickData) {
    form.setValue("name", emojiData.emoji);
  }

  async function onSubmit(data: ServerSchemaType) {
    try {
      const res = await createServer(data);
      if (res.success) {
        toast.success(res.message);
        form.reset();
        window.location.reload();
      } else {
        toast.error(res.message || "Failed to create server");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create server");
    }
  }

  const isLoading = form.formState.isSubmitting || createServerLoading;

  return (
    <Dialog open>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize your server</DialogTitle>
          <p className="text-muted-foreground">
            Give your server a personality with a name and an image. You can
            always change them later.
          </p>
          <form id="create-server-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                onClick={emojiData => {
                  if ("emoji" in emojiData) {
                    onEmojiClick(emojiData);
                  }
                }}
              />
            </FieldGroup>
          </form>

          <FieldSeparator />

          <Field orientation="horizontal">
            <Button
              type="submit"
              variant={"primary"}
              form="create-server-form"
              className="mt-2 h-9 w-full"
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner /> Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </Field>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
