import { EQUIPMENT, loadoutStats, GEAR, UPGRADE_COSTS, type Slot } from '../../content/equipment';
import { NODES, generateEncounter } from '../../content/encounters';
import { SKILL_BY_ID } from '../../content/skills';
import { accountLevel, type SaveFile } from '../../services/save';
import { CombatEngine } from '../combat/CombatEngine';
import {
  emptyBattleStats,
  type BattleStats,
  type OwnedSkills,
  type Rarity,
  type Stats,
} from '../combat/types';
import { SeededRng } from '../rng/SeededRng';
import { generateDraft } from './Draft';
export type Phase = 'route' | 'battle' | 'draft' | 'event' | 'rest' | 'summary';
export class RunSession {
  readonly rng: SeededRng;
  readonly baseStats: Stats;
  readonly level: number;
  readonly skills: OwnedSkills = {};
  readonly stats: BattleStats = emptyBattleStats();
  node = 0;
  phase: Phase = 'route';
  hp: number;
  shield = 0;
  bits = 0;
  xp = 0;
  elites = 0;
  cleared = 0;
  rerolls = 1;
  pity = 0;
  draft: string[] = [];
  consumed: string[] = [];
  engine?: CombatEngine;
  result: 'victory' | 'defeat' | null = null;
  rewardGear = '';
  settled = false;
  eventId = 0;
  startedAt = Date.now();
  endedAt = 0;
  notice = '';
  private minRarity?: Rarity;
  constructor(
    readonly seed: string,
    save: SaveFile,
  ) {
    this.rng = new SeededRng(seed);
    this.level = accountLevel(save.account.xp);
    this.baseStats = loadoutStats(save.account.equipped, save.account.inventory);
    this.hp = this.baseStats.maxHp;
  }
  enterNode(route = 0) {
    if (this.phase !== 'route') return;
    const type = NODES[this.node];
    if (type === 'event') {
      this.phase = 'event';
      this.eventId = this.rng.pick([0, 1, 2]);
    } else if (type === 'rest') this.phase = 'rest';
    else {
      this.phase = 'battle';
      this.engine = new CombatEngine({
        seed: `${this.seed}:battle:${this.node}:${route}`,
        stats: this.baseStats,
        hp: this.hp,
        shield: this.shield,
        skills: this.skills,
        consumed: this.consumed,
        enemies: generateEncounter(this.seed, this.node, route),
      });
      this.shield = 0;
    }
  }
  finishBattle() {
    if (this.phase !== 'battle' || !this.engine?.outcome) return;
    this.hp = this.engine.hero.hp;
    this.consumed = [...this.engine.consumed];
    for (const key of Object.keys(this.stats) as (keyof BattleStats)[])
      this.stats[key] =
        key === 'highestHit'
          ? Math.max(this.stats[key], this.engine.stats[key])
          : this.stats[key] + this.engine.stats[key];
    if (this.engine.outcome === 'defeat') {
      this.end('defeat');
      return;
    }
    const type = NODES[this.node];
    this.cleared++;
    this.xp += type === 'boss' ? 80 : type === 'elite' ? 30 : 10;
    this.bits += type === 'boss' ? 250 : type === 'elite' ? 50 : 20;
    if (type === 'elite') this.elites++;
    if (type === 'boss') this.end('victory');
    else this.offer();
  }
  private offer(minimum?: Rarity) {
    this.minRarity = minimum;
    this.draft = generateDraft(
      this.rng,
      this.skills,
      this.level,
      this.pity,
      NODES[this.node] === 'elite',
      minimum,
    ).map((s) => s.id);
    if (!this.draft.length) {
      this.bits += 20;
      this.advance();
      return;
    }
    this.pity = this.draft.some((id) => SKILL_BY_ID[id].rarity !== 'common') ? 0 : this.pity + 1;
    this.phase = 'draft';
  }
  selectSkill(id: string) {
    if (this.phase !== 'draft' || !this.draft.includes(id)) return;
    this.skills[id] = (this.skills[id] ?? 0) + 1;
    this.notice = `${SKILL_BY_ID[id].name} installed.`;
    this.advance();
  }
  reroll() {
    if (this.phase !== 'draft' || this.rerolls < 1) return;
    this.rerolls--;
    this.offer(this.minRarity);
  }
  rest(choice: 'heal' | 'upgrade' | 'shield') {
    if (this.phase !== 'rest') return;
    if (choice === 'heal') {
      this.hp = Math.min(this.baseStats.maxHp, this.hp + Math.round(this.baseStats.maxHp * 0.3));
      this.notice = 'Recovered 30% max HP.';
    } else if (choice === 'shield') {
      this.shield = Math.round(this.baseStats.maxHp * 0.25);
      this.notice = '25% Shield prepared for the next battle.';
    } else {
      const id = Object.keys(this.skills).find((id) => this.skills[id] < SKILL_BY_ID[id].maxRank);
      if (!id) return;
      this.skills[id]++;
      this.notice = `${SKILL_BY_ID[id].name} upgraded.`;
    }
    this.cleared++;
    this.xp += 10;
    this.offer();
  }
  event(choice: number) {
    if (this.phase !== 'event' || choice < 0 || choice > 2) return;
    this.cleared++;
    this.xp += 10;
    if (this.eventId === 0) {
      if (choice < 2) {
        if (choice === 0) this.hp = Math.max(1, this.hp - Math.round(this.baseStats.maxHp * 0.2));
        this.notice =
          choice === 0
            ? 'Plugin installed. Lost 20% max HP.'
            : 'Scan complete. Choose a verified upgrade.';
        this.offer(choice === 0 ? 'epic' : 'rare');
        return;
      }
      this.bits += 20;
      this.notice = 'Plugin ignored. +20 Bits.';
    } else if (this.eventId === 1) {
      if (choice === 0) {
        this.hp = Math.max(1, this.hp - Math.round(this.baseStats.maxHp * 0.15));
        this.notice = 'One more scroll. Lost 15% max HP.';
        this.offer();
        return;
      }
      this.hp = Math.min(this.baseStats.maxHp, this.hp + Math.round(this.baseStats.maxHp * 0.15));
      this.notice = 'Disconnected to recharge. Recovered 15% max HP.';
    } else {
      if (choice === 0) {
        this.baseStats.dodgeRate += 0.04;
        this.notice = 'Encryption key active. Dodge +4% this run.';
      } else {
        this.bits += 30;
        this.notice = 'Key sold. +30 Bits.';
      }
    }
    this.advance();
  }
  private advance() {
    this.node++;
    this.phase = 'route';
    this.engine = undefined;
  }
  private end(result: 'victory' | 'defeat') {
    this.result = result;
    this.phase = 'summary';
    this.endedAt = Date.now();
    if (result === 'victory') this.rewardGear = this.rng.pick(EQUIPMENT).id;
  }
  get score() {
    return Math.round(
      this.stats.kills * 100 +
        this.elites * 1000 +
        (this.result === 'victory' ? 5000 : 0) +
        (this.hp / this.baseStats.maxHp) * 2000,
    );
  }
  settle(save: SaveFile): SaveFile {
    if (this.settled || this.phase !== 'summary') return save;
    this.settled = true;
    const next = structuredClone(save);
    const a = next.account;
    a.runs++;
    a.wins += this.result === 'victory' ? 1 : 0;
    a.bits += this.bits;
    a.xp += this.xp;
    a.bestScore = Math.max(a.bestScore, this.score);
    if (this.rewardGear) {
      if (a.inventory[this.rewardGear]) a.bits += 50;
      else a.inventory[this.rewardGear] = 1;
    }
    if (this.cleared && !a.achievements.includes('first_login')) a.achievements.push('first_login');
    if (this.result === 'victory' && !a.achievements.includes('feed_cleaner'))
      a.achievements.push('feed_cleaner');
    return next;
  }
}
export function equip(save: SaveFile, id: string): SaveFile {
  const item = GEAR[id];
  if (!item || !save.account.inventory[id]) return save;
  const next = structuredClone(save);
  next.account.equipped[item.slot] = id;
  return next;
}
export function upgrade(save: SaveFile, slot: Slot): SaveFile {
  const id = save.account.equipped[slot],
    level = save.account.inventory[id],
    cost = UPGRADE_COSTS[level - 1];
  if (!cost || save.account.bits < cost) return save;
  const next = structuredClone(save);
  next.account.bits -= cost;
  next.account.inventory[id]++;
  return next;
}
