import { z } from "zod";

export const baseEnvSchema = z.object({
  DATABASE_URL: z.url(),

  // LOG_LEVEL: z
  //   .enum(["fatal", "error", "warn", "info", "debug", "trace"])
  //   .default("info"),


  // CLOUDINARY_CLOUD_NAME: z.string(),
  // CLOUDINARY_API_KEY: z.string(),
  // CLOUDINARY_API_SECRET: z.string(),
});
