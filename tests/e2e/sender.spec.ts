import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
test('full verified link encrypts Unicode before upload; incomplete link fails closed', async ({
  page,
  browser,
}) => {
  const name = `send-${crypto.randomUUID().slice(0, 8)}`;
  await page.goto('/create');
  const publicName = '<img src=x onerror=alert(1)> Recipient';
  await page.getByLabel('Display name', { exact: true }).fill(publicName);
  await page
    .getByRole('textbox', { name: 'Public prompt', exact: true })
    .fill('</textarea><script>window.__xss=1</script>');
  await page.getByLabel('Link name', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Prepare my recovery code' }).click();
  const recovery = await page
    .getByLabel('Recovery code', { exact: true })
    .inputValue();
  await page.getByLabel('I saved my recovery code somewhere safe').check();
  await page.getByRole('button', { name: 'Create my private profile' }).click();
  const link = await page
    .getByLabel('Verified share link', { exact: true })
    .inputValue();
  await expect(
    page.getByRole('img', { name: 'QR code for full verified share link' }),
  ).toBeVisible();
  const context = await browser.newContext();
  try {
    const sender = await context.newPage();
    const note = 'শুভেচ্ছা 🌿 <script>alert(1)</script> unique-private-text';
    let leaked = false,
      uploaded = false;
    sender.on('request', (r) => {
      const raw = JSON.stringify([r.url(), r.postData()]);
      if (
        raw.includes(note) ||
        raw.includes(recovery) ||
        raw.includes(recovery.slice(5, 48)) ||
        raw.includes('recipient_private_jwk') ||
        r.url().includes('#v=')
      )
        leaked = true;
      if (r.method() === 'POST' && r.url().endsWith('/messages'))
        uploaded = true;
    });
    await sender.goto(link.split('#')[0]!);
    await expect(
      sender.getByRole('heading', { name: 'Check this link' }),
    ).toBeVisible();
    await expect(
      sender.getByLabel('Your message', { exact: true }),
    ).toHaveCount(0);
    await sender.goto(link);
    const beforeSkip = sender.url();
    await sender.getByRole('link', { name: 'Skip to content' }).focus();
    await sender.keyboard.press('Enter');
    expect(sender.url()).toBe(beforeSkip);
    await expect(
      sender.getByRole('heading', { name: publicName, exact: true }),
    ).toBeVisible();
    await expect(sender.locator('img')).toHaveCount(0);
    await sender.getByLabel('Your message', { exact: true }).fill(note);
    await sender.getByRole('button', { name: 'Send private message' }).click();
    await expect(
      sender.getByRole('heading', { name: 'Your words are on their way.' }),
    ).toBeVisible();
    expect(uploaded).toBe(true);
    expect(leaked).toBe(false);
    await page.getByRole('button', { name: 'Refresh inbox' }).click();
    await expect(page.locator('.message-text')).toHaveText(note);
    await page
      .getByText('Profile settings & security', { exact: true })
      .click();
    const downloaded = page.waitForEvent('download');
    await page
      .getByRole('button', { name: 'Download encrypted backup' })
      .click();
    const backup = await downloaded,
      file = await backup.path();
    if (!file) throw new Error('Backup unavailable.');
    const rawBackup = await readFile(file, 'utf8');
    expect(
      rawBackup.includes(note) ||
        rawBackup.includes(recovery) ||
        rawBackup.includes('recipient_private_jwk'),
    ).toBe(false);
    await sender.goto('/backup');
    await sender.getByLabel('Encrypted backup file').setInputFiles({
      name: 'encrypted.json',
      mimeType: 'application/json',
      buffer: Buffer.from(rawBackup),
    });
    await sender.getByLabel('Recovery code', { exact: true }).fill(recovery);
    await sender.getByRole('button', { name: 'Open backup locally' }).click();
    await expect(sender.locator('.message-text')).toHaveText(note);
    expect(leaked).toBe(false);
    await expect(page.locator('.message-text script')).toHaveCount(0);
    await sender.goto('/restore');
    await sender.getByLabel('Link name', { exact: true }).fill(name);
    await sender.getByLabel('Recovery code', { exact: true }).fill(recovery);
    await sender
      .getByRole('button', { name: 'Restore profile', exact: true })
      .click();
    await expect(sender.locator('.message-text')).toHaveText(note);
    expect(leaked).toBe(false);
    const persisted = await page.evaluate(async () => {
      const values = await new Promise<unknown[]>((resolve, reject) => {
        const open = indexedDB.open('nibhrito-v1', 1);
        open.onerror = () => reject(new Error('storage'));
        open.onsuccess = () => {
          const db = open.result,
            req = db.transaction('owners').objectStore('owners').getAll();
          req.onsuccess = () => {
            db.close();
            resolve(req.result as unknown[]);
          };
        };
      });
      return JSON.stringify([
        values,
        { ...localStorage },
        { ...sessionStorage },
      ]);
    });
    expect(persisted.includes(note)).toBe(false);
    await page.route('**/api/v1/inbox?*', async (route) => {
      const response = await route.fetch();
      const data = (await response.json()) as {
        data: { messages: { envelope: { ciphertext: string } }[] };
      };
      const item = data.data.messages[0];
      if (item)
        item.envelope.ciphertext =
          (item.envelope.ciphertext[0] === 'A' ? 'B' : 'A') +
          item.envelope.ciphertext.slice(1);
      await route.fulfill({ response, json: data });
    });
    await page.getByRole('button', { name: 'Refresh inbox' }).click();
    await expect(page.getByRole('alert')).toHaveText(
      'This message could not be authenticated or decrypted. No text was displayed.',
    );
    await expect(page.locator('.message-text')).toHaveCount(0);
    await page.unroute('**/api/v1/inbox?*');
    await page.getByRole('button', { name: 'Refresh inbox' }).click();
    await expect(page.locator('.message-text')).toHaveText(note);
    await page.getByLabel('Search loaded messages').fill('no match');
    await expect(
      page.getByRole('heading', { name: 'No matching notes' }),
    ).toBeVisible();
    await page.getByLabel('Search loaded messages').fill('');
    page.once('dialog', (dialog) => {
      void dialog.accept();
    });
    await page
      .getByRole('button', { name: 'Delete message', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'A little quiet, for now' }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
