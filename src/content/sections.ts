/**
 * The sections of the front page, as a manifest.
 *
 * Shared by the floating rail and the scroll cue, so the two can never disagree
 * about what is on the page or in what order. `tests/sectionrail.test.ts`
 * checks each id against the ids actually rendered, because nothing at compile
 * time ties a manifest entry to an `id` attribute in another file.
 */

export interface PageSection {
  id: string;
  /** Shown in the rail and on the scroll cue. Kept to three words or so. */
  label: string;
}

export const HOME_SECTIONS: readonly PageSection[] = [
  { id: 'top', label: 'What this is' },
  { id: 'history', label: 'Where it came from' },
  { id: 'trap', label: 'Before you trust a chart' },
  { id: 'ways-in', label: 'Three ways in' },
  { id: 'guide', label: 'What is in the guide' },
  { id: 'start', label: 'Start here' },
];
