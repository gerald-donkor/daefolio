import { expect, test } from '@playwright/test';

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } });

for (const width of [1440, 1024, 768]) {
  test(`hero arrow and preference fade at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const controls = page.locator('.display-preferences');
    await expect(controls).toHaveAttribute('inert', '');
    await expect(controls).toHaveCSS('opacity', '0');
    await page.getByRole('link', { name: 'Explore the work' }).click();
    await expect(page.locator('#work')).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
    await page.locator('#about').scrollIntoViewIfNeeded();
    await expect(controls).toHaveAttribute('data-visible', 'true');
    await expect(controls).toHaveCSS('opacity', '1');
    await page.getByRole('button', { name: 'Light theme', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(controls).toHaveAttribute('inert', '');
    await expect(controls).toHaveCSS('opacity', '0');
    await expect(page.getByRole('link', { name: 'Explore the work' })).toBeInViewport();
  });
}

for (const reduced of [false, true]) {
  test(`portrait reveal and motion preferences, reduced=${reduced}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await page.goto('/');
    await page.locator('#about').scrollIntoViewIfNeeded();
    const card = page.locator('button[data-revealed]');
    if (reduced) {
      await expect(card).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Reduced motion' })).toBeDisabled();
    } else {
      await card.click();
      await expect(card).toHaveAttribute('aria-pressed', 'true');
      await page.getByRole('button', { name: 'Reset portrait reveal' }).click();
      await expect(card).toHaveAttribute('aria-pressed', 'false');
      await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
      await expect(card).toBeDisabled();
      await page.getByRole('button', { name: 'Resume motion', exact: true }).click();
      await expect(card).toBeEnabled();
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.locator('.display-preferences')).toHaveAttribute('inert', '');
  });
}
