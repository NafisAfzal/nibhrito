import { expect, test } from './test';

test('creating and switching multiple local profiles preserves the selected space', async ({
  page,
}) => {
  const first = 'first-' + crypto.randomUUID().slice(0, 8),
    second = 'second-' + crypto.randomUUID().slice(0, 8);
  for (const slug of [first, second]) {
    await page.goto('/create');
    await page.getByLabel('Display name', { exact: true }).fill(slug);
    await page.getByLabel('Link name', { exact: true }).fill(slug);
    await page
      .getByRole('button', { name: 'Prepare my recovery code' })
      .click();
    await page.getByLabel('I saved my recovery code somewhere safe').check();
    await page
      .getByRole('button', { name: 'Create my private profile' })
      .click();
    await expect(page.locator('.workspace-name')).toHaveText(slug);
  }
  const nav = page.getByRole('navigation', { name: 'Your space navigation' });
  for (const slug of [first, second]) {
    await page.getByLabel('Your profiles').selectOption(slug);
    await expect(page.locator('.workspace-name')).toHaveText(slug);
    await nav.getByRole('link', { name: 'Profile', exact: true }).click();
    await expect(page.getByLabel('Display name', { exact: true })).toHaveValue(
      slug,
    );
    await nav.getByRole('link', { name: 'My link', exact: true }).click();
    await page.getByText('View complete link', { exact: true }).click();
    const link = await page
      .getByLabel('Verified share link', { exact: true })
      .inputValue();
    expect(new URL(link).pathname === '/u/' + slug).toBe(true);
  }
  for (const slug of [first, second]) {
    if (slug === first)
      await page.getByLabel('Your profiles').selectOption(slug);
    else await page.goto('/inbox?view=security&space=' + slug);
    await nav
      .getByRole('link', { name: 'Security & recovery', exact: true })
      .click();
    await page.getByLabel('Type your link name to delete').fill(slug);
    page.once('dialog', (dialog) => {
      void dialog.accept();
    });
    await page
      .getByRole('button', { name: 'Permanently delete profile', exact: true })
      .click();
    if (slug === first)
      await expect(page.locator('.workspace-name')).toHaveText(second);
  }
  await expect(
    page.getByRole('heading', { name: 'Your inbox lives here' }),
  ).toBeVisible();
});

test('all public destinations fit mobile, tablet and desktop in light and dark', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [360, 390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/',
      '/about',
      '/create',
      '/restore',
      '/inbox',
      '/backup',
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
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
      for (const field of await page.locator('input,select,textarea').all()) {
        expect(
          await field.evaluate(
            (el) => (el as HTMLInputElement).labels?.length ?? 0,
          ),
        ).toBeGreaterThan(0);
        const described = await field.getAttribute('aria-describedby');
        if (described)
          for (const id of described.split(' '))
            await expect(page.locator('#' + id)).toBeAttached();
      }
    }
  }
});

test('mobile menu exposes navigation and Escape returns focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  const menu = page.locator('.mobile-menu');
  await expect(menu).toHaveAccessibleName('Menu');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toHaveAccessibleName('Close menu');
  const inbox = page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'My inbox', exact: true });
  await inbox.focus();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
});

test('owner destinations, complete copy, empty action and deletion cancellation work', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          document.body.dataset['copiedLink'] = text;
        },
      },
    });
  });
  const slug = 'ux-' + crypto.randomUUID().slice(0, 8);
  await page.goto('/create');
  await expect(
    page.getByRole('list', { name: 'What you are creating' }),
  ).toBeVisible();
  await page
    .getByLabel('Display name', { exact: true })
    .fill('বাংলা সুন্দর একটি ব্যক্তিগত জায়গা');
  await page.getByLabel('Link name', { exact: true }).fill(slug);
  await page.getByRole('button', { name: 'Prepare my recovery code' }).click();
  await expect(
    page.getByRole('list', { name: 'How recovery brings you back' }),
  ).toBeVisible();
  await expect(
    page.getByLabel('Recovery code', { exact: true }),
  ).toHaveAttribute('aria-describedby', 'recovery-warning');
  await page.getByLabel('I saved my recovery code somewhere safe').check();
  await page.getByRole('button', { name: 'Create my private profile' }).click();
  await page
    .getByRole('button', { name: 'Copy full link', exact: true })
    .click();
  const copied = await page.locator('body').getAttribute('data-copied-link');
  await page.getByText('View complete link', { exact: true }).click();
  expect(
    copied ===
      (await page
        .getByLabel('Verified share link', { exact: true })
        .inputValue()),
  ).toBe(true);
  expect(copied?.includes('#v=1&pk=')).toBe(true);
  const nav = page.getByRole('navigation', { name: 'Your space navigation' });
  for (const destination of [
    'Inbox',
    'My link',
    'Profile',
    'Security & recovery',
  ]) {
    await nav.getByRole('link', { name: destination, exact: true }).click();
    await expect(
      nav.getByRole('link', { name: destination, exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    if (destination === 'My link')
      await expect(
        page.getByRole('list', { name: 'From your link to your inbox' }),
      ).toBeVisible();
    if (destination === 'Inbox') {
      await expect(
        page.getByRole('list', { name: 'Invite your first response' }),
      ).toBeVisible();
      await expect(page.getByLabel('Search loaded messages')).toHaveCount(0);
    }
    if (destination === 'Security & recovery')
      await expect(
        page.getByRole('list', { name: 'How recovery brings you back' }),
      ).toBeVisible();
    for (const width of [360, 390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.getByLabel('Type your link name to delete').fill(slug);
  page.once('dialog', (dialog) => {
    void dialog.dismiss();
  });
  await page
    .getByRole('button', { name: 'Permanently delete profile', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Security & recovery', exact: true }),
  ).toBeVisible();
  await nav.getByRole('link', { name: 'Inbox', exact: true }).click();
  await page
    .getByRole('link', { name: 'Share your link', exact: true })
    .last()
    .click();
  await expect(
    page.getByRole('heading', { name: 'Your Nibhrito link' }),
  ).toBeVisible();
  await nav
    .getByRole('link', { name: 'Security & recovery', exact: true })
    .click();
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
});
