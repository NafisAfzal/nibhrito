import { expect, test } from './test';
import type { Locator, Page, Request } from '@playwright/test';

async function fits(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

async function touchTarget(control: Locator) {
  const box = await control.boundingBox();
  expect(box !== null && box.width >= 44 && box.height >= 44).toBe(true);
}

test('small-phone touch journey preserves complete links, private drafts and deletion confirmation', async ({
  browser,
}) => {
  test.setTimeout(90000);
  const ownerContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:8788',
    hasTouch: true,
    viewport: { width: 320, height: 568 },
  });
  const senderContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:8788',
    hasTouch: true,
    viewport: { width: 320, height: 568 },
  });
  const slug = 'thoughtful-feedback-' + crypto.randomUUID().slice(0, 12);
  const bangla = 'আপনার কাজের একটি ভালো দিক। '.repeat(25);
  const english = 'One helpful suggestion for your next project. '.repeat(40);
  const note = bangla + '\n\n' + english;
  let code = '',
    leaked = false,
    uploaded = false;
  const observe = (request: Request) => {
    const raw = JSON.stringify([request.url(), request.postData()]);
    if (
      raw.includes(note) ||
      raw.includes(bangla) ||
      raw.includes(english) ||
      (code && raw.includes(code)) ||
      raw.includes('recipient_private_jwk')
    )
      leaked = true;
    if (request.method() === 'POST' && request.url().endsWith('/messages'))
      uploaded = true;
  };
  ownerContext.on('request', observe);
  senderContext.on('request', observe);
  try {
    const owner = await ownerContext.newPage();
    await owner.waitForLoadState('load');
    await owner.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (text: string) => {
            document.body.dataset['copiedLink'] = text;
          },
        },
      });
    });
    await owner.goto('/create');
    const firstField = owner.getByLabel('Display name', { exact: true });
    // This is the empty public setup screen, before keys or a profile exist.
    // Failure diagnostics contain geometry/font names only, never DOM or values.
    const publicLayout = await firstField.evaluate((input) => ({
      viewport: [innerWidth, innerHeight],
      font: getComputedStyle(document.body).fontFamily,
      sizes: [
        document.querySelector('.header-inner'),
        document.querySelector('.page-intro'),
        document.querySelector('.page-intro h1'),
        document.querySelector('.page-intro .lede'),
        document.querySelector('.product-flow'),
        input,
      ].map((element) => {
        const rect = element?.getBoundingClientRect();
        return rect ? [rect.y, rect.height] : null;
      }),
    }));
    await expect(
      firstField,
      'Public setup geometry: ' + JSON.stringify(publicLayout),
    ).toBeInViewport({ ratio: 1 });
    await touchTarget(firstField);
    const steps = owner
      .getByRole('list', { name: 'What you are creating' })
      .locator(':scope > li');
    const first = await steps.first().boundingBox(),
      last = await steps.last().boundingBox();
    expect(
      first !== null && last !== null && first.y === last.y && first.x < last.x,
    ).toBe(true);
    await firstField.fill('নিভৃত — thoughtful feedback');
    await owner.getByLabel('Link name', { exact: true }).fill(slug);
    await owner.getByRole('button', { name: 'Prepare my recovery code' }).tap();
    code = await owner
      .getByLabel('Recovery code', { exact: true })
      .inputValue();
    await fits(owner);
    await expect(
      owner.getByLabel('Recovery code', { exact: true }),
    ).toHaveAttribute('aria-describedby', 'recovery-warning');
    await owner.getByLabel('I saved my recovery code somewhere safe').check();
    await owner
      .getByRole('button', { name: 'Create my private profile' })
      .tap();
    const copy = owner.getByRole('button', {
      name: 'Copy full link',
      exact: true,
    });
    await touchTarget(copy);
    await copy.tap();
    await expect(
      owner.getByRole('button', { name: 'Link copied', exact: true }),
    ).toHaveClass(/is-copied/);
    await owner.getByText('View complete link', { exact: true }).tap();
    const link = await owner
      .getByLabel('Verified share link', { exact: true })
      .inputValue();
    expect(link.length > 140 && link.includes('#v=1&pk=')).toBe(true);
    expect(
      (await owner.locator('body').getAttribute('data-copied-link')) === link,
    ).toBe(true);
    await expect(
      owner.getByRole('img', { name: 'QR code for full verified share link' }),
    ).toBeVisible();
    await fits(owner);

    const sender = await senderContext.newPage();
    await sender.waitForLoadState('load');
    await sender.goto(link);
    const composer = sender.getByLabel('Your message', { exact: true });
    // Emulate the space left by a keyboard; physical OS keyboards need device QA.
    await composer.tap();
    await sender.setViewportSize({ width: 320, height: 360 });
    for (const draft of [bangla, english, note]) {
      await composer.fill(draft);
      await composer.scrollIntoViewIfNeeded();
      await expect(composer).toBeFocused();
      await fits(sender);
    }
    expect(new TextEncoder().encode(note).length <= 4096).toBe(true);
    const send = sender.getByRole('button', { name: 'Send private message' });
    await touchTarget(send);
    await sender.route('**/messages', (route) => route.abort('failed'));
    await send.tap();
    await expect(sender.getByRole('alert')).toBeVisible();
    expect((await composer.inputValue()) === note).toBe(true);
    await fits(sender);
    await sender.unroute('**/messages');
    await send.tap();
    await expect(
      sender.getByRole('heading', { name: 'Your words are on their way.' }),
    ).toBeVisible();
    await expect(
      sender.getByRole('list', { name: 'Private delivery' }),
    ).toBeVisible();
    expect(uploaded && !leaked).toBe(true);

    const nav = owner.getByRole('navigation', {
      name: 'Your space navigation',
    });
    await nav.getByRole('link', { name: 'Inbox', exact: true }).tap();
    await expect(owner.locator('.message-text')).toBeVisible();
    expect((await owner.locator('.message-text').textContent()) === note).toBe(
      true,
    );
    await expect(owner.locator('.expiry-label time')).toHaveAttribute(
      'dateTime',
      /T/,
    );
    await fits(owner);
    const remove = owner.getByRole('button', {
      name: 'Delete message',
      exact: true,
    });
    await touchTarget(remove);
    owner.once('dialog', (dialog) => {
      void dialog.dismiss();
    });
    await remove.tap();
    expect((await owner.locator('.message-text').textContent()) === note).toBe(
      true,
    );
    owner.once('dialog', (dialog) => {
      void dialog.accept();
    });
    await remove.tap();
    await expect(
      owner.getByRole('heading', { name: 'No messages yet' }),
    ).toBeVisible();
    await expect(
      owner.getByRole('list', { name: 'Invite your first response' }),
    ).toBeVisible();
    await nav
      .getByRole('link', { name: 'Security & recovery', exact: true })
      .tap();
    await owner.getByLabel('Type your link name to delete').fill(slug);
    owner.once('dialog', (dialog) => {
      void dialog.accept();
    });
    await owner
      .getByRole('button', { name: 'Permanently delete profile', exact: true })
      .tap();
    await expect(
      owner.getByRole('heading', { name: 'Your inbox lives here' }),
    ).toBeVisible();
    expect(leaked).toBe(false);
  } finally {
    await senderContext.close();
    await ownerContext.close();
  }
});
