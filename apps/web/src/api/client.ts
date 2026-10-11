import { ApiResponse } from '@devopshub/shared';

const API_BASE_URL = '/api/v1';

class ApiError extends Error {
  constructor(public message: string, public status: number, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include HTTP-only cookies
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: 'Failed to parse API response',
  }));

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error || 'An unexpected API error occurred',
      response.status,
      (data as any).details
    );
  }

  return data.data as T;
}
