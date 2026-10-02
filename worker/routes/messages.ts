import { slug, ValidationError } from '../../shared/protocol/encoding';
import { messageEnvelope, validatePoint } from '../../shared/protocol/envelope';
import type { MessageRepository } from '../repositories/messageRepository';
import type { ProfileRepository } from '../repositories/profileRepository';
import { boundedJson, HttpError } from '../security/request';
import { apiError } from './api';
import { success } from './profiles';
export async function messageRoutes(
  request: Request,
  profiles: ProfileRepository,
  messages: MessageRepository,
  now = Date.now(),
): Promise<Response> {
  try {
    const url = new URL(request.url),
      match = /^\/api\/v1\/profiles\/([^/]+)\/messages$/.exec(url.pathname);
    if (!match || url.search || url.pathname.length > 256)
      throw new ValidationError();
    if (request.method !== 'POST')
      return apiError('METHOD_NOT_ALLOWED', 'Method not allowed.', 405, {
        Allow: 'POST',
      });
    const name = slug(match[1]),
      e = messageEnvelope(await boundedJson(request, 12288));
    if (e.profile_slug !== name) throw new ValidationError();
    await validatePoint(e.ephemeral_pub);
    const profile = await profiles.bySlug(name);
    if (!profile || profile.is_disabled)
      throw new HttpError(404, 'NOT_FOUND', 'Profile not available.');
    if (profile.current_key_id !== e.key_id) throw new ValidationError();
    const created = await messages.submit(e, now);
    return success(
      { accepted: true, message_id: e.message_id },
      created ? 201 : 200,
    );
  } catch (error) {
    if (error instanceof HttpError)
      return apiError(error.code, error.message, error.status);
    if (error instanceof ValidationError)
      return apiError('INVALID_REQUEST', 'Invalid encrypted message.', 400);
    return apiError('UNAVAILABLE', 'Service temporarily unavailable.', 503);
  }
}
