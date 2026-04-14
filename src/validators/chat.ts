import z from "zod";

export const ChatInputSchema = z.object({
  content: z.string().min(1)
});

export const FileUploadSchema = z.object({
  file: z.string().min(1)
});

export type ChatInputType = z.infer<typeof ChatInputSchema>;
export type FileUploadType = z.infer<typeof FileUploadSchema>;
