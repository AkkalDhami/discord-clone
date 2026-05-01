import { PartialProfile } from "@/types/friend";
import { IMessage } from "@/interface";

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

export interface FetchMessagesResponse extends ApiResponse {
  data: {
    messages: IMessage[];
    nextCursor: string | null;
    hasMore: boolean;
  };
}
