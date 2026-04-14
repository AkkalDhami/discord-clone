"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";

import { UserAvatar } from "@/components/common/user-avatar";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

import {
  EditCategorySchema,
  EditCategorySchemaType
} from "@/validators/category";
import { IconLock, IconX } from "@tabler/icons-react";
import { useCategory } from "@/hooks/use-category";
import { useEffect } from "react";
import MemberRole from "@/enums/role.enum";
import { EmojiInput } from "@/components/common/emoji-input";
import { cn } from "@/lib/utils";

export function EditCategoryModal() {
  const { close, isOpen, type, data, open } = useModal();
  const isModalOpen = isOpen && type === "edit-category";

  const { category } = data;

  const { updateCategory, isCategoryUpdating, isMemberUpdating } =
    useCategory();
  const router = useRouter();

  const form = useForm<EditCategorySchemaType>({
    resolver: zodResolver(EditCategorySchema),
    defaultValues: {
      name: category?.name,
      private: category?.private
    }
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        private: category.private
      });
    }
  }, [category, form]);

  const privateCategory = useWatch({
    control: form.control,
    name: "private"
  });

  async function onSubmit(data: EditCategorySchemaType) {
    try {
      const res = await updateCategory({
        categoryId: category?._id as string,
        data
      });
      if (res.success) {
        toast.success(res.message || "Category updated successfully");
        form.reset();
        router.refresh();
        close();
      } else {
        toast.error(res.message || "Failed to update category");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update category");
    }
  }

  // async function onRemoveMember(memberId: string) {
  //   try {
  //     const res = await removeMember({
  //       categoryId: category?._id as string,
  //       memberId,
  //       serverId: category?.serverId as string,
  //       type: "remove"
  //     });
  //     if (res.success) {
  //       toast.success(res.message || "Member removed successfully");
  //       form.reset();
  //       router.refresh();
  //       close();
  //     } else {
  //       toast.error(res.message || "Failed to remove member");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Failed to remove member");
  //   }
  // }

  const isLoading = form.formState.isSubmitting || isCategoryUpdating;

  const handleClose = () => {
    form.reset();
    close();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className={"uppercase"}>
              General
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className={cn(
                "uppercase",
                !privateCategory &&
                  category?.privateMembers &&
                  category?.privateMembers?.length < 2 &&
                  "hidden"
              )}>
              Permissions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" className={"mt-3"}>
            <DialogHeader>
              <DialogTitle>Update Category</DialogTitle>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-3"
                id="edit-category-form">
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
                              onCheckedChange={checked =>
                                field.onChange(checked)
                              }
                              aria-invalid={fieldState.invalid}
                            />
                          </div>
                          <FieldDescription>
                            By making a category private, only select members
                            and roles will be able to view this category. Linked
                            channels in this category will automatically match
                            to this setting.
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

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={close}
                  variant={"outline"}
                  className={"h-10 py-2 text-base font-medium"}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="edit-category-form"
                  variant={"primary"}
                  className="h-10 w-full py-2"
                  disabled={isLoading || !form.formState.isDirty}>
                  {isLoading ? (
                    <>
                      <Spinner /> Updating...
                    </>
                  ) : (
                    "Update Category"
                  )}
                </Button>
              </div>
            </DialogHeader>
          </TabsContent>
          <TabsContent value="permissions" className={"mt-3"}>
            <DialogHeader>
              <DialogTitle>Update Permissions</DialogTitle>

              <div className="mt-1 flex items-center justify-between">
                <p className="text-muted-primary">
                  Who can access this category?
                </p>
                <Button
                  type="button"
                  variant={"primary"}
                  onClick={() => {
                    close();
                    open("add-members", {
                      category,
                      categoryData: {
                        name: category?.name || "",
                        private: category?.private || false
                      }
                    });
                  }}
                  className={"h-7 text-sm"}>
                  Add Members
                </Button>
              </div>

              <div className="mt-3 space-y-3">
                {category?.private &&
                  category?.privateMembers?.map(m => (
                    <div
                      key={m._id}
                      className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={m.profile.avatar?.url}
                          name={m.profile.name}
                          className="size-9"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {m.profile.name}
                            {"  "}
                            <span className="text-muted-foreground text-xs">
                              ({m.role})
                            </span>
                          </p>
                          {m.profile.username && (
                            <p className="text-muted-foreground text-xs">
                              @{m.profile.username}
                            </p>
                          )}
                        </div>
                      </div>
                      {m.role !== MemberRole.ADMIN && (
                        <Button
                          type="button"
                          onClick={() => {
                            open("remove-member", {
                              category,
                              member: m
                            });
                          }}
                          variant={"ghost"}
                          size={"icon"}
                          disabled={isMemberUpdating}
                          className={"h-8 w-8"}>
                          {isMemberUpdating ? (
                            <Spinner className="size-4" />
                          ) : (
                            <IconX className="size-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={close}
                  variant={"outline"}
                  className={"h-10 px-4 py-2 text-base font-medium"}>
                  Cancel
                </Button>
              </div>
            </DialogHeader>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
