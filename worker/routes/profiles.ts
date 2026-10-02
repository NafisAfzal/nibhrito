import { slug, uuid, ValidationError } from '../../shared/protocol/encoding';
import { createProfile, profileUpdate } from '../../shared/schemas/profile';
import { owner } from '../middleware/auth';
import { secureResponse } from '../middleware/securityHeaders';
import type { ProfileRepository } from '../repositories/profileRepository';
import {
  boundedJson,
  checkOrigin,
  HttpError,
  noBody,
} from '../security/request';
import { apiError } from './api';
import type { WriteLimits } from '../middleware/rateLimit';
export function success(data: unknown, status = 200) {
  return secureResponse(
    Response.json(
      { ok: true, data },
      { status, headers: { 'Cache-Control': 'no-store' } },
    ),
  );
}
export async function profileRoutes(
  request: Request,
  profiles: ProfileRepository,
  now = Date.now(),
  limits?: WriteLimits,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    if (url.search || url.pathname.length > 256) throw new ValidationError();
    if (url.pathname === '/api/v1/profiles' && request.method === 'POST') {
      const input = createProfile(await boundedJson(request));
      await limits?.creation();
      return success(await profiles.create(input, now), 201);
    }
    if (url.pathname === '/api/v1/owner' && request.method === 'GET') {
      await noBody(request);
      return success(await owner(request, profiles));
    }
    const match = /^\/api\/v1\/(profiles|recovery)\/([^/]+)$/.exec(
      url.pathname,
    );
    if (
      match?.[1] === 'profiles' &&
      ['PATCH', 'DELETE'].includes(request.method)
    ) {
      checkOrigin(request);
      const profile = await owner(request, profiles);
      if (uuid(match[2]) !== profile.id)
        throw new HttpError(404, 'NOT_FOUND', 'Profile not available.');
      if (request.method === 'DELETE') {
        await noBody(request);
        await profiles.remove(profile.id);
        return success({ deleted: true });
      }
      await profiles.update(
        profile.id,
        profileUpdate(await boundedJson(request, 4096)),
        now,
      );
      return success(await profiles.bySlug(profile.slug));
    }
    if (match && request.method === 'GET') {
      await noBody(request);
      const name = slug(match[2]);
      const result =
        match[1] === 'profiles'
          ? await profiles.bySlug(name)
          : await profiles.recovery(name);
      if (!result)
        throw new HttpError(404, 'NOT_FOUND', 'Profile not available.');
      return success(result);
    }
    return apiError('NOT_FOUND', 'Route not found.', 404);
  } catch (error) {
    if (error instanceof HttpError)
      return apiError(error.code, error.message, error.status);
    if (error instanceof ValidationError)
      return apiError('INVALID_REQUEST', 'Invalid request.', 400);
    return apiError('UNAVAILABLE', 'Service temporarily unavailable.', 503);
  }
}
