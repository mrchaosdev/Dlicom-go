import { SKILL_BY_ID } from '../../content/skills';
import { SeededRng } from '../rng/SeededRng';
import { absorbDamage, damageAmount } from './DamageResolver';
import {
  BASE_STATS,
  emptyBattleStats,
  type Actor,
  type CombatEvent,
  type DamageTag,
  type Effect,
  type OwnedSkills,
  type Stats,
  type StatusId,
  type Trigger,
} from './types';
export const MAX_COMBO_CHAIN = 5;
export const MAX_TRIGGER_DEPTH = 12;
export const MAX_EVENTS_PER_TURN = 200;
export interface BattleOptions {
  seed: string;
  stats?: Partial<Stats>;
  hp?: number;
  shield?: number;
  enemies: Actor[];
  skills?: OwnedSkills;
  consumed?: string[];
}
export function makeActor(
  id: string,
  name: string,
  stats: Partial<Stats>,
  tier: Actor['tier'] = 'normal',
  kind = id,
): Actor {
  const full = { ...BASE_STATS, critRate: 0, dodgeRate: 0, ...stats };
  return { id, name, stats: full, hp: full.maxHp, shield: 0, statuses: [], tier, kind };
}
export class CombatEngine {
  readonly rng: SeededRng;
  readonly hero: Actor;
  readonly enemies: Actor[];
  readonly stats = emptyBattleStats();
  readonly consumed: Set<string>;
  turn = 0;
  rage = 0;
  outcome: 'victory' | 'defeat' | null = null;
  private effects: { key: string; effect: Effect }[] = [];
  private counts: Record<string, number> = {};
  private used = new Set<string>();
  private events: CombatEvent[] = [];
  private basicCount = 0;
  private nextCrit = 0;
  private scrollBonus = 0;
  private bandwidth = 0;
  private incoming = 0;
  private turnHits = 0;
  private avoided = 0;
  private ghost = false;
  private guarded = false;
  private comboIndex = 0;
  private damagingSkills = 0;
  private enemyTurns: Record<string, number> = {};
  private bossPhases = new Set<string>();
  private rewoundBosses = new Set<string>();
  private previousBossMove: Record<string, number> = {};
  private dodgeDamage = 0;
  constructor(options: BattleOptions) {
    this.rng = new SeededRng(options.seed);
    this.consumed = new Set(options.consumed);
    const stats = { ...BASE_STATS, ...options.stats };
    for (const [id, rank] of Object.entries(options.skills ?? {})) {
      const skill = SKILL_BY_ID[id];
      if (!skill) throw new Error(`Unknown skill: ${id}`);
      skill.effects.forEach((effect, index) => {
        if (effect.type === 'modifier')
          stats[effect.stat] += id === 'packet_boost' ? 0.2 + 0.15 * (rank - 1) : effect.value;
        else this.effects.push({ key: `${id}_${index}`, effect });
      });
    }
    this.hero = makeActor('dili', 'Dili', stats, 'hero');
    this.hero.hp = Math.min(stats.maxHp, options.hp ?? stats.maxHp);
    this.hero.shield = Math.min(stats.maxHp, options.shield ?? 0);
    this.rage = Math.min(100, stats.startRage);
    this.enemies = structuredClone(options.enemies);
    if (this.rule('main_character') && this.enemies.some((e) => e.tier === 'boss')) {
      stats.critRate += 0.15;
      stats.dodgeRate += 0.1;
      stats.rageGain += 0.2;
      this.hero.stats = stats;
    }
  }
  private rule(rule: Extract<Effect, { type: 'rule' }>['rule']) {
    return this.effects.some((e) => e.effect.type === 'rule' && e.effect.rule === rule);
  }
  private living() {
    return this.enemies.filter((e) => e.hp > 0);
  }
  private target() {
    return this.living().sort((a, b) => a.hp - b.hp)[0];
  }
  private status(actor: Actor, id: StatusId) {
    return actor.statuses.find((s) => s.id === id);
  }
  private warn() {
    if (!this.guarded) {
      this.guarded = true;
      console.warn('Combat trigger guard reached; remaining chain skipped.', { turn: this.turn });
    }
  }
  private allowed(depth: number) {
    if (depth > MAX_TRIGGER_DEPTH || this.events.length >= MAX_EVENTS_PER_TURN) {
      this.warn();
      return false;
    }
    return true;
  }
  private emit(event: CombatEvent) {
    if (this.allowed(0)) this.events.push(event);
  }
  private gainRage(value: number) {
    if (this.hero.hp <= 0) return;
    const gain = Math.max(0, Math.round(value * this.hero.stats.rageGain));
    this.rage = Math.min(100, this.rage + gain);
    this.emit({ type: 'rage', source: 'dili', target: 'dili', amount: gain, label: 'Rage' });
  }
  private heal(value: number) {
    if (this.hero.hp <= 0) return;
    const amount = Math.min(
      this.hero.stats.maxHp - this.hero.hp,
      Math.round(value * this.hero.stats.healingPower),
    );
    this.hero.hp += amount;
    if (amount)
      this.emit({ type: 'heal', source: 'dili', target: 'dili', amount, label: 'Recovery' });
  }
  private shield(fraction: number) {
    if (this.hero.hp <= 0) return;
    const amount = Math.round(this.hero.stats.maxHp * fraction * this.hero.stats.shieldPower);
    const excess = Math.max(0, this.hero.shield + amount - this.hero.stats.maxHp);
    this.hero.shield = Math.min(this.hero.stats.maxHp, this.hero.shield + amount);
    this.emit({
      type: 'shield',
      source: 'dili',
      target: 'dili',
      amount: amount - excess,
      label: 'Firewall',
    });
    if (this.rule('excess_heal')) this.heal(excess * 0.5);
  }
  applyStatus(
    target: Actor,
    id: StatusId,
    turns: number,
    power: number,
    source = 'dili',
    depth = 0,
  ) {
    if (target.hp <= 0 || !this.allowed(depth)) return;
    const existing = this.status(target, id);
    if (existing) {
      existing.turns = turns;
      existing.power = power;
      existing.stacks = Math.min(5, existing.stacks + 1);
    } else target.statuses.push({ id, turns, power, stacks: 1, source });
    this.emit({ type: 'status', source, target: target.id, amount: turns, label: id });
    if (source === 'dili') {
      this.trigger('debuff', target, depth + 1);
      if (id === 'glitch' && this.rule('full_moderation'))
        this.applyStatus(target, 'vulnerable', turns, 0.1, source, depth + 1);
    }
  }
  private trigger(on: Trigger, target?: Actor, depth = 0) {
    if (this.hero.hp <= 0 || !this.allowed(depth)) return;
    if (this.status(this.hero, 'silence')) return;
    for (const { key, effect } of this.effects) {
      if (effect.type !== 'trigger' || effect.on !== on || !this.allowed(depth)) continue;
      if (effect.comboIndex !== undefined && this.comboIndex !== effect.comboIndex) continue;
      this.counts[key] = (this.counts[key] ?? 0) + 1;
      const every = key.startsWith('ban_hammer_')
        ? this.hero.stats.hammerInterval
        : (effect.every ?? 1);
      if (
        this.counts[key] % every ||
        (effect.once && this.used.has(key)) ||
        !this.rng.chance(effect.chance ?? 1)
      )
        continue;
      this.used.add(key);
      const a = effect.action;
      if (a.kind === 'shield') this.shield(a.value);
      else if (a.kind === 'heal') this.heal(this.hero.stats.maxHp * a.value);
      else if (a.kind === 'rage') this.gainRage(a.value);
      else if (a.kind === 'next_crit') this.nextCrit = a.value;
      else if (a.kind === 'extra_basic') this.basic(this.target(), depth + 1);
      else if (a.kind === 'status') {
        const victim =
          on === 'turn_start'
            ? this.living()
                .filter((e) => a.status !== 'silence' || e.tier !== 'boss')
                .sort((x, y) => y.stats.atk - x.stats.atk)[0]
            : target;
        if (victim) this.applyStatus(victim, a.status, a.turns, a.value, 'dili', depth + 1);
      } else if (a.kind === 'damage') {
        const victims =
          a.target === 'all'
            ? this.living()
            : [target?.hp ? target : this.target()].filter((v): v is Actor => !!v);
        for (const victim of victims) this.skillHit(victim, a.value, a.label, depth + 1);
        this.damagingSkills++;
        if (this.rule('network_effect') && this.damagingSkills % 5 === 0)
          for (const victim of this.living())
            this.skillHit(victim, 0.6, 'Viral Explosion', depth + 1);
      }
    }
  }
  private skillHit(target: Actor, value: number, label: string, depth: number) {
    if (!this.allowed(depth)) return;
    const hammer = label === 'Ban Hammer';
    let mult = value;
    if (hammer) {
      mult *= 1 + this.hero.stats.hammerDamage;
      if (this.rule('permanent_ban') && this.status(target, 'marked')) {
        mult *= 2.5;
        target.statuses = target.statuses.filter((s) => s.id !== 'marked');
      }
      if (this.rule('execute') && target.tier !== 'boss' && target.hp < target.stats.maxHp * 0.12)
        mult = 100000;
    }
    if (label === 'Viral Explosion')
      mult *= 1 + this.hero.stats.explosionDamage + this.hero.stats.viralLauncher +
        (this.rule('share_count') ? this.stats.kills * 0.03 : 0);
    if (label.startsWith('DliClip')) mult *= 1 + this.hero.stats.clipDamage;
    this.hit(this.hero, target, mult, 'skill', label, depth);
    if (hammer && this.rule('mass_ban'))
      for (const other of this.living().filter((e) => e !== target))
        this.hit(this.hero, other, mult * 0.7, 'skill', 'Mass Ban', depth + 1);
    if (label === 'DliClip' && this.rule('bounce'))
      for (const other of this.living()
        .filter((e) => e !== target)
        .slice(0, 2))
        this.hit(this.hero, other, mult, 'skill', 'DliClip Bounce', depth + 1);
    if (label === 'Viral Explosion' && this.rule('repost'))
      this.hit(this.hero, target, mult * 0.4, 'skill', 'Repost', depth + 1);
  }
  private hit(
    source: Actor,
    target: Actor,
    multiplier: number,
    tag: DamageTag,
    label: string,
    depth = 0,
    counter = false,
    guaranteed = false,
  ) {
    if (source.hp <= 0 || target.hp <= 0 || !this.allowed(depth)) return;
    const direct = tag === 'basic' || tag === 'skill' || tag === 'ultimate';
    const heroHit = target === this.hero;
    const fromHero = source.id === 'dili';
    if (direct && !guaranteed) {
      if (heroHit) this.incoming++;
      const forcedDodge =
        heroHit && ((this.rule('first_dodge') && this.incoming === 1) || this.ghost);
      if (forcedDodge || this.rng.chance(target.stats.dodgeRate)) {
      if (heroHit) {
        this.stats.dodges++;
        this.dodgeDamage = this.hero.stats.dodgeFollowup;
          this.ghost = false;
          this.avoided++;
          if (this.rule('end_to_end') && this.avoided % 3 === 0) this.ghost = true;
        }
        this.emit({
          type: 'dodge',
          source: source.id,
          target: target.id,
          amount: 0,
          label: 'DODGE',
        });
        if (heroHit) this.trigger('dodge', source, depth + 1);
        return;
      }
    }
    const crit =
      tag === 'basic' && this.rng.chance(source.stats.critRate + (fromHero ? this.nextCrit : 0));
    if (fromHero && tag === 'basic') this.nextCrit = 0;
    let incomingReduction = target.stats.damageReduction;
    if (heroHit) {
      if (target.hp < target.stats.maxHp * 0.25) incomingReduction += target.stats.lowHpReduction;
      if (source.statuses.length) incomingReduction += target.stats.debuffedReduction;
      if (source.kind.includes('bot') || ['boss_spam_king', 'boss_raid_master'].includes(source.kind))
        incomingReduction += target.stats.botReduction;
    }
    let modifier = 1 - Math.min(0.9,
      incomingReduction + (target.shield ? target.stats.shieldReduction : 0));
    modifier *= 1 + (this.status(target, 'vulnerable')?.power ?? 0);
    if (this.status(source, 'glitch'))
      modifier *= 1 - Math.min(0.9, 0.1 + (heroHit ? this.hero.stats.glitchedReduction : 0));
    if (fromHero) {
      modifier *=
        1 +
        (target.tier === 'boss'
          ? source.stats.bossDamage
          : target.tier === 'elite'
            ? source.stats.eliteDamage
            : 0);
      if (target.statuses.length)
        modifier *=
          1 + source.stats.debuffDamage + (tag === 'basic' ? source.stats.cleanPacket : 0);
      if (tag === 'basic')
        modifier *=
          1 + source.stats.basicDamage + this.scrollBonus + (this.bandwidth > 0 ? 0.35 : 0) + this.dodgeDamage;
      if (tag === 'basic' && !counter) modifier *= 1 + this.comboIndex * source.stats.comboMomentum;
      if (this.rule('adaptation') && (this.enemyTurns[target.id] ?? 0) > 10) modifier *= 1.3;
      if (this.rule('final_push') && source.hp < source.stats.maxHp * 0.25) modifier *= 1.35;
      if (counter && this.status(target, 'vulnerable')) modifier *= 1 + source.stats.counterDamage;
    }
    const amount =
      tag === 'true'
        ? Math.round(source.stats.atk * multiplier)
        : damageAmount(
            source.stats.atk,
            multiplier,
            tag === 'status' ? 0 : target.stats.def,
            modifier,
            crit ? source.stats.critDamage : 1,
          );
    const priorShield = target.shield;
    const result = absorbDamage(target.hp, target.shield, amount);
    target.hp = result.hp;
    target.shield = result.shield;
    this.emit({ type: 'damage', source: source.id, target: target.id, amount, label, crit, tag });
    if (fromHero && direct && this.dodgeDamage) this.dodgeDamage = 0;
    if (heroHit) this.stats.damageTaken += result.lostHp;
    else if (fromHero) {
      this.stats.damageDealt += result.lostHp + result.absorbed;
      this.stats.highestHit = Math.max(this.stats.highestHit, amount);
      if (crit) this.stats.crits++;
    }
    if (heroHit && target.hp === 0) {
      if (this.rule('lethal') && !this.consumed.has('lethal')) {
        this.consumed.add('lethal');
        target.hp = 1;
        this.shield(0.15);
      } else if (this.rule('revive') && !this.consumed.has('revive')) {
        this.consumed.add('revive');
        target.hp = Math.round(target.stats.maxHp * 0.35);
        this.emit({
          type: 'revive',
          source: 'dili',
          target: 'dili',
          amount: target.hp,
          label: 'NEVER LOG OFF',
        });
      }
    }
    if (target.hp === 0) {
      this.emit({
        type: 'death',
        source: source.id,
        target: target.id,
        amount: 0,
        label: 'Disconnected',
      });
      if (!heroHit) {
        this.stats.kills++;
        this.trigger('kill', this.target(), depth + 1);
        if (target.modifier === 'Viral')
          this.hit({ ...target, hp: 1 }, this.hero, 0.6, 'true', 'Viral Residue', depth + 1);
      }
    }
    if (fromHero && direct) {
      this.heal((result.lostHp + result.absorbed) * source.stats.lifesteal);
      if (crit) this.trigger('crit', target, depth + 1);
      if (target.modifier === 'Mirrored')
        this.hit(
          { ...target, hp: Math.max(1, target.hp), stats: { ...target.stats, atk: amount } },
          this.hero,
          0.1,
          'reflect',
          'Mirror',
          depth + 1,
        );
    }
    if (heroHit && target.hp > 0) {
      if (priorShield > 0 && target.shield === 0) this.trigger('shield_break', source, depth + 1);
      if (target.hp < target.stats.maxHp * 0.3) this.trigger('low_hp', source, depth + 1);
      if (direct) {
        this.gainRage(10);
        this.turnHits++;
        if (
          !counter &&
          ((this.rule('last_word') && this.turnHits === 1) ||
            this.rng.chance(target.stats.counterRate))
        ) {
          this.stats.counters++;
          this.basic(source, depth + 1, true);
          this.trigger('counter', source, depth + 1);
        }
      }
    }
  }
  private basic(target: Actor | undefined, depth = 0, counter = false) {
    if (!target || target.hp <= 0 || this.hero.hp <= 0 || !this.allowed(depth)) return;
    this.basicCount++;
    const targets = this.rule('overflow') && this.basicCount % 5 === 0 ? this.living() : [target];
    for (const enemy of targets)
      this.hit(
        this.hero,
        enemy,
        1,
        'basic',
        counter ? 'Auto Reply' : targets.length > 1 ? 'Packet Overflow' : 'Packet Shot',
        depth,
        counter,
      );
    this.trigger('basic', target, depth + 1);
    this.gainRage(this.hero.stats.ragePerAttack);
  }
  private enemyAction(enemy: Actor) {
    if (enemy.hp <= 0 || this.hero.hp <= 0) return;
    const silenced = !!this.status(enemy, 'silence');
    if (this.status(enemy, 'slow') && this.turn % 2 === 0) return;
    if (enemy.kind === 'boss_spam_king' && !silenced) {
      if (this.turn % 3 === 0 && this.living().length < 3) {
        const bot = makeActor(
          `summon_${this.turn}`,
          'Spam Bot',
          { maxHp: 130, atk: 26, def: 8 },
          'normal',
          'spam_bot',
        );
        this.enemies.push(bot);
        this.emit({
          type: 'summon',
          source: enemy.id,
          target: bot.id,
          amount: 0,
          label: 'SPAM REINFORCEMENTS',
        });
      }
      if (this.turn % 5 === 0) {
        this.emit({
          type: 'warning',
          source: enemy.id,
          target: 'dili',
          amount: 0,
          label: 'SPAM FLOOD INCOMING',
        });
        this.hit(enemy, this.hero, 1.6, 'skill', 'Spam Flood');
        return;
      }
    }
    if (enemy.kind === 'boss_loop_phantom' && !silenced) {
      if (enemy.hp <= enemy.stats.maxHp * 0.5 && !this.rewoundBosses.has(enemy.id)) {
        this.rewoundBosses.add(enemy.id);
        const healed = Math.min(enemy.stats.maxHp * 0.3, enemy.stats.maxHp - enemy.hp);
        enemy.hp += healed;
        this.emit({ type: 'heal', source: enemy.id, target: enemy.id, amount: Math.round(healed), label: 'LOOP REWIND' });
      }
      if (this.turn % 3 === 0) {
        this.applyStatus(this.hero, 'vulnerable', 2, 0.2, enemy.id);
        this.emit({ type: 'warning', source: enemy.id, target: 'dili', amount: 0, label: 'LOOP MARK — REPEATING LAST MOVE' });
        this.hit(enemy, this.hero, this.previousBossMove[enemy.id] ?? 1, 'skill', 'Repeated Move');
        return;
      }
      this.previousBossMove[enemy.id] = 0.8;
    }
    if (enemy.kind === 'boss_raid_master' && !silenced) {
      if (this.turn === 1) {
        for (let i = 0; i < 2 && this.enemies.length < 3; i++) {
          const minion = makeActor(`${enemy.id}_minion_${i}`, 'Raid Minion', { maxHp: 190 * enemy.stats.maxHp / 2200, atk: 40 * enemy.stats.atk / 54, def: enemy.stats.def * 0.7 }, 'normal', 'raid_minion');
          this.enemies.push(minion);
          this.emit({ type: 'summon', source: enemy.id, target: minion.id, amount: 0, label: 'RAID PARTY JOINED' });
        }
      }
      const minions = this.living().filter(other => other.kind === 'raid_minion');
      if (minions.length) {
        const shield = Math.round(enemy.stats.maxHp * 0.04);
        const gain = Math.min(shield, enemy.stats.maxHp * 0.3 - enemy.shield);
        enemy.shield += Math.max(0, gain);
        if (gain > 0) this.emit({ type: 'shield', source: enemy.id, target: enemy.id, amount: gain, label: 'PARTY FIREWALL' });
      }
      if (this.turn % 4 === 0) {
        this.emit({ type: 'warning', source: enemy.id, target: 'dili', amount: 0, label: 'SILENCE WAVE' });
        this.applyStatus(this.hero, 'silence', 2, 1, enemy.id);
        this.hit(enemy, this.hero, 0.65, 'skill', 'Silence Wave');
        return;
      }
    }
    if (enemy.kind === 'boss_null_exe' && !silenced) {
      if (enemy.hp <= enemy.stats.maxHp * 0.6 && !this.bossPhases.has(`${enemy.id}:glitch`)) {
        this.bossPhases.add(`${enemy.id}:glitch`);
        this.hero.stats.healingPower *= 0.65;
        this.applyStatus(this.hero, 'glitch', 3, 0.1, enemy.id);
        this.emit({ type: 'warning', source: enemy.id, target: 'dili', amount: 0, label: 'PHASE 2 — GLITCH FIELD / HEALING REDUCED' });
      }
      if (enemy.hp <= enemy.stats.maxHp * 0.25 && !this.bossPhases.has(`${enemy.id}:overclock`)) {
        this.bossPhases.add(`${enemy.id}:overclock`);
        enemy.stats.atk *= 1.35;
        this.emit({ type: 'warning', source: enemy.id, target: 'dili', amount: 0, label: 'PHASE 3 — OVERCLOCK' });
      }
      if (this.turn % 5 === 0) {
        this.emit({ type: 'warning', source: enemy.id, target: 'dili', amount: 0, label: 'NULL PULSE INCOMING' });
        this.hit(enemy, this.hero, this.hero.stats.maxHp * 0.18 / enemy.stats.atk, 'true', 'NULL PULSE', 0, false, true);
        return;
      }
    }
    this.hit(enemy, this.hero, 1, 'basic', enemy.name);
    if (!silenced && enemy.kind === 'scam_link' && this.turn % 3 === 0)
      this.applyStatus(this.hero, 'vulnerable', 2, 0.15, enemy.id);
    if (!silenced && enemy.kind === 'bug' && this.rng.chance(0.25))
      this.applyStatus(this.hero, 'glitch', 2, 0.1, enemy.id);
    if (!silenced && enemy.kind === 'data_leech' && this.turn % 2 === 0) {
      const stolen = Math.min(this.rage, 15 * (1 - this.hero.stats.rageLeechReduction));
      this.rage = Math.max(0, this.rage - stolen);
      this.emit({ type: 'rage', source: enemy.id, target: 'dili', amount: -Math.round(stolen), label: 'RAGE LEECHED' });
    }
    if (!silenced && enemy.kind === 'popup' && this.turn % 3 === 0) {
      for (const ally of this.living().filter(other => other !== enemy)) {
        const amount = Math.min(Math.round(ally.stats.maxHp * 0.12), ally.stats.maxHp - ally.shield);
        ally.shield += amount;
        if (amount) this.emit({ type: 'shield', source: enemy.id, target: ally.id, amount, label: 'POP-UP BARRIER' });
      }
    }
    if (!silenced && enemy.kind === 'toxic_reply' && this.turn % 3 === 0) {
      this.emit({ type: 'warning', source: enemy.id, target: 'dili', amount: 0, label: 'TOXIC RETORT' });
      this.hit(enemy, this.hero, 0.65, 'skill', 'Toxic Retort');
    }
    if (!silenced && enemy.kind === 'corrupted_clip' && this.turn % 2 === 0)
      this.hit(enemy, this.hero, 0.6, 'skill', 'Corrupted Burst');
    if (enemy.kind === 'boss_spam_king' && enemy.hp < enemy.stats.maxHp * 0.3)
      this.hit(enemy, this.hero, 0.6, 'basic', 'Overclocked King');
  }
  step(): CombatEvent[] {
    if (this.outcome) return [];
    this.events = [];
    this.guarded = false;
    this.turn++;
    this.turnHits = 0;
    this.comboIndex = 0;
    for (const enemy of this.living())
      this.enemyTurns[enemy.id] = (this.enemyTurns[enemy.id] ?? 0) + 1;
    if (this.turn === 1) this.trigger('battle_start', this.target());
    this.trigger('turn_start', this.target());
    this.basic(this.target());
    let chain = 0;
    while (
      this.target() &&
      this.hero.hp > 0 &&
      chain < Math.min(MAX_COMBO_CHAIN, this.hero.stats.maxCombo) &&
      this.rng.chance(this.hero.stats.comboRate) &&
      this.allowed(chain)
    ) {
      chain++;
      this.stats.combos++;
      this.comboIndex = chain;
      if (this.rule('infinite_scroll')) this.scrollBonus = Math.min(1, this.scrollBonus + 0.05);
      this.basic(this.target(), chain);
      this.trigger('combo', this.target(), chain);
    }
    this.comboIndex = 0;
    for (const enemy of [...this.living()]) this.enemyAction(enemy);
    for (const actor of [this.hero, ...this.living()]) {
      for (const s of [...actor.statuses]) {
        if (s.id === 'burn') {
          const source =
            s.source === 'dili' ? this.hero : this.enemies.find((e) => e.id === s.source);
          if (source) this.hit({ ...source, hp: 1 }, actor, s.power * s.stacks, 'status', 'Burn');
        }
        s.turns--;
      }
      actor.statuses = actor.statuses.filter((s) => s.turns > 0);
    }
    if (this.rage >= 100 && this.hero.hp > 0 && this.target()) {
      this.rage = 0;
      this.stats.ultimates++;
      this.emit({
        type: 'ultimate',
        source: 'dili',
        target: 'dili',
        amount: 0,
        label: 'DLI OVERDRIVE',
      });
      for (const enemy of this.living())
        this.hit(
          this.hero,
          enemy,
          1.8 * (1 + this.hero.stats.ultimateDamage),
          'ultimate',
          'DLI Overdrive',
        );
      this.trigger('ultimate', this.target());
      if (this.rule('bandwidth')) this.bandwidth = 4;
    }
    if (this.bandwidth > 0) this.bandwidth--;
    if (this.hero.hp <= 0) this.outcome = 'defeat';
    else if (!this.living().length) {
      this.outcome = 'victory';
      this.trigger('battle_end');
    }
    // A defensive build cannot hold the browser indefinitely; the turn limit ends in a recoverable defeat.
    if (!this.outcome && this.turn >= 150) {
      this.outcome = 'defeat';
      this.emit({
        type: 'warning',
        source: 'system',
        target: 'dili',
        amount: 0,
        label: 'Connection timed out — stalemate',
      });
    }
    return [...this.events];
  }
  snapshot() {
    return {
      hero: structuredClone(this.hero),
      enemies: structuredClone(this.enemies),
      rage: this.rage,
      turn: this.turn,
      outcome: this.outcome,
    };
  }
}
export type BattleSnapshot = ReturnType<CombatEngine['snapshot']>;
