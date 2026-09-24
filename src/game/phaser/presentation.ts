import type { CombatEvent } from '../combat/types';
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
  if (event.type === 'damage') return 240;
  if (event.type === 'summon' || event.type === 'death') return 300;
  return 150;
};
export const turnDuration = (events: CombatEvent[]) =>
  Math.max(
    2800,
    buildPresentationQueue(events).reduce((sum, event) => sum + eventDuration(event), 0) + 350,
  );
