import { expect, test } from '@playwright/test';

test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
});

for (const [width, deviceScaleFactor] of [[390, 3], [1440, 1]] as const) {
  test.describe(`hero loading at ${width}px / ${deviceScaleFactor}x`, () => {
    test.use({ viewport: { width, height: 900 }, deviceScaleFactor });
    test('preloads only the image selected by the responsive picture', async ({ page }) => {
      const heroRequests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('/images/hero-wireframes-')) heroRequests.push(request.url());
      });
      await page.goto('/');
      const photo = page.locator('img[src="/images/hero-wireframes-2560.webp"]');
      await photo.evaluate((image: HTMLImageElement) => image.decode());
      const currentSrc = await photo.evaluate((image: HTMLImageElement) => image.currentSrc);
      await expect(page.locator('head link[rel="preload"][as="image"][imagesrcset*="hero-wireframes"]')).toHaveCount(1);
      expect(heroRequests).toEqual([currentSrc]);
      // The below-fold video must not compete with initial hero resources.
      await expect(page.locator('video')).not.toHaveAttribute('src');
    });
  });
}

test('copy feedback preserves playground state and back-to-top focus', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
  await page.getByRole('button', { name: 'Give it a nudge' }).click();
  const layout = page.getByRole('button', { name: 'Change perspective' });
  await layout.click();
  const tempo = page.getByRole('slider', { name: 'Tempo' });
  await tempo.focus();
  await page.keyboard.press('ArrowRight');
  await expect(tempo).toHaveAttribute('aria-valuenow', '56');
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.getByRole('status')).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('geralddonkor1@gmail.com');
  await expect(page.getByRole('button', { name: 'Toggle spring position' })).toHaveAttribute('aria-pressed', 'true');
  await expect(layout).toHaveAttribute('aria-pressed', 'true');
  await expect(tempo).toHaveAttribute('aria-valuenow', '56');
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByRole('button', { name: 'Back to top' }).click();
  await expect(page.getByRole('link', { name: 'Gerald Donkor, back to top' })).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('every exported page renders without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/', '/design-system', '/work/aetherfield', '/work/studio-antenix', '/work/jobbiton', '/work/pixca', '/work/ether']) {
    const response = await page.goto(path);
    expect(response?.ok(), path).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
  }
  expect(errors).toEqual([]);
});
