/**
 * How the UN System Data Commons came to exist.
 *
 * Twenty-one years from a project about making statistics a public good to a
 * knowledge graph an AI agent can query without a key. Every date here is taken
 * from a primary or named source, listed on the entry itself, because a
 * timeline is the easiest kind of page to fill with plausible-sounding dates
 * that nobody checks.
 */

export interface Milestone {
  /** Displayed as written: some events have a day, some only a year. */
  when: string;
  /** Sortable key, so the order cannot drift from the labels. */
  sort: string;
  title: string;
  /** What actually happened, in two or three sentences. */
  body: string;
  /** The one fact worth remembering from this entry, if there is one. */
  note?: string;
  /** Who did it — shown as a small line of attribution. */
  actors: string;
  source: { label: string; href: string };
  /** `un` = a UN milestone, `tech` = the technology it was built on. */
  strand: 'un' | 'tech';
  /** The entry that carries the most weight in the story. */
  headline?: boolean;
}

export const MILESTONES: readonly Milestone[] = [
  {
    when: '2005',
    sort: '2005-01',
    title: 'Statistics as a Public Good',
    body:
      'A project begins to give the world free access to official global statistics, to make the case for evidence in policy, and to help national statistical offices publish their own numbers. It is the idea the whole story rests on: that public data should be reachable by anyone, not just by the institutions that collect it.',
    actors: 'UN Statistics Division, with Statistics Sweden and the Gapminder Foundation; funded in part by SIDA',
    source: { label: 'UNdata — About', href: 'https://data.un.org/Host.aspx?Content=About' },
    strand: 'un',
  },
  {
    when: 'February 2008',
    sort: '2008-02',
    title: 'UNdata opens at data.un.org',
    body:
      'The first attempt at a single front door: a search engine across the statistical databases of the UN system, covering everything from agriculture to refugees. For most of the next two decades, this is what "UN data" means to anyone outside the system.',
    note: 'Still online today, at data.un.org/legacy.',
    actors: 'UN Statistics Division',
    source: { label: 'UNdata', href: 'https://data.un.org/legacy' },
    strand: 'un',
  },
  {
    when: 'May 2018',
    sort: '2018-05',
    title: 'Google builds Data Commons',
    body:
      'An open knowledge graph that joins public datasets — census, climate, health, economic — into one structure, so a figure from one source can be compared with a figure from another without either being rebuilt. Founded by Ramanathan V. Guha, who had already helped create RDF, RSS and Schema.org.',
    note: 'This is the engine the UN platform would eventually run on.',
    actors: 'Google',
    source: { label: 'Data Commons', href: 'https://datacommons.org/' },
    strand: 'tech',
  },
  {
    when: 'April 2020',
    sort: '2020-04',
    title: "The Secretary-General's Data Strategy",
    body:
      'Fifty UN entities design a common plan for treating data as a strategic asset, approved by the Secretary-General and the Executive Committee as a COVID-19 response priority. It is the mandate that later makes a shared platform an obligation rather than a good idea.',
    actors: 'UN Secretariat and 50 UN entities',
    source: {
      label: 'Data Strategy of the Secretary-General',
      href: 'https://www.un.org/en/content/datastrategy/images/pdf/UN_SG_Data-Strategy.pdf',
    },
    strand: 'un',
  },
  {
    when: '2023',
    sort: '2023-01',
    title: 'Data Commons learns to answer questions',
    body:
      'The platform relaunches with a natural-language front end driven by a large language model. Asking becomes a sentence rather than a query, which is what makes a statistical corpus usable by someone who is not a statistician.',
    actors: 'Google',
    source: { label: 'Data Commons', href: 'https://datacommons.org/' },
    strand: 'tech',
  },
  {
    when: '4 October 2023',
    sort: '2023-10',
    title: 'UN Data Commons for the SDGs',
    body:
      'Launched at the SDG Summit: official SDG indicator data and the narrative of the Sustainable Development Goals Report, in one searchable place. The first proof that the knowledge-graph approach works on UN statistics.',
    actors: 'UN DESA Statistics Division with Google.org',
    source: {
      label: 'UN DESA',
      href: 'https://www.un.org/en/desa/un-data-commons-for-the-sdgs',
    },
    strand: 'un',
  },
  {
    when: '23 September 2024',
    sort: '2024-09',
    title: 'Beyond the SDGs, to the agencies',
    body:
      'Work with the UN International Computing Centre opens the way for the approach to scale past one division to the agencies themselves — WHO, ILO and UNICEF among the first named. The platform stops being an SDG tool and starts becoming a system-wide one.',
    actors: 'Google, UN DESA and the UN International Computing Centre (UNICC)',
    source: {
      label: 'Google blog',
      href: 'https://blog.google/company-news/outreach-and-initiatives/public-policy/un-data-commons-expansion/',
    },
    strand: 'un',
  },
  {
    when: '17 September 2026',
    sort: '2026-09',
    title: 'The UN System Data Commons opens',
    body:
      'The Secretary-General launches data.un.org: official statistics from 26 UN System entities in a single AI-ready knowledge graph, roughly 44 million data points, free and without a login. It is built on open standards including the Model Context Protocol, so an AI agent can look a figure up itself rather than recalling one.',
    note: 'No API key. The REST surface answers cross-origin, which is why every chart on this site is a request from your own browser.',
    actors: 'The United Nations System, with Google and UNICC',
    source: { label: 'data.un.org', href: 'https://data.un.org' },
    strand: 'un',
    headline: true,
  },
  {
    when: 'By 2027',
    sort: '2027-12',
    title: 'Four fifths of the system',
    body:
      'The stated goal is to have 80% of the UN system\'s statistical datasets in the graph. More entities, more indicators, and more of the corpus reachable through one question.',
    note: 'Which means the catalogue page on this site should keep growing. It counts live.',
    actors: 'The UN System',
    source: {
      label: 'Google blog',
      href: 'https://blog.google/innovation-and-ai/technology/ai/google-un-data-commons-platform/',
    },
    strand: 'un',
  },
];

/** Chronological, and guaranteed so rather than assumed. */
export function orderedMilestones(): readonly Milestone[] {
  return [...MILESTONES].sort((a, b) => a.sort.localeCompare(b.sort));
}

/** The span the timeline covers, for the heading. */
export function timelineSpan(): { from: string; to: string; years: number } {
  const ordered = orderedMilestones();
  const from = ordered[0]!.sort.slice(0, 4);
  const to = ordered[ordered.length - 1]!.sort.slice(0, 4);
  return { from, to, years: Number(to) - Number(from) };
}
