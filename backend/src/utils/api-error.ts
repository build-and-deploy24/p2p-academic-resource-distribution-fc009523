
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export function createApiError(
  code: string,
  message: string,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
