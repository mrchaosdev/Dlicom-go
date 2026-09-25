import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => localStorage.setItem('dlicom-test-clipboard', text) },
    });
  });
  (page as typeof page & { __browserErrors?: string[] }).__browserErrors = errors;
});

test.afterEach(async ({ page }) => {
  expect((page as typeof page & { __browserErrors?: string[] }).__browserErrors).toEqual([]);
});

test('fresh profile, loadout, settings and mobile layouts', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Small hero/ })).toBeVisible();
  await expect(page.getByText('SYSTEM ONLINE · v0.2.0')).toBeVisible();
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
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole('navigation').getByRole('button', { name: 'Loadout' }).click();
  await expect(page.getByRole('heading', { name: 'Packet Blaster' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('[data-equipment-icon]')).toHaveCount(3);
  await expect(page.locator('[data-equipment-option-icon]')).toHaveCount(3);
  await page.getByRole('navigation').getByRole('button', { name: 'Records' }).click();
  await expect(page.locator('[data-achievement-icon]')).toHaveCount(2);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const music = page.locator('input[type="range"]').first();
  await music.focus();
  await music.press('Home');
  await expect(page.getByText('0%', { exact: true })).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.reload();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('checkbox')).toBeChecked();
  await expect(page.getByText('0%', { exact: true })).toBeVisible();
});
test('automatic battle pauses, changes speed and reaches a three-choice draft', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  await page.getByRole('button', { name: /Data lane/ }).click();
  await expect(page.locator('.battle-canvas canvas').first()).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByText('Connection paused')).toBeVisible();
  for (const [width, height] of [[360, 800], [390, 844], [412, 915], [768, 1024], [900, 600], [1366, 768], [1513, 651], [1892, 814]]) {
    await page.setViewportSize({ width, height });
    await expect.poll(() => page.evaluate(() => {
      const battle = document.querySelector('.phase-battle')!.getBoundingClientRect();
      const canvas = document.querySelector('.battle-canvas canvas')!.getBoundingClientRect();
      const bottomNav = innerWidth <= 480 ? 62 : 0;
      return document.documentElement.scrollHeight <= innerHeight
        && document.documentElement.scrollWidth <= innerWidth
        && document.querySelector('.phase-battle')!.scrollHeight
          <= document.querySelector('.phase-battle')!.clientHeight
        && battle.bottom <= innerHeight - bottomNav
        && canvas.top >= battle.top
        && canvas.bottom <= battle.bottom
        && ((getComputedStyle(document.querySelector('.battle-side-build')!).display !== 'none')
          === (innerWidth >= 900));
    })).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.battle-build-toggle summary').click();
  await expect(page.locator('.battle-build-popover')).toBeVisible();
  await page.locator('.battle-build-toggle summary').click();
  await page.getByRole('button', { name: '×1', exact: true }).click();
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A little more unreasonable.' })).toBeVisible({
    timeout: 30000,
  });
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  await expect(page.locator('.skill-card')).toHaveCount(3);
  expect(await page.locator('.skill-card .skill-icon').evaluateAll((icons) =>
    new Set(icons.map((icon) => icon.getAttribute('data-skill-icon'))).size)).toBe(3);
  await expect(page.locator('.skill-card .skill-icon-glyph svg')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: /Reroll/ }).click();
  await expect(page.getByRole('button', { name: /Reroll/ })).toBeDisabled();
  await page.locator('.skill-card').first().click();
  await expect(page.getByText('Pick your next connection.')).toBeVisible();
  await expect(page.locator('.owned-skill')).toHaveCount(1);
  expect(errors).toEqual([]);
});
test('enemy HP waits for projectile impact and stays still while paused', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/stores/gameStore.ts'))!;
    const { useGame } = await import(path);
    useGame.getState().start();
    useGame.getState().act('enter', 0);
    useGame.setState({ paused: true });
  });
  await expect(page.locator('.battle-canvas canvas').first()).toBeVisible();
  await page.waitForTimeout(400);
  const enemyHp = page.locator('.enemy-hud [role="progressbar"]').first();
  const initialHp = Number(await enemyHp.getAttribute('aria-valuenow'));
  const logicalHp = await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/stores/gameStore.ts'))!;
    const { useGame } = await import(path);
    useGame.setState({ paused: false });
    useGame.getState().step();
    await new Promise((resolve) => setTimeout(resolve, 50));
    useGame.setState({ paused: true });
    return useGame.getState().snapshot!.enemies[0].hp;
  });
  expect(logicalHp).toBeLessThan(initialHp);
  await expect(enemyHp).toHaveAttribute('aria-valuenow', String(initialHp));
  await page.waitForTimeout(250);
  await expect(enemyHp).toHaveAttribute('aria-valuenow', String(initialHp));
  await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/stores/gameStore.ts'))!;
    (await import(path)).useGame.setState({ paused: false });
  });
  await expect(enemyHp).toHaveAttribute('aria-valuenow', String(logicalHp));
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
});
test('late-run desktop battle keeps the arena and build visible without a scrollbar', async ({ page }) => {
  await page.setViewportSize({ width: 1513, height: 651 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
  await page.evaluate(async () => {
    const resources = performance.getEntriesByType('resource').map((entry) => entry.name);
    const storePath = resources.find((url) => url.includes('/src/stores/gameStore.ts'))!;
    const skillsPath = resources.find((url) => url.includes('/src/content/skills.ts'))!;
    const { useGame } = await import(storePath);
    const { SKILLS } = await import(skillsPath);
    const run = useGame.getState().run!;
    run.node = 7;
    for (const skill of SKILLS.slice(0, 5)) run.skills[skill.id] = 1;
    useGame.getState().act('enter', 0);
  });
  await expect(page.locator('.battle-canvas canvas').first()).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.locator('.battle-side-build .owned-skill')).toHaveCount(5);
  expect(await page.evaluate(() => {
    const panel = document.querySelector('.phase-battle')!;
    return panel.scrollHeight <= panel.clientHeight
      && document.documentElement.scrollHeight <= innerHeight
      && getComputedStyle(document.querySelector('.battle-side-build')!).scrollbarWidth === 'none';
  })).toBe(true);
});
test('status chips stay color coded and compact on a phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
  await page.getByRole('button', { name: /Data lane/ }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.locator('.battle-canvas canvas').first()).toBeVisible();
  await page.waitForTimeout(300);
  await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/stores/gameStore.ts'))!;
    const { useGame } = await import(path);
    const engine = useGame.getState().run!.engine!;
    const statuses = ['burn', 'glitch', 'vulnerable', 'silence', 'slow', 'corrupted', 'marked'] as const;
    engine.hero.statuses = statuses.map((id) => ({
      id, turns: 2, stacks: 1, power: 0.1, source: 'spam_bot_0',
    }));
    engine.enemies[0].statuses = statuses.slice(0, 4).map((id) => ({
      id, turns: 2, stacks: 1, power: 0.1, source: 'dili',
    }));
    useGame.setState({ snapshot: engine.snapshot() });
  });
  await expect(page.locator('.player-hud .status-chip')).toHaveCount(7);
  await expect(page.locator('.enemy-hud .status-chip')).toHaveCount(4);
  await expect(page.locator('.player-hud .status-chip svg')).toHaveCount(7);
  await expect(page.locator('.enemy-hud .status-chip svg')).toHaveCount(4);
  expect(await page.locator('.player-hud .status-chip[data-status="burn"]').evaluate((element) =>
    getComputedStyle(element).color)).toBe('rgb(255, 189, 130)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.player-hud .status-chip[data-status="burn"]').evaluate((element) =>
    getComputedStyle(element).animationName)).toBe('none');
  const layout = await page.evaluate(() => {
    const panel = document.querySelector('.phase-battle')!;
    const statusRow = document.querySelector('.player-hud .status-row')!;
    return {
      documentFits: document.documentElement.scrollHeight <= innerHeight,
      panelFits: panel.scrollHeight <= panel.clientHeight,
      scrollbar: getComputedStyle(statusRow).scrollbarWidth,
    };
  });
  expect(layout).toMatchObject({ documentFits: true, panelFits: true, scrollbar: 'none' });
});
test('unlocked chapters load their own backdrop, boss art and soundtrack', async ({ page, browserName }) => {
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
    ['The Feed', 'spam-king.png', 'feed-loop.mp3', ['spam-bot.png', 'scam-link.png', 'bug.png'], 'background-feed-city.webp'],
    ['DliClips', 'loop-phantom.png', 'dliclips-loop.mp3', ['fake-account.png', 'data-leech.png', 'corrupted-clip.png'], 'background-dliclip-stream.webp'],
    ['Dili Rooms', 'raid-master.png', 'rooms-loop.mp3', ['toxic-reply.png', 'popup.png', 'raid-bot.png'], 'background-dili-rooms.webp'],
    ['Core Network', 'null-exe.png', 'core-loop.mp3', ['null-fragment.png', 'data-leech.png', 'corrupted-clip.png'], 'background-core-network.webp'],
  ] as const) {
    await page.getByRole('button', { name: new RegExp(chapter[0]) }).click();
    await page.getByRole('button', { name: /Data lane/ }).click();
    await expect(page.locator('.battle-canvas')).toHaveAttribute(
      'aria-label',
      `Dili automatically battles in ${chapter[0]}`,
    );
    await expect(page.locator('.battle-canvas canvas').first()).toBeVisible();
    await expect.poll(() => page.evaluate((asset) =>
      performance.getEntriesByType('resource').some((entry) => entry.name.includes(asset)),
    chapter[1])).toBe(true);
    const soundtrack = await page.request.get(`/assets/${chapter[2]}`);
    expect(soundtrack.ok()).toBe(true);
    const decoded = await page.evaluate(async ({ asset, browserName }) => {
      const element = document.createElement('audio');
      if (browserName === 'webkit' && !window.AudioContext)
        return { format: element.canPlayType('audio/mpeg'), duration: null, channels: null };
      const response = await fetch(`/assets/${asset}`);
      const context = new AudioContext();
      try {
        const audio = await context.decodeAudioData(await response.arrayBuffer());
        return { format: 'decoded', duration: audio.duration, channels: audio.numberOfChannels };
      } finally {
        await context.close();
      }
    }, { asset: chapter[2], browserName });
    expect(decoded.format).not.toBe('');
    if (decoded.duration !== null) {
      expect(decoded.channels).toBe(1);
      expect(decoded.duration).toBeGreaterThan(7.9);
      expect(decoded.duration).toBeLessThan(8.1);
    }
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
  // This checks screen integration; motion behavior is covered in dedicated browser tests.
  await page.emulateMedia({ reducedMotion: 'reduce' });
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
    else if (phase === 'draft') await page.locator('.skill-card').first().click({ force: true });
    else if (phase === 'rest')
      await page.getByRole('button', { name: /Recover integrity/ }).click();
    else {
      expect(await page.evaluate(() =>
        document.querySelector('.play-panel')!.getBoundingClientRect().bottom
        <= document.querySelector('.build-panel')!.getBoundingClientRect().top,
      )).toBe(true);
      await page.locator('.choice-list button').last().click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await expect(page.getByRole('heading', { name: 'The Feed is yours.' })).toBeVisible();
  await expect(page.getByText('Equipment chest:', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Copied!', exact: true })).toBeVisible();
  const sharedResult = await page.evaluate(() => localStorage.getItem('dlicom-test-clipboard'));
  expect(sharedResult).toContain('SPAM KING DEFEATED');
  expect(sharedResult).toContain('Seed:');
  await page.getByRole('button', { name: 'Upgrade equipment', exact: true }).click();
  await page.getByRole('button', { name: 'Upgrade · 100 Bits', exact: true }).first().click();
  await expect(page.getByText('LEVEL 2 / 5')).toBeVisible();
  await page.reload();
  await page.getByRole('navigation').getByRole('button', { name: 'Loadout' }).click();
  await expect(page.getByText('LEVEL 2 / 5')).toBeVisible();
});
