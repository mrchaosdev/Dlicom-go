import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const targetUrl = process.env.SMOKE_URL ?? 'http://127.0.0.1:4173';
const errors = [],
  failures = [],
  requests = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => {
  if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
});
page.on('request', (request) => requests.push(request.url()));
try {
  await page.goto(targetUrl);
  await page.getByRole('heading', { name: /Small hero/ }).waitFor();
  await page.getByText('SYSTEM ONLINE · v0.2.6').waitFor();
  assert.equal(
    requests.some((url) => /phaser-.*\.js/.test(url)),
    false,
    'Phaser should load only on entering battle',
  );
  await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
  await page.getByRole('button', { name: /Data lane/ }).click();
  await page.locator('canvas').waitFor();
  await page.getByRole('button', { name: '×1', exact: true }).click();
  await page
    .getByRole('heading', { name: 'A little more unreasonable.' })
    .waitFor({ timeout: 30000 });
  assert.equal(await page.locator('.skill-card').count(), 3);
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  console.log(
    `Production smoke passed at ${targetUrl}: v0.2.6, lazy Phaser, real battle, skill draft, no missing assets or browser errors.`,
  );
} finally {
  await browser.close();
}
