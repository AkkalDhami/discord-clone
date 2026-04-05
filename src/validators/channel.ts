import ChannelType from "@/enums/channel.enum";
import z from "zod";

export const CreateChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required"),
  type: z.enum(ChannelType, {
    error: "Invalid channel type"
  })
});

export type CreateChannelSchemaType = z.infer<typeof CreateChannelSchema>;
