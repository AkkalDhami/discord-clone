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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";

import { useModal } from "@/hooks/use-modal-store";
import toast from "react-hot-toast";
import { useServer } from "@/hooks/use-server";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import {
  DeleteServerSchema,
  DeleteServerSchemaType
} from "@/validators/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { removeLeadingEmoji } from "@/utils/remove-leading-emoji";

export function DeleteServerModal() {
  const router = useRouter();

  const { close, isOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === "delete-server";

  const { deleteServer, isDeleting } = useServer();
  const { server } = data;

  const form = useForm<DeleteServerSchemaType>({
    resolver: zodResolver(
      DeleteServerSchema.refine(
        data => data.name === removeLeadingEmoji(server?.name || ""),
        {
          message: "You didn't enter the server name correctly",
          path: ["name"]
        }
      )
    ),
    defaultValues: { name: "" }
  });

  if (!server) {
    return;
  }

  const onDeleteServer = async () => {
    try {
      const res = await deleteServer({ serverId: server?._id?.toString() });
      if (res.success) {
        toast.success(res.message ?? "Server deleted successfully");
        close();
        router.push("/");
        form.reset();
      } else {
        toast.error(res.message ?? "Failed to delete server");
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to delete server");
    }
  };

  const onSubmit = (data: DeleteServerSchemaType) => {
    if (data.name !== removeLeadingEmoji(server.name)) return;
    onDeleteServer();
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={open => {
        if (!open) close();
      }}>
      <DialogContent
        onCopy={e => {
          const selection = window.getSelection()?.toString();

          if (!selection) return;

          const replaced = "🖕🖕🖕🖕";

          e.preventDefault();
          e.clipboardData.setData("text/plain", replaced);
        }}>
        <DialogHeader>
          <DialogTitle>Delete &apos;{server.name}&apos;</DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to delete <strong>{server.name}</strong>? All
            of your messages and channels will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <form id="delete-server-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="server-name"
                    className="text-muted-primary font-medium uppercase">
                    Enter server name
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
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            onClick={() => {
              close();
              form.reset();
            }}
            variant={"outline"}
            className={"h-10 py-2 text-base font-medium"}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={"destructive"}
            form="delete-server-form"
            disabled={isDeleting}
            className={"h-10 py-2 text-base font-medium"}>
            {isDeleting ? (
              <>
                <Spinner /> Deleting...
              </>
            ) : (
              "Delete Server"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
