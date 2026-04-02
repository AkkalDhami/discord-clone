import { z } from "zod";

const clientSchema = z.object({
  // NEXT_PUBLIC_APP_URL: z.url()
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),

});

const parsed = clientSchema.safeParse({
  // NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

});

if (!parsed.success) {
  throw new Error("❌ Invalid client env");
}

const clientEnv = parsed.data;

export default clientEnv;