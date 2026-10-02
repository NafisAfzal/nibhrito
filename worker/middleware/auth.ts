import { decode, encode } from '../../shared/protocol/encoding';
import type { ProfileRepository } from '../repositories/profileRepository';
import { HttpError } from '../security/request';
export async function owner(request: Request, profiles: ProfileRepository) {
  const header = request.headers.get('Authorization');
  if (!header || !/^Bearer [A-Za-z0-9_-]{43}$/.test(header))
    throw new HttpError(401, 'UNAUTHORIZED', 'Owner authorization required.');
  let token: Uint8Array<ArrayBuffer>;
  try {
    token = decode(header.slice(7), 32);
  } catch {
    throw new HttpError(401, 'UNAUTHORIZED', 'Owner authorization required.');
  }
  const verifier = encode(
    new Uint8Array(await crypto.subtle.digest('SHA-256', token)),
  );
  token.fill(0);
  const profile = await profiles.byVerifier(verifier);
  if (!profile)
    throw new HttpError(401, 'UNAUTHORIZED', 'Owner authorization required.');
  const a = decode(profile.owner_token_hash, 32),
    b = decode(verifier, 32);
  let difference = 0;
  for (let i = 0; i < 32; i++) difference |= a[i]! ^ b[i]!;
  if (difference)
    throw new HttpError(401, 'UNAUTHORIZED', 'Owner authorization required.');
  const { owner_token_hash: _hash, ...publicProfile } = profile;
  void _hash;
  return publicProfile;
}
