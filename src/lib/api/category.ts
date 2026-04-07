import {
  CreateCategorySchemaType,
  EditCategorySchemaType
} from "@/validators/category";

export async function createCategory(
  serverId: string,
  data: CreateCategorySchemaType & { memberIds?: string[] }
) {
  const response = await fetch(`/api/categories?serverId=${serverId}`, {
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

export async function updateCategory(
  categoryId: string,
  data: EditCategorySchemaType
) {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: "PATCH",
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

export async function removeMember({
  categoryId,
  memberId,
  serverId,
  type
}: {
  categoryId: string;
  memberId: string;
  serverId: string;
  type: "add" | "remove";
}) {
  const response = await fetch(
    `/api/categories/${categoryId}/members/${memberId}?serverId=${serverId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type }),
      credentials: "include"
    }
  );

  const result = await response.json();
  return result;
}
