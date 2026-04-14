import { EditServerSchemaType, ServerSchemaType } from "@/validators/server";

export async function createServer(data: ServerSchemaType) {
  const res = await fetch("/api/servers", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include"
  });

  return res.json();
}

export async function editServer(serverId: string, data: EditServerSchemaType) {
  const res = await fetch(`/api/servers/${serverId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    credentials: "include"
  });

  return res.json();
}

export async function generateInviteLink(serverId: string) {
  const res = await fetch(`/api/servers/${serverId}/invite`, {
    method: "PATCH",
    credentials: "include"
  });

  if (!res.ok) throw new Error("Failed to generate invite link");
  return res.json();
}

export async function acceptInvite(serverId: string, inviteCode: string) {
  const res = await fetch(`/api/servers/${serverId}/invite`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ inviteCode })
  });

  return res.json();
}

export async function leaveServer(serverId: string) {
  const res = await fetch(`/api/servers/${serverId}/leave`, {
    method: "PATCH",
    credentials: "include"
  });

  return res.json();
}

export async function deleteServer(serverId: string) {
  const res = await fetch(`/api/servers/${serverId}`, {
    method: "DELETE",
    credentials: "include"
  });

  return res.json();
}
