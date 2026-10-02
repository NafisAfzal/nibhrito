import {
  decode,
  encode,
  utf8,
  ValidationError,
} from '../../shared/protocol/encoding';
import type { Env } from '../types';
import { HttpError } from './request';
export function normalizeNetwork(value: string): string {
  if (value.length > 64 || value.includes('%')) throw new ValidationError();
  if (/^\d+\.\d+\.\d+\.\d+$/.test(value)) {
    const parts = value.split('.');
    if (parts.some((p) => Number(p) > 255 || String(Number(p)) !== p))
      throw new ValidationError();
    return `${value}/32`;
  }
  if (!/^[0-9a-fA-F:.]+$/.test(value)) throw new ValidationError();
  let canonical: string;
  try {
    canonical = new URL(`http://[${value}]/`).hostname.slice(1, -1);
  } catch {
    throw new ValidationError();
  }
  const halves = canonical.split('::'),
    left = halves[0] ? halves[0].split(':') : [],
    right = halves[1] ? halves[1].split(':') : [];
  const parts =
    halves.length === 2
      ? [
          ...left,
          ...Array<string>(8 - left.length - right.length).fill('0'),
          ...right,
        ]
      : left;
  if (parts.length !== 8) throw new ValidationError();
  if (parts.slice(0, 5).every((p) => p === '0') && parts[5] === 'ffff') {
    const a = parseInt(parts[6]!, 16),
      b = parseInt(parts[7]!, 16);
    return `${a >>> 8}.${a & 255}.${b >>> 8}.${b & 255}/32`;
  }
  return (
    parts
      .slice(0, 4)
      .map((p) => parseInt(p, 16).toString(16))
      .join(':') + '::/64'
  );
}
export function sourceNetwork(request: Request, env: Env): string {
  if (
    env.APP_ENV === 'local' &&
    ['127.0.0.1', 'localhost', '[::1]'].includes(new URL(request.url).hostname)
  )
    return 'local-loopback';
  if (env.APP_ENV !== 'production' || request.headers.has('CF-Worker'))
    throw new HttpError(503, 'UNAVAILABLE', 'Service temporarily unavailable.');
  const source = request.headers.get('CF-Connecting-IP');
  if (!source)
    throw new HttpError(503, 'UNAVAILABLE', 'Service temporarily unavailable.');
  return normalizeNetwork(source);
}
export async function networkBucket(
  secret: string,
  network: string,
  scope: string,
  now: number,
): Promise<string> {
  const raw = decode(secret, 32);
  const root = await crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  raw.fill(0);
  const day = new Uint8Array(
    await crypto.subtle.sign(
      'HMAC',
      root,
      utf8.encode(`nibhrito:rate:day:${Math.floor(now / 86400000)}`),
    ),
  );
  const key = await crypto.subtle.importKey(
    'raw',
    day,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  day.fill(0);
  return encode(
    new Uint8Array(
      await crypto.subtle.sign('HMAC', key, utf8.encode(`${scope}|${network}`)),
    ),
  );
}
