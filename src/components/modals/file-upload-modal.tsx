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
import { ServerSchema, ServerSchemaType } from "@/validators/server";
import { FileUpload } from "@/components/uploads/file-upload";
import toast from "react-hot-toast";
import { useModal } from "@/hooks/use-modal-store";
import { Spinner } from "@/components/ui/spinner";
import { FileUploadSchema, FileUploadType } from "@/validators/chat";

export function FileUploadModal() {
  const { close, isOpen, type } = useModal();
  const isModalOpen = isOpen && type === "file-upload";

  const form = useForm<FileUploadType>({
    resolver: zodResolver(FileUploadSchema),
    defaultValues: {
      file: "",
    }
  });

  async function onSubmit(data: FileUploadType) {
    try {
      console.log(data);
      // const res = await createServer(data);
      // if (res.success) {
      //   toast.success(res.message);

      //   form.reset();
      //   router.refresh();
      //   close();
      // } else {
      //   toast.error(res.message);
      // }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create server");
    }
  }

  const isLoading = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset();
    close();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <form id="server-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="file"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FileUpload
                      endpoint="messageFile"
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
              form="server-form"
              className="h-10 w-full py-2"
              disabled={isLoading || !form.formState.isDirty}>
              {isLoading ? (
                <>
                  <Spinner /> Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
