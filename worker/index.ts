import { secureResponse } from './middleware/securityHeaders';
import { D1ReadinessRepository } from './repositories/readinessRepository';
import { apiError, handleApi } from './routes/api';
import type { Env } from './types';
import { D1ProfileRepository } from './repositories/profileRepository';
import { profileRoutes } from './routes/profiles';
import { D1MessageRepository } from './repositories/messageRepository';
import { messageRoutes } from './routes/messages';
import { inboxRoutes } from './routes/inbox';
import { D1CleanupRepository } from './repositories/cleanupRepository';

export default {
  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    await new D1CleanupRepository(env.DB).cleanup(controller.scheduledTime);
  },
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      if (pathname === '/api/v1/health')
        return handleApi(request, new D1ReadinessRepository(env.DB));
      const profiles = new D1ProfileRepository(env.DB);
      if (
        pathname === '/api/v1/inbox' ||
        pathname.startsWith('/api/v1/messages/')
      )
        return inboxRoutes(request, profiles, new D1MessageRepository(env.DB));
      if (/^\/api\/v1\/profiles\/[^/]+\/messages$/.test(pathname))
        return messageRoutes(
          request,
          profiles,
          new D1MessageRepository(env.DB),
        );
      return profileRoutes(request, profiles);
    }

    try {
      return secureResponse(await env.ASSETS.fetch(request));
    } catch {
      return apiError('UNAVAILABLE', 'Service temporarily unavailable.', 503);
    }
  },
} satisfies ExportedHandler<Env>;
