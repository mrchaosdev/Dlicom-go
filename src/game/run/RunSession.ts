import { EQUIPMENT, loadoutStats, GEAR, UPGRADE_COSTS, type Slot, type AttackStyle } from '../../content/equipment';
import { getChapter } from '../../content/chapters';
import { NODES, generateEncounter, generateEventElite } from '../../content/encounters';
import { eventsForChapter, type EventEffect } from '../../content/events';
import { SKILL_BY_ID } from '../../content/skills';
import { ACHIEVEMENT_IDS } from '../../content/achievements';
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
  readonly weaponStyle: AttackStyle;
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
  battleBuffs: { stat: keyof Stats; value: number; battles: number }[] = [];
  private eventFight = false;
  startedAt = Date.now();
  endedAt = 0;
  notice = '';
  get chapter() { return getChapter(this.chapterId); }
  get currentEvent() { return eventsForChapter(this.chapterId)[this.eventId]; }
  private minRarity?: Rarity;
  constructor(
    readonly seed: string,
    save: SaveFile,
    readonly chapterId = 'chapter_feed',
  ) {
    getChapter(chapterId);
    this.rng = new SeededRng(seed);
    this.level = accountLevel(save.account.xp);
    this.weaponStyle = GEAR[save.account.equipped.weapon].attackStyle ?? 'ranged';
    this.baseStats = loadoutStats(save.account.equipped, save.account.inventory);
    this.hp = this.baseStats.maxHp;
  }
  enterNode(route = 0) {
    if (this.phase !== 'route') return;
    const type = NODES[this.node];
    if (type === 'event') {
      this.phase = 'event';
      this.eventId = this.rng.pick(eventsForChapter(this.chapterId).map((_, index) => index));
    } else if (type === 'rest') this.phase = 'rest';
    else {
      this.phase = 'battle';
      const stats = { ...this.baseStats };
      for (const buff of this.battleBuffs) stats[buff.stat] += buff.value;
      this.engine = new CombatEngine({
        seed: `${this.seed}:${this.chapterId}:battle:${this.node}:${route}`,
        stats,
        hp: this.hp,
        shield: this.shield,
        skills: this.skills,
        consumed: this.consumed,
        enemies: generateEncounter(this.seed, this.node, route, this.chapterId),
      });
      this.battleBuffs = this.battleBuffs.map(buff => ({ ...buff, battles: buff.battles - 1 })).filter(buff => buff.battles > 0);
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
    if (this.eventFight) {
      this.eventFight = false;
      this.xp += 30;
      this.bits += 50;
      this.elites++;
      this.offer('rare');
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
    if (this.phase !== 'event' || !Number.isInteger(choice)) return;
    const selected = this.currentEvent.choices[choice];
    if (!selected) return;
    this.cleared++;
    this.xp += 10;
    this.notice = selected.outcomeText;
    for (const effect of selected.effects) if (this.applyEventEffect(effect)) return;
    this.advance();
  }
  private applyEventEffect(effect: EventEffect): boolean {
    if (effect.type === 'bits') this.bits = Math.max(0, this.bits + effect.amount);
    else if (effect.type === 'xp') this.xp += effect.amount;
    else if (effect.type === 'heal') this.hp = Math.min(this.baseStats.maxHp, this.hp + Math.round(this.baseStats.maxHp * effect.fraction));
    else if (effect.type === 'damage') this.hp = Math.max(1, this.hp - Math.round(this.baseStats.maxHp * effect.fraction));
    else if (effect.type === 'shield') this.shield = Math.min(this.baseStats.maxHp, this.shield + Math.round(this.baseStats.maxHp * effect.fraction));
    else if (effect.type === 'buff') this.battleBuffs.push({ stat: effect.stat, value: effect.value, battles: effect.battles });
    else if (effect.type === 'skill') { this.offer(effect.rarity); return true; }
    else if (effect.type === 'random_cache') {
      if (this.rng.chance(0.5)) this.bits += 40;
      else this.hp = Math.max(1, this.hp - Math.round(this.baseStats.maxHp * 0.1));
    } else if (effect.type === 'elite_fight') {
      this.eventFight = true;
      const stats = { ...this.baseStats };
      for (const buff of this.battleBuffs) stats[buff.stat] += buff.value;
      this.engine = new CombatEngine({
        seed: `${this.seed}:${this.chapterId}:event-elite:${this.node}`,
        stats, hp: this.hp, shield: this.shield, skills: this.skills, consumed: this.consumed,
        enemies: generateEventElite(this.seed, this.node, this.chapterId),
      });
      this.battleBuffs = this.battleBuffs.map(buff => ({ ...buff, battles: buff.battles - 1 })).filter(buff => buff.battles > 0);
      this.phase = 'battle';
      return true;
    }
    return false;
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
    if (result === 'victory') {
      const rarity = this.rng.weighted(
        [
          { rarity: 'common' as const, weight: 55 }, { rarity: 'rare' as const, weight: 30 },
          { rarity: 'epic' as const, weight: 12 }, { rarity: 'legendary' as const, weight: 3 },
        ],
        entry => entry.weight,
      ).rarity;
      this.rewardGear = this.rng.pick(EQUIPMENT.filter(item => (item.rarity ?? 'common') === rarity)).id;
    }
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
    if (this.result === 'victory')
      a.unlockedChapters = Math.max(a.unlockedChapters, Math.min(4, this.chapter.order + 1));
    a.bits += this.bits;
    a.xp += this.xp;
    a.bestScore = Math.max(a.bestScore, this.score);
    if (this.rewardGear) {
      if (a.inventory[this.rewardGear]) a.bits += 50;
      else a.inventory[this.rewardGear] = 1;
    }
    if (this.cleared && !a.achievements.includes(ACHIEVEMENT_IDS.firstBattle))
      a.achievements.push(ACHIEVEMENT_IDS.firstBattle);
    if (this.result === 'victory' && !a.achievements.includes(ACHIEVEMENT_IDS.firstBoss))
      a.achievements.push(ACHIEVEMENT_IDS.firstBoss);
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
