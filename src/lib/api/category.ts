import { CreateCategorySchemaType } from "@/validators/category";

export async function createCategory(
  url: string,
  data: CreateCategorySchemaType
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
    credentials: "include"
  });

  const result = await response.json();
  return result;
}

export async function deleteCategory(categoryId: string) {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: "DELETE",
    credentials: "include"
  });

  const result = await response.json();
  return result;
}
