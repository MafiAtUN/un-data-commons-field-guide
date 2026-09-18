/**
 * Every destination on the site, ordered by one axis: depth.
 *
 * The old navigation was two dropdowns, which solved the "thirteen links in
 * front of someone who does not know which is theirs" problem by hiding twelve
 * of them. This orders them instead. The site really does have a single axis —
 * how much you already know — running from a reporting officer who has never
 * opened data.un.org to someone wiring an MCP endpoint into an agent. Laid out
 * along that axis, a newcomer can see where they are and what comes next, which
 * a dropdown can never show.
 *
 * `tests/routes.test.ts` asserts that every route the build materialises appears
 * here, so a new page cannot ship unreachable.
 */

export type Track = 'practical' | 'technical';

export interface Destination {
  to: string;
  label: string;
  /** What the page is for, in the reader's words rather than the site's. */
  hint: string;
  track: Track;
  /** Honest reading time, used on the rail and in the palette. */
  time: string;
  /**
   * Words a reader might plausibly type when looking for this page but not
   * knowing its title — "excel" for the CSV export, "api" for the cookbook.
   */
  keywords: readonly string[];
}

/**
 * In depth order. The array index *is* the position on the rail, so reordering
 * this list reorders the navigation.
 */
export const DESTINATIONS: readonly Destination[] = [
  {
    to: '/start',
    label: 'The basics',
    hint: 'Five words, three rules, four minutes',
    track: 'practical',
    time: '4 min',
    keywords: ['beginner', 'first', 'glossary', 'jargon', 'what is'],
  },
  {
    to: '/toolkit',
    label: 'Data Finder',
    hint: 'The tool on its own page',
    track: 'practical',
    time: '1 min',
    keywords: ['search', 'find', 'download', 'csv', 'excel', 'spreadsheet'],
  },
  {
    to: '/tutorials',
    label: 'Tutorials',
    hint: 'Six walkthroughs, five minutes each',
    track: 'practical',
    time: '30 min',
    keywords: ['walkthrough', 'learn', 'course', 'practice', 'guide'],
  },
  {
    to: '/visualise',
    label: 'Make a chart',
    hint: 'Free tools, and what makes a chart honest',
    track: 'practical',
    time: '8 min',
    keywords: ['datawrapper', 'flourish', 'graph', 'visualise', 'visualize', 'plot'],
  },
  {
    to: '/cite',
    label: 'Cite the data',
    hint: 'Credit the agency, not the website',
    track: 'practical',
    time: '2 min',
    keywords: ['citation', 'reference', 'apa', 'bibliography', 'attribution'],
  },
  {
    to: '/ai',
    label: 'Use AI on it',
    hint: 'Prompts that stop invented figures',
    track: 'practical',
    time: '5 min',
    keywords: ['chatgpt', 'claude', 'gemini', 'llm', 'prompt', 'hallucination'],
  },
  {
    to: '/lab',
    label: 'Prompt Lab',
    hint: 'How the search box really works',
    track: 'technical',
    time: '6 min',
    keywords: ['resolver', 'nl', 'natural language', 'detect', 'fulfill'],
  },
  {
    to: '/peace-and-security',
    label: 'Peace & security case',
    hint: 'Worked end to end, wrong turns left in',
    track: 'technical',
    time: '12 min',
    keywords: ['conflict', 'south sudan', 'unhcr', 'unodc', 'mortality', 'sdg 16'],
  },
  {
    to: '/development',
    label: 'Development case',
    hint: 'Worked end to end, with the honest axis',
    track: 'technical',
    time: '10 min',
    keywords: ['hdi', 'southern asia', 'human development', 'baseline'],
  },
  {
    to: '/cookbook',
    label: 'Query cookbook',
    hint: 'The REST API, with copy-paste recipes',
    track: 'technical',
    time: '10 min',
    keywords: ['rest', 'api', 'curl', 'json', 'dcid', 'endpoint', 'v2'],
  },
  {
    to: '/catalogue',
    label: 'Catalogue',
    hint: 'All 16 collections, counted live',
    track: 'technical',
    time: '3 min',
    keywords: ['collections', 'agencies', 'coverage', 'inventory'],
  },
  {
    to: '/connect',
    label: 'Connect an agent',
    hint: 'MCP: six tools, no key',
    track: 'technical',
    time: '5 min',
    keywords: ['mcp', 'agent', 'tools', 'model context protocol', 'integration'],
  },
] as const;

/** The front page, which is the tool and therefore not a stop on the rail. */
export const HOME: Destination = {
  to: '/',
  label: 'Find data',
  hint: 'The tool itself — a figure in about fifteen seconds',
  track: 'practical',
  time: '15 sec',
  keywords: ['home', 'start', 'tool', 'number', 'finder'],
};

/** Where each track begins, for the labels at the ends of the rail. */
export const RAIL_ENDS = {
  start: 'Never used UN data',
  end: 'Wiring an AI agent',
} as const;

/** Index of the first technical stop, where the rail changes character. */
export const FIRST_TECHNICAL: number = DESTINATIONS.findIndex(
  (destination) => destination.track === 'technical',
);

/**
 * Rank a destination against a typed query.
 *
 * Deliberately simple: a label match beats a hint match beats a keyword match,
 * and a prefix beats a match in the middle. Fuzzy subsequence matching was tried
 * and removed — with only thirteen destinations it produced confident nonsense
 * for typos rather than an honest empty state.
 */
export function scoreDestination(destination: Destination, query: string): number {
  const needle = query.trim().toLowerCase();
  if (!needle) return 1;

  const label = destination.label.toLowerCase();
  if (label.startsWith(needle)) return 100;
  if (label.includes(needle)) return 80;

  if (destination.hint.toLowerCase().includes(needle)) return 60;

  for (const keyword of destination.keywords) {
    if (keyword.startsWith(needle)) return 40;
    if (keyword.includes(needle)) return 20;
  }

  return 0;
}

/** Destinations matching a query, best first, with ties left in depth order. */
export function searchDestinations(query: string): readonly Destination[] {
  return [HOME, ...DESTINATIONS]
    .map((destination, index) => ({
      destination,
      score: scoreDestination(destination, query),
      index,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.destination);
}
