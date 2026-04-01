import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url()
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
});

if (!parsed.success) {
  throw new Error("❌ Invalid client env");
}

const clientEnv = parsed.data;

export default clientEnv;