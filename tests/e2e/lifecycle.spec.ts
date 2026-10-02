import { test, expect } from '@playwright/test';

test('settings, substituted keys, expiry and permanent profile deletion fail safely', async ({
  page,
  browser,
}) => {
  const slug = `life-${crypto.randomUUID().slice(0, 8)}`;
  await page.goto('/create');
  await page
    .getByLabel('Display name', { exact: true })
    .fill('Lifecycle recipient');
  await page.getByLabel('Link name', { exact: true }).fill(slug);
  await page.getByRole('button', { name: 'Prepare my recovery code' }).click();
  await page.getByLabel('I saved my recovery code somewhere safe').check();
  await page.getByRole('button', { name: 'Create my private profile' }).click();
  const link = await page
    .getByLabel('Verified share link', { exact: true })
    .inputValue();
  const context = await browser.newContext();
  try {
    const sender = await context.newPage();
    await sender.goto('/');
    await sender.goto(link);
    await expect(
      sender.getByLabel('Your message', { exact: true }),
    ).toBeVisible();
    const substituted = await sender.evaluate(async () => {
      const pair = await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveBits'],
      );
      const bytes = new Uint8Array(
        await crypto.subtle.exportKey('raw', pair.publicKey),
      );
      return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    });
    await sender.evaluate((key) => {
      location.hash = `v=1&pk=${key}`;
    }, substituted);
    await expect(
      sender.getByRole('heading', { name: 'Check this link' }),
    ).toBeVisible();
    await expect(
      sender.getByLabel('Your message', { exact: true }),
    ).toHaveCount(0);
    await page
      .getByText('Profile settings & security', { exact: true })
      .click();
    await page
      .getByLabel('Display name', { exact: true })
      .fill('Updated recipient');
    await page.getByLabel('Pause incoming messages').check();
    await page
      .getByRole('button', { name: 'Save settings', exact: true })
      .click();
    await expect(page.locator('.settings [role="status"]')).toHaveText(
      'Settings saved.',
    );
    await sender.goto('/');
    await sender.goto(link);
    await expect(
      sender.getByRole('heading', { name: 'Check this link' }),
    ).toBeVisible();
    await page.getByLabel('Pause incoming messages').uncheck();
    await page
      .getByRole('button', { name: 'Save settings', exact: true })
      .click();
    await expect(page.locator('.settings [role="status"]')).toHaveText(
      'Settings saved.',
    );
    await sender.goto('/');
    await sender.goto(link);
    await expect(
      sender.getByRole('heading', { name: 'Updated recipient', exact: true }),
    ).toBeVisible();
    await sender
      .getByLabel('Your message', { exact: true })
      .fill('Expiry stays in browser memory only.');
    await sender.getByRole('button', { name: 'Send private message' }).click();
    await expect(
      sender.getByRole('heading', { name: 'Your words are on their way.' }),
    ).toBeVisible();
    await page.route('**/api/v1/inbox?*', async (route) => {
      const response = await route.fetch();
      const body = (await response.json()) as {
        data: { messages: { expires_at: number }[] };
      };
      for (const message of body.data.messages)
        message.expires_at = Date.now() + 2500;
      await route.fulfill({ response, json: body });
    });
    await expect(
      page.locator('button').filter({ hasText: /^Refresh inbox$/ }),
    ).toHaveCount(1);
    await page
      .locator('button')
      .filter({ hasText: /^Refresh inbox$/ })
      .click();
    await expect(page.locator('.message-text')).toHaveText(
      'Expiry stays in browser memory only.',
    );
    await expect(page.locator('.message-text')).toHaveCount(0, {
      timeout: 6000,
    });
    await page.unroute('**/api/v1/inbox?*');
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
    await sender.goto('/');
    await sender.goto(link);
    await expect(
      sender.getByRole('heading', { name: 'Check this link' }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
