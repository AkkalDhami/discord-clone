import {
  SendFriendRequestType,
  UpdateFriendRequestStatusType
} from "@/validators/friends";
import { fetchWithAuth } from "@/lib/api/auth";

export async function sendFriendRequest(data: SendFriendRequestType) {
  const res = await fetchWithAuth("/api/friends/send", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include"
  });

  return res.json();
}

export async function acceptFriendRequest(requestId: string) {
  const res = await fetchWithAuth("/api/friends/accept", {
    method: "POST",
    body: JSON.stringify({ requestId }),
    credentials: "include"
  });

  return res.json();
}

export async function rejectFriendRequest(data: UpdateFriendRequestStatusType) {
  const res = await fetchWithAuth("/api/friends/requests", {
    method: "PUT",
    body: JSON.stringify(data),
    credentials: "include"
  });

  return res.json();
}
