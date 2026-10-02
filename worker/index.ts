import { secureResponse } from './middleware/securityHeaders';
import { D1ReadinessRepository } from './repositories/readinessRepository';
import { apiError, handleApi } from './routes/api';
import type { Env } from './types';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return handleApi(request, new D1ReadinessRepository(env.DB));
    }

    try {
      return secureResponse(await env.ASSETS.fetch(request));
    } catch {
      return apiError('UNAVAILABLE', 'Service temporarily unavailable.', 503);
    }
  },
} satisfies ExportedHandler<Env>;
