import z from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  private: z
    .boolean({
      error: "Private is required"
    })
    .default(false)
});

export const EditCategorySchema = CreateCategorySchema.partial();

export type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>;
export type EditCategorySchemaType = z.infer<typeof EditCategorySchema>;
