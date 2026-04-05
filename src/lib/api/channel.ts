import { CreateChannelSchemaType } from "@/validators/channel";

export async function createChannel(
  url: string,
  data: CreateChannelSchemaType
) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include"
  });

  return res.json();
}
