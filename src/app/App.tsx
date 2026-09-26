import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Bolt,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Cpu,
  Crosshair,
  Crown,
  Gauge,
  Gift,
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
import type { CSSProperties, ReactNode } from 'react';
import type { Archetype, CombatEvent } from '../game/combat/types';
import type { BattleSnapshot } from '../game/combat/CombatEngine';
import { useGame } from '../stores/gameStore';
import { ASSETS, SKILL_ART, diliWeaponPoses } from '../content/assets';
import { SKINS, SKIN_BY_ID } from '../content/skins';
import { EQUIPMENT, GEAR, UPGRADE_COSTS, gearPrice, loadoutStats, type Slot } from '../content/equipment';
import { RUN_SHOP_COST } from '../game/run/RunSession';
import { canOpenChest, GEAR_CHEST_COST, SKILL_CHEST_COST } from '../game/meta/chests';
import { SKILLS, SKILL_BY_ID } from '../content/skills';
import { NODES, generateEncounter } from '../content/encounters';
import { CHAPTERS } from '../content/chapters';
import { SKILL_GLYPHS, STATUS_GLYPHS } from '../content/skillGlyphs';
import { ACHIEVEMENTS } from '../content/achievements';
import { ACHIEVEMENT_GLYPHS, EQUIPMENT_GLYPHS } from '../content/progressionIcons';
import { accountLevel } from '../services/save';
import { DAILY_ENERGY_REWARD, ENERGY_MAX, RUN_ENERGY_COST, canClaimDailyEnergy, energyCountdown, localDay } from '../game/meta/energy';
import { playSound, startAudio, suspendAudio, updateAudio } from '../services/audio';
import { applyCueVitals, snapshotVitals, turnDuration, type PresentedVitals } from '../game/phaser/presentation';
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
function SkillIcon({ skillId, tag }: { skillId: string; tag: Archetype }) {
  const Glyph = SKILL_GLYPHS[skillId as keyof typeof SKILL_GLYPHS] ?? Hexagon;
  return (
    <span
      className="skill-icon"
      data-skill-icon={skillId}
      data-archetype={tag}
      aria-hidden="true"
    >
      <img src={SKILL_ART[tag]} alt="" draggable={false} />
      <span className="skill-icon-glyph"><Glyph /></span>
    </span>
  );
}
function StatusIcon({ status }: { status: string }) {
  const Glyph = STATUS_GLYPHS[status as keyof typeof STATUS_GLYPHS] ?? Sparkles;
  return <Glyph className="status-icon" size={12} aria-hidden="true" />;
}
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
  const weaponId = useGame((state) => state.save.account.equipped.weapon);
  const skinId = useGame((state) => state.save.account.skinId);
  const weapon = GEAR[weaponId];
  const preview = diliWeaponPoses(skinId, weaponId).idle;
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
        src={preview}
        alt={`Dili in ${SKIN_BY_ID[skinId].name}, holding ${weapon.name}`}
      />
      <div className="hero-platform" />
      <span className="hero-caption">
        DILI <i /> READY TO CONNECT
      </span>
    </div>
  );
}
function EnergyBadge() {
  const energy = useGame((state) => state.save.account.energy);
  useEffect(() => {
    const id = window.setInterval(() => useGame.getState().syncEnergy(), 5000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="energy-indicator" aria-label={`Energy ${energy} of ${ENERGY_MAX}`}>
      <Zap size={15} fill="currentColor" /> {energy}<small>/{ENERGY_MAX}</small>
    </span>
  );
}
function DailyReward() {
  const { save, claimDailyEnergy } = useGame();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const account = save.account;
  const claimed = account.dailyClaimedOn === localDay(now);
  const canClaim = canClaimDailyEnergy(account, now);
  const remaining = energyCountdown(account, now);
  const remainingSeconds = Math.ceil(remaining / 1000);
  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const seconds = String(remainingSeconds % 60).padStart(2, '0');
  return (
    <section className="panel daily-panel" aria-label="Daily energy check-in">
      <div className="square-icon"><Zap aria-hidden="true" /></div>
      <div className="daily-copy">
        <span className="eyebrow">DAILY CHECK-IN</span>
        <h3>{account.energy} / {ENERGY_MAX} energy</h3>
        <p>{account.energy < ENERGY_MAX ? `+1 in ${minutes}:${seconds} · 1 energy every 10 minutes` : 'Energy full · 1 energy restores every 10 minutes'} · {RUN_ENERGY_COST} per run</p>
      </div>
      <Button disabled={!canClaim} onClick={claimDailyEnergy}>
        {claimed ? 'Claimed today' : canClaim ? `Claim +${DAILY_ENERGY_REWARD}` : 'Use energy to claim'}
      </Button>
    </section>
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
            <Button onClick={() => navigate('guide')}>
              <CircleHelp size={18} /> How to play
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
      <DailyReward />
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
function GuideScreen() {
  const { start, navigate, run } = useGame();
  const enter = () => (run && !run.result ? navigate('play') : start());
  const steps = [
    { number: '01', icon: Cpu, title: 'Prepare your loadout', text: 'Equip a weapon, armor and module, then choose Dili\'s skin. Each run costs 5 energy; 1 restores every 10 minutes and your daily check-in grants 5 more.' },
    { number: '02', icon: ArrowRight, title: 'Choose a route', text: 'Pick a lane at each route map. Battles build your run; events, rest stops and elites offer different risks and rewards.' },
    { number: '03', icon: Swords, title: 'Watch Dili fight automatically', text: 'Attacks, skills and enemy turns resolve on their own. Pause or switch between ×1 and ×2 speed whenever you need.' },
    { number: '04', icon: Sparkles, title: 'Build a skill synergy', text: 'After a battle, choose 1 of 3 skills. Read each effect and tags, then combine skills that reinforce the same strategy. Tap a skill or status to inspect it.' },
    { number: '05', icon: Crown, title: 'Reach the boss and improve', text: 'Clear 12 nodes to face the chapter boss. Spend earned Bits on gear, upgrades or chests in Shop. A skill chest gives your next run one starting skill.' },
  ];
  return (
    <div className="guide-page">
      <PageHeading kicker="YOUR FIRST RUN, DECODED" title="How to play" text="No reflex tests or manual aiming. Make a few sharp choices and let Dili handle the fight." />
      <section className="guide-steps" aria-label="How to play steps">
        {steps.map(({ number, icon: Icon, title: stepTitle, text }) => (
          <article className="panel guide-step" key={number}>
            <span className="guide-number">{number}</span>
            <span className="square-icon"><Icon size={21} /></span>
            <div><h3>{stepTitle}</h3><p>{text}</p></div>
          </article>
        ))}
      </section>
      <section className="panel guide-tip">
        <div className="square-icon"><Zap size={21} /></div>
        <div><span className="eyebrow">QUICK TIP</span><p>Skills with matching tags can trigger each other. Check your active skills during a run and look for a build taking shape.</p></div>
      </section>
      <div className="guide-actions">
        <Button className="primary" audioChapterId={run && !run.result ? run.chapterId : 'chapter_feed'} onClick={enter}>
          <Play size={17} fill="currentColor" /> {run && !run.result ? 'Resume connection' : 'Start your first run'} <ArrowRight size={18} />
        </Button>
        <Button onClick={() => navigate('equipment')}><Cpu size={17} /> View loadout</Button>
      </div>
    </div>
  );
}
function EquipmentScreen() {
  const { save, equip, upgrade, start, run } = useGame();
  const [tab, setTab] = useState<'loadout' | 'inventory' | 'shop' | 'skins'>('loadout');
  const stats = loadoutStats(save.account.equipped, save.account.inventory);
  return (
    <>
      <PageHeading
        kicker="BUILD YOUR NEXT RUN"
        title={tab === 'loadout' ? 'Your loadout' : tab === 'inventory' ? 'Your inventory' : tab === 'shop' ? 'Network shop' : 'Dili skins'}
        text={tab === 'loadout' ? 'Three slots. A different way to break the network.'
          : tab === 'inventory' ? 'Every item you own, grouped by slot. Upgrade or equip for your next run.'
            : tab === 'shop' ? 'Spend earned Bits on a known item or open a gear or skill chest.'
              : 'Choose Dili\'s costume. Every outfit has unique armor, weapons and effects across all combat poses.'}
      />
      <div className="gear-tabs" role="tablist" aria-label="Equipment views">
        {([['loadout', 'Loadout'], ['inventory', 'Inventory'], ['shop', 'Shop'], ['skins', 'Skins']] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {save.account.queuedSkill && (
        <p className="queued-skill-note">
          <SkillIcon skillId={save.account.queuedSkill} tag={SKILL_BY_ID[save.account.queuedSkill].tags[0]} />
          <span>{run && !run.result ? 'Current run started with ' : 'Next run starts with '}<strong>{SKILL_BY_ID[save.account.queuedSkill].name}</strong> from your skill chest.</span>
        </p>
      )}
      {tab === 'loadout' ? (
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
              GearGlyph = EQUIPMENT_GLYPHS[id as keyof typeof EQUIPMENT_GLYPHS] ?? Cpu,
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
                  <div className="square-icon" data-equipment-icon={id}>
                    <GearGlyph aria-hidden="true" />
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
                <div className="gear-options">
                  {EQUIPMENT.filter((e) => e.slot === slot && save.account.inventory[e.id]).map(
                    (e) => {
                      const OptionGlyph = EQUIPMENT_GLYPHS[e.id as keyof typeof EQUIPMENT_GLYPHS] ?? Cpu;
                      return (
                      <button
                        className={e.id === id ? 'selected' : ''}
                        key={e.id}
                        onClick={() => equip(e.id)}
                      >
                        <OptionGlyph size={15} aria-hidden="true" data-equipment-option-icon={e.id} />
                        {e.id === id && <Check size={13} />} {e.name}
                      </button>
                      );
                    },
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
      ) : tab === 'inventory' ? <InventoryPanel /> : tab === 'shop' ? <GearShopPanel onPurchased={() => setTab('inventory')} /> : <SkinPanel />}
    </>
  );
}
function InventoryPanel() {
  const { save, equip, upgradeItem } = useGame();
  return (
    <div className="collection-layout">
      {(['weapon', 'armor', 'module'] as Slot[]).map((slot) => (
        <section key={slot} className="collection-section">
          <div className="section-heading"><h2>{title(slot)}s</h2><span className="muted">{EQUIPMENT.filter((item) => item.slot === slot && save.account.inventory[item.id]).length} / {EQUIPMENT.filter((item) => item.slot === slot).length} OWNED</span></div>
          <div className="collection-grid">
            {EQUIPMENT.filter((item) => item.slot === slot && save.account.inventory[item.id]).map((item) => {
              const Glyph = EQUIPMENT_GLYPHS[item.id as keyof typeof EQUIPMENT_GLYPHS] ?? Cpu;
              const level = save.account.inventory[item.id];
              const cost = UPGRADE_COSTS[level - 1];
              const selected = save.account.equipped[slot] === item.id;
              return (
                <article className="panel collection-card" key={item.id} data-inventory-id={item.id}>
                  <div className="collection-icon"><Glyph size={24} aria-hidden="true" /></div>
                  <div><span className={`chip ${item.rarity ?? 'common'}`}>{(item.rarity ?? 'common').toUpperCase()} · LV {level}</span><h3>{item.name}</h3><p>{item.description}</p></div>
                  <div className="collection-actions">
                    <Button disabled={selected} onClick={() => equip(item.id)}>{selected ? 'Equipped' : 'Equip'}</Button>
                    <Button disabled={!cost || save.account.bits < cost} onClick={() => upgradeItem(item.id)}>{cost ? `Upgrade · ${cost} Bits` : 'Max level'}</Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
function SkinPanel() {
  const { save, selectSkin, run } = useGame();
  const weaponId = save.account.equipped.weapon;
  const weapon = GEAR[weaponId];
  return (
    <section className="skin-collection" aria-label="Dili skins">
      <p className="shop-note">Costume previews use your equipped {weapon.name}. All costumes are cosmetic only and apply to the next run{run && !run.result ? '; the active run keeps its current outfit and weapon' : ''}.</p>
      <div className="skin-grid">
        {SKINS.map((skin) => {
          const selected = save.account.skinId === skin.id;
          return (
            <article className="panel skin-card" key={skin.id} data-skin-id={skin.id} data-selected={selected} style={{ '--skin-color': skin.accent } as CSSProperties}>
              <div className="skin-card-art"><img src={diliWeaponPoses(skin.id, weaponId).idle} alt={`Dili wearing ${skin.name} and holding ${weapon.name}`} loading="lazy" /></div>
              <div><span className="eyebrow">DILI COSTUME · {weapon.name.toUpperCase()}</span><h2>{skin.name}</h2><p>{skin.description}</p></div>
              <Button disabled={selected} onClick={() => selectSkin(skin.id)}>{selected ? 'Selected' : 'Use this skin'}</Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
function GearShopPanel({ onPurchased }: { onPurchased: () => void }) {
  const { save, buyGear, openChest, chestReward, clearChestReward, run } = useGame();
  const available = EQUIPMENT.filter((item) => !save.account.inventory[item.id]);
  const rewardItem = chestReward?.kind === 'gear' ? GEAR[chestReward.id] : undefined;
  const rewardSkill = chestReward?.kind === 'skill' ? SKILL_BY_ID[chestReward.id] : undefined;
  const RewardGearGlyph = rewardItem ? EQUIPMENT_GLYPHS[rewardItem.id as keyof typeof EQUIPMENT_GLYPHS] ?? Cpu : Cpu;
  return (
    <div className="collection-layout">
      <p className="shop-note">Earn Bits from every run, including defeats. Buy a known item below or open a chest for a surprise.</p>
      {chestReward && (
        <div className={`panel chest-reveal ${rewardItem?.rarity ?? rewardSkill?.rarity ?? 'common'}`} role="status" aria-live="polite" key={`${chestReward.kind}:${chestReward.id}`}>
          <div className="chest-reveal-visuals">
            <div className="chest-reveal-burst"><img src={chestReward.kind === 'gear' ? ASSETS.chest_gear : ASSETS.chest_skill} alt="" /></div>
            <ArrowRight size={18} aria-hidden="true" />
            <div className="chest-reveal-reward" data-chest-reward-art={chestReward.kind}>
              {rewardSkill ? <SkillIcon skillId={rewardSkill.id} tag={rewardSkill.tags[0]} /> : <RewardGearGlyph size={52} aria-hidden="true" />}
            </div>
          </div>
          <div>
            <span className="eyebrow">CHEST OPENED · {(rewardItem?.rarity ?? rewardSkill?.rarity ?? 'common').toUpperCase()}</span>
            <h2>{rewardItem?.name ?? rewardSkill?.name}</h2>
            <p>{rewardItem ? `${rewardItem.description} · Added to your inventory.` : `${rewardSkill?.description} · Ready at the start of your next run.`}</p>
          </div>
          <div className="chest-reveal-actions">
            {rewardItem && <Button onClick={() => { clearChestReward(); onPurchased(); }}>View in inventory</Button>}
            <Button onClick={clearChestReward}>Close</Button>
          </div>
        </div>
      )}
      <section className="collection-section">
        <div className="section-heading"><h2>Open a chest</h2><span className="muted">ONE PURCHASE · ONE REWARD</span></div>
        <div className="chest-grid">
          <article className="panel chest-card" data-chest-kind="gear">
            <div className="chest-art gear"><img src={ASSETS.chest_gear} alt="Gear chest" loading="lazy" /></div>
            <div><span className="eyebrow">EQUIPMENT DROP</span><h3>Gear chest</h3><p>Receive one random item you do not own yet. Its rarity can be Common, Rare, Epic or Legendary.</p></div>
            <p className="chest-odds">Base rarity odds: Common 55% · Rare 30% · Epic 12% · Legendary 3%. Unavailable tiers are skipped.</p>
            <Button disabled={!canOpenChest(save, 'gear')} onClick={() => openChest('gear')}><Gift size={16} /> Open · {GEAR_CHEST_COST} Bits</Button>
            {!available.length && <small>Collection complete.</small>}
          </article>
          <article className="panel chest-card" data-chest-kind="skill">
            <div className="chest-art skill"><img src={ASSETS.chest_skill} alt="Skill chest" loading="lazy" /></div>
            <div><span className="eyebrow">NEXT-RUN BOOST</span><h3>Skill chest</h3><p>Reveal one random skill unlocked for your account. Start your next run with it at Rank 1.</p></div>
            <p className="chest-odds">One skill may be queued. It is spent only when that run ends.</p>
            <Button disabled={!canOpenChest(save, 'skill') || !!(run && !run.result)} onClick={() => openChest('skill')}><Sparkles size={16} /> Open · {SKILL_CHEST_COST} Bits</Button>
            {save.account.queuedSkill && <small>{SKILL_BY_ID[save.account.queuedSkill].name} is already queued.</small>}
          </article>
        </div>
      </section>
      <div className="section-heading"><h2>Choose an item</h2><span className="muted">DIRECT PURCHASE</span></div>
      {available.length ? (['weapon', 'armor', 'module'] as Slot[]).map((slot) => {
        const items = available.filter((item) => item.slot === slot);
        return items.length ? (
          <section key={slot} className="collection-section">
            <div className="section-heading"><h2>{title(slot)}s</h2></div>
            <div className="collection-grid">
              {items.map((item) => {
                const Glyph = EQUIPMENT_GLYPHS[item.id as keyof typeof EQUIPMENT_GLYPHS] ?? Cpu;
                const price = gearPrice(item);
                return (
                  <article className="panel collection-card" key={item.id} data-shop-id={item.id}>
                    <div className="collection-icon"><Glyph size={24} aria-hidden="true" /></div>
                    <div><span className={`chip ${item.rarity ?? 'common'}`}>{(item.rarity ?? 'common').toUpperCase()}</span><h3>{item.name}</h3><p>{item.description}</p></div>
                    <div className="collection-actions"><Button disabled={save.account.bits < price} onClick={() => { buyGear(item.id); onPurchased(); }}><Hexagon size={14} /> Buy & equip · {price} Bits</Button></div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null;
      }) : <p className="panel collection-empty">Collection complete. Every piece of gear is yours.</p>}
    </div>
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
          you close or reload the page; interrupted runs return their energy next time you open the game.
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
      {ACHIEVEMENTS.map(({ id, name, description }) => {
        const Glyph = ACHIEVEMENT_GLYPHS[id as keyof typeof ACHIEVEMENT_GLYPHS];
        return (
          <div className="panel achievement" key={id}>
            <Glyph size={30} data-achievement-icon={id} aria-hidden="true" />
            <div>
              <h3>{name}</h3>
              <p>{description}</p>
            </div>
            {save.account.achievements.includes(id) ? <Check /> : <LockKeyhole />}
          </div>
        );
      })}
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
                <span className="mini-icon"><SkillIcon skillId={skill.id} tag={skill.tags[0]} /></span>
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
              ? run.node === 9 ? 'The Signal Bazaar is open.' : 'Take a breath. Reconnect.'
              : kind === 'event'
                ? 'An unexpected connection.'
                : 'Pick your next connection.'}
        </h2>
        <p>
          {kind === 'boss'
            ? run.chapter.bossDescription
            : kind === 'rest' && run.node === 9
              ? 'Spend run Bits on a stronger skill signal, or use the rest stop.'
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
                      ? run.node === 9 ? 'Signal Bazaar' : 'Safe connection'
                      : kind === 'event'
                        ? 'Unknown signal'
                        : ['Data lane', 'Side channel', 'Open frequency'][route]}
              </h3>
              <p>
                {fighting
                  ? enemies.map((e) => e.name).join(' + ')
                  : kind === 'rest'
                    ? run.node === 9 ? 'Heal, upgrade, shield or buy a Rare+ skill offer.' : 'Recover HP, upgrade a skill or prepare Shield.'
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
  const [presentedVitals, setPresentedVitals] = useState<PresentedVitals>(() =>
    snapshot ? snapshotVitals(snapshot) : {},
  );
  const onCue = useCallback((event: CombatEvent) => {
    setPresentedVitals((current) => applyCueVitals(current, event));
  }, []);
  const onSnapshot = useCallback((presentedSnapshot: BattleSnapshot) => {
    setPresentedVitals(snapshotVitals(presentedSnapshot));
  }, []);
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
          <details className="battle-build-toggle">
            <summary>
              <Sparkles size={14} /> Build <small>{Object.keys(run.skills).length}</small>
            </summary>
            <div className="battle-build-popover"><BuildPanel /></div>
          </details>
          <Button onClick={toggleSpeed} className="compact">
            <Gauge size={16} /> ×{speed}
          </Button>
          <Button className="compact" onClick={togglePause}>
            {paused ? <Play size={17} /> : <Pause size={17} />} {paused ? 'Resume' : 'Pause'}
          </Button>
        </div>
      </div>
      <div className="battle-stage">
        <div className="enemy-hud">
          {snapshot.enemies
            .filter((enemy) => (presentedVitals[enemy.id]?.hp ?? enemy.hp) > 0)
            .map((enemy) => (
              <div key={enemy.id}>
                <span>
                  {enemy.tier === 'boss' && <Crown size={13} />} {enemy.name}{' '}
                  <small>{enemy.modifier}</small>
                </span>
                <Meter value={presentedVitals[enemy.id]?.hp ?? enemy.hp} max={enemy.stats.maxHp} label={enemy.name} />
                <div className="status-row">
                  {enemy.statuses.map((s) => (
                    <button
                      className="status-chip"
                      data-status={s.id}
                      key={s.id}
                      onClick={() => setInspected(`${title(s.id)} · ${s.turns} turn(s) remaining`)}
                    >
                      <StatusIcon status={s.id} /> {s.id} {s.turns}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
        <Suspense fallback={<div className="battle-loading">Connecting to Feed City…</div>}>
          <BattleCanvas onCue={onCue} onSnapshot={onSnapshot} />
        </Suspense>
        {paused && <div className="pause-banner">Connection paused · Take your time.</div>}
      </div>
      <div className="battle-status-side">
        <div className="player-hud">
          <div className="player-hud-title">
            <span className="mini-icon">
              <Cpu size={20} />
            </span>
            <strong>DILI</strong>
            <span>
              <Shield size={14} /> {presentedVitals.dili?.shield ?? snapshot.hero.shield} Shield
            </span>
          </div>
          <Meter value={presentedVitals.dili?.hp ?? snapshot.hero.hp} max={snapshot.hero.stats.maxHp} label="INTEGRITY" />
          <Meter value={snapshot.rage} max={100} label="DLI OVERDRIVE" kind="rage" />
          <div className="status-row">
            {snapshot.hero.statuses.map((s) => (
              <button
                className="status-chip"
                data-status={s.id}
                key={s.id}
                onClick={() => setInspected(`${title(s.id)} · ${s.turns} turn(s) remaining`)}
              >
                <StatusIcon status={s.id} /> {s.id} {s.turns}
              </button>
            ))}
          </div>
          {inspected && (
            <p className="status-info" role="status">
              {inspected}
            </p>
          )}
        </div>
        <div className="battle-side-build"><BuildPanel /></div>
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
              <div className="skill-art"><SkillIcon skillId={skill.id} tag={skill.tags[0]} /></div>
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
  const bazaar = rest && run.node === 9;
  const event = run.phase === 'event' ? run.currentEvent : undefined;
  const choices = rest
    ? [
        ['heal', 'Recover integrity', 'Heal 30% of maximum HP.'],
        ['upgrade', 'Upgrade a skill', 'Rank up an owned skill that has room to grow.'],
        ['shield', 'Prepare a firewall', 'Gain 25% max HP Shield for the next battle.'],
        ...(bazaar ? [['shop', 'Browse the Signal Bazaar', `Spend ${RUN_SHOP_COST} run Bits for a Rare-or-better skill offer.`]] : []),
      ]
    : (event?.choices ?? []).map((choice, index) => [String(index), choice.label, choice.outcomeText]);
  return (
    <div className="choice-screen">
      <div className="event-symbol">{bazaar ? <Hexagon size={56} /> : iconFor(rest ? 'rest' : 'event', 56)}</div>
      <div className="node-intro">
        <span className="eyebrow">
          NODE {run.node + 1} · {bazaar ? 'SIGNAL BAZAAR' : rest ? 'REST CONNECTION' : 'NETWORK EVENT'}
        </span>
        <h2>{bazaar ? 'Spend your signal.' : rest ? 'Room to breathe.' : event?.title}</h2>
        <p>{bazaar ? `You have ${run.bits} run Bits. Choose one service, then install a skill.` : rest ? 'Make one choice, then install a new skill.' : event?.body}</p>
      </div>
      <div className="choice-list">
        {choices.map(([value, label, desc]) => (
          <button
            key={value}
            disabled={
              (value === 'upgrade' &&
              !Object.keys(run.skills).some((id) => run.skills[id] < SKILL_BY_ID[id].maxRank))
              || (value === 'shop' && run.bits < RUN_SHOP_COST)
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
  const transitionName = run.phase === 'battle'
    ? NODES[run.node] === 'boss' ? 'BOSS SIGNAL' : 'COMBAT LINK'
    : run.phase === 'draft' ? 'NEW SKILL SIGNAL'
      : run.phase === 'event' ? 'UNKNOWN CONNECTION'
        : run.phase === 'rest' && run.node === 9 ? 'SIGNAL BAZAAR'
          : run.phase === 'rest' ? 'SAFE CONNECTION' : 'NEXT NODE';
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
      <div className={`play-layout${run.phase === 'battle' ? ' battle-layout' : ''}`}>
        <section className={`panel play-panel phase-${run.phase}`}>
          <div className="phase-transition" key={`${run.seed}:${run.node}:${run.phase}`} aria-hidden="true">
            <span className="phase-transition-icon">{run.phase === 'draft' ? <Sparkles size={34} /> : iconFor(NODES[run.node], 34)}</span>
            <span className="eyebrow">NODE {String(run.node + 1).padStart(2, '0')} / 12</span>
            <strong>{transitionName}</strong>
          </div>
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
        {run.phase !== 'battle' && <BuildPanel />}
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
    <div className={`app${save.settings.reducedMotion ? ' reduced-motion' : ''}${screen === 'play' && run && run.phase !== 'summary' ? ' run-app' : ''}${screen === 'play' && run?.phase === 'battle' ? ' battle-app' : ''}`}>
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
            ['guide', 'Guide', BookOpen],
            ['equipment', 'Loadout', Cpu],
            ['achievements', 'Records', Trophy],
          ].map(([id, label, Icon]) => {
            const NavIcon = Icon as typeof Home;
            return (
              <button
                key={String(id)}
                className={screen === id || (id === 'home' && screen === 'play') ? 'active' : ''}
                onClick={() => navigate(id as 'home' | 'guide' | 'equipment' | 'achievements')}
              >
                <NavIcon size={16} />
                <span>{String(label)}</span>
              </button>
            );
          })}
        </nav>
        <div className="header-account">
          <EnergyBadge />
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
        ) : screen === 'guide' ? (
          <GuideScreen />
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
