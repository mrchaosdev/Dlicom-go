import type { CombatEvent } from '../combat/types';
import type { BattleSnapshot } from '../combat/CombatEngine';
export const BASIC_PROJECTILE_MS = 150;
export const BOSS_PROJECTILE_MS = 190;
export type PresentedVitals = Record<string, { hp: number; shield: number }>;
export const snapshotVitals = (snapshot: BattleSnapshot): PresentedVitals =>
  Object.fromEntries([snapshot.hero, ...snapshot.enemies].map((actor) => [
    actor.id, { hp: actor.hp, shield: actor.shield },
  ]));
export const applyCueVitals = (current: PresentedVitals, event: CombatEvent): PresentedVitals => {
  if (event.targetHp === undefined || event.targetShield === undefined) return current;
  const previous = current[event.target];
  if (previous?.hp === event.targetHp && previous.shield === event.targetShield) return current;
  return { ...current, [event.target]: { hp: event.targetHp, shield: event.targetShield } };
};
export type PresentationCue =
  | CombatEvent
  | { type: 'crit_anticipation' | 'rage_burst'; source: string; target: string };

export const buildPresentationQueue = (events: CombatEvent[]): PresentationCue[] => {
  const queue: PresentationCue[] = [];
  for (const event of events) {
    if (event.type === 'rage') continue;
    if (event.type === 'damage' && event.crit && event.tag !== 'status' && event.tag !== 'reflect')
      queue.push({ type: 'crit_anticipation', source: event.source, target: event.target });
    if (event.type === 'ultimate' && event.source === 'dili')
      queue.push({ type: 'rage_burst', source: event.source, target: event.source });
    queue.push(event);
  }
  return queue;
};

export const eventDuration = (event: PresentationCue): number => {
  if (event.type === 'rage') return 0;
  if (event.type === 'crit_anticipation') return 70;
  if (event.type === 'rage_burst') return 150;
  if (event.type === 'warning') return 600;
  if (event.type === 'ultimate') return 800;
  if (event.type === 'damage') {
    if (event.tag === 'status' || event.tag === 'reflect') return 220;
    const travel = event.source.startsWith('boss_') ? BOSS_PROJECTILE_MS : BASIC_PROJECTILE_MS;
    const impact = event.label === 'Ban Hammer' ? 360
      : event.label === 'Viral Explosion' ? 300
        : event.crit ? 190 : 130;
    return travel + impact + 10;
  }
  if (event.type === 'summon' || event.type === 'death') return 300;
  return 150;
};
export const turnDuration = (events: CombatEvent[]) =>
  Math.max(
    2800,
    buildPresentationQueue(events).reduce((sum, event) => sum + eventDuration(event), 0) + 350,
  );
