import { expect, it } from 'vitest';
import { validateContent } from '../src/content/validate';
import { SKILLS } from '../src/content/skills';
import { CHAPTERS } from '../src/content/chapters';
import { EVENTS, eventsForChapter } from '../src/content/events';
import { EQUIPMENT } from '../src/content/equipment';
import { generateEncounter } from '../src/content/encounters';
import { SKILL_GLYPHS, STATUS_GLYPHS } from '../src/content/skillGlyphs';
it('validates every definition', () => expect(() => validateContent()).not.toThrow());
it('provides a distinct art glyph for all 70 skills and each combat status', () => {
  expect(Object.keys(SKILL_GLYPHS).sort()).toEqual(SKILLS.map(({ id }) => id).sort());
  expect(new Set(Object.values(SKILL_GLYPHS)).size).toBe(SKILLS.length);
  expect(Object.keys(STATUS_GLYPHS).sort()).toEqual([
    'burn', 'corrupted', 'glitch', 'marked', 'silence', 'slow', 'vulnerable',
  ]);
  expect(new Set(Object.values(STATUS_GLYPHS)).size).toBe(Object.keys(STATUS_GLYPHS).length);
});
it('ships four deterministic chapters, twenty events and eighteen equipment items', () => {
  expect(CHAPTERS).toHaveLength(4);
  expect(EVENTS).toHaveLength(20);
  expect(EQUIPMENT).toHaveLength(18);
  for (const chapter of CHAPTERS) expect(eventsForChapter(chapter.id).length).toBeGreaterThanOrEqual(2);
  for (const chapter of CHAPTERS) {
    const a = generateEncounter('stable-seed', 11, 0, chapter.id);
    const b = generateEncounter('stable-seed', 11, 0, chapter.id);
    expect(a).toEqual(b);
    expect(a[0].kind).toBe(chapter.bossId);
  }
});
it('identifies duplicate content by ID', () =>
  expect(() => validateContent([...SKILLS, SKILLS[0]])).toThrow(
    'Duplicate skill ID: packet_boost',
  ));
it('identifies missing prerequisites', () => {
  const content = structuredClone(SKILLS);
  content[0].prerequisites = ['missing_skill'];
  expect(() => validateContent(content)).toThrow('packet_boost.prerequisites');
});
it('rejects prerequisite cycles', () => {
  const content = structuredClone(SKILLS);
  content[0].prerequisites = ['packet_boost'];
  expect(() => validateContent(content)).toThrow('cycle');
});
it('identifies invalid effect numbers', () => {
  const content = structuredClone(SKILLS);
  content[0].effects = [
    { type: 'trigger', on: 'basic', chance: 2, action: { kind: 'rage', value: 10 } },
  ];
  expect(() => validateContent(content)).toThrow('packet_boost');
});
