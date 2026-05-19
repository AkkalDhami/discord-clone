import z from "zod";

export const CreateMessageSchema = z.object({
  conversationId: z.string().optional(),
  content: z.string().min(1),
  privateUsers: z.array(z.string()).optional(),
  serverId: z.string().optional(),
  channelId: z.string().optional(),
  replyTo: z.string().optional(),
  forwarded: z
    .object({
      messageId: z.string().min(1),
      senderId: z.string().min(1),
      forwardedAt: z.string().min(1)
    })
    .optional()
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
