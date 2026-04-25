import { PartialProfile } from "@/types/friend";

export interface Error {
  data: {
    message: string;
  };
}

export interface ApiResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data?: Record<string, unknown>;
}

export interface SigninResponse extends ApiResponse {
  data: {
    user: PartialProfile & {
      id: string;
    };
  };
}

export interface GetMeResponse extends ApiResponse {
  data: {
    user: PartialProfile & {
      id: string;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}
