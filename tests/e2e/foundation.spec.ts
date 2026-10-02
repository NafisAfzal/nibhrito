import { expect, test } from '@playwright/test';
import { securityHeaders } from '../../worker/middleware/securityHeaders';

test('Worker serves the built SPA and deep links with same-origin assets', async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/create#v=1&pk=public-test-fragment');
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', {
      name: 'Create your profile',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Prepare my recovery code' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    requests.some((url) => url.includes('/assets/') && url.endsWith('.js')),
  ).toBe(true);
  for (const url of requests) {
    expect(new URL(url).origin).toBe('http://127.0.0.1:8788');
    expect(url).not.toContain('public-test-fragment');
    expect(new URL(url).hash).toBe('');
  }
  for (const [name, value] of Object.entries(securityHeaders)) {
    expect(response?.headers()[name.toLowerCase()]).toBe(value);
  }
});

test('health and API failures bypass SPA fallback and have security headers', async ({
  request,
}) => {
  const health = await request.get('/api/v1/health');
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ ok: true, data: { status: 'ok' } });
  expect(health.headers()['cache-control']).toBe('no-store');
  expect(health.headers()['access-control-allow-origin']).toBeUndefined();
  for (const [name, value] of Object.entries(securityHeaders)) {
    expect(health.headers()[name.toLowerCase()]).toBe(value);
  }
  const head = await request.head('/api/v1/health');
  expect(head.status()).toBe(200);
  expect(await head.text()).toBe('');
  const method = await request.post('/api/v1/health', {
    data: 'unsupported body',
  });
  expect(method.status()).toBe(405);
  expect(method.headers()['allow']).toBe('GET, HEAD');
  const query = await request.get('/api/v1/health?debug=1');
  expect(query.status()).toBe(400);
  for (const path of ['/api', '/api/v1/missing']) {
    const missing = await request.get(path, {
      headers: { 'Sec-Fetch-Mode': 'navigate' },
    });
    expect(missing.status()).toBe(404);
    expect(await missing.json()).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Route not found.' },
    });
  }
  const preflight = await request.fetch('/api/v1/health', {
    method: 'OPTIONS',
    headers: { Origin: 'https://other.invalid' },
  });
  expect(preflight.status()).toBe(405);
  expect(preflight.headers()['access-control-allow-origin']).toBeUndefined();
});

test('built static assets have the same header policy as the HTML document', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const sources = await page
    .locator('script[src], link[rel="stylesheet"]')
    .evaluateAll((elements) =>
      elements.map(
        (element) =>
          element.getAttribute('src') ?? element.getAttribute('href'),
      ),
    );
  expect(sources.length).toBeGreaterThanOrEqual(2);
  for (const source of sources) {
    expect(source).not.toBeNull();
    const asset = await request.get(source!);
    expect(asset.status()).toBe(200);
    for (const [name, value] of Object.entries(securityHeaders)) {
      expect(asset.headers()[name.toLowerCase()]).toBe(value);
    }
  }
});

test('production CSP rejects an injected inline script', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    document.body.dataset['inlineExecuted'] = 'no';
    document.addEventListener('securitypolicyviolation', (event) => {
      if (event.blockedURI === 'inline')
        document.body.dataset['inlineBlocked'] = 'yes';
    });
    const injected = document.createElement('script');
    injected.textContent = 'document.body.dataset.inlineExecuted = "yes"';
    document.body.appendChild(injected);
  });
  await expect(page.locator('body')).toHaveAttribute(
    'data-inline-blocked',
    'yes',
  );
  await expect(page.locator('body')).toHaveAttribute(
    'data-inline-executed',
    'no',
  );
});
