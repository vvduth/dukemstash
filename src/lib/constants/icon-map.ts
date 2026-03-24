import {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link as LinkIcon,
  File,
  Image,
} from 'lucide-react';

export const ICON_MAP = {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link: LinkIcon,
  File,
  Image,
} as const;

export type IconName = keyof typeof ICON_MAP;
