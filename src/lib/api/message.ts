import { FetchMessagePayload } from "@/hooks/use-message";
import { fetchWithAuth } from "@/lib/api/auth";
import { CreateMessageType, UpdateMessageType } from "@/validators/message";

export async function createMessage(data: CreateMessageType) {
  const res = await fetchWithAuth("/api/messages", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Failed to create message");
  }

  return res.json();
}

export async function fetchMessages(data: FetchMessagePayload) {
  const res = await fetchWithAuth(
    `/api/messages?conversationId=${data.conversationId}&limit=${data.limit}&cursor=${data.cursor}`,
    {
      method: "GET",
      credentials: "include"
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return res.json();
}

export async function updateMessage(
  data: UpdateMessageType & { messageId: string }
) {
  const { messageId, ...rest } = data;

  const res = await fetchWithAuth(`/api/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify(rest),
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Failed to update message");
  }

  return res.json();
}

export async function deleteMessage(messageId: string) {
  const res = await fetchWithAuth(`/api/messages/${messageId}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Failed to delete message");
  }

  return res.json();
}
