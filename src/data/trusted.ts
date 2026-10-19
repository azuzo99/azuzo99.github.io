// Source: v4:L723-730 (template copy), v4:L1108-1117 (trustMarquee L) (verbatim; apostrophes -> ’)
import type { ImageMetadata } from 'astro';
import { img } from './icons';

export const trustedSection = {
  label: 'WORKED WITH & TRUSTED BY',
  /** section aria-label (design §6.5; not in v4) */
  ariaLabel: 'Worked with and trusted by',
} as const;

/**
 * v4 tile mode `m` (L1112). All tiles 36px high, radius 10, border #E4DACA, img alt "".
 * 0: tile 36 wide, bg #FFFFFF, img 22x22 contain
 * 1: tile 36 wide, bg #FFFFFF, img 100% cover
 * 2: tile 36 wide, bg #FFFFFF, img 28x28 contain
 * 3: tile 36 wide, bg #F0F0F0, img 28x28 contain
 * 4: tile 96 wide, bg #252D3D, img 100% contain
 */
export type TrustedMode = 0 | 1 | 2 | 3 | 4;

export interface TrustedLogo {
  name: string;
  logo: ImageMetadata;
  mode: TrustedMode;
}

/** Marquee order (>= 600, set duplicated once); phone shows `trusted[techTick % 8]`. */
export const trusted: TrustedLogo[] = [
  { name: 'Fandom', logo: img.fandom, mode: 0 },
  { name: 'Fanatical', logo: img.fanatical, mode: 2 },
  { name: 'Onwelo', logo: img.onwelo, mode: 1 },
  { name: 'GE HealthCare', logo: img.geHealthcare, mode: 2 },
  { name: 'Claude Community Poznan', logo: img.claudeCommunity, mode: 3 },
  { name: 'AWS Poznan & Poland Community', logo: img.aws, mode: 0 },
  { name: 'AWS Community Day', logo: img.awsCommunityDay, mode: 4 },
  { name: 'SysOps/DevOps Polska', logo: img.sodo, mode: 1 },
];
