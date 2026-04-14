import {
  CreateChannelSchemaType,
  EditChannelSchemaType
} from "@/validators/channel";
import { fetchWithAuth } from "./auth";

export async function createChannel({
  serverId,
  categoryId,
  data
}: {
  serverId: string;
  categoryId?: string;
  data: CreateChannelSchemaType;
}) {
  const res = await fetchWithAuth(
    `/api/channels?serverId=${serverId}&categoryId=${categoryId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include"
    }
  );

  // const res = await fetch(
  //   `/api/channels?serverId=${serverId}&categoryId=${categoryId}`,
  //   {
  //     method: "POST",
  //     body: JSON.stringify(data),
  //     credentials: "include"
  //   }
  // );

  return res.json();
}

export async function editChannel(
  channelId: string,
  data: EditChannelSchemaType
) {
  const res = await fetch(`/api/channels/${channelId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    credentials: "include"
  });

  return res.json();
}

export async function deleteChannel(channelId: string) {
  const res = await fetch(`/api/channels/${channelId}`, {
    method: "DELETE",
    credentials: "include"
  });

  return res.json();
}
