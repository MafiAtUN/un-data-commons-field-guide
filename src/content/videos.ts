import type { VideoSpec } from '../components/VideoEmbed';

/**
 * The twelve screen tutorials, built in the sibling `un-data-commons-videos`
 * repository and uploaded by hand to YouTube.
 *
 * `youTubeId` is empty until a video has been uploaded. Empty means the series
 * simply does not offer that entry yet — nothing breaks, nothing renders a
 * broken player, and the videos can go up one at a time. Paste the eleven
 * characters that follow `?v=` in the share link.
 *
 * Runtimes are the rendered durations, not estimates.
 */
export interface Video extends VideoSpec {
  /** Matches the `out/<slug>.mp4` filename in the video repository. */
  slug: string;
  /** The single idea the video exists to land. */
  idea: string;
  track: 'practical' | 'technical';
  /** The page this video belongs beside, if it has one. */
  page?: string;
  /**
   * The narration, as written, with the second it is spoken at.
   *
   * Kept separately from the burned-in captions because captions are broken at
   * clause boundaries to stay readable on screen, which makes them poor prose.
   * This is the version worth reading if you would rather not watch, and the
   * version a search engine can index.
   */
  transcript: readonly { at: number; text: string }[];
  /**
   * What a viewer needs in their own hands to follow along: the exact query to
   * paste, the page to open, the command to run.
   */
  assets?: readonly VideoAsset[];
}

export type VideoAsset =
  /** A question to put into the platform's search box. Opens data.un.org. */
  | { kind: 'query'; value: string }
  /** A page on the platform, or the docs. */
  | { kind: 'link'; href: string; label: string }
  /** Something to run in a terminal. */
  | { kind: 'command'; value: string; note?: string }
  /** A line to keep, such as a citation pattern or a column name. */
  | { kind: 'keep'; label: string; value: string };

const SERIES: readonly Video[] = [
  {
    slug: '01-your-first-number',
    id: '8CMmvQ3Lrj0',
    title: 'Your first number',
    idea: 'Figure, year, producer — a sentence you can defend.',
    seconds: 80,
    track: 'practical',
    page: '/start',
    transcript: [
      { at: 0.18, text: 'You have been asked for a figure, and it has to hold up.' },
      { at: 4, text: 'Everything starts at one address: data dot U N dot org. One search box over eighty-five thousand official statistics.' },
      { at: 13.48, text: 'Type it the way you would say it out loud. Name the measure, and name the country.' },
      { at: 20.03, text: 'A couple of seconds later, you have an answer.' },
      { at: 23.84, text: 'First, check this chip. It is the place the platform decided you meant. Leave the country out of your question, and it still picks one.' },
      { at: 34.44, text: 'Now the number. One hundred and fifteen. On its own, that is not evidence. It is just a number on a screen.' },
      { at: 44.56, text: 'So read the two lines underneath it. The unit: count per one hundred thousand live births. And the year: twenty twenty-three.' },
      { at: 55.26, text: 'Then the part most people miss: the source. The Global S D G Database measured this. Data dot U N dot org is only how you found it.' },
      { at: 66.27, text: 'And the chart on the left gives you the trend behind that single figure.' },
      { at: 71.02, text: 'The figure, the year, the producer. Three things, every time, and you have a sentence you can defend.' },
    ],
    assets: [
      { kind: 'query', value: 'maternal mortality in Bangladesh' },
      { kind: 'keep', label: 'The shape of a defensible sentence', value: 'figure + year + producing agency' },
    ],
  },
  {
    slug: '02-the-place-chip',
    id: 'G-TOIJArZa4',
    title: 'The chip that decides your answer',
    idea: 'Naming no place means a place gets picked for you.',
    seconds: 52,
    track: 'practical',
    page: '/start',
    transcript: [
      { at: 0.18, text: 'This is the single control that decides whether your answer is right.' },
      { at: 4.77, text: 'Ask for a homicide rate. Just that, with no country named. You get an answer straight away.' },
      { at: 13.43, text: 'But look here. The platform needed a place, your question did not give one, so it supplied its own. Everything on screen is now a world figure, whether you meant that or not.' },
      { at: 25.86, text: 'Add two words — in Kenya — and the chip changes. Now the platform is answering the question you actually asked.' },
      { at: 34.78, text: 'The chip is also a control. Click it and switch country without retyping a thing.' },
      { at: 41.64, text: 'So name the place every time, then check the chip agrees with you. It takes a second, and it is the most common way a briefing goes wrong.' },
    ],
    assets: [
      { kind: 'query', value: 'homicide rate' },
      { kind: 'query', value: 'homicide rate in Kenya' },
      { kind: 'keep', label: 'Check before you quote', value: 'the place chip, right of the search box' },
    ],
  },
  {
    slug: '03-reading-a-result',
    id: '084rYtPWq24',
    title: 'Reading a result block',
    idea: 'Headline, trend, map, ranking — then the small print.',
    seconds: 78,
    track: 'practical',
    page: '/start',
    transcript: [
      { at: 0.18, text: 'A result on this platform is not one chart. It is the same answer, four ways.' },
      { at: 6.81, text: 'Ask about maternal mortality across Southern Asia, and the platform answers in layers. Learn the layers once and every result page afterwards reads instantly.' },
      { at: 17.65, text: 'First, the headline. One number for the whole region, with its unit and its year underneath. This is the figure you quote.' },
      { at: 27.51, text: 'Next to it, the trend. The same measure over time, which tells you whether that headline is good news or bad.' },
      { at: 35.88, text: 'Then the map, which shows you where the burden sits. Maps flatter large countries and hide small ones, so never publish one on its own.' },
      { at: 45.98, text: 'And the ranking, country by country, with the actual values. This is the one to download when you need the numbers rather than the picture.' },
      { at: 55.72, text: 'And read the line under the table. Some countries are missing because they did not report. That is not the same as zero, and your text should say so.' },
      { at: 66.68, text: 'Headline, trend, map, ranking. Quote the headline, download the ranking, and never let a map travel on its own.' },
    ],
    assets: [
      { kind: 'query', value: 'maternal mortality in Southern Asia' },
      { kind: 'keep', label: 'Four views of one answer', value: 'headline · trend · map · ranking' },
    ],
  },
  {
    slug: '04-latest-is-not-a-year',
    id: 'Vly-PmWWpwU',
    title: '"Latest" is not a year',
    idea: 'A ranking of recent figures can span a decade.',
    seconds: 72,
    track: 'practical',
    page: '/start',
    transcript: [
      { at: 0.18, text: 'Here is a mistake that survives peer review, because nothing on screen looks wrong.' },
      { at: 5.88, text: 'Compare an indicator across a region and you get a ranking. It looks like a snapshot of one moment.' },
      { at: 13.65, text: 'It is not. Read the footnote. Most recent date with highest coverage. The platform took each country\'s latest figure, and those were not measured in the same year.' },
      { at: 26.46, text: 'In a single African ranking those years can stretch from around two thousand and nine to last year. One bar is fresh; the one beside it is fifteen years old.' },
      { at: 37.83, text: 'And some countries are not here at all, because they never reported. Leaving them out silently turns a data gap into a finding you did not make.' },
      { at: 47.62, text: 'You have two honest options. Pin one year for everyone, and accept that countries which did not report it drop out. Or keep the latest figures and label the chart as most recent available, showing each year.' },
      { at: 62.02, text: 'Latest is a per-country answer, not a date. Say which year every number comes from, and the ranking stops lying quietly.' },
    ],
    assets: [
      { kind: 'query', value: 'compare homicide rate across countries in Africa' },
      { kind: 'keep', label: 'What the footnote means', value: '"Most recent date with highest coverage" = mixed years' },
    ],
  },
  {
    slug: '05-two-agencies-two-numbers',
    id: 'qmeWC1bpLEY',
    title: 'Two agencies, two numbers',
    idea: 'Afghanistan is 520.5 and 620.4 on the same page.',
    seconds: 62,
    track: 'practical',
    page: '/cite',
    transcript: [
      { at: 0.18, text: 'Two colleagues quote the same UN indicator and get different numbers. Neither of them is wrong.' },
      { at: 7.12, text: 'Search for maternal mortality across Southern Asia. Scroll down and you will notice something odd: the same measure appears more than once.' },
      { at: 16.81, text: 'Here is Afghanistan, from the Global S D G Database. Five hundred and twenty deaths per hundred thousand live births.' },
      { at: 26.12, text: 'And here is Afghanistan again, on the same page, from U N D P\'s Human Development Report Office. Six hundred and twenty.' },
      { at: 36.08, text: 'A hundred apart, and neither is a mistake. Agencies use different estimation methods, different model vintages, and revise at different times. They are genuinely different measurements.' },
      { at: 49.71, text: 'So pick one source, name it in your text, and never mix two in a single chart. If a reviewer finds a different figure, your named source is the answer.' },
    ],
    assets: [
      { kind: 'query', value: 'maternal mortality in Southern Asia' },
      { kind: 'keep', label: 'Afghanistan, same page, same indicator', value: '520.5 (Global SDG Database) vs 620.4 (hdr.undp.org)' },
    ],
  },
  {
    slug: '06-download-and-metadata',
    id: '9NzZO66rJMA',
    title: 'Download, and the metadata',
    idea: 'Keep the dcid and the provenanceUrl with the rows.',
    seconds: 79,
    track: 'practical',
    page: '/toolkit',
    transcript: [
      { at: 0.18, text: 'Getting the data out takes one click. What comes with it is the useful part.' },
      { at: 6.24, text: 'Under every chart on the platform there is a Download link. It is easy to miss, and it is on all of them.' },
      { at: 14.01, text: 'Click it and you get the chart\'s underlying table, ready to copy straight into Excel, Datawrapper or Flourish.' },
      { at: 21.54, text: 'Notice these columns. Entity D C I D and Variable D C I D are the platform\'s permanent identifiers for the place and the measure. Record them and anyone can reproduce your exact figure.' },
      { at: 35.77, text: 'And these carry the provenance: the unit, and the URL of the agency that published it. This is what makes the file still attributable after it has been forwarded three times.' },
      { at: 47.36, text: 'Copy takes the whole table to your clipboard. Paste it into a spreadsheet and the provenance travels with the numbers.' },
      { at: 55.49, text: 'And here is what actually lands in your spreadsheet. Every single row carries the place, the variable identifier and the year beside the value, so a stray copy-paste cannot separate a number from what it measures.' },
      { at: 69.43, text: 'Keep the identifier and keep the provenance URL. Those two columns are the difference between a spreadsheet and evidence.' },
    ],
    assets: [
      { kind: 'query', value: 'maternal mortality in Southern Asia' },
      { kind: 'keep', label: 'The two columns to keep', value: 'Variable DCID · provenanceUrl' },
    ],
  },
  {
    slug: '07-cite-the-agency',
    id: 'SoQQWY8uF2w',
    title: 'Cite the agency, not the website',
    idea: 'The Commons distributes; it does not measure.',
    seconds: 54,
    track: 'practical',
    page: '/cite',
    transcript: [
      { at: 0.18, text: 'This is the most common mistake made with the platform, and it is a one-word fix.' },
      { at: 5.59, text: 'You searched, you found your number, and now you are writing the footnote.' },
      { at: 10.96, text: 'Under every chart and every headline figure is a source line. On this one it reads Global S D G Database. That is the body that produced the number.' },
      { at: 22.45, text: 'And it is a live link. Follow it and you land on the producing agency, where the methodology and the terms of use live.' },
      { at: 31.11, text: 'So do not cite data dot U N dot org. That is the route you took, not the authority. Cite the agency, and mention the platform as where you accessed it.' },
      { at: 42.67, text: 'Producer, indicator, place, year, then the platform as the route. Five parts, and nobody can take the figure apart.' },
    ],
    assets: [
      { kind: 'query', value: 'maternal mortality in Bangladesh' },
      { kind: 'link', href: 'https://unstats.un.org/sdgs/dataportal', label: 'Global SDG Indicators Database' },
      { kind: 'keep', label: 'Citation pattern', value: 'Agency, Indicator, Place, Year. Accessed via data.un.org.' },
    ],
  },
  {
    slug: '08-share-the-query',
    id: 'RQgZQjsBLeU',
    title: 'Share the query, not a screenshot',
    idea: 'Results are addressable, so send the address.',
    seconds: 67,
    track: 'practical',
    page: '/toolkit',
    transcript: [
      { at: 0.18, text: 'A screenshot of a statistic is dead the moment you paste it. A link is not.' },
      { at: 6.21, text: 'Every search you run has its own address. The question is right there in the URL, which means you can send a colleague the query itself instead of a picture of it.' },
      { at: 16.6, text: 'And you can go finer than the page. The three dots beside any result offer Copy sharable link, and View in S D Gs.' },
      { at: 26, text: 'Click it and this is what you get. Worth reading before you paste it, because it does not hand back your search. It deep-links into the S D G explorer at indicator three point one point one — the underlying indicator, not the question you asked.' },
      { at: 42.77, text: 'This matters more than it sounds. Agencies revise their figures. A link re-runs the query and shows whatever is true today, while a screenshot quietly preserves whatever was true the afternoon you took it.' },
      { at: 57.09, text: 'Send the query. If you truly need an image, write the access date beside it, because from that moment it is a historical document.' },
    ],
    assets: [
      { kind: 'query', value: 'maternal mortality in Bangladesh' },
      { kind: 'keep', label: 'Watch what it copies', value: 'the SDG explorer at the indicator — not your search' },
    ],
  },
  {
    slug: '09-browse-by-theme',
    id: 'hHcVwXKtCeo',
    title: 'Browse by theme',
    idea: 'Search picks one indicator. Browsing shows the choice.',
    seconds: 72,
    track: 'practical',
    page: '/catalogue',
    transcript: [
      { at: 0.18, text: 'Search is for when you know the question. This is for when you only know the topic.' },
      { at: 5.95, text: 'The Explore tab opens the whole catalogue as twelve thematic areas, rather than a search box waiting for a question you cannot phrase yet.' },
      { at: 14.9, text: 'Three filters narrow it: a location, a thematic area, and the UN body that published it. That last one is useful when you already trust a particular agency.' },
      { at: 26.78, text: 'Open Health and the scale becomes obvious. Seven hundred and fifty-two indicators sit under this one heading.' },
      { at: 35.03, text: 'So it breaks down again, into sub-themes with their own counts. Infectious diseases, mental health, reproductive and maternal health.' },
      { at: 45.61, text: 'And here is the reason to browse rather than search. Adolescent birth rate appears four times, from W H O, UNICEF, the S D G database and U N D P. Browsing shows you the choice. Searching just picks one.' },
      { at: 62.43, text: 'Use search when you know what you want. Use Explore when the real question is which indicator you should be using at all.' },
    ],
    assets: [
      { kind: 'link', href: 'https://data.un.org/undatacommons/areas', label: 'Explore, by thematic area' },
      { kind: 'keep', label: 'Why browse at all', value: 'four UN bodies publish "adolescent birth rate"' },
    ],
  },
  {
    slug: '10-your-country-sdg-page',
    id: 'o1dsVaQDIg8',
    title: "Your country's SDG page",
    idea: 'Goal plus country is a shareable profile, in two clicks.',
    seconds: 71,
    track: 'practical',
    page: '/catalogue',
    transcript: [
      { at: 0.18, text: 'If you report against the Sustainable Development Goals, this page saves you an afternoon.' },
      { at: 6.12, text: 'Under Data Insights, the S D G catalogue lays out all seventeen goals, each one backed by the Global S D G Indicators Database.' },
      { at: 16.1, text: 'Open one and you get more than charts. There is a written assessment of where the world stands, which is quotable in its own right, and then the indicators underneath it.' },
      { at: 26.99, text: 'By default all of it describes the world. But this chip works the same way it does in search.' },
      { at: 34.11, text: 'Click it, pick a country, and every indicator on the page re-scopes.' },
      { at: 39.58, text: 'What you now have is a country profile for that goal, built from official figures, with a URL you can send to a colleague. That is a piece of work you would otherwise have assembled by hand.' },
      { at: 51.5, text: 'The same machinery runs a second framework. A B A S tracks the Antigua and Barbuda Agenda across seven priorities for Small Island Developing States.' },
      { at: 63.04, text: 'Pick the goal, pick the country, send the link. Two clicks instead of an afternoon.' },
    ],
    assets: [
      { kind: 'link', href: 'https://data.un.org/undatacommons/goals', label: 'All seventeen goals' },
      { kind: 'link', href: 'https://data.un.org/undatacommons/abas', label: 'ABAS, for Small Island Developing States' },
    ],
  },
  {
    slug: '11-the-rest-api',
    id: 'I1hYpOjeRsg',
    title: 'The REST API, no key',
    idea: 'One containment expression in place of thirty-seven requests.',
    seconds: 81,
    track: 'technical',
    page: '/cookbook',
    transcript: [
      { at: 0.18, text: 'If you write code, the search box is the slowest way in. Here is the fast one, run for real.' },
      { at: 7.72, text: 'The Connect page documents two surfaces. No registration, no key, and no licence to negotiate.' },
      { at: 16.72, text: 'When you know the indicator and the countries, one POST returns every year for all of them. And there is the same figure the interface gave you, straight out of the API.' },
      { at: 27.68, text: 'The catch is that the numbers and their meaning come back in separate objects. Each series carries a facet id; look it up and you get the unit and the publisher. Skip that step and you have shipped a bare number.' },
      { at: 41.5, text: 'And this is the expression worth memorising. Contained-in-place asks for every country inside a region. One request, thirty-seven countries, and no list of country codes to maintain.' },
      { at: 55.13, text: 'But read what actually came back. Mauritius is twenty twenty-four; Eritrea is twenty twelve. Eleven different reference years in one response. Sort that by value and you have built exactly the misleading ranking from video four.' },
      { at: 72.07, text: 'It answers cross-origin too, so a static page with no server behind it can query the UN knowledge graph directly.' },
    ],
    assets: [
      { kind: 'link', href: 'https://data.un.org/undatacommons/docs/connect', label: 'Connect — the platform\'s own API docs' },
      { kind: 'command', value: 'africa<-containedInPlace+{typeOf:Country}', note: 'The containment expression. One request returned 37 countries.' },
      { kind: 'keep', label: 'Do not skip', value: 'join each series to its facet, or you ship a number with no unit' },
    ],
  },
  {
    slug: '12-ai-assistant-mcp',
    id: '',
    title: 'Point an AI assistant at it',
    idea: 'Connect it, ask, and watch it fetch rather than recall.',
    seconds: 84,
    track: 'technical',
    page: '/connect',
    transcript: [
      { at: 0.18, text: 'Ask a chatbot for a UN statistic and it will give you a confident, plausible, invented number.' },
      { at: 6.62, text: 'Pasting the table fixes that. Better still, let it fetch the figure itself — which is what the Commons publishes an M C P server for.' },
      { at: 16.53, text: 'The address is on the Connect page under Build. No key, no account, no registration.' },
      { at: 24.23, text: 'In Claude Code it is one command. In any other M C P client it is three lines of config. You do this once.' },
      { at: 33.97, text: 'Then you just ask. It searches the corpus and comes back with candidate indicators and their identifiers — including, here, that two agencies measure this.' },
      { at: 45.41, text: 'Then it fetches the observation. One hundred and fifteen point one one, for twenty twenty-three — and the unit and publisher come back attached to it.' },
      { at: 55.63, text: 'That is the same number you found by hand in the first video. Nothing was remembered, nothing was guessed, and the citation arrived with the figure.' },
      { at: 65.42, text: 'Check it anyway. Match a few figures against the tool output, and confirm the unit survived into your prose.' },
      { at: 73.89, text: 'Connect it once, then ask what the numbers mean rather than what they are. That is the whole of using AI safely with official statistics.' },
    ],
    assets: [
      { kind: 'command', value: 'claude mcp add --transport http undata https://unsd-datacommons.gcp.un-icc.cloud/mcp', note: 'One line, once. Any MCP client works — this is just the shortest form.' },
      { kind: 'link', href: 'https://projects.officialstatistics.org/undata2/undatacommons-mcp/', label: 'The MCP server\'s own documentation' },
      { kind: 'keep', label: 'The habit', value: 'never ask what a statistic is — hand it the statistic and ask what it means' },
    ],
  },
];

/**
 * Posters ship with the site rather than coming from `i.ytimg.com`, so the page
 * touches no Google domain until someone actually presses play.
 */
export const VIDEOS: readonly Video[] = SERIES.map((video) => ({
  ...video,
  poster: `${import.meta.env.BASE_URL}posters/${video.slug}.jpg`,
}));

/** Only the ones actually uploaded. Everything that renders goes through this. */
export function publishedVideos(): readonly Video[] {
  return VIDEOS.filter((video) => video.id !== '');
}

/**
 * Every uploaded video belonging to a page, in series order.
 *
 * Four of the twelve belong beside `/start`, so this returns a list rather than
 * one video. Returning a single video silently hid the other three.
 */
export function videosForPage(path: string): readonly Video[] {
  return publishedVideos().filter((video) => video.page === path);
}

/** Total runtime of the published series, for the honest "14 min" on the page. */
export function seriesMinutes(): number {
  return Math.round(publishedVideos().reduce((total, v) => total + (v.seconds ?? 0), 0) / 60);
}
