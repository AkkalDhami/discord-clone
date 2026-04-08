import { z } from "zod";

export const baseEnvSchema = z.object({
  DATABASE_URL: z.string(),

  UPLOADTHING_TOKEN: z.string(),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

});
