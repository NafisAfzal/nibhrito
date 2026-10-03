import { expect, test } from './test';
test('setup and restore keep keys and recovery code out of requests', async ({
  page,
  browser,
}) => {
  const name = `test-${crypto.randomUUID().slice(0, 8)}`;
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined });
  });
  let code = '';
  let leaked = false;
  const errors: string[] = [];
  page.on('request', (r) => {
    if (code) {
      const data = JSON.stringify([r.url(), r.postData(), r.headers()]);
      if (
        data.includes(code) ||
        data.includes(code.slice(5, 48)) ||
        data.includes('recipient_private_jwk')
      )
        leaked = true;
    }
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/create');
  await page.getByLabel('Display name', { exact: true }).fill('বাংলা Profile');
  await page.getByLabel('Link name', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Prepare my recovery code' }).click();
  code = await page.getByLabel('Recovery code', { exact: true }).inputValue();
  expect(code.startsWith('NBR1-')).toBe(true);
  await page.getByLabel('I saved my recovery code somewhere safe').check();
  await page.getByRole('button', { name: 'Create my private profile' }).click();
  await page.getByText('View complete link', { exact: true }).click();
  await expect(
    page.getByLabel('Verified share link', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Copy full link', exact: true })
    .click();
  await expect(page.getByRole('alert')).toHaveText(
    'Copy unavailable. Select and copy the full link.',
  );
  const protectedKey = await page.evaluate(
    () =>
      new Promise<boolean>((resolve, reject) => {
        const open = indexedDB.open('nibhrito-v1', 1);
        open.onerror = () => reject(new Error('storage'));
        open.onsuccess = () => {
          const db = open.result,
            request = db.transaction('owners').objectStore('owners').getAll();
          request.onsuccess = () => {
            const value = request.result[0] as { privateKey: CryptoKey };
            db.close();
            resolve(
              value.privateKey.type === 'private' &&
                !value.privateKey.extractable,
            );
          };
        };
      }),
  );
  expect(protectedKey).toBe(true);
  const context = await browser.newContext();
  try {
    const restored = await context.newPage();
    await restored.waitForLoadState('load');
    restored.on('request', (r) => {
      const data = JSON.stringify([r.url(), r.postData(), r.headers()]);
      if (
        data.includes(code) ||
        data.includes(code.slice(5, 48)) ||
        data.includes('recipient_private_jwk')
      )
        leaked = true;
    });
    await restored.goto('http://127.0.0.1:8788/restore');
    await restored.getByLabel('Link name', { exact: true }).fill(name);
    await restored
      .getByLabel('Recovery code', { exact: true })
      .fill('NBR1-invalid');
    await restored
      .getByRole('button', { name: 'Restore profile', exact: true })
      .click();
    await expect(restored.getByRole('alert')).toBeVisible();
    await restored.getByLabel('Recovery code', { exact: true }).fill(code);
    await restored
      .getByRole('button', { name: 'Restore profile', exact: true })
      .click();
    await restored
      .getByRole('navigation', { name: 'Your space navigation' })
      .getByRole('link', { name: 'My link', exact: true })
      .click();
    await restored.getByText('View complete link', { exact: true }).click();
    await expect(
      restored.getByLabel('Verified share link', { exact: true }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
  expect(leaked).toBe(false);
  expect(errors).toEqual([]);
});
