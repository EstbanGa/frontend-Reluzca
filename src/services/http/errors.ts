export interface ApiError {
  error_code: string;
  error_message: string;
  error_detail?: string;
}

export function normalizeError(status: number, data: unknown): ApiError {
  if (data && typeof data === 'object' && 'error_code' in data) {
    return data as ApiError;
  }

  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    return {
      error_code: String(d.error_code || d.code || status),
      error_message: String(d.message || d.detail || d.error || `Error ${status}`),
      error_detail: d.detail ? String(d.detail) : undefined,
    };
  }

  return {
    error_code: String(status),
    error_message: `Error ${status}`,
  };
}
