import { test, expect } from './test';

test('theme changes keep action text readable throughout the switch', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('.header-cta')).toBeVisible();
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    for (const colorScheme of ['dark', 'light'] as const) {
      await page.emulateMedia({ colorScheme, reducedMotion });
      const minimum = await page
        .locator('.header-cta')
        .evaluate(async (button) => {
          function luminance(rgb: string) {
            const c = rgb
              .match(/[\d.]+/g)!
              .slice(0, 3)
              .map(Number)
              .map((v) => {
                v /= 255;
                return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
              });
            return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
          }
          let minimum = Infinity;
          // Sample actual painted colors, not just the final semantic tokens.
          // Return a number only; no DOM, private values, or screenshots.
          for (let frame = 0; frame < 20; frame++) {
            await new Promise<void>((resolve) =>
              requestAnimationFrame(() => resolve()),
            );
            const style = getComputedStyle(button);
            const a = luminance(style.color),
              b = luminance(style.backgroundColor);
            minimum = Math.min(
              minimum,
              (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
            );
          }
          return minimum;
        });
      expect(minimum).toBeGreaterThanOrEqual(4.5);
    }
  }
});
test('legal navigation, mobile layout and keyboard focus are usable', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  // WebKit's default Safari preference uses Option-Tab for links.
  if (browserName === 'webkit')
    await page.getByRole('link', { name: 'Skip to content' }).focus();
  else await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  for (const [path, title] of [
    ['/privacy', 'Privacy policy'],
    ['/terms', 'Terms of service'],
    ['/acceptable-use', 'Acceptable use'],
    ['/security', 'Security & encryption'],
    ['/contact', 'Contact & abuse support'],
  ]) {
    await page.goto(path!);
    await expect(
      page.getByRole('heading', { name: title!, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole('heading', { name: 'Service operator' }),
    ).toBeVisible();
  }
  await page.goto('/create');
  const controls = page.locator('input,select,textarea');
  for (const input of await controls.all())
    expect(
      await input.evaluate(
        (el) => (el as HTMLInputElement).labels?.length ?? 0,
      ),
    ).toBeGreaterThan(0);
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto('/missing');
  await expect(
    page.getByRole('heading', { name: 'This space isn’t here' }),
  ).toBeVisible();
});
test('unsupported crypto fails explicitly without requests or fallback', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(globalThis.crypto, 'subtle', { value: undefined });
  });
  let calls = 0;
  page.on('request', (r) => {
    if (r.url().includes('/api/')) calls++;
  });
  await page.goto('/create');
  await expect(
    page.getByRole('heading', {
      name: 'This browser cannot safely open Nibhrito',
    }),
  ).toBeVisible();
  expect(calls).toBe(0);
});
test('operator contact mailbox cannot inject mailto headers', async ({
  page,
}) => {
  const email = 'support+safe?bcc=extra@nibhrito.org';
  await page.route('**/api/v1/site', (route) =>
    route.fulfill({
      json: {
        ok: true,
        data: {
          operator_name: 'Contact fixture',
          contact_email: email,
          jurisdiction: 'Bangladesh',
          local: true,
        },
      },
    }),
  );
  await page.goto('/contact');
  await expect(
    page.getByRole('link', { name: email, exact: true }),
  ).toHaveAttribute('href', `mailto:${encodeURIComponent(email)}`);
});
