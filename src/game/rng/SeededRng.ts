export class SeededRng {
  private state: number;
  constructor(seed: string) {
    this.state = 2166136261;
    for (const c of seed) this.state = Math.imul(this.state ^ c.charCodeAt(0), 16777619) >>> 0;
  }
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  chance(value: number): boolean {
    return this.next() < Math.max(0, Math.min(1, value));
  }
  pick<T>(values: readonly T[]): T {
    if (!values.length) throw new Error('Cannot pick from an empty pool');
    return values[Math.floor(this.next() * values.length)];
  }
  weighted<T>(values: readonly T[], weight: (value: T) => number): T {
    let cursor = this.next() * values.reduce((sum, value) => sum + weight(value), 0);
    for (const value of values) {
      cursor -= weight(value);
      if (cursor < 0) return value;
    }
    if (!values.length) throw new Error('Cannot draft from an empty pool');
    return values[values.length - 1];
  }
}
