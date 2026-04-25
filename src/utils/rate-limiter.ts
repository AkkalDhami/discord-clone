import redis from "@/configs/redis";
import {
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS
} from "@/constants/auth-constants";
import { Ratelimit } from "@upstash/ratelimit";

export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS),
  ephemeralCache: new Map(),
  prefix: "@discordbyakkal/ratelimit"
});
