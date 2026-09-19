/**
 * The sections of the front page, as a manifest.
 *
 * Shared by the floating rail, the scroll cue and the section headers, so none
 * of them can disagree about what is on the page, in what order, or in which
 * colour. `tests/sectionrail.test.ts` checks each id against the ids actually
 * rendered, because nothing at compile time ties a manifest entry to an `id`
 * attribute in another file.
 */

/** Section accents. Chrome only — chart colours still follow the entity. */
export type Accent = 'volt' | 'aqua' | 'blue' | 'orange' | 'violet' | 'magenta';

export interface PageSection {
  id: string;
  /** Shown in the rail and on the scroll cue. Kept to three words or so. */
  label: string;
  accent: Accent;
}

export const HOME_SECTIONS: readonly PageSection[] = [
  { id: 'top', label: 'The short version', accent: 'volt' },
  { id: 'wand', label: 'What changed', accent: 'aqua' },
  { id: 'video-tutorial', label: 'Video tutorial', accent: 'magenta' },
  { id: 'history', label: 'How we got here', accent: 'blue' },
  { id: 'trap', label: 'The one catch', accent: 'orange' },
  { id: 'ways-in', label: 'Three ways in', accent: 'violet' },
  { id: 'guide', label: "What's in the guide", accent: 'magenta' },
  { id: 'start', label: 'Start here', accent: 'volt' },
];

/**
 * Tailwind class fragments per accent.
 *
 * Written out rather than interpolated: Tailwind scans source text for class
 * names, so `text-accent-${accent}-ink` would compile to nothing at all.
 */
export const ACCENT_CLASSES: Record<Accent, {
  text: string;
  border: string;
  bg: string;
  dot: string;
  ring: string;
}> = {
  volt:    { text: 'text-volt',                border: 'border-volt/35',            bg: 'bg-volt/[0.07]',            dot: 'bg-volt',                ring: 'ring-volt/30' },
  aqua:    { text: 'text-accent-aqua-ink',     border: 'border-accent-aqua/35',     bg: 'bg-accent-aqua/[0.07]',     dot: 'bg-accent-aqua',         ring: 'ring-accent-aqua/30' },
  blue:    { text: 'text-accent-blue-ink',     border: 'border-accent-blue/35',     bg: 'bg-accent-blue/[0.07]',     dot: 'bg-accent-blue',         ring: 'ring-accent-blue/30' },
  orange:  { text: 'text-accent-orange-ink',   border: 'border-accent-orange/35',   bg: 'bg-accent-orange/[0.07]',   dot: 'bg-accent-orange',       ring: 'ring-accent-orange/30' },
  violet:  { text: 'text-accent-violet-ink',   border: 'border-accent-violet/35',   bg: 'bg-accent-violet/[0.07]',   dot: 'bg-accent-violet',       ring: 'ring-accent-violet/30' },
  magenta: { text: 'text-accent-magenta-ink',  border: 'border-accent-magenta/35',  bg: 'bg-accent-magenta/[0.07]',  dot: 'bg-accent-magenta',      ring: 'ring-accent-magenta/30' },
};
