import { CONVERSATION_TYPES } from "@/constants";
import z from "zod";

export const ConversationSchema = z.object({
  participants: z.array(z.string()),
  admin: z.string().min(1, "Admin Id is required"),
  name: z.string().optional(),
  type: z.enum(CONVERSATION_TYPES, {
    error: "Invalid conversation type"
  })
});

export const ConversationUpdateSchema = z.object({
  conversationId: z.string().min(1, "Conversation Id is required"),
  name: z.string().optional()
});

export const ConversationAddMembersSchema = z.object({
  conversationId: z.string().min(1, "Conversation Id is required"),
  participants: z.array(z.string()).min(1, "Select at least one member to add")
});

export const LeaveConversationSchema = z.object({
  conversationId: z.string().min(1, "Conversation Id is required"),
  participants: z.array(z.string()).min(1, "Select at least one member to add")
});

export type ConversationType = z.infer<typeof ConversationSchema>;
export type ConversationUpdateType = z.infer<typeof ConversationUpdateSchema>;
export type ConversationAddMembersType = z.infer<
  typeof ConversationAddMembersSchema
>;
export type LeaveConversationType = z.infer<typeof LeaveConversationSchema>;
