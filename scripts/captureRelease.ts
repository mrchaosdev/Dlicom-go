import { mkdir } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const output = 'artifacts';
const errors: string[] = [];
await mkdir(output, { recursive: true });
const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(
    "Object.defineProperty(crypto, 'randomUUID', "
    + "{ configurable: true, value: () => 'release-capture-seed-2026' });",
  );
  await page.goto(process.env.RELEASE_CAPTURE_URL ?? 'http://127.0.0.1:5173');
  await expect(page.getByRole('heading', { name: /Small hero/ })).toBeVisible();
  await page.screenshot({ path: `${output}/home-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${output}/home-mobile.png` });
  await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
  await page.getByRole('button', { name: /Data lane/ }).click();
  await expect(page.locator('.battle-canvas canvas').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${output}/battle-mobile.png` });

  await page.getByRole('button', { name: '×1', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A little more unreasonable.' }))
    .toBeVisible({ timeout: 45000 });
  await expect(page.locator('.skill-card')).toHaveCount(3);
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.screenshot({ path: `${output}/skill-draft-desktop.png`, fullPage: true });

  expect(errors).toEqual([]);
  console.log('Captured current release screenshots in artifacts/.');
} finally {
  await browser.close();
}
