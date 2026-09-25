import {
  Bot,
  CircuitBoard,
  CircleGauge,
  Clapperboard,
  Cpu,
  Crosshair,
  DatabaseZap,
  EyeOff,
  GitBranch,
  Gavel,
  KeyRound,
  ListFilter,
  LogIn,
  Radio,
  Scale,
  Shield,
  ShieldBan,
  ShieldCheck,
  ShieldPlus,
  Shirt,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Distinct item silhouettes for the equipment collection and loadout choices. */
export const EQUIPMENT_GLYPHS = {
  weapon_packet_blaster: Crosshair,
  weapon_moderator_hammer: Gavel,
  weapon_overdrive_core: Cpu,
  weapon_viral_launcher: Radio,
  weapon_encryption_blade: KeyRound,
  weapon_dliclip_cannon: Clapperboard,
  armor_firewall_shell: Shield,
  armor_creator_hoodie: Shirt,
  armor_zero_knowledge_cloak: EyeOff,
  armor_moderator_vest: ShieldCheck,
  armor_antispam_plating: ShieldBan,
  armor_core_armor: ShieldPlus,
  module_viral_chip: Bot,
  module_combo_router: GitBranch,
  module_counter_protocol: Scale,
  module_rage_cache: DatabaseZap,
  module_safe_mode: CircleGauge,
  module_trust: CircuitBoard,
} satisfies Record<string, LucideIcon>;

export const ACHIEVEMENT_GLYPHS = {
  first_login: LogIn,
  feed_cleaner: ListFilter,
} satisfies Record<string, LucideIcon>;
