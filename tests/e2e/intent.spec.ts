import { expect, test } from './test';

test('public storytelling explains constructive feedback without crypto, storage or API access', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(globalThis.crypto, 'subtle', { value: undefined });
    Object.defineProperty(globalThis, 'indexedDB', { value: undefined });
  });
  let apiCalls = 0;
  const origins = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    origins.add(url.origin);
    if (url.pathname.startsWith('/api/')) apiCalls++;
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Invite honest feedback.',
  );
  await expect(page.locator('.feedback-example')).toHaveText(
    /An example of your space.*What could I improve.*Someone responds privately/s,
  );
  await expect(
    page.getByRole('heading', { name: 'Your work', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Your ideas', exact: true }),
  ).toBeVisible();
  const comparison = page.getByRole('group', {
    name: 'Why a private response can help',
  });
  await expect(
    comparison.getByRole('list', {
      name: 'With your name attached',
      exact: true,
    }),
  ).toContainText('Feedback held back');
  await expect(
    comparison.getByRole('list', { name: 'With a Nibhrito link', exact: true }),
  ).toContainText('A useful perspective');
  await expect(
    page.getByRole('heading', { name: 'Honest can still be kind.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'See how it works' }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(
    page.getByRole('list', { name: 'How Nibhrito works' }),
  ).toBeInViewport();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Why Nibhrito' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Good feedback needs room to breathe.',
  );
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Why Nibhrito' }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page.getByText('Privacy is here to protect people', { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText('Anonymous to the recipient does not mean untraceable.', {
      exact: false,
    }),
  ).toBeVisible();
  // The "why" page must add an honest account of its own limits rather than
  // repeating the landing walkthrough.
  const boundaries = page.getByRole('region', {
    name: 'What Nibhrito does, and what it cannot do.',
  });
  await expect(boundaries).toBeVisible();
  await expect(
    boundaries.getByRole('heading', { name: 'What it does', exact: true }),
  ).toBeVisible();
  await expect(
    boundaries.getByRole('heading', { name: 'What it cannot do', exact: true }),
  ).toBeVisible();
  await expect(
    boundaries.getByText(
      'Read or moderate the content of an encrypted message.',
    ),
  ).toBeVisible();
  await expect(
    boundaries.getByRole('link', { name: /security model/i }),
  ).toHaveAttribute('href', '/security');
  await expect(
    page.getByRole('list', { name: 'How Nibhrito works' }),
  ).toHaveCount(0);
  await page.getByRole('link', { name: 'See how Nibhrito works' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('list', { name: 'How Nibhrito works' }),
  ).toBeAttached();
  expect(apiCalls).toBe(0);
  expect(origins.size).toBe(1);
  // Public explanation must remain readable; operational routes still fail closed.
  await page.goto('/create');
  await expect(
    page.getByRole('heading', {
      name: 'This browser cannot safely open Nibhrito',
    }),
  ).toBeVisible();
  expect(apiCalls).toBe(0);
});

test('captioned privacy flows retain reading order and adapt to mobile, tablet and desktop', async ({
  page,
}) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    for (const width of [320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/about');
      const flow = page.getByRole('list', {
        name: 'How a message stays private',
      });
      const items = flow.locator(':scope > li');
      await expect(items).toHaveCount(3);
      await expect(items.nth(0)).toContainText('Encrypted before it leaves');
      await expect(items.nth(1)).toContainText('Stored as encrypted data');
      await expect(items.nth(2)).toContainText('Opened with your key');
      const first = await items.nth(0).boundingBox(),
        last = await items.nth(2).boundingBox();
      expect(first !== null && last !== null).toBe(true);
      if (width <= 640) expect(last!.y).toBeGreaterThan(first!.y);
      else {
        expect(last!.x).toBeGreaterThan(first!.x);
        expect(last!.y).toBe(first!.y);
      }
      for (const icon of await flow.locator('svg').all())
        await expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.goto('/restore');
  await expect(
    page.getByRole('list', { name: 'How recovery brings you back' }),
  ).toContainText('Keep your code safe');
  await page.goto('/backup');
  await expect(
    page.getByRole('list', { name: 'What you need to open a backup' }),
  ).toContainText('Nothing is uploaded');
});
