import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as categoryApi from "@/lib/api/category";
import {
  CreateCategorySchemaType,
  EditCategorySchemaType
} from "@/validators/category";
import { ApiResponse } from "@/interface/error";

export function useCategory() {
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async ({
      serverId,
      data
    }: {
      serverId: string;
      data: CreateCategorySchemaType & { memberIds?: string[] };
    }) => {
      const res = await categoryApi.createCategory(serverId, data);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      categoryId,
      data
    }: {
      categoryId: string;
      data: EditCategorySchemaType;
    }) => {
      const res = await categoryApi.updateCategory(categoryId, data);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({
      categoryId,
      memberIds,
      serverId,
      type
    }: {
      categoryId: string;
      memberIds: string[];
      serverId: string;
      type: "add" | "remove";
    }) => {
      const res = await categoryApi.updateMember({
        categoryId,
        memberIds,
        serverId,
        type
      });
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const res = await categoryApi.deleteCategory(categoryId);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  return {
    createCategory: createCategoryMutation.mutateAsync,
    isCategoryCreating: createCategoryMutation.isPending,

    updateCategory: updateCategoryMutation.mutateAsync,
    isCategoryUpdating: updateCategoryMutation.isPending,

    updateMember: updateMemberMutation.mutateAsync,
    isMemberUpdating: updateMemberMutation.isPending,

    deleteCategory: deleteCategoryMutation.mutateAsync,
    isCategoryDeleting: deleteCategoryMutation.isPending
  };
}
