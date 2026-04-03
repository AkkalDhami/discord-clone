import { ServerSchemaType } from "@/validators/server";

export async function createServer(data: ServerSchemaType) {
  const res = await fetch("/api/servers", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include"
  });

  if (!res.ok) throw new Error("Failed to create server");
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
