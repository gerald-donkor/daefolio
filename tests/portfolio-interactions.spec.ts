import { expect, test } from '@playwright/test';

test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
});

test('transparent navigation, pointer feedback, project dialog and paused field', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Pause motion', exact: true })).toBeVisible();
  await expect(page.locator('header')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator('header')).toHaveCSS('backdrop-filter', 'none');
  const cursor = page.locator('[class*="portfolio-motion-module"][aria-hidden]');
  await page.mouse.move(750, 400);
  await page.mouse.move(820, 450, { steps: 10 });
  await expect(cursor).toHaveCSS('visibility', 'visible');
  for (let i = 0; i < 24; i++) {
    await page.mouse.move(780 + i * 9, 340 + Math.sin(i * .15) * 60);
    await page.waitForTimeout(17);
  }
  // Dust is faint; a live pointer wake produces pixels with much higher alpha.
  const wakeAlpha = await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let maximum = 0;
    for (let i = 3; i < pixels.length; i += 4) maximum = Math.max(maximum, pixels[i]);
    return maximum;
  });
  expect(wakeAlpha).toBeGreaterThan(90);
  await page.screenshot({ path: test.info().outputPath('cursor-wake.png') });
  await page.mouse.down();
  await expect(cursor).toHaveAttribute('data-pressed', 'true');
  await page.mouse.up();
  await expect(cursor).toHaveAttribute('data-pressed', 'false');
  const project = page.getByRole('button', { name: 'View Aetherfield project details' });
  await project.scrollIntoViewIfNeeded();
  await project.hover();
  await expect(cursor).toHaveAttribute('data-link', 'true');
  await project.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Aetherfield' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(project).toBeFocused();
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  await expect(cursor).toHaveCSS('display', 'none');
  const still = await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.mouse.move(400, 450, { steps: 15 });
  await page.waitForTimeout(120);
  expect(await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(still);
});

test('mobile navigation closes, focuses its destination, and fits narrow screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#about')).toBeFocused();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('motion studies remain operable and project routes render', async ({ page }) => {
  await page.goto('/');
  const spring = page.getByRole('button', { name: 'Toggle spring position' });
  await page.getByRole('button', { name: 'Give it a nudge' }).click();
  await expect(spring).toHaveAttribute('aria-pressed', 'true');
  const perspective = page.getByRole('button', { name: 'Change perspective' });
  await perspective.click();
  await expect(perspective).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/work/aetherfield');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Aetherfield');
  await expect(page.getByRole('link', { name: 'Visit live site' })).toHaveAttribute('href', 'https://aetherfield-rho.vercel.app/');
});
