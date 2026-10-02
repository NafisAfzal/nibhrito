import { decode, slug, ValidationError } from '../../shared/protocol/encoding';
import { validatePoint } from '../../shared/protocol/envelope';
import { fingerprint } from './keys';
export async function parseShareLink(url: URL) {
  const match = /^\/u\/([^/]+)$/.exec(url.pathname),
    fragment = /^#v=1&pk=([A-Za-z0-9_-]{87})$/.exec(url.hash);
  if (!match || !fragment || url.search) throw new ValidationError();
  const profileSlug = slug(match[1]),
    publicKey = fragment[1]!;
  await validatePoint(publicKey);
  return {
    profileSlug,
    publicKey,
    keyId: await fingerprint(decode(publicKey, 65)),
  };
}
