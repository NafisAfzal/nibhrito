import type { ApiResponse } from '../../shared/types/api';
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  if (!path.startsWith('/api/v1/') || path.includes('#'))
    throw new Error('Invalid API path.');
  try {
    const response = await fetch(path, {
      method: options.method ?? 'GET',
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      headers: {
        ...(options.body === undefined
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.body === undefined
        ? {}
        : { body: JSON.stringify(options.body) }),
      ...(options.signal ? { signal: options.signal } : {}),
    });
    const result = (await response.json()) as ApiResponse<T>;
    if (!result.ok) throw new ApiError(result.error.code, result.error.message);
    if (!response.ok) throw new Error();
    return result.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // eslint-disable-next-line preserve-caught-error -- Network causes may include sensitive request details.
    throw new Error('Could not connect. Please try again.');
  }
}
