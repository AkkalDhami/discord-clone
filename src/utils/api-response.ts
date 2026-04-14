import { NextResponse } from "next/server";

type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
  statusCode: number;
};

export function ApiResponse<T>({
  success,
  message,
  data,
  error,
  statusCode
}: ApiResponse<T>) {
  return NextResponse.json(
    {
      success,
      message,
      data,
      error
    },
    { status: statusCode }
  );
}
