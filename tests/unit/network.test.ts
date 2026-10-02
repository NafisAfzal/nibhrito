import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { encode } from '../../shared/protocol/encoding';
import {
  networkBucket,
  normalizeNetwork,
  sourceNetwork,
} from '../../worker/security/network';
import type { Env } from '../../worker/types';
describe('network buckets', () => {
  it('matches independent HMAC vector and changes with day/scope/network', async () => {
    const raw = new Uint8Array(32).fill(7),
      secret = encode(raw);
    const day = createHmac('sha256', raw)
      .update('nibhrito:rate:day:0')
      .digest();
    const expected = encode(
      new Uint8Array(
        createHmac('sha256', day).update('api|192.0.2.1/32').digest(),
      ),
    );
    expect(await networkBucket(secret, '192.0.2.1/32', 'api', 0)).toBe(
      expected,
    );
    for (const [network, scope, time] of [
      ['192.0.2.2/32', 'api', 0],
      ['192.0.2.1/32', 'send', 0],
      ['192.0.2.1/32', 'api', 86400000],
    ] as const)
      expect(await networkBucket(secret, network, scope, time)).not.toBe(
        expected,
      );
  });
  it('normalizes IPv4, mapped IPv4 and equivalent IPv6 /64s', () => {
    expect(normalizeNetwork('192.0.2.1')).toBe('192.0.2.1/32');
    expect(normalizeNetwork('::ffff:192.0.2.1')).toBe('192.0.2.1/32');
    expect(normalizeNetwork('2001:DB8:0:1::a')).toBe(
      normalizeNetwork('2001:db8:0000:0001:ffff:ffff:ffff:ffff'),
    );
    for (const bad of [
      '127.1',
      '192.0.2.999',
      '192.00.2.1',
      '::1%zone',
      'garbage',
      '::1, ::2',
    ])
      expect(() => normalizeNetwork(bad)).toThrow();
  });
  it('ignores spoofable forwarded headers; production requires direct trusted edge', () => {
    const env = { APP_ENV: 'production' } as Env;
    const request = (headers: HeadersInit) =>
      new Request('https://nibhrito.invalid/api/v1/health', { headers });
    expect(
      sourceNetwork(
        request({
          'CF-Connecting-IP': '192.0.2.1',
          'X-Forwarded-For': '192.0.2.2',
          'CF-Connecting-IPv6': '2001:db8::1',
        }),
        env,
      ),
    ).toBe('192.0.2.1/32');
    for (const headers of [
      { 'X-Forwarded-For': '192.0.2.1' },
      { 'CF-Connecting-IP': 'bad' },
      { 'CF-Connecting-IP': '192.0.2.1', 'CF-Worker': 'proxy.invalid' },
    ])
      expect(() => sourceNetwork(request(headers), env)).toThrow();
    expect(() =>
      sourceNetwork(request({}), { APP_ENV: 'local' } as Env),
    ).toThrow();
  });
});
