/**
 * The reference pages and the tools, as one list, for the Guides and Tools
 * index pages and the page metadata.
 *
 * The pages themselves are the guide's original chapters, moved under new
 * addresses. Their old addresses forward here (see MOVED in lib/paths.ts).
 */
export interface GuidePage {
  path: string;
  title: string;
  /** For search engines and the index card: what it is for. */
  description: string;
  group: 'Using the platform' | 'For developers' | 'Worked cases' | 'Tools';
  time: string;
}

export const GUIDES: readonly GuidePage[] = [
  {
    path: '/guides/five-behaviours/',
    title: 'The five behaviours',
    description: 'Five things data.un.org does that you would not predict, each a common cause of corrections: a guessed place, mixed years, blanks, two agencies and revised history.',
    group: 'Using the platform',
    time: '5 min',
  },
  {
    path: '/guides/walkthroughs/',
    title: 'Step-by-step walkthroughs',
    description: 'Six written walkthroughs of four to eight minutes each, from one defensible figure to a report section drafted with AI. Every step says what you should see.',
    group: 'Using the platform',
    time: '36 min',
  },
  {
    path: '/guides/charts/',
    title: 'Make a chart',
    description: 'Free charting tools, which one to use, and five rules that keep a chart of UN data honest.',
    group: 'Using the platform',
    time: '8 min',
  },
  {
    path: '/guides/ai-prompts/',
    title: 'Use AI with UN data',
    description: 'Prompts that make an AI assistant analyse the UN figures you give it instead of inventing them.',
    group: 'Using the platform',
    time: '5 min',
  },
  {
    path: '/guides/catalogue/',
    title: 'The catalogue',
    description: 'All 16 collections in the UN System Data Commons, with indicator counts read live from the graph.',
    group: 'Using the platform',
    time: '3 min',
  },
  {
    path: '/guides/api/',
    title: 'Query cookbook',
    description: 'The data.un.org REST API in copy-paste recipes: the identifier grammar, a whole region in one request, paging past 500 results, and the traps.',
    group: 'For developers',
    time: '10 min',
  },
  {
    path: '/guides/python-r-julia/',
    title: 'Python, R and Julia',
    description: 'The two REST calls worth learning, written to one contract in Python, R and Julia, and where the undata package fits.',
    group: 'For developers',
    time: '10 min',
  },
  {
    path: '/guides/power-bi/',
    title: 'Power BI and Tableau',
    description: "From the API's keyed JSON to a dashboard that cites its source: Power Query M, a star schema, DAX measures and four routes into Tableau.",
    group: 'For developers',
    time: '12 min',
  },
  {
    path: '/guides/mcp/',
    title: 'Connect an AI assistant',
    description: "The platform's MCP endpoint: setup for Claude, VS Code and Cursor, a real call for each tool, and the four things that break.",
    group: 'For developers',
    time: '9 min',
  },
  {
    path: '/guides/cases/peace-and-security/',
    title: 'Peace and security',
    description: "How much of South Sudan's conflict mortality falls on children? Worked end to end with SDG 16, UNODC, UNHCR and IOM data, wrong turns left in.",
    group: 'Worked cases',
    time: '12 min',
  },
  {
    path: '/guides/cases/development/',
    title: 'Development',
    description: "Is Bangladesh's development keeping pace with Southern Asia? The baseline, axis and coverage choices that make a chart honest.",
    group: 'Worked cases',
    time: '10 min',
  },
  {
    path: '/guides/cases/scenarios/',
    title: 'Scenarios',
    description: 'Three requests as they arrive, worked end to end, with the discovery trail and its dead ends left in.',
    group: 'Worked cases',
    time: '14 min',
  },
  {
    path: '/tools/finder/',
    title: 'Data Finder',
    description: 'Pick an indicator and countries. Leave with a chart, a CSV that carries its sources, and a citation.',
    group: 'Tools',
    time: '1 min',
  },
  {
    path: '/tools/cite/',
    title: 'Citation Builder',
    description: 'Credit the agency that produced a figure, in four citation styles.',
    group: 'Tools',
    time: '2 min',
  },
  {
    path: '/tools/prompt-lab/',
    title: 'Prompt Lab',
    description: "Ask data.un.org a question and see the place and indicators its search box chose, before it draws a chart.",
    group: 'Tools',
    time: '5 min',
  },
  {
    path: '/tools/recipes/',
    title: 'Recipe Builder',
    description: "Search the platform's own resolver for an indicator, measure what it covers, and take the call in curl, Python, Power Query M, R, Julia or jq.",
    group: 'Tools',
    time: '5 min',
  },
];

export function guide(path: string): GuidePage {
  const found = GUIDES.find((g) => g.path === path);
  if (!found) throw new Error(`No guide at ${path}`);
  return found;
}
