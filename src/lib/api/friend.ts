import {
  SendFriendRequestType,
  UpdateFriendRequestStatusType,
  UpdateFriendStatusType
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

export async function getFriendRequests(search: string) {
  const res = await fetchWithAuth(`/api/friends/requests?q=${search}`, {
    method: "GET",
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

export async function cancelFriendRequest(requestId: string) {
  const res = await fetchWithAuth("/api/friends/requests", {
    method: "DELETE",
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

export async function removeFriend(friendId: string) {
  const res = await fetchWithAuth("/api/friends", {
    method: "DELETE",
    body: JSON.stringify({ friendId }),
    credentials: "include"
  });

  return res.json();
}

export async function blockFriend(data: UpdateFriendStatusType) {
  const res = await fetchWithAuth("/api/friends", {
    method: "PUT",
    body: JSON.stringify(data),
    credentials: "include"
  });

  return res.json();
}
