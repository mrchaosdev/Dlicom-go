import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error'
      && !message.text().includes('InvalidStateError: Navigated away from page'))
      errors.push(message.text());
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
    [320, 740],
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
  await page.getByRole('navigation').getByRole('button', { name: 'Guide' }).click();
  await expect(page.getByRole('heading', { name: 'How to play' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'How to play steps' }).locator('article')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Start your first run' }).click();
  await expect(page.getByRole('button', { name: /Data lane/ })).toBeVisible();
  await page.getByRole('button', { name: 'DLICOM ATTACK home' }).click();
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
test('daily energy claim, five-energy run cost and interrupted-run refund', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByLabel('Energy 15 of 20')).toBeVisible();
  await page.getByRole('button', { name: 'Claim +5' }).click();
  await expect(page.getByLabel('Energy 20 of 20')).toBeVisible();
  await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
  await expect(page.getByRole('button', { name: /Data lane/ })).toBeVisible();
  await expect(page.getByLabel('Energy 15 of 20')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Energy 20 of 20')).toBeVisible();
  await expect(page.getByText('The interrupted run ended. Its 5 energy was returned.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Claimed today' })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('blade and hammer loadouts use their own battle poses and finish melee hits', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [weaponId, prefix] of [
    ['weapon_encryption_blade', 'dili-sword'],
    ['weapon_moderator_hammer', 'dili-hammer'],
  ]) {
    await page.goto('/');
    await page.evaluate(async (id) => {
      const path = performance.getEntriesByType('resource').map((entry) => entry.name)
        .find((url) => url.includes('/src/services/save.ts'))!;
      const { defaultSave, SAVE_KEY } = await import(path);
      const save = defaultSave();
      save.account.inventory[id] = 1;
      save.account.equipped.weapon = id;
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    }, weaponId);
    await page.reload();
    await expect(page.locator('.hero-art img').first()).toHaveAttribute('src', new RegExp(`${prefix}-idle`));
    await expect.poll(() => page.locator('.hero-art img').first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
    const attack = page.waitForResponse((response) => response.url().includes(`${prefix}-attack.webp`));
    await page.getByRole('button', { name: /Data lane/ }).click();
    expect((await attack).status()).toBe(200);
    await expect(page.locator('.battle-canvas canvas')).toBeVisible();
    await expect.poll(async () => page.evaluate(async () => {
      const path = performance.getEntriesByType('resource').map((entry) => entry.name)
        .find((url) => url.includes('/src/stores/gameStore.ts'))!;
      const { useGame } = await import(path);
      return useGame.getState().run?.engine?.stats.damageDealt ?? 0;
    }), { timeout: 15000 }).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('Dili skin gallery saves a cosmetic choice and uses it in ranged battle', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Loadout' }).click();
  await page.getByRole('tab', { name: 'Skins' }).click();
  await expect(page.locator('[data-skin-id]')).toHaveCount(4);
  await expect(page.locator('[data-skin-id="signal_blue"] button')).toBeDisabled();
  const rose = page.locator('[data-skin-id="neon_rose"]');
  await expect(rose.getByRole('heading', { name: 'Night Operative' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Solar Vanguard' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Glitch Phantom' })).toBeVisible();
  await rose.getByRole('button', { name: 'Use this skin' }).click();
  await expect(rose.getByRole('button', { name: 'Selected' })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.locator('.hero-art img').first()).toHaveAttribute('src', /dili-skin-rose-idle\.webp/);
  await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
  const attack = page.waitForResponse((response) => response.url().includes('dili-skin-rose-attack.webp'));
  await page.getByRole('button', { name: /Data lane/ }).click();
  expect((await attack).status()).toBe(200);
  await expect(page.locator('.battle-canvas canvas').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('cosmetic skins retain matching sword and hammer poses in battle', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const [skinId, weaponId, image] of [
    ['solar_circuit', 'weapon_encryption_blade', 'dili-skin-solar-sword-attack.webp'],
    ['jade_glitch', 'weapon_moderator_hammer', 'dili-skin-jade-hammer-attack.webp'],
  ]) {
    await page.goto('/');
    await page.evaluate(async ({ skinId, weaponId }) => {
      const path = performance.getEntriesByType('resource').map((entry) => entry.name)
        .find((url) => url.includes('/src/services/save.ts'))!;
      const { defaultSave, SAVE_KEY } = await import(path);
      const save = defaultSave();
      save.account.skinId = skinId as typeof save.account.skinId;
      save.account.inventory[weaponId] = 1;
      save.account.equipped.weapon = weaponId;
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    }, { skinId, weaponId });
    await page.reload();
    await expect(page.locator('.hero-art img').first()).toHaveAttribute('src', new RegExp(image.replace('-attack', '-idle')));
    await page.getByRole('navigation').getByRole('button', { name: 'Loadout' }).click();
    await page.getByRole('tab', { name: 'Skins' }).click();
    await expect(page.locator(`[data-skin-id="${skinId}"] img`)).toHaveAttribute('src', new RegExp(image.replace('-attack', '-idle')));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('navigation').getByRole('button', { name: 'Play' }).click();
    await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
    const attack = page.waitForResponse((response) => response.url().includes(image));
    await page.getByRole('button', { name: /Data lane/ }).click();
    expect((await attack).status()).toBe(200);
    await expect(page.locator('.battle-canvas canvas').first()).toBeVisible();
  }
});

test('gear shop purchase appears in inventory, equips and survives reload on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/services/save.ts'))!;
    const { defaultSave, SAVE_KEY } = await import(path);
    const save = defaultSave();
    save.account.bits = 500;
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  });
  await page.reload();
  await page.getByRole('navigation').getByRole('button', { name: 'Loadout' }).click();
  await page.getByRole('tab', { name: 'Shop' }).click();
  const blade = page.locator('[data-shop-id="weapon_encryption_blade"]');
  await expect(blade).toBeVisible();
  await blade.getByRole('button', { name: /Buy & equip.*350 Bits/ }).click();
  await expect(page.getByRole('heading', { name: 'Your inventory' })).toBeVisible();
  await expect(page.locator('[data-inventory-id="weapon_encryption_blade"]')).toBeVisible();
  await expect(page.locator('[data-inventory-id="weapon_encryption_blade"] button', { hasText: 'Equipped' })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await page.getByRole('navigation').getByRole('button', { name: 'Loadout' }).click();
  await page.getByRole('tab', { name: 'Inventory' }).click();
  await expect(page.locator('[data-inventory-id="weapon_encryption_blade"]')).toBeVisible();
  await page.getByRole('tab', { name: 'Shop' }).click();
  await expect(page.locator('[data-shop-id="weapon_encryption_blade"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('shop chests reveal gear and queue a starter skill through reload and settlement', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/services/save.ts'))!;
    const { defaultSave, SAVE_KEY } = await import(path);
    const save = defaultSave();
    save.account.bits = 1000;
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  });
  await page.reload();
  await page.getByRole('navigation').getByRole('button', { name: 'Loadout' }).click();
  await page.getByRole('tab', { name: 'Shop' }).click();
  for (const kind of ['gear', 'skill']) {
    const art = page.locator(`[data-chest-kind="${kind}"] img`);
    await art.scrollIntoViewIfNeeded();
    await expect.poll(() => art.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await page.locator('[data-chest-kind="gear"]').getByRole('button', { name: /Open.*250 Bits/ }).click();
  await expect(page.getByText('CHEST OPENED', { exact: false })).toBeVisible();
  await expect(page.locator('[data-chest-reward-art="gear"]')).toBeVisible();
  const gearId = await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/stores/gameStore.ts'))!;
    return (await import(path)).useGame.getState().chestReward.id;
  });
  await page.getByRole('button', { name: 'View in inventory' }).click();
  await expect(page.locator(`[data-inventory-id="${gearId}"]`)).toBeVisible();
  await page.getByRole('tab', { name: 'Shop' }).click();
  await page.locator('[data-chest-kind="skill"]').getByRole('button', { name: /Open.*200 Bits/ }).click();
  await expect(page.locator('[data-chest-reward-art="skill"] [data-skill-icon]')).toBeVisible();
  const skillId = await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/stores/gameStore.ts'))!;
    return (await import(path)).useGame.getState().chestReward.id;
  });
  await expect(page.locator('[data-chest-kind="skill"] button')).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await page.getByRole('navigation').getByRole('button', { name: 'Loadout' }).click();
  await expect(page.getByText('Next run starts with', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Enter the Feed' }).click();
  const runSkill = await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/stores/gameStore.ts'))!;
    const { useGame } = await import(path);
    return { skills: useGame.getState().run.skills, queued: useGame.getState().save.account.queuedSkill };
  });
  expect(runSkill.skills[skillId]).toBe(1);
  expect(runSkill.queued).toBe(skillId);
  await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/stores/gameStore.ts'))!;
    const { useGame } = await import(path);
    const state = useGame.getState();
    state.run.enterNode();
    state.run.engine.outcome = 'defeat';
    state.run.engine.hero.hp = 0;
    state.finish();
  });
  expect(await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/stores/gameStore.ts'))!;
    return (await import(path)).useGame.getState().save.account.queuedSkill;
  })).toBe('');
});

test('Signal Bazaar spends run Bits for a Rare-or-better skill choice', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter the Network', exact: false }).first().click();
  await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/stores/gameStore.ts'))!;
    const { useGame } = await import(path);
    const run = useGame.getState().run!;
    run.node = 9;
    run.bits = 80;
    run.phase = 'rest';
    useGame.setState({ run });
  });
  await expect(page.getByRole('heading', { name: 'Spend your signal.' })).toBeVisible();
  await page.getByRole('button', { name: /Browse the Signal Bazaar/ }).click();
  await expect(page.locator('.skill-card')).toHaveCount(3);
  expect(await page.locator('.skill-card.common').count()).toBe(0);
  expect(await page.evaluate(async () => {
    const path = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((url) => url.includes('/src/stores/gameStore.ts'))!;
    return (await import(path)).useGame.getState().run.bits;
  })).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
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
