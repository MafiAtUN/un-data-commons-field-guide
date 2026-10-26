/**
 * The four courses. Each is an ordered list of lessons; the lessons themselves
 * live in src/content/lessons/<course>/.
 *
 * They are ordered by what someone works in, not by how much they know: a
 * reporting officer who never writes code finishes Find and has what they need.
 */
export type CourseSlug = 'find' | 'analyse' | 'present' | 'automate';

export interface Course {
  slug: CourseSlug;
  number: number;
  title: string;
  /** The one-word name used in filters and labels. */
  short: string;
  /** Who it is for, in their words. */
  who: string;
  /** One line under the title on a card. */
  blurb: string;
  /** What someone can do at the end. */
  outcomes: readonly string[];
  /** What it asks of you, as a short phrase: "Needs a browser". */
  needs: string;
  /** Two or three words above the title on a card. */
  label: string;
}

export const COURSES: readonly Course[] = [
  {
    slug: 'find',
    number: 1,
    title: 'Find it on data.un.org',
    short: 'Find',
    who: 'For anyone who needs a figure for a report. No code.',
    blurb: 'Search, check, download and cite a figure.',
    label: 'No code',
    outcomes: [
      'Find a figure and say exactly what it measures, where and when.',
      'Spot the three ways a result misleads: a guessed place, mixed years, two agencies.',
      'Download it with its sources, cite the agency, and share the live query.',
    ],
    needs: 'Needs a browser',
  },
  {
    slug: 'analyse',
    number: 2,
    title: 'Analyse it in Python',
    short: 'Analyse',
    who: 'For anyone who works in Python, or can open Google Colab in a browser, with nothing to install.',
    blurb: 'undata: country names in, sourced tables out.',
    label: 'Python',
    outcomes: [
      'Get any indicator for any country, region or UN group as a sourced table.',
      'Run the analyses UN reports use: SDG progress, a country in context, the gaps between groups.',
      'Hand the result to an AI assistant with its sources attached.',
    ],
    needs: 'Needs Python or Google Colab',
  },
  {
    slug: 'present',
    number: 3,
    title: 'Present it in the tools you use',
    short: 'Present',
    who: 'For whoever makes the chart, the slide or the first draft. The data comes from undata, in Python.',
    blurb: 'Excel, Flourish, PowerPoint, Copilot and R.',
    label: 'Python + Office',
    outcomes: [
      'A report chart in Excel that refreshes itself.',
      'An animated chart in Flourish and a one-slide briefing in PowerPoint.',
      'A first draft from an assistant, with every number checked, and a publication figure in Python or R.',
    ],
    needs: 'Needs Python and the tool in each lesson',
  },
  {
    slug: 'automate',
    number: 4,
    title: 'Automate it',
    short: 'Automate',
    who: 'For developers, and anyone connecting an AI assistant.',
    blurb: 'Get the data in code, and connect AI assistants to it.',
    label: 'Developers',
    outcomes: [
      'Query the REST API with no key, a whole region in one request.',
      'Connect an AI assistant to the platform so it fetches figures instead of recalling them.',
    ],
    needs: 'Needs a terminal or an AI assistant',
  },
];

export function course(slug: string): Course {
  const found = COURSES.find((c) => c.slug === slug);
  if (!found) throw new Error(`Unknown course: ${slug}`);
  return found;
}

/** Labels for the tool filter in the video library. */
export const TOOLS: Record<string, string> = {
  browser: 'Browser only',
  python: 'Python',
  excel: 'Excel',
  flourish: 'Flourish',
  powerpoint: 'PowerPoint',
  ai: 'AI assistants',
  r: 'R',
  api: 'REST API',
};
