/**
 * The ONE place BuildSmith's colors are defined.
 *
 * Everything else derives from this module:
 *  - `tailwind.config.ts` generates the CSS custom properties for both themes from it
 *    (a Tailwind plugin `addBase`s them under `:root[data-theme=…]`), and binds the semantic
 *    color utilities (`bg-surface-raised`, `text-fg-muted`, …) to those variables.
 *  - Monaco and xterm render to canvas and cannot read CSS variables, so their theme objects
 *    are built from these hexes directly (see `features/ide/monacoSetup.ts`, `Terminal.tsx`).
 *  - The `<meta name="theme-color">` swap in `themeStore.applyTheme` reads `META_THEME_COLOR`.
 *  - The pre-paint script in `index.html` necessarily duplicates the two canvas hexes as string
 *    literals (it runs before any module loads); `htmlSync.test.ts` asserts they match.
 *  - `contrast.test.ts` asserts WCAG contrast pairs across BOTH themes, so a token that only
 *    works in one theme fails CI rather than review.
 *
 * Values are plain hex. `rgbTriplet()` converts to the `R G B` channel form Tailwind needs to
 * keep alpha utilities working (`bg-surface/40` → `rgb(var(--ff-surface) / 0.4)`).
 */

export interface ThemePalette {
  /** Page background — the darkest (dark) / lightest (light) layer. */
  canvas: string;
  /** Default panel/card background, one step off the canvas. */
  surface: string;
  /** Hover targets, menus, secondary wells — one step above surface. */
  raised: string;
  /** Modals, popovers, command palette — the topmost opaque layer. */
  overlay: string;
  /** Inset wells: code blocks, terminals, editors sit BELOW the surface. */
  sunken: string;

  /** Primary text. */
  fg: string;
  /** Secondary text — labels, descriptions. AA on canvas/surface/raised. */
  fgMuted: string;
  /** Tertiary text — metadata, timestamps. Still AA on surface. */
  fgSubtle: string;
  /** Decorative text — placeholders, disabled. ≥3:1 on surface, not for reading copy. */
  fgFaint: string;
  /** Text on brand-colored fills. */
  fgInverted: string;

  /** Default hairline border. */
  edge: string;
  /** Emphasised border — inputs, hovered outlines. */
  edgeStrong: string;

  /** Primary action color (indigo). */
  brand: string;
  /** Hover shift for brand fills. */
  brandHover: string;
  /** Brand-colored TEXT — tuned per theme so links/active labels stay AA on surfaces. */
  brandText: string;
  /** Violet secondary accent — used sparingly (gradients, highlights). */
  accent: string;

  success: string;
  warning: string;
  danger: string;
  info: string;
}

export const dark: ThemePalette = {
  canvas: '#1a1a1c',
  surface: '#232326',
  raised: '#2d2d30',
  overlay: '#363639',
  sunken: '#141416',

  fg: '#f8f8f8',
  fgMuted: '#cdcdcb',
  fgSubtle: '#919599',
  fgFaint: '#6e7073',
  fgInverted: '#1a1a1c',

  edge: '#3d3d40',
  edgeStrong: '#4d4d50',

  brand: '#fba45c',
  brandHover: '#e56515',
  brandText: '#fba45c',
  accent: '#e56515',

  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#60a5fa',
};

export const light: ThemePalette = {
  canvas: '#f8f8f8',
  surface: '#ffffff',
  raised: '#f0f0f0',
  overlay: '#ffffff',
  sunken: '#e8e8e7',

  fg: '#1a1a1c',
  fgMuted: '#4d4d50',
  fgSubtle: '#6e7073',
  fgFaint: '#919599',
  fgInverted: '#ffffff',

  edge: '#cdcdcb',
  edgeStrong: '#b8b8b6',

  brand: '#c0480c',
  brandHover: '#a63d0a',
  brandText: '#c0480c',
  accent: '#fba45c',

  success: '#047857',
  warning: '#b45309',
  danger: '#b91c1c',
  info: '#2563eb',
};

export const PALETTES = { dark, light } as const;
export type ResolvedTheme = keyof typeof PALETTES;

/** `<meta name="theme-color">` per theme — must match the literals in index.html's FOUC script. */
export const META_THEME_COLOR: Record<ResolvedTheme, string> = {
  dark: dark.canvas,
  light: light.canvas,
};

/** Token key → CSS custom property name. The `ff-` prefix avoids colliding with 3rd-party vars. */
export const CSS_VAR: Record<keyof ThemePalette, string> = {
  canvas: '--ff-canvas',
  surface: '--ff-surface',
  raised: '--ff-raised',
  overlay: '--ff-overlay',
  sunken: '--ff-sunken',
  fg: '--ff-fg',
  fgMuted: '--ff-fg-muted',
  fgSubtle: '--ff-fg-subtle',
  fgFaint: '--ff-fg-faint',
  fgInverted: '--ff-fg-inverted',
  edge: '--ff-edge',
  edgeStrong: '--ff-edge-strong',
  brand: '--ff-brand',
  brandHover: '--ff-brand-hover',
  brandText: '--ff-brand-text',
  accent: '--ff-accent',
  success: '--ff-success',
  warning: '--ff-warning',
  danger: '--ff-danger',
  info: '--ff-info',
};

/** '#0f1014' → '15 16 20' (the channel form `rgb(var(--x) / <alpha-value>)` composes with). */
export function rgbTriplet(hex: string): string {
  const value = hex.replace('#', '');
  const n = parseInt(value, 16);
  return `${(n >> 16) & 0xff} ${(n >> 8) & 0xff} ${n & 0xff}`;
}

/** All CSS custom properties for one theme, ready for a Tailwind `addBase` block. */
export function cssVariables(palette: ThemePalette): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(CSS_VAR) as (keyof ThemePalette)[]) {
    out[CSS_VAR[key]] = rgbTriplet(palette[key]);
  }
  return out;
}
