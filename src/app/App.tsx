import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Bolt,
  Check,
  ChevronRight,
  CircleHelp,
  Cpu,
  Crosshair,
  Crown,
  Gauge,
  Heart,
  Hexagon,
  Home,
  LockKeyhole,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Settings,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Trophy,
  Volume2,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useGame } from '../stores/gameStore';
import { ASSETS } from '../content/assets';
import { EQUIPMENT, GEAR, UPGRADE_COSTS, loadoutStats, type Slot } from '../content/equipment';
import { SKILLS, SKILL_BY_ID } from '../content/skills';
import { NODES, generateEncounter } from '../content/encounters';
import { CHAPTERS } from '../content/chapters';
import { accountLevel } from '../services/save';
import { playSound, startAudio, suspendAudio, updateAudio } from '../services/audio';
import { turnDuration } from '../game/phaser/presentation';
const BattleCanvas = lazy(() => import('../game/phaser/BattleCanvas'));
const iconFor = (tag: string, size = 22) => {
  const Icon =
    (
      {
        packet: Crosshair,
        hammer: Swords,
        firewall: Shield,
        viral: Radio,
        moderation: Shield,
        encryption: LockKeyhole,
        rage: Zap,
        heal: Heart,
        battle: Swords,
        elite: Skull,
        rest: Heart,
        event: CircleHelp,
        boss: Crown,
      } as Record<string, typeof Zap>
    )[tag] ?? Hexagon;
  return <Icon size={size} />;
};
const title = (text: string) => text.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
function Button({
  children,
  onClick,
  disabled,
  className = '',
  audioChapterId,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  audioChapterId?: string;
}) {
  return (
    <button
      className={`button ${className}`}
      disabled={disabled}
      onClick={() => {
        const state = useGame.getState();
        startAudio(
          state.save.settings,
          audioChapterId ?? state.run?.chapterId ?? 'chapter_feed',
        );
        playSound('select');
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}
function Meter({
  value,
  max,
  label,
  kind = 'hp',
}: {
  value: number;
  max: number;
  label: string;
  kind?: string;
}) {
  return (
    <div className={`meter ${kind}`}>
      <div className="meter-label">
        <span>{label}</span>
        <strong>
          {Math.round(value)} <small>/ {max}</small>
        </strong>
      </div>
      <div
        className="meter-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemax={max}
        aria-valuemin={0}
      >
        <i style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }} />
      </div>
    </div>
  );
}
function HeroPanel() {
  return (
    <div className="hero-art">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <span className="float-tag tag-one">
        <Shield size={15} /> FIREWALL ONLINE
      </span>
      <span className="float-tag tag-two">
        <Zap size={15} /> OVERDRIVE READY
      </span>
      <div className="hero-glow" />
      <img
        src={ASSETS.dili_idle}
        alt="Dili, the blue cyber mascot, holding a glowing packet blaster"
      />
      <div className="hero-platform" />
      <span className="hero-caption">
        DILI <i /> READY TO CONNECT
      </span>
    </div>
  );
}
function HomeScreen() {
  const { save, start, navigate, run } = useGame();
  const level = accountLevel(save.account.xp);
  const enter = () => (run && !run.result ? navigate('play') : start());
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> THE NETWORK NEEDS YOU
          </div>
          <h1>
            Small hero.
            <br />
            Unreasonable
            <br />
            <em>firepower.</em>
          </h1>
          <p>
            The network is corrupted. Build your Dili, stack wild skills, and turn its systems against
            themselves.
          </p>
          <div className="hero-actions">
            <Button
              className="primary"
              audioChapterId={run && !run.result ? run.chapterId : 'chapter_feed'}
              onClick={enter}
            >
              <Play size={18} fill="currentColor" />{' '}
              {run && !run.result ? 'Resume connection' : 'Enter the Network'} <ArrowRight size={20} />
            </Button>
            <Button onClick={() => navigate('equipment')}>
              <Cpu size={18} /> Loadout
            </Button>
          </div>
          <div className="hero-foot">
            <span>
              <Swords size={14} /> AUTO BATTLE
            </span>
            <span>
              <Sparkles size={14} /> YOUR BUILD. YOUR CHAOS.
            </span>
          </div>
        </div>
        <HeroPanel />
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">CHOOSE YOUR CONNECTION</span>
          <h2>
            The network awaits<span>.</span>
          </h2>
        </div>
        <span className="muted">{String(save.account.unlockedChapters).padStart(2, '0')} / 04 SECTORS ONLINE</span>
      </div>
      <section className="chapters">
        {CHAPTERS.map((chapter) => {
          const available = chapter.order <= save.account.unlockedChapters;
          const selectChapter = () => {
            startAudio(save.settings, run && !run.result ? run.chapterId : chapter.id);
            if (run && !run.result) navigate('play');
            else start(chapter.id);
          };
          const details = (
            <>
              <div className={`chapter-illustration chapter-${String(chapter.order).padStart(2, '0')}`}>
                {chapter.order === 1 && <div className="city-buildings" />}
                <span className="chapter-number">{String(chapter.order).padStart(2, '0')}</span>
                {available ? <span className="available">{chapter.order === save.account.unlockedChapters ? 'AVAILABLE' : 'UNLOCKED'}</span> : <LockKeyhole size={38} />}
                {chapter.order === 1 ? <Radio size={62} /> : <Crown size={47} />}
                {!available && <span className="coming">CLEAR THE PREVIOUS BOSS</span>}
              </div>
              <div className="chapter-content">
                <span className="eyebrow">CHAPTER {String(chapter.order).padStart(2, '0')}</span>
                <h3>{chapter.name} {available && <ArrowRight size={19} />}</h3>
                <p>{chapter.theme}</p>
                <div className="chapter-meta"><span><Crown size={14} /> {chapter.bossName}</span><span>12 nodes</span></div>
              </div>
            </>
          );
          return available
            ? <button className="chapter active" key={chapter.id} onClick={selectChapter}>{details}</button>
            : <article className="chapter locked" key={chapter.id}>{details}</article>;
        })}
      </section>
      <section className="bottom-panels">
        <div className="profile-strip">
          <div className="square-icon">
            <Cpu />
          </div>
          <div>
            <h3>Build something ridiculous.</h3>
            <p>
              Level {level} operator · {SKILLS.filter((s) => s.unlockLevel <= level).length} skills
              unlocked · {save.account.wins} network clears
            </p>
          </div>
          <Button onClick={() => navigate('equipment')}>
            Prepare Dili <ChevronRight size={17} />
          </Button>
        </div>
        <div className="record">
          <Trophy size={24} />
          <div>
            <span className="eyebrow">PERSONAL BEST</span>
            <strong>
              {save.account.bestScore.toLocaleString()} <small>PTS</small>
            </strong>
          </div>
        </div>
      </section>
    </>
  );
}
function EquipmentScreen() {
  const { save, equip, upgrade, start } = useGame();
  const stats = loadoutStats(save.account.equipped, save.account.inventory);
  return (
    <>
      <PageHeading
        kicker="PREPARE YOUR LOADOUT"
        title="Your loadout"
        text="Three slots. A different way to break the network."
      />
      <div className="equipment-layout">
        <div className="equipment-hero">
          <HeroPanel />
          <div className="stat-row">
            <span>
              HP <b>{stats.maxHp}</b>
            </span>
            <span>
              ATK <b>{stats.atk}</b>
            </span>
            <span>
              DEF <b>{stats.def}</b>
            </span>
          </div>
          <Button className="primary full" audioChapterId="chapter_feed" onClick={start}>
            Enter the Feed <ArrowRight size={18} />
          </Button>
        </div>
        <div className="equipment-list">
          {(['weapon', 'armor', 'module'] as Slot[]).map((slot) => {
            const id = save.account.equipped[slot],
              item = GEAR[id],
              level = save.account.inventory[id],
              cost = UPGRADE_COSTS[level - 1];
            return (
              <section className="panel gear-slot" key={slot}>
                <div className="section-heading">
                  <span className="eyebrow">{slot.toUpperCase()}</span>
                  <div>
                    <span className={`chip ${item.rarity ?? 'common'}`}>{(item.rarity ?? 'common').toUpperCase()}</span>
                    <span className="chip">LEVEL {level} / 5</span>
                  </div>
                </div>
                <div className="gear-title">
                  <div className="square-icon">
                    {slot === 'weapon' ? <Crosshair /> : slot === 'armor' ? <Shield /> : <Cpu />}
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
                <div className="gear-options">
                  {EQUIPMENT.filter((e) => e.slot === slot && save.account.inventory[e.id]).map(
                    (e) => (
                      <button
                        className={e.id === id ? 'selected' : ''}
                        key={e.id}
                        onClick={() => equip(e.id)}
                      >
                        {e.id === id && <Check size={13} />} {e.name}
                      </button>
                    ),
                  )}
                </div>
                <Button disabled={!cost || save.account.bits < cost} onClick={() => upgrade(slot)}>
                  {cost ? `Upgrade · ${cost} Bits` : 'Maximum level'} <Bolt size={15} />
                </Button>
              </section>
            );
          })}
          <p className="muted">
            Clear a chapter boss to open an equipment chest. Duplicate drops become 50 Bits. Gear changes
            apply to your next run.
          </p>
        </div>
      </div>
    </>
  );
}
function PageHeading({
  kicker,
  title: heading,
  text,
}: {
  kicker: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{kicker}</span>
      <h1>
        {heading}
        <span>.</span>
      </h1>
      {text && <p>{text}</p>}
    </div>
  );
}
function SettingsScreen() {
  const { save, settings } = useGame();
  return (
    <div className="narrow">
      <PageHeading kicker="MAKE YOURSELF AT HOME" title="Settings" />
      <section className="panel settings">
        {(['music', 'sfx'] as const).map((key) => (
          <label key={key}>
            <span>
              <Volume2 size={18} />
              {key === 'music' ? 'Music volume' : 'Sound effects'}
              <strong>{Math.round(save.settings[key] * 100)}%</strong>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step=".05"
              value={save.settings[key]}
              onChange={(e) => {
                settings({ [key]: Number(e.target.value) });
                startAudio(useGame.getState().save.settings);
              }}
            />
          </label>
        ))}
        <label className="toggle">
          <span>
            Reduced motion<small>Disable screen shake and attack movement.</small>
          </span>
          <input
            type="checkbox"
            checked={save.settings.reducedMotion}
            onChange={(e) => settings({ reducedMotion: e.target.checked })}
          />
        </label>
        <div className="toggle">
          <span>Default battle speed</span>
          <Button onClick={() => settings({ speed: save.settings.speed === 1 ? 2 : 1 })}>
            ×{save.settings.speed}
          </Button>
        </div>
        <p className="muted">
          Your equipment, Bits, unlocks and settings are saved in this browser. Active runs end when
          you close or reload the page.
        </p>
      </section>
    </div>
  );
}
function AchievementsScreen() {
  const { save } = useGame();
  return (
    <div className="narrow">
      <PageHeading kicker="YOUR NETWORK LEGACY" title="Achievements" />
      {[
        ['first_login', 'First Login', 'Clear your first battle.'],
        ['feed_cleaner', 'Feed Cleaner', 'Defeat the Spam King.'],
      ].map(([id, name, desc]) => (
        <div className="panel achievement" key={id}>
          <Trophy size={30} />
          <div>
            <h3>{name}</h3>
            <p>{desc}</p>
          </div>
          {save.account.achievements.includes(id) ? <Check /> : <LockKeyhole />}
        </div>
      ))}
      <p className="muted">
        {save.account.runs} runs completed · {save.account.wins} victories · Level{' '}
        {accountLevel(save.account.xp)} operator
      </p>
    </div>
  );
}
function BuildPanel() {
  const run = useGame((s) => s.run)!;
  const tags = Object.keys(run.skills).flatMap((id) => SKILL_BY_ID[id].tags);
  const archetype = tags.length
    ? [...tags].sort(
        (a, b) => tags.filter((t) => t === b).length - tags.filter((t) => t === a).length,
      )[0]
    : null;
  return (
    <aside className="panel build-panel">
      <div className="eyebrow">YOUR BUILD</div>
      <h3>
        {archetype
          ? `${title(archetype)} ${archetype === 'packet' ? 'Storm' : 'Protocol'}`
          : 'A clean slate'}
      </h3>
      <p className="muted">{Object.keys(run.skills).length} skills installed</p>
      <div className="skill-list">
        {Object.entries(run.skills).map(([id, rank]) => {
          const skill = SKILL_BY_ID[id];
          return (
            <details className={`owned-skill ${skill.rarity}`} key={id}>
              <summary>
                <span className="mini-icon">{iconFor(skill.tags[0], 17)}</span>
                <span>{skill.name}</span>
                <small>{rank > 1 ? `R${rank}` : '+'}</small>
              </summary>
              <p>{skill.description}</p>
            </details>
          );
        })}
        {!tags.length && (
          <p className="empty-build">
            Your first skill arrives after battle. Choose one of three and start a chain reaction.
          </p>
        )}
      </div>
      <div className="run-stat">
        <span>Bits collected</span>
        <b>{run.bits}</b>
      </div>
      <div className="run-stat">
        <span>Highest hit</span>
        <b>{Math.max(run.stats.highestHit, run.engine?.stats.highestHit ?? 0)}</b>
      </div>
    </aside>
  );
}
function RouteScreen() {
  const { run, act } = useGame();
  if (!run) return null;
  const kind = NODES[run.node];
  const fighting = ['battle', 'elite', 'boss'].includes(kind);
  return (
    <>
      <div className="node-intro">
        <span className="eyebrow">CHAPTER {String(run.chapter.order).padStart(2, '0')} · {run.chapter.name.toUpperCase()}</span>
        <h2>
          {kind === 'boss'
            ? `${run.chapter.bossName} awaits.`
            : kind === 'rest'
              ? 'Take a breath. Reconnect.'
              : kind === 'event'
                ? 'An unexpected connection.'
                : 'Pick your next connection.'}
        </h2>
        <p>
          {kind === 'boss'
            ? run.chapter.bossDescription
            : 'Dili handles the fighting. You decide what comes next.'}
        </p>
      </div>
      {run.notice && (
        <p className="notice">
          <Check size={17} />
          {run.notice}
        </p>
      )}
      <div className="route-map" aria-label="12-node route">
        {NODES.map((node, i) => (
          <div
            key={i}
            className={`route-node ${i < run.node ? 'complete' : ''} ${i === run.node ? 'current' : ''}`}
            title={`Node ${i + 1}: ${node}`}
          >
            <span>{i < run.node ? <Check size={16} /> : iconFor(node, 16)}</span>
            <small>{String(i + 1).padStart(2, '0')}</small>
          </div>
        ))}
      </div>
      <div className="route-options">
        {Array.from({ length: kind === 'battle' && run.node > 0 ? 3 : 1 }, (_, route) => {
          const enemies = fighting ? generateEncounter(run.seed, run.node, route, run.chapterId) : [];
          return (
            <button
              className={`route-card ${kind}`}
              key={route}
              onClick={() => act('enter', route)}
            >
              <div className="route-card-icon">{iconFor(kind, 34)}</div>
              <span className="eyebrow">
                NODE {run.node + 1} · {title(kind)}
              </span>
              <h3>
                {kind === 'boss'
                  ? run.chapter.bossName
                  : kind === 'elite'
                    ? `${enemies[0]?.modifier} encounter`
                    : kind === 'rest'
                      ? 'Safe connection'
                      : kind === 'event'
                        ? 'Unknown signal'
                        : ['Data lane', 'Side channel', 'Open frequency'][route]}
              </h3>
              <p>
                {fighting
                  ? enemies.map((e) => e.name).join(' + ')
                  : kind === 'rest'
                    ? 'Recover HP, upgrade a skill or prepare Shield.'
                    : 'A short choice. An unexpected advantage.'}
              </p>
              <span className="route-reward">
                {kind === 'boss'
                  ? '250 Bits + equipment chest'
                  : kind === 'elite'
                    ? '50 Bits + boosted skill draft'
                    : kind === 'battle'
                      ? '20 Bits + choose a skill'
                      : 'Make your next move'}{' '}
                <ArrowRight size={17} />
              </span>
            </button>
          );
        })}
      </div>
      <Meter value={run.hp} max={run.baseStats.maxHp} label="DILI / INTEGRITY" />
    </>
  );
}
function BattleScreen() {
  const { snapshot, paused, togglePause, speed, toggleSpeed, run, events } = useGame();
  const [inspected, setInspected] = useState<string>('');
  useEffect(() => {
    let remaining = 850;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now(),
        delta = Math.min(100, now - last);
      last = now;
      const state = useGame.getState();
      if (state.paused || document.hidden) return;
      remaining -= delta * state.speed;
      if (remaining <= 0) {
        if (state.run?.engine?.outcome) {
          state.finish();
          return;
        }
        state.step();
        remaining = turnDuration(useGame.getState().events);
      }
    }, 40);
    return () => window.clearInterval(id);
  }, []);
  if (!snapshot || !run) return null;
  return (
    <>
      <div className="battle-toolbar">
        <div>
          <span className="live-dot" />{' '}
          {NODES[run.node] === 'boss' ? `${run.chapter.bossName.toUpperCase()} CONNECTION` : 'AUTO BATTLE'}{' '}
          <small>TURN {snapshot.turn}</small>
        </div>
        <div>
          <Button onClick={toggleSpeed} className="compact">
            <Gauge size={16} /> ×{speed}
          </Button>
          <Button className="compact" onClick={togglePause}>
            {paused ? <Play size={17} /> : <Pause size={17} />} {paused ? 'Resume' : 'Pause'}
          </Button>
        </div>
      </div>
      <div className="enemy-hud">
        {snapshot.enemies
          .filter((e) => e.hp > 0)
          .map((enemy) => (
            <div key={enemy.id}>
              <span>
                {enemy.tier === 'boss' && <Crown size={13} />} {enemy.name}{' '}
                <small>{enemy.modifier}</small>
              </span>
              <Meter value={enemy.hp} max={enemy.stats.maxHp} label={enemy.name} />
              {enemy.statuses.map((s) => (
                <button
                  className="status-chip"
                  key={s.id}
                  onClick={() => setInspected(`${title(s.id)} · ${s.turns} turn(s) remaining`)}
                >
                  {s.id} {s.turns}
                </button>
              ))}
            </div>
          ))}
      </div>
      <Suspense fallback={<div className="battle-loading">Connecting to Feed City…</div>}>
        <BattleCanvas />
      </Suspense>
      {paused && <div className="pause-banner">Connection paused · Take your time.</div>}
      <div className="player-hud">
        <div className="player-hud-title">
          <span className="mini-icon">
            <Cpu size={20} />
          </span>
          <strong>DILI</strong>
          <span>
            <Shield size={14} /> {snapshot.hero.shield} Shield
          </span>
        </div>
        <Meter value={snapshot.hero.hp} max={snapshot.hero.stats.maxHp} label="INTEGRITY" />
        <Meter value={snapshot.rage} max={100} label="DLI OVERDRIVE" kind="rage" />
        {snapshot.hero.statuses.map((s) => (
          <button
            className="status-chip"
            key={s.id}
            onClick={() => setInspected(`${title(s.id)} · ${s.turns} turn(s) remaining`)}
          >
            {s.id} {s.turns}
          </button>
        ))}
        {inspected && (
          <p className="status-info" role="status">
            {inspected}
          </p>
        )}
      </div>
      <div className="combat-log" aria-label="Recent combat events">
        {events
          .filter((e) => e.type !== 'rage')
          .slice(-3)
          .map((e, i) => (
            <span key={i}>
              {e.label}
              {e.amount ? ` · ${e.amount}` : ''}
            </span>
          ))}
      </div>
    </>
  );
}
function DraftScreen() {
  const { run, act } = useGame();
  if (!run) return null;
  return (
    <>
      <div className="node-intro">
        <span className="eyebrow">
          <Sparkles size={14} /> CONNECTION UPGRADE
        </span>
        <h2>A little more unreasonable.</h2>
        <p>Choose one skill. Make the next fight your own.</p>
      </div>
      <div className="draft-cards">
        {run.draft.map((id) => {
          const skill = SKILL_BY_ID[id];
          return (
            <button
              key={id}
              className={`skill-card ${skill.rarity}`}
              onClick={() => {
                playSound('select');
                act('skill', id);
              }}
            >
              <div className="card-top">
                <span>{skill.rarity.toUpperCase()}</span>
                <small>{run.skills[id] ? `UPGRADE → R${run.skills[id] + 1}` : 'NEW'}</small>
              </div>
              <div className="skill-art">{iconFor(skill.tags[0], 48)}</div>
              <h3>{skill.name}</h3>
              <p>{skill.description}</p>
              <div className="skill-tags">
                {skill.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <span className="install-label">
                Install skill <ArrowRight size={17} />
              </span>
            </button>
          );
        })}
      </div>
      <div className="draft-footer">
        <Button disabled={!run.rerolls} onClick={() => act('reroll')}>
          <RotateCcw size={16} /> Reroll · {run.rerolls} remaining
        </Button>
        <span className="muted">Skills last for this run.</span>
      </div>
    </>
  );
}
function ChoiceScreen() {
  const { run, act } = useGame();
  if (!run) return null;
  const rest = run.phase === 'rest';
  const event = run.phase === 'event' ? run.currentEvent : undefined;
  const choices = rest
    ? [
        ['heal', 'Recover integrity', 'Heal 30% of maximum HP.'],
        ['upgrade', 'Upgrade a skill', 'Rank up an owned skill that has room to grow.'],
        ['shield', 'Prepare a firewall', 'Gain 25% max HP Shield for the next battle.'],
      ]
    : (event?.choices ?? []).map((choice, index) => [String(index), choice.label, choice.outcomeText]);
  return (
    <div className="choice-screen">
      <div className="event-symbol">{iconFor(rest ? 'rest' : 'event', 56)}</div>
      <div className="node-intro">
        <span className="eyebrow">
          NODE {run.node + 1} · {rest ? 'REST CONNECTION' : 'NETWORK EVENT'}
        </span>
        <h2>{rest ? 'Room to breathe.' : event?.title}</h2>
        <p>{rest ? 'Make one choice, then install a new skill.' : event?.body}</p>
      </div>
      <div className="choice-list">
        {choices.map(([value, label, desc]) => (
          <button
            key={value}
            disabled={
              value === 'upgrade' &&
              !Object.keys(run.skills).some((id) => run.skills[id] < SKILL_BY_ID[id].maxRank)
            }
            onClick={() => act(rest ? 'rest' : 'event', value)}
          >
            <div>
              <h3>{label}</h3>
              <p>{desc}</p>
            </div>
            <ArrowRight size={20} />
          </button>
        ))}
      </div>
      <Meter value={run.hp} max={run.baseStats.maxHp} label="DILI / INTEGRITY" />
    </div>
  );
}
function SummaryScreen() {
  const { run, start, navigate } = useGame();
  const [copied, setCopied] = useState(false);
  if (!run) return null;
  const share = `Dlicom Attack — ${run.chapter.name}\n${run.result === 'victory' ? `${run.chapter.bossName.toUpperCase()} DEFEATED` : 'RUN ENDED'}\nScore: ${run.score}\n${Object.keys(
    run.skills,
  )
    .map((id) => SKILL_BY_ID[id].name)
    .join(' + ')}\nSeed: ${run.seed}`;
  return (
    <div className="summary-screen">
      <div className="summary-icon">
        {run.result === 'victory' ? <Crown size={55} /> : <Radio size={55} />}
      </div>
      <PageHeading
        kicker={`CHAPTER ${String(run.chapter.order).padStart(2, '0')} · ${run.chapter.name.toUpperCase()}`}
        title={run.result === 'victory' ? `${run.chapter.name} is yours` : 'Connection lost'}
        text={
          run.result === 'victory'
            ? `${run.chapter.bossName} disconnected. That build was something else.`
            : 'Every run leaves you a little stronger. Try another connection.'
        }
      />
      <div className="score-number">
        {run.score.toLocaleString()}
        <span>FINAL SCORE</span>
      </div>
      <div className="summary-stats">
        {[
          ['Damage dealt', run.stats.damageDealt],
          ['Damage taken', run.stats.damageTaken],
          ['Highest hit', run.stats.highestHit],
          ['Enemies defeated', run.stats.kills],
          ['Elites cleared', run.elites],
          ['Nodes cleared', `${run.cleared} / 12`],
          [
            'Duration',
            `${Math.floor((run.endedAt - run.startedAt) / 60000)}m ${Math.floor((run.endedAt - run.startedAt) / 1000) % 60}s`,
          ],
          ['Bits earned', run.bits],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value.toLocaleString()}</strong>
          </div>
        ))}
      </div>
      {run.rewardGear && (
        <p className="reward-reveal">
          <Sparkles size={20} /> Equipment chest: <strong>{GEAR[run.rewardGear].name}</strong> ·
          duplicates convert to 50 Bits
        </p>
      )}
      <div className="summary-skills">
        {Object.keys(run.skills).map((id) => (
          <span key={id} className={`chip ${SKILL_BY_ID[id].rarity}`}>
            {SKILL_BY_ID[id].name}
          </span>
        ))}
      </div>
      <div className="summary-actions">
        <Button className="primary" audioChapterId={run.chapterId} onClick={() => start(run.chapterId)}>
          <RotateCcw size={17} /> Run it back
        </Button>
        <Button audioChapterId={run.chapterId} onClick={() => navigate('equipment')}>
          <Cpu size={17} /> Upgrade equipment
        </Button>
        <Button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(share);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? 'Copied!' : 'Copy result'}
        </Button>
      </div>
      <details className="share-text">
        <summary>Result text & seed</summary>
        <pre>{share}</pre>
      </details>
    </div>
  );
}
function PlayScreen() {
  const { run } = useGame();
  if (!run) return null;
  if (run.phase === 'summary') return <SummaryScreen />;
  return (
    <>
      <div className="run-heading">
        <span className="eyebrow">
          <Radio size={15} /> {run.chapter.name.toUpperCase()}
        </span>
        <span>
          NODE <b>{String(run.node + 1).padStart(2, '0')}</b> / 12
        </span>
        <span className="chip">{run.bits} BITS</span>
      </div>
      <div className="play-layout">
        <section className={`panel play-panel phase-${run.phase}`}>
          {run.phase === 'route' ? (
            <RouteScreen />
          ) : run.phase === 'battle' ? (
            <BattleScreen />
          ) : run.phase === 'draft' ? (
            <DraftScreen />
          ) : (
            <ChoiceScreen />
          )}
        </section>
        <BuildPanel />
      </div>
    </>
  );
}
export default function App() {
  const { screen, navigate, save, warning, run } = useGame();
  const summaryCue = useRef('');
  useEffect(() => updateAudio(save.settings), [save.settings]);
  useEffect(() => {
    if (run?.phase !== 'summary' || !run.result) {
      summaryCue.current = '';
      return;
    }
    const cueId = `${run.seed}:${run.result}`;
    if (summaryCue.current === cueId) return;
    summaryCue.current = cueId;
    playSound(run.result);
    const rewardTimers: number[] = [];
    if (run.result === 'victory' && run.rewardGear) {
      rewardTimers.push(window.setTimeout(() => playSound('reward'), 350));
      if (GEAR[run.rewardGear].rarity === 'legendary')
        rewardTimers.push(window.setTimeout(() => playSound('legendary'), 850));
    }
    return () => rewardTimers.forEach(window.clearTimeout);
  }, [run?.phase, run?.result, run?.rewardGear, run?.seed]);
  useEffect(() => {
    const listener = () => {
      suspendAudio(document.hidden);
      if (
        document.hidden &&
        !useGame.getState().paused &&
        useGame.getState().run?.phase === 'battle'
      )
        useGame.getState().togglePause();
    };
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  }, []);
  const inRun = screen === 'play' && run?.phase !== 'summary';
  return (
    <div className={save.settings.reducedMotion ? 'app reduced-motion' : 'app'}>
      <header className="site-header">
        <button className="brand" onClick={() => navigate('home')} aria-label="Dlicom Attack home">
          <span className="brand-symbol">
            <Zap size={28} fill="currentColor" />
          </span>
          <span>
            DLICOM<small>ATTACK</small>
          </span>
        </button>
        <nav aria-label="Main navigation">
          {[
            ['home', 'Play', Home],
            ['equipment', 'Loadout', Cpu],
            ['achievements', 'Records', Trophy],
          ].map(([id, label, Icon]) => {
            const NavIcon = Icon as typeof Home;
            return (
              <button
                key={String(id)}
                className={screen === id || (id === 'home' && screen === 'play') ? 'active' : ''}
                onClick={() => navigate(id as 'home' | 'equipment' | 'achievements')}
              >
                <NavIcon size={16} />
                <span>{String(label)}</span>
              </button>
            );
          })}
        </nav>
        <div className="header-account">
          <span className="bits">
            <Hexagon size={15} />
            {save.account.bits.toLocaleString()} <small>BITS</small>
          </span>
          <button
            className="settings-button"
            aria-label="Settings"
            onClick={() => navigate('settings')}
          >
            <Settings size={19} />
          </button>
        </div>
      </header>
      <main>
        {warning && (
          <p className="notice" role="status">
            {warning}
          </p>
        )}
        {screen !== 'play' && run && !run.result && (
          <div className="resume-run">
            <span>Your current connection is waiting.</span>
            <Button onClick={() => navigate('play')}>
              Resume run <Play size={15} />
            </Button>
          </div>
        )}
        {screen !== 'home' && screen !== 'play' && (
          <button className="back-link" onClick={() => navigate('home')}>
            <ArrowLeft size={16} /> Back to network
          </button>
        )}
        {screen === 'home' ? (
          <HomeScreen />
        ) : screen === 'equipment' ? (
          <EquipmentScreen />
        ) : screen === 'settings' ? (
          <SettingsScreen />
        ) : screen === 'achievements' ? (
          <AchievementsScreen />
        ) : (
          <PlayScreen />
        )}
      </main>
      <footer>
        <span>
          <span className="live-dot" /> SYSTEM ONLINE <i>·</i> v0.2.0
        </span>
        <span>
          {inRun
            ? 'AUTOMATIC COMBAT. MEANINGFUL CHOICES.'
            : 'NO WALLET. NO TRANSACTIONS. JUST CHAOS.'}
        </span>
        <span>
          <AudioLines size={14} /> MADE FOR THE DLICOM GAME JAM
        </span>
      </footer>
    </div>
  );
}
