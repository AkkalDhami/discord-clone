import { fetchWithAuth } from "@/lib/api/auth";
import {
  ConversationType,
  ConversationUpdateType,
  DeleteConversationType,
  LeaveConversationType
} from "@/validators/conversation";

export async function getConversation() {
  const res = await fetchWithAuth("/api/conversations", {
    method: "GET",
    credentials: "include"
  });

  return res.json();
}

export async function createConversation(data: ConversationType) {
  const res = await fetchWithAuth("/api/conversations", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include"
  });

  return res.json();
}

export async function updateConversation(
  conversationId: string,
  data: Pick<ConversationUpdateType, "name">
) {
  const res = await fetchWithAuth("/api/conversations", {
    method: "PATCH",
    body: JSON.stringify({ conversationId, ...data }),
    credentials: "include"
  });

  return res.json();
}

export async function addGroupMembers(
  conversationId: string,
  participants: string[]
) {
  const res = await fetchWithAuth(
    `/api/conversations/${conversationId}/members`,
    {
      method: "PATCH",
      body: JSON.stringify({ participants }),
      credentials: "include"
    }
  );

  return res.json();
}

export async function removeGroupMembers(data: LeaveConversationType) {
  const res = await fetchWithAuth(
    `/api/conversations/${data.conversationId}/members`,
    {
      method: "PUT",
      body: JSON.stringify({ participants: data.participants }),
      credentials: "include"
    }
  );

  return res.json();
}

export async function kickGroupMember(data: LeaveConversationType) {
  const res = await fetchWithAuth(
    `/api/conversations/${data.conversationId}/members`,
    {
      method: "DELETE",
      body: JSON.stringify({ participants: data.participants }),
      credentials: "include"
    }
  );

  return res.json();
}

export async function deleteConversation({
  conversationId
}: DeleteConversationType) {
  const res = await fetchWithAuth(`/api/conversations/${conversationId}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!res.ok) return null;

  return res.json();
}
