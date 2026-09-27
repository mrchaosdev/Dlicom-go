import { existsSync } from 'node:fs';
import { expect, it } from 'vitest';
import {
  ARCHETYPE_GUIDE,
  BOSS_GUIDE,
  ELITE_MODIFIER_GUIDE,
  ENEMY_GUIDE,
  GUIDE_BANNER,
  GUIDE_SECTIONS,
  GUIDE_STEPS,
} from '../src/content/guide';
import { CHAPTERS } from '../src/content/chapters';
import { SKILLS, SKILL_BY_ID } from '../src/content/skills';
import { generateEncounter, NODES } from '../src/content/encounters';

it('keeps the five-step quick start', () => expect(GUIDE_STEPS).toHaveLength(5));

it('describes every enemy, boss and skill family in the game', () => {
  const enemyIds = new Set(CHAPTERS.flatMap((chapter) => chapter.enemyPool.map((enemy) => enemy.id)));
  expect(Object.keys(ENEMY_GUIDE).sort()).toEqual([...enemyIds].sort());
  expect(Object.keys(BOSS_GUIDE).sort()).toEqual(CHAPTERS.map((chapter) => chapter.bossId).sort());
  expect(Object.keys(ARCHETYPE_GUIDE).sort()).toEqual([...new Set(SKILLS.flatMap((skill) => skill.tags))].sort());
});

it('only names skills that exist and belong to the described family', () => {
  for (const [tag, { keySkills }] of Object.entries(ARCHETYPE_GUIDE))
    for (const id of keySkills) expect(SKILL_BY_ID[id]?.tags, id).toContain(tag);
});

it('covers every elite modifier the encounter generator can roll', () => {
  const eliteNode = NODES.indexOf('elite');
  const rolled = new Set(
    Array.from({ length: 200 }, (_, index) => generateEncounter(`guide-${index}`, eliteNode)[0].modifier),
  );
  expect([...rolled].sort()).toEqual(Object.keys(ELITE_MODIFIER_GUIDE).sort());
});

it('points every guide image at a runtime asset file', () => {
  const images = [
    GUIDE_BANNER.backdrop,
    GUIDE_BANNER.enemy,
    ...GUIDE_SECTIONS.flatMap((section) => [
      ...section.entries.flatMap((entry) => [entry.image, entry.backdrop]),
      ...(section.gallery?.items.map((item) => item.image) ?? []),
    ]),
  ].filter((url): url is string => url !== undefined);
  expect(images.length).toBeGreaterThan(30);
  for (const url of images) expect(existsSync(`public${url}`), url).toBe(true);
});

it('has unique section ids and no empty entries', () => {
  expect(new Set(GUIDE_SECTIONS.map((section) => section.id)).size).toBe(GUIDE_SECTIONS.length);
  for (const section of GUIDE_SECTIONS) {
    expect(section.entries.length, section.id).toBeGreaterThan(0);
    for (const entry of section.entries) {
      expect(entry.text, `${section.id}:${entry.term}`).toBeTruthy();
      expect(entry.text, `${section.id}:${entry.term}`).not.toMatch(/undefined|NaN/);
    }
  }
});
