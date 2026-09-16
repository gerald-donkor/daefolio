import { expect, test } from '@playwright/test';

// Run against `npm run dev` to retain React's development hydration warnings.
test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
});

for (const scenario of ['running', 'paused', 'reduced'] as const) {
  test(`preference controls hydrate and remain functional with ${scenario} motion`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: scenario === 'reduced' ? 'reduce' : 'no-preference' });
    await page.addInitScript(({ scenario }) => {
      // Keep persisted preferences opposite to the server's default theme.
      localStorage.setItem('portfolio-theme-v1', 'dark');
      localStorage.setItem('portfolio-motion', scenario === 'paused' ? 'paused' : 'running');

      // Recreate the supplied error: disabled attributes disappear before hydration.
      // Touch each initial button only once, leaving React's later updates intact.
      const seen = new WeakSet<Element>();
      const observer = new MutationObserver(() => {
        document.querySelectorAll('.theme-options button').forEach(button => {
          if (seen.has(button)) return;
          seen.add(button);
          button.removeAttribute('disabled');
        });
      });
      observer.observe(document, { childList: true, subtree: true });
      window.addEventListener('load', () => observer.disconnect(), { once: true });
    }, { scenario });

    await page.goto('/');
    // In development, HTML and fonts can arrive before hydration finishes.
    await expect(page.locator('.theme-options button[aria-label="Dark theme"]')).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#about').scrollIntoViewIfNeeded();
    const dark = page.getByRole('button', { name: 'Dark theme', exact: true });
    await expect(dark).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const portrait = page.locator('button[data-revealed]');
    if (scenario === 'running') {
      await expect(portrait).toBeEnabled();
      await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
      await expect(portrait).toBeDisabled();
      await page.getByRole('button', { name: 'Resume motion', exact: true }).click();
      await expect(portrait).toBeEnabled();
    } else {
      await expect(portrait).toBeDisabled();
    }
    await page.getByRole('button', { name: 'Light theme', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('portfolio-theme-v1'))).toBe('light');
    await expect(page.locator('html')).toHaveAttribute('data-motion', scenario === 'running' ? 'running' : 'paused');
    expect(errors).toEqual([]);
  });
}
