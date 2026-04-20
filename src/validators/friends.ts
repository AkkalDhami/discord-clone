import z from "zod";

export const SendFriendRequestSchema = z.object({
  receiverUsername: z.string().min(1, "Receiver username is required")
});

export const UpdateFriendRequestStatus = z.object({
  requestId: z.string().min(1)
});

export type SendFriendRequestType = z.infer<typeof SendFriendRequestSchema>;
export type UpdateFriendRequestStatusType = z.infer<
  typeof UpdateFriendRequestStatus
>;
