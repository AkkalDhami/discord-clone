import { STATUS_CODES } from "@/constants/status-codes";
import { logger } from "./logger";
import { NextRequest } from "next/server";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function AsyncHandler(
  fn: (req: NextRequest, ctx?: any) => Promise<Response>
) {
  return async (req: NextRequest, ctx?: any) => {
    try {
      return await fn(req, ctx);
    } catch (err: any) {
      logger.error(err, "API Error");
      return new Response(
        JSON.stringify({
          success: false,
          message: err.message || "Internal Server Error"
        }),
        { status: err.status || STATUS_CODES.INTERNAL_SERVER_ERROR }
      );
    }
  };
}
