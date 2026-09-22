import type { CombatEvent } from '../combat/types';
export const eventDuration = (event: CombatEvent): number =>
  event.type === 'rage'
    ? 0
    : event.type === 'warning'
      ? 600
      : event.type === 'ultimate'
        ? 800
        : event.type === 'damage'
          ? 240
          : 150;
export const turnDuration = (events: CombatEvent[]) =>
  Math.max(2800, events.reduce((sum, event) => sum + eventDuration(event), 0) + 350);
