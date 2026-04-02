"use client";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ServerSchema, ServerSchemaType } from "@/validators/server";
import { FileUpload } from "../uploads/file-upload";

export function InitialModal() {
  const form = useForm<ServerSchemaType>({
    resolver: zodResolver(ServerSchema),
    defaultValues: {
      name: ""
    }
  });
  function onSubmit(data: ServerSchemaType) {
    console.log(data);
  }

  return (
    <Dialog>
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
                    <FieldLabel
                      htmlFor="server-logo"
                      className="font-medium uppercase">
                      Server logo
                    </FieldLabel>
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
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="server-name"
                      className="font-medium uppercase">
                      Server name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="server-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter server name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <Field orientation="horizontal">
            <Button
              type="submit"
              variant={"primary"}
              form="create-server-form"
              className="mt-4 w-full"
              disabled={form.formState.isLoading}>
              Create
            </Button>
          </Field>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
