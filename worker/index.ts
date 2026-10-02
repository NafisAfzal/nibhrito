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
import { D1RateRepository } from './repositories/rateRepository';
import { rateLimit, type WriteLimits } from './middleware/rateLimit';
import { checkOrigin, HttpError, noBody } from './security/request';
import { siteInfo } from '../shared/schemas/site';
import { success } from './routes/profiles';

export default {
  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    await new D1CleanupRepository(env.DB).cleanup(controller.scheduledTime);
  },
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      let limits: WriteLimits;
      try {
        if (
          env.APP_ENV === 'production' &&
          new URL(request.url).protocol !== 'https:'
        )
          throw new HttpError(426, 'HTTPS_REQUIRED', 'HTTPS is required.');
        checkOrigin(request);
        limits = await rateLimit(request, env, new D1RateRepository(env.DB));
        if (
          pathname === '/api/v1/site' &&
          request.method === 'GET' &&
          !new URL(request.url).search
        ) {
          await noBody(request);
          return success(
            siteInfo({
              operator_name: env.PUBLIC_OPERATOR_NAME ?? '',
              contact_email: env.PUBLIC_CONTACT_EMAIL ?? '',
              jurisdiction: env.PUBLIC_JURISDICTION ?? '',
              local: env.APP_ENV === 'local',
            }),
          );
        }
      } catch (error) {
        if (error instanceof HttpError)
          return apiError(
            error.code,
            error.message,
            error.status,
            error.status === 429 ? { 'Retry-After': '3600' } : undefined,
          );
        return apiError('UNAVAILABLE', 'Service temporarily unavailable.', 503);
      }
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
          Date.now(),
          limits,
        );
      return profileRoutes(request, profiles, Date.now(), limits);
    }

    try {
      return secureResponse(await env.ASSETS.fetch(request));
    } catch {
      return apiError('UNAVAILABLE', 'Service temporarily unavailable.', 503);
    }
  },
} satisfies ExportedHandler<Env>;
