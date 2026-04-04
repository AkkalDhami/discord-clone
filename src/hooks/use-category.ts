import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as categoryApi from "@/lib/api/category";
import { CreateCategorySchemaType } from "@/validators/category";

export function useCategory() {
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: ({
      url,
      data
    }: {
      url: string;
      data: CreateCategorySchemaType;
    }) => categoryApi.createCategory(url, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  return {
    createCategory: createCategoryMutation.mutateAsync,
    isCategoryCreating: createCategoryMutation.isPending
  };
}
