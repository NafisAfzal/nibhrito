import { readFile } from 'node:fs/promises';
import { expect, test } from './test';
import { accessible } from './accessibility';

test('public screens and expanded mobile navigation pass local accessibility rules', async ({
  page,
}) => {
  test.setTimeout(180000);
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/',
      '/about',
      '/create',
      '/restore',
      '/backup',
      '/inbox',
      '/u/missing',
      '/privacy',
      '/terms',
      '/acceptable-use',
      '/security',
      '/contact',
      '/missing',
    ]) {
      await page.goto(path);
      await expect(page.locator('main h1')).toBeVisible();
      if (
        [
          '/privacy',
          '/terms',
          '/acceptable-use',
          '/security',
          '/contact',
        ].includes(path)
      )
        await expect(
          page.getByRole('heading', { name: 'Service operator' }),
        ).toBeVisible();
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
        expect(
          await page.evaluate(() => {
            const meta = Array.from(
              document.querySelectorAll<HTMLMetaElement>(
                'meta[name="theme-color"]',
              ),
            ).find((item) => matchMedia(item.media).matches);
            return (
              meta?.content ===
              getComputedStyle(document.documentElement)
                .getPropertyValue('--background')
                .trim()
            );
          }),
        ).toBe(true);
        await accessible(page, path + ' ' + width + ' ' + colorScheme);
      }
    }
  }
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await accessible(page, 'expanded mobile navigation');
  expect(origins.size).toBe(1);
});

test('native private lifecycle and error states pass local accessibility rules without private reports', async ({
  page,
  browser,
}) => {
  test.setTimeout(180000);
  const slug = 'a11y-' + crypto.randomUUID().slice(0, 8);
  const note = 'একটি ভালো দিক। A helpful perspective.';
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/create');
  await page.getByLabel('Display name', { exact: true }).fill('বাংলা Feedback');
  await page.getByLabel('Link name', { exact: true }).fill(slug);
  await page.getByRole('button', { name: 'Prepare my recovery code' }).click();
  const code = await page
    .getByLabel('Recovery code', { exact: true })
    .inputValue();
  await accessible(page, 'recovery acknowledgement');
  await page.getByLabel('I saved my recovery code somewhere safe').check();
  await page.getByRole('button', { name: 'Create my private profile' }).click();
  await page.getByText('View complete link', { exact: true }).click();
  const link = await page
    .getByLabel('Verified share link', { exact: true })
    .inputValue();
  await accessible(page, 'complete share link and QR');
  const nav = page.getByRole('navigation', { name: 'Your space navigation' });
  for (const name of ['Inbox', 'Profile', 'Security & recovery']) {
    await nav.getByRole('link', { name, exact: true }).click();
    if (name === 'Inbox')
      await expect(
        page.getByRole('heading', { name: 'No messages yet' }),
      ).toBeVisible();
    else await expect(page.locator('main h1')).toBeVisible();
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      await accessible(page, name + ' ' + colorScheme);
    }
  }
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:8788',
    viewport: { width: 320, height: 900 },
  });
  let leaked = false;
  context.on('request', (request) => {
    const raw = JSON.stringify([
      request.url(),
      request.postData(),
      request.headers(),
    ]);
    if (
      raw.includes(note) ||
      raw.includes(code) ||
      raw.includes('recipient_private_jwk')
    )
      leaked = true;
  });
  try {
    const sender = await context.newPage();
    await sender.waitForLoadState('load');
    await sender.goto(link);
    await expect(
      sender.getByLabel('Your message', { exact: true }),
    ).toBeVisible();
    await accessible(sender, 'verified composer');
    await sender
      .getByLabel('Your message', { exact: true })
      .fill('ক'.repeat(1500));
    await expect(sender.getByRole('alert')).toBeVisible();
    await accessible(sender, 'oversized message validation');
    await sender.getByLabel('Your message', { exact: true }).fill(note);
    await sender.getByRole('button', { name: 'Send private message' }).click();
    await expect(
      sender.getByRole('heading', { name: 'Your words are on their way.' }),
    ).toBeVisible();
    await accessible(sender, 'private delivery');
    await nav.getByRole('link', { name: 'Inbox', exact: true }).click();
    await expect(page.locator('.message-text')).toBeVisible();
    expect((await page.locator('.message-text').textContent()) === note).toBe(
      true,
    );
    await page.locator('.message-text').scrollIntoViewIfNeeded();
    await page.getByText('Message details', { exact: true }).click();
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      await accessible(
        page,
        'decrypted message and expanded details ' + colorScheme,
      );
    }
    await nav
      .getByRole('link', { name: 'Security & recovery', exact: true })
      .click();
    const download = page.waitForEvent('download');
    await page
      .getByRole('button', { name: 'Download encrypted backup' })
      .click();
    const path = await (await download).path();
    if (!path) throw new Error('Test backup unavailable.');
    const buffer = await readFile(path);
    await sender.goto('/backup');
    await sender.getByLabel('Encrypted backup file').setInputFiles({
      name: 'fixture.json',
      mimeType: 'application/json',
      buffer,
    });
    await sender.getByLabel('Recovery code', { exact: true }).fill(code);
    await sender.getByRole('button', { name: 'Open backup locally' }).click();
    await expect(sender.locator('.message-text')).toBeVisible();
    await sender.locator('.message-text').scrollIntoViewIfNeeded();
    await accessible(sender, 'local archive reading');
    await sender.goto('/restore');
    await sender.getByLabel('Link name', { exact: true }).fill(slug);
    await sender
      .getByLabel('Recovery code', { exact: true })
      .fill('NBR1-invalid');
    await sender
      .getByRole('button', { name: 'Restore profile', exact: true })
      .click();
    await expect(sender.getByRole('alert')).toBeVisible();
    await accessible(sender, 'recovery validation');
    expect(leaked).toBe(false);
    await page.getByLabel('Type your link name to delete').fill(slug);
    page.once('dialog', (dialog) => {
      void dialog.accept();
    });
    await page
      .getByRole('button', { name: 'Permanently delete profile', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Your inbox lives here' }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
