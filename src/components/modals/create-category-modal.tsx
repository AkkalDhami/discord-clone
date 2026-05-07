"use client";

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

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

import { CreateCategorySchema } from "@/validators/category";
import z from "zod";
import { IconLock } from "@tabler/icons-react";
import { useCategory } from "@/hooks/use-category";

import { EmojiInput } from "@/components/common/emoji-input";

export function CreateCategoryModal() {
  const { close, isOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === "create-category";

  const { server } = data;

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
    // if (data.private && server?.members && server?.members?.length > 1) {
    //   open("add-members", {
    //     server,
    //     category,
    //     categoryData: {
    //       name: data.name,
    //       private: true
    //     }
    //   });
    //   return;
    // }

    try {
      const res = await createCategory({
        serverId: server?._id || "",
        data: {
          name: data.name,
          private: false
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
              <EmojiInput
                label="Category name"
                control={form.control}
                name="name"
                placeholder="Enter category name"
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
              form="create-category-form"
              variant="primary"
              className="h-10 w-full"
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner /> Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
