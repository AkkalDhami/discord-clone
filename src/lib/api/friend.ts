import {
  SendFriendRequestType,
  UpdateFriendRequestStatusType
} from "@/validators/friends";
import { fetchWithAuth } from "@/lib/api/auth";

export async function sendFriendRequest(data: SendFriendRequestType) {
  const res = await fetchWithAuth("/api/friends/requests/send", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include"
  });

  return res.json();
}

export async function acceptFriendRequest(requestId: string) {
  const res = await fetchWithAuth("/api/friends/requests/accept", {
    method: "PUT",
    body: JSON.stringify({ requestId }),
    credentials: "include"
  });

  return res.json();
}

export async function ignoreFriendRequest(data: UpdateFriendRequestStatusType) {
  const res = await fetchWithAuth("/api/friends/requests/ignore", {
    method: "PUT",
    body: JSON.stringify(data),
    credentials: "include"
  });

  return res.json();
}
