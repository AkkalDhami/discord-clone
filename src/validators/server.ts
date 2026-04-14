import z from "zod";

export const ServerSchema = z.object({
  name: z
    .string({
      error: "Server name must be a string"
    })
    .min(3, "Server name must be at least 3 characters.")
    .max(32, "Server name must be at most 32 characters."),

  logo: z.string({
    error: "Server logo must be a string"
  })
});

export const EditServerSchema = ServerSchema.partial();

export const DeleteServerSchema = z.object({
  name: z.string({
    error: "You didn't enter the server name correctly"
  })
});

export type ServerSchemaType = z.infer<typeof ServerSchema>;
export type EditServerSchemaType = z.infer<typeof EditServerSchema>;
export type DeleteServerSchemaType = z.infer<typeof DeleteServerSchema>;
