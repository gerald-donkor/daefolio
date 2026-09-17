import { expect, test } from '@playwright/test';

test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
});

test('wet cloth only reveals the paths wiped and never auto-completes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('#about').scrollIntoViewIfNeeded();

  const card = page.locator('button[data-revealed]');
  const veil = card.locator('canvas').nth(0);
  const residue = card.locator('canvas').nth(1);
  const cloth = card.locator('[data-wipe-cloth]');
  const box = await card.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await expect(veil).toHaveAttribute('data-ready', 'true');

  const alpha = (selector: 'veil' | 'residue') => card.evaluate((element, target) => {
    const canvases = element.querySelectorAll('canvas');
    const canvas = canvases[target === 'veil' ? 0 : 1];
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let total = 0;
    for (let index = 3; index < data.length; index += 4) total += data[index];
    return total;
  }, selector);

  const before = await alpha('veil');
  expect(before).toBeGreaterThan(0);
  const x = box.x + box.width * .35;
  const y = box.y + box.height * .62;
  await page.mouse.move(x, y);
  await expect(card).toHaveAttribute('data-cloth-visible', 'true');
  await page.mouse.down();
  await page.mouse.move(x + 72, y + 8, { steps: 8 });
  await expect(card).toHaveAttribute('data-wiping', 'true');
  await expect(card).toHaveAttribute('data-wipe-state', /dirty|wet|dry/);
  await page.mouse.up();

  await expect(card).toHaveAttribute('data-wiping', 'false');
  await expect(card).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => alpha('veil')).toBeLessThan(before);
  await expect.poll(() => alpha('residue')).toBeGreaterThan(0);

  const surfaceWidth = await card.locator('span').first().evaluate(element => element.getBoundingClientRect().width);
  const clothWidth = await cloth.evaluate(element => element.getBoundingClientRect().width);
  expect(clothWidth / surfaceWidth).toBeCloseTo(.13, 1);

  await page.waitForTimeout(1950);
  await expect.poll(() => alpha('residue')).toBe(0);

  // Cover well beyond the old 58% completion threshold. Releasing the cloth
  // must leave the remaining veil intact instead of fading the whole canvas.
  const left = box.x + box.width * .14;
  const right = box.x + box.width * .86;
  await page.mouse.move(left, box.y + box.height * .18);
  await page.mouse.down();
  for (let row = 0; row < 7; row += 1) {
    const rowY = box.y + box.height * (.18 + row * .105);
    await page.mouse.move(row % 2 === 0 ? right : left, rowY, { steps: 12 });
  }
  await page.mouse.up();
  await page.waitForTimeout(700);
  await expect(card).toHaveAttribute('aria-pressed', 'false');
  await expect(veil).toHaveCSS('opacity', '1');
});
