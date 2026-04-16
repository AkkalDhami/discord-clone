import { z } from "zod";

export const baseEnvSchema = z.object({
  DATABASE_URL: z.string(),

  UPLOADTHING_TOKEN: z.string(),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  UPSTASH_REDIS_REST_TOKEN: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),

  EMAIL_FROM: z.string(),

  RESEND_API_KEY: z.string()
});
