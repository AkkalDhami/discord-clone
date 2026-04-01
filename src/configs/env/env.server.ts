import z from "zod";
import { baseEnvSchema } from "./env.schema";

const parsed = baseEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

const env = Object.freeze(parsed.data);

export default env;
