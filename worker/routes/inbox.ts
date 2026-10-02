import { uuid, ValidationError } from '../../shared/protocol/encoding';
import { parseCursor } from '../../shared/schemas/inbox';
import type { ProfileRepository } from '../repositories/profileRepository';
import type { MessageRepository } from '../repositories/messageRepository';
import { owner } from '../middleware/auth';
import { checkOrigin, HttpError, noBody } from '../security/request';
import { success } from './profiles';
import { apiError } from './api';
export async function inboxRoutes(
  request: Request,
  profiles: ProfileRepository,
  messages: MessageRepository,
  now = Date.now(),
) {
  try {
    const url = new URL(request.url);
    if (url.href.length > 2048) throw new ValidationError();
    await noBody(request);
    checkOrigin(request);
    const profile = await owner(request, profiles);
    if (url.pathname === '/api/v1/inbox' && request.method === 'GET') {
      for (const [key] of url.searchParams)
        if (
          !['cursor', 'limit'].includes(key) ||
          url.searchParams.getAll(key).length !== 1
        )
          throw new ValidationError();
      const raw = url.searchParams.get('limit') ?? '25';
      if (!/^[1-9]\d?$/.test(raw) || Number(raw) > 50)
        throw new ValidationError();
      const cursor = url.searchParams.has('cursor')
        ? parseCursor(url.searchParams.get('cursor')!, profile.id)
        : null;
      return success(
        await messages.inbox(profile.id, Number(raw), cursor, now),
      );
    }
    const match = /^\/api\/v1\/messages\/([^/]+)$/.exec(url.pathname);
    if (match && request.method === 'DELETE' && !url.search) {
      await messages.remove(profile.id, uuid(match[1]));
      return success({ deleted: true });
    }
    return apiError('NOT_FOUND', 'Route not found.', 404);
  } catch (error) {
    if (error instanceof HttpError)
      return apiError(error.code, error.message, error.status);
    if (error instanceof ValidationError || error instanceof SyntaxError)
      return apiError('INVALID_REQUEST', 'Invalid request.', 400);
    return apiError('UNAVAILABLE', 'Service temporarily unavailable.', 503);
  }
}
