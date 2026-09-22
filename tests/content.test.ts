import { expect, it } from 'vitest';
import { validateContent } from '../src/content/validate';
import { SKILLS } from '../src/content/skills';
it('validates every definition', () => expect(() => validateContent()).not.toThrow());
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
