import { secureResponse } from './middleware/securityHeaders';
import { D1ReadinessRepository } from './repositories/readinessRepository';
import { apiError, handleApi } from './routes/api';
import type { Env } from './types';
import { D1ProfileRepository } from './repositories/profileRepository';
import { profileRoutes } from './routes/profiles';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      if (pathname === '/api/v1/health')
        return handleApi(request, new D1ReadinessRepository(env.DB));
      return profileRoutes(request, new D1ProfileRepository(env.DB));
    }

    try {
      return secureResponse(await env.ASSETS.fetch(request));
    } catch {
      return apiError('UNAVAILABLE', 'Service temporarily unavailable.', 503);
    }
  },
} satisfies ExportedHandler<Env>;
