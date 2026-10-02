import type { ApiResponse, HealthData } from '../../shared/types/api';
import { secureResponse } from '../middleware/securityHeaders';
import type { ReadinessRepository } from '../repositories/readinessRepository';

function json<T>(
  body: ApiResponse<T>,
  status: number,
  headers?: HeadersInit,
): Response {
  const response = Response.json(body, {
    status,
    ...(headers ? { headers } : {}),
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export function apiError(
  code: string,
  message: string,
  status: number,
  headers?: HeadersInit,
): Response {
  return secureResponse(
    json(
      { ok: false, error: { code, message } },
      status,
      status === 429 ? { 'Retry-After': '3600', ...headers } : headers,
    ),
  );
}

export async function handleApi(
  request: Request,
  readiness: ReadinessRepository,
): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname !== '/api/v1/health') {
    return apiError('NOT_FOUND', 'Route not found.', 404);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return apiError('METHOD_NOT_ALLOWED', 'Method not allowed.', 405, {
      Allow: 'GET, HEAD',
    });
  }
  if (url.search !== '' || request.body !== null) {
    return apiError('INVALID_REQUEST', 'Invalid request.', 400);
  }

  try {
    if (!(await readiness.isReady())) {
      return apiError('UNAVAILABLE', 'Service temporarily unavailable.', 503);
    }
    const response = secureResponse(
      json<HealthData>({ ok: true, data: { status: 'ok' } }, 200),
    );
    return request.method === 'HEAD' ? new Response(null, response) : response;
  } catch {
    // Exception details may contain attacker-controlled input or secrets. Never log them.
    return apiError('UNAVAILABLE', 'Service temporarily unavailable.', 503);
  }
}
