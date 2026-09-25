import { copyFile, mkdir, readFile, unlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
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
  await expect(page.getByRole('heading', { name: /small hero/i })).toBeVisible();
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

  const clipContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: `${output}/.capture`, size: { width: 1440, height: 900 } },
  });
  const clipPage = await clipContext.newPage();
  clipPage.on('pageerror', (error) => errors.push(error.message));
  await clipPage.addInitScript(
    "Object.defineProperty(crypto, 'randomUUID', "
    + "{ configurable: true, value: () => 'release-capture-seed-2026' });",
  );
  await clipPage.goto(process.env.RELEASE_CAPTURE_URL ?? 'http://127.0.0.1:5173');
  await clipPage.waitForTimeout(2200);
  await clipPage.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
  await clipPage.getByRole('button', { name: /Data lane/ }).click();
  await expect(clipPage.locator('.battle-canvas canvas').first()).toBeVisible();
  await expect(clipPage.getByRole('heading', { name: 'A little more unreasonable.' }))
    .toBeVisible({ timeout: 45000 });
  await clipPage.waitForTimeout(4000);
  await clipPage.locator('.skill-card').first().click();
  await clipPage.locator('.route-card').first().click();
  await expect(clipPage.locator('.battle-canvas canvas').first()).toBeVisible();
  await clipPage.waitForTimeout(9000);
  const video = clipPage.video();
  if (!video) throw new Error('Playwright did not create the gameplay video.');
  await clipContext.close();
  const clipPath = resolve(output, 'gameplay-clip.webm');
  await video.saveAs(clipPath);
  const muxedClipPath = resolve(output, '.capture', 'gameplay-clip-muxed.webm');
  const ffmpegPath = process.env.FFMPEG_PATH ?? 'ffmpeg';
  let hasSoundtrack = false;
  try {
    execFileSync(ffmpegPath, [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-i', clipPath,
      '-stream_loop', '-1', '-i', 'public/assets/feed-loop.mp3',
      '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'libopus', '-b:a', '96k',
      '-shortest', '-map_metadata', '-1', muxedClipPath,
    ], { stdio: 'ignore' });
    await copyFile(muxedClipPath, clipPath);
    await unlink(muxedClipPath);
    hasSoundtrack = true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  const metadataPage = await browser.newPage();
  const encodedClip = (await readFile(clipPath)).toString('base64');
  const duration = await metadataPage.evaluate(async (base64) => {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(new Blob([bytes], { type: 'video/webm' }));
    document.body.append(videoElement);
    await new Promise<void>((resolve, reject) => {
      videoElement.onloadedmetadata = () => resolve();
      videoElement.onerror = () => reject(new Error('Could not read captured clip metadata.'));
    });
    return videoElement.duration;
  }, encodedClip);
  await metadataPage.close();
  if (duration < 20 || duration > 40)
    throw new Error(`Gameplay clip duration ${duration.toFixed(1)}s is outside 20–40s.`);
  expect(errors).toEqual([]);

  const audioStatus = hasSoundtrack ? 'with the Feed soundtrack' : 'silent (install FFmpeg to mix sound)';
  console.log(`Captured screenshots and a ${duration.toFixed(1)}s gameplay clip ${audioStatus}.`);
} finally {
  await browser.close();
}
