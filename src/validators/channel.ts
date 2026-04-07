import ChannelType from "@/enums/channel.enum";
import z from "zod";

export const CreateChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required"),
  type: z.enum(ChannelType, {
    error: "Invalid channel type"
  })
});

export const EditChannelSchema = CreateChannelSchema.partial();

export type CreateChannelSchemaType = z.infer<typeof CreateChannelSchema>;
export type EditChannelSchemaType = z.infer<typeof EditChannelSchema>;
