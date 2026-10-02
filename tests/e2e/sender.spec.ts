import { test, expect } from '@playwright/test';
test('full verified link encrypts Unicode before upload; incomplete link fails closed', async ({
  page,
  browser,
}) => {
  const name = `send-${crypto.randomUUID().slice(0, 8)}`;
  await page.goto('/create');
  await page.getByLabel('Display name', { exact: true }).fill('Recipient');
  await page.getByLabel('Link name', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Prepare my recovery code' }).click();
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
      if (raw.includes(note) || r.url().includes('#v=')) leaked = true;
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
    await sender.getByLabel('Your message', { exact: true }).fill(note);
    await sender.getByRole('button', { name: 'Send private message' }).click();
    await expect(
      sender.getByRole('heading', { name: 'Your words are on their way.' }),
    ).toBeVisible();
    expect(uploaded).toBe(true);
    expect(leaked).toBe(false);
  } finally {
    await context.close();
  }
});
