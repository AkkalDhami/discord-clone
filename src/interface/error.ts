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
