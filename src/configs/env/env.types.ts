import { z } from "zod";
import { baseEnvSchema } from "./env.schema";

export type Env = z.infer<typeof baseEnvSchema>;
