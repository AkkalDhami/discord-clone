import z from "zod";

export const CreateMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1),
  privateUsers: z.array(z.string()).optional(),
  serverId: z.string().optional(),
  channelId: z.string().optional(),
  replyTo: z.string().optional(),
  forwarded: z.boolean().default(false).optional()
});

export const UpdateMessageSchema = CreateMessageSchema.partial()
  .pick({
    content: true
  })
  .extend({
    pinned: z.boolean().optional(),
    reaction: z.string().min(1).optional()
  });

export type CreateMessageType = z.infer<typeof CreateMessageSchema>;
export type UpdateMessageType = z.infer<typeof UpdateMessageSchema>;
