import { ListFilter, LogIn } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ACHIEVEMENT_GLYPHS = {
  first_login: LogIn,
  feed_cleaner: ListFilter,
} satisfies Record<string, LucideIcon>;
