import { test, expect } from '@playwright/test';
test('fresh profile, loadout, settings and mobile layouts', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Small hero/ })).toBeVisible();
  for (const [width, height] of [
    [360, 800],
    [390, 844],
    [412, 915],
    [1366, 768],
  ]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole('navigation').getByRole('button', { name: 'Loadout' }).click();
  await expect(page.getByRole('heading', { name: 'Packet Blaster' })).toBeVisible();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('checkbox').check();
  await page.reload();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('checkbox')).toBeChecked();
  expect(errors).toEqual([]);
});
test('automatic battle pauses, changes speed and reaches a three-choice draft', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
  await page.getByRole('button', { name: /Data lane/ }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByText('Connection paused')).toBeVisible();
  await page.getByRole('button', { name: '×1', exact: true }).click();
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A little more unreasonable.' })).toBeVisible({
    timeout: 30000,
  });
  await expect(page.locator('.skill-card')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: /Reroll/ }).click();
  await expect(page.getByRole('button', { name: /Reroll/ })).toBeDisabled();
  await page.locator('.skill-card').first().click();
  await expect(page.getByText('Pick your next connection.')).toBeVisible();
  await expect(page.locator('.owned-skill')).toHaveCount(1);
  expect(errors).toEqual([]);
});
test('unlocked chapters load their own backdrop, boss art and soundtrack', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((e) => e.name)
      .filter((url) => url.includes('/src/services/save.ts')).at(-1)!;
    const { defaultSave, SAVE_KEY } = await import(path);
    const save = defaultSave();
    save.account.unlockedChapters = 4;
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  });
  await page.reload();
  for (const chapter of [
    ['The Feed', 'spam-king.png', 'feed-loop.wav', ['spam-bot.png', 'scam-link.png', 'bug.png'], 'background-feed-city.png'],
    ['DliClips', 'loop-phantom.png', 'dliclips-loop.wav', ['fake-account.png', 'data-leech.png', 'corrupted-clip.png'], 'background-dliclip-stream.png'],
    ['Dili Rooms', 'raid-master.png', 'rooms-loop.wav', ['toxic-reply.png', 'popup.png', 'raid-bot.png'], 'background-dili-rooms.png'],
    ['Core Network', 'null-exe.png', 'core-loop.wav', ['null-fragment.png', 'data-leech.png', 'corrupted-clip.png'], 'background-core-network.png'],
  ] as const) {
    await page.getByRole('button', { name: new RegExp(chapter[0]) }).click();
    await page.getByRole('button', { name: /Data lane/ }).click();
    await expect(page.locator('.battle-canvas')).toHaveAttribute(
      'aria-label',
      `Dili automatically battles in ${chapter[0]}`,
    );
    await expect(page.locator('.battle-canvas canvas')).toBeVisible();
    await expect.poll(() => page.evaluate((asset) =>
      performance.getEntriesByType('resource').some((entry) => entry.name.includes(asset)),
    chapter[1])).toBe(true);
    await expect.poll(() => page.evaluate((asset) =>
      performance.getEntriesByType('resource').some((entry) => entry.name.includes(asset)),
    chapter[2])).toBe(true);
    await expect.poll(() => page.evaluate((asset) =>
      performance.getEntriesByType('resource').some((entry) => entry.name.includes(asset)),
    chapter[4])).toBe(true);
    for (const asset of chapter[3])
      await expect.poll(() => page.evaluate((name) =>
        performance.getEntriesByType('resource').some((entry) => entry.name.includes(name)),
      asset)).toBe(true);
    await page.reload();
  }
});
test('all run screens, boss rewards, upgrade and save reload integrate', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
  // Resolve only combat through the public store boundary to keep this screen-integration test fast.
  // Real animation, speed and pause are exercised by the preceding browser test.
  await page.evaluate(async () => {
    const path = performance
      .getEntriesByType('resource')
      .map((e) => e.name)
      .filter((u) => u.includes('/src/stores/gameStore.ts'))
      .at(-1)!;
    const { useGame } = await import(path);
    useGame.getState().run.baseStats.atk = 10000;
    useGame.getState().run.baseStats.maxHp = 1000000;
    useGame.getState().run.hp = 1000000;
  });
  for (let i = 0; i < 50; i++) {
    const phase = await page.evaluate(async () => {
      const path = performance
        .getEntriesByType('resource')
        .map((e) => e.name)
        .filter((u) => u.includes('/src/stores/gameStore.ts'))
        .at(-1)!;
      return (await import(path)).useGame.getState().run.phase;
    });
    if (phase === 'summary') break;
    if (phase === 'route') await page.locator('.route-card').first().click();
    else if (phase === 'battle')
      await page.evaluate(async () => {
        const path = performance
          .getEntriesByType('resource')
          .map((e) => e.name)
          .filter((u) => u.includes('/src/stores/gameStore.ts'))
          .at(-1)!;
        const { useGame } = await import(path);
        while (!useGame.getState().run.engine.outcome) useGame.getState().step();
        useGame.getState().finish();
      });
    else if (phase === 'draft') await page.locator('.skill-card').first().click();
    else if (phase === 'rest')
      await page.getByRole('button', { name: /Recover integrity/ }).click();
    else await page.locator('.choice-list button').last().click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await expect(page.getByRole('heading', { name: 'The Feed is yours.' })).toBeVisible();
  await expect(page.getByText('Equipment chest:', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Upgrade equipment', exact: true }).click();
  await page.getByRole('button', { name: 'Upgrade · 100 Bits', exact: true }).first().click();
  await expect(page.getByText('LEVEL 2 / 5')).toBeVisible();
  await page.reload();
  await page.getByRole('navigation').getByRole('button', { name: 'Loadout' }).click();
  await expect(page.getByText('LEVEL 2 / 5')).toBeVisible();
  expect(errors).toEqual([]);
});
