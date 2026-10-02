import { readFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import {
  secureResponse,
  securityHeaders,
} from '../../worker/middleware/securityHeaders';
import { handleApi } from '../../worker/routes/api';

describe('security response policy', () => {
  it('applies headers to immutable upstream responses without changing content', async () => {
    const response = secureResponse(
      Response.redirect('https://example.invalid/'),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://example.invalid/');
    for (const [name, value] of Object.entries(securityHeaders)) {
      expect(response.headers.get(name)).toBe(value);
    }
  });

  it('keeps static asset and Worker security policies identical', async () => {
    const staticPolicy = await readFile(
      new URL('../../public/_headers', import.meta.url),
      'utf8',
    );
    for (const [name, value] of Object.entries(securityHeaders)) {
      expect(staticPolicy).toContain(`  ${name}: ${value}`);
    }
    expect(securityHeaders['Content-Security-Policy']).not.toMatch(
      /unsafe-|https?:/,
    );
  });
});

describe('health API', () => {
  it('returns minimal no-store readiness data', async () => {
    const response = await handleApi(
      new Request('https://local.invalid/api/v1/health'),
      {
        isReady: async () => true,
      },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    expect(await response.json()).toEqual({ ok: true, data: { status: 'ok' } });
  });

  it('does not read the repository for unsupported methods or invalid query input', async () => {
    const isReady = vi.fn(async () => true);
    const post = await handleApi(
      new Request('https://local.invalid/api/v1/health', { method: 'POST' }),
      { isReady },
    );
    const query = await handleApi(
      new Request('https://local.invalid/api/v1/health?diagnostics=true'),
      { isReady },
    );
    expect(post.status).toBe(405);
    expect(post.headers.get('allow')).toBe('GET, HEAD');
    expect(query.status).toBe(400);
    expect(isReady).not.toHaveBeenCalled();
  });

  it('returns a bodyless successful HEAD', async () => {
    const response = await handleApi(
      new Request('https://local.invalid/api/v1/health', { method: 'HEAD' }),
      {
        isReady: async () => true,
      },
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');
  });

  it('does not reflect or log failure details', async () => {
    const log = vi.spyOn(console, 'log');
    const error = vi.spyOn(console, 'error');
    try {
      const response = await handleApi(
        new Request('https://local.invalid/api/v1/health'),
        {
          isReady: async () => {
            throw new Error('sensitive-internal-test-sentinel');
          },
        },
      );
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({
        ok: false,
        error: {
          code: 'UNAVAILABLE',
          message: 'Service temporarily unavailable.',
        },
      });
      expect(log).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
      error.mockRestore();
    }
  });
});
