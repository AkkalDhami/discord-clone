"use client";

import qs from "query-string";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

import { CreateCategorySchema } from "@/validators/category";
import z from "zod";
import { IconLock } from "@tabler/icons-react";
import { useCategory } from "@/hooks/use-category";

export function CreateCategoryModal() {
  const { close, isOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === "create-category";

  const server = data.server;

  const { createCategory, isCategoryCreating } = useCategory();
  const router = useRouter();

  type CreateCategoryInput = z.input<typeof CreateCategorySchema>;

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: "",
      private: false
    }
  });

  async function onSubmit(data: CreateCategoryInput) {
    try {
      const url = qs.stringifyUrl({
        url: "/api/categories",
        query: {
          serverId: server?._id
        }
      });
      const res = await createCategory({
        url,
        data: {
          name: data.name,
          private: data.private || false
        }
      });
      if (res.success) {
        toast.success(res.message || "Category created successfully");
      } else {
        toast.error(res.message || "Failed to create category");
      }
      form.reset();
      router.refresh();
      close();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create category");
    }
  }

  const isLoading = form.formState.isSubmitting || isCategoryCreating;

  const handleClose = () => {
    form.reset();
    close();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-3"
            id="create-category-form">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="channel-name"
                      className="text-muted-primary font-medium uppercase">
                      Channel name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="channel-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter channel name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="private"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <div className="mb-1 flex items-center justify-between">
                        <FieldLabel
                          htmlFor="private"
                          className="text-muted-primary flex items-center gap-2 font-medium uppercase">
                          <IconLock className="size-4" />
                          Private Category
                        </FieldLabel>
                        <Switch
                          id="private"
                          checked={!!field.value}
                          onCheckedChange={checked => field.onChange(checked)}
                          aria-invalid={fieldState.invalid}
                        />
                      </div>
                      <FieldDescription>
                        By making a category private, only select members and
                        roles will be able to view this category. Linked
                        channels in this category will automatically match to
                        this setting.
                      </FieldDescription>
                    </FieldContent>

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
              form="create-category-form"
              variant={"primary"}
              className="mt-2 h-9 w-full"
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner /> Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </Field>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
