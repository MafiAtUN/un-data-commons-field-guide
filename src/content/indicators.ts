/**
 * A curated, plain-language shortlist of indicators.
 *
 * The graph holds roughly 85,000 statistical variables. That is wonderful for a
 * developer and paralysing for a reporting officer who needs one number before a
 * meeting. This file is the opinionated answer: about twenty indicators that
 * cover the questions colleagues actually ask, each with a name a human would
 * use, a sentence on what it really measures, and the trap that most often
 * causes it to be misread.
 *
 * Every entry was checked against the live platform on 18 September 2026 with a
 * whole-world query. `countryCoverage` is the number of countries and areas that
 * returned a value in that check — shown in the interface, because "available
 * for 58 countries" and "available for 224" are very different tools.
 *
 * Coverage numbers drift as agencies report. They are indicative, and the
 * interface says so; the values themselves are always fetched live.
 */

export type Topic =
  | 'people'
  | 'poverty'
  | 'health'
  | 'education'
  | 'gender'
  | 'infrastructure'
  | 'economy'
  | 'environment'
  | 'peace';

export interface CuratedIndicator {
  /** The dcid to fetch. Verified to return data. */
  dcid: string;
  /** What a colleague would call it. */
  name: string;
  topic: Topic;
  /** What it measures, in one sentence, without jargon. */
  what: string;
  /** The unit, spelled out for a chart axis or a table header. */
  unit: string;
  /** Which UN body stands behind the number. */
  source: string;
  /** The SDG indicator number, where the series is part of the framework. */
  sdg?: string;
  /** Countries and areas that returned a value in the September 2026 check. */
  countryCoverage: number;
  /** Earliest and latest year seen across countries in that check. */
  years: string;
  /** The misreading this indicator most often invites. */
  watchOut?: string;
}

export const TOPIC_LABELS: Record<Topic, string> = {
  people: 'People and population',
  poverty: 'Poverty and hunger',
  health: 'Health',
  education: 'Education',
  gender: 'Gender equality',
  infrastructure: 'Water, energy and connectivity',
  economy: 'Economy and development',
  environment: 'Climate and environment',
  peace: 'Peace, security and rights',
};

export const INDICATORS: readonly CuratedIndicator[] = [
  {
    dcid: 'undata/unicef/DM_POP',
    name: 'Total population',
    topic: 'people',
    what: 'How many people live in the country.',
    unit: 'People',
    source: 'UNICEF',
    countryCoverage: 232,
    years: '2025',
    watchOut:
      'This is a projection for the current year, not a census count. Census years are far apart, so the figure is modelled between them.',
  },
  {
    dcid: 'undata/undphdro/HDI_le',
    name: 'Life expectancy at birth',
    topic: 'people',
    what: 'How many years a baby born today could expect to live if conditions stayed as they are now.',
    unit: 'Years',
    source: 'UNDP Human Development Report Office',
    countryCoverage: 195,
    years: '2023',
    watchOut:
      'It describes today\'s conditions, not a prediction about any real child. A shock such as a pandemic moves it sharply and temporarily.',
  },
  {
    dcid: 'undata/undphdro/HDI_hdi',
    name: 'Human Development Index (HDI)',
    topic: 'economy',
    what: 'A single 0-to-1 score combining health, education and income. Higher is better.',
    unit: 'Index, 0 to 1',
    source: 'UNDP Human Development Report Office',
    countryCoverage: 193,
    years: '2023',
    watchOut:
      'Because it is a composite, a country can improve on HDI while getting worse on one of its three parts. Never report a change in HDI without saying what drove it.',
  },
  {
    dcid: 'undata/undphdro/HDI_gnipc',
    name: 'Income per person (GNI per capita)',
    topic: 'economy',
    what: 'Average yearly income per person, adjusted so it buys a comparable amount in every country.',
    unit: 'US dollars, purchasing-power adjusted',
    source: 'UNDP Human Development Report Office',
    countryCoverage: 193,
    years: '2023',
    watchOut:
      'It is an average. It says nothing about how income is distributed, so it can rise while most people are no better off.',
  },
  {
    dcid: 'undata/sdg/SI_POV_DAY1',
    name: 'People living in extreme poverty',
    topic: 'poverty',
    what: 'The share of the population living below the international extreme poverty line.',
    unit: 'Percent of population',
    source: 'Global SDG Indicators Database',
    sdg: '1.1.1',
    countryCoverage: 170,
    years: '1992–2024',
    watchOut:
      'This comes from household surveys that run every few years, so most countries have only a handful of data points. Treat the line between them as a gap, not a trend.',
  },
  {
    dcid: 'undata/sdg/SN_ITK_DEFC',
    name: 'Undernourishment',
    topic: 'poverty',
    what: 'The share of the population whose food intake is too low to meet their energy needs.',
    unit: 'Percent of population',
    source: 'Global SDG Indicators Database',
    sdg: '2.1.1',
    countryCoverage: 169,
    years: '2006–2023',
    watchOut:
      'Published as a three-year rolling average, so a single bad year is smoothed out. It will always lag a sudden food crisis.',
  },
  {
    dcid: 'undata/sdg/SH_STA_MORT.SEX--F',
    name: 'Maternal mortality',
    topic: 'health',
    what: 'Deaths of women from causes related to pregnancy and childbirth, per 100,000 live births.',
    unit: 'Deaths per 100,000 live births',
    source: 'Global SDG Indicators Database',
    sdg: '3.1.1',
    countryCoverage: 195,
    years: '2023',
    watchOut:
      'Only published as a female series, so its identifier ends in .SEX--F. The version without that ending returns nothing at all.',
  },
  {
    dcid: 'undata/sdg/SH_H2O_SAFE',
    name: 'Safely managed drinking water',
    topic: 'infrastructure',
    what: 'The share of people using an improved water source that is on the premises, available when needed and free from contamination.',
    unit: 'Percent of population',
    source: 'Global SDG Indicators Database',
    sdg: '6.1.1',
    countryCoverage: 163,
    years: '2017–2024',
    watchOut:
      '"Safely managed" is a stricter test than "improved source". A country can look far worse on this than on older water statistics for no real-world reason.',
  },
  {
    dcid: 'undata/sdg/EG_ACS_ELEC',
    name: 'Access to electricity',
    topic: 'infrastructure',
    what: 'The share of the population with an electricity connection.',
    unit: 'Percent of population',
    source: 'Global SDG Indicators Database',
    sdg: '7.1.1',
    countryCoverage: 217,
    years: '2024',
    watchOut:
      'Having a connection is not the same as having reliable power. This counts connections, not hours of supply.',
  },
  {
    dcid: 'undata/sdg/IT_USE_ii99',
    name: 'People using the internet',
    topic: 'infrastructure',
    what: 'The share of the population who used the internet in the last three months.',
    unit: 'Percent of population',
    source: 'Global SDG Indicators Database / ITU',
    sdg: '17.8.1',
    countryCoverage: 224,
    years: '2000–2025',
  },
  {
    dcid: 'undata/sdg/SE_ADT_LITR.AGE--Y15T24__SKILL--LTRCY',
    name: 'Youth literacy (15–24)',
    topic: 'education',
    what: 'The share of young people aged 15 to 24 who can read and write a short simple statement.',
    unit: 'Percent of people aged 15–24',
    source: 'Global SDG Indicators Database',
    sdg: '4.6.1',
    countryCoverage: 153,
    years: '2000–2024',
    watchOut:
      'Usually self-reported in a census or survey rather than tested, so it tends to overstate ability.',
  },
  {
    dcid: 'undata/unicef/ED_CR.EDUCATION_LEVEL--ISCED11_1__SCHOOL_AGE--L1',
    name: 'Primary school completion',
    topic: 'education',
    what: 'The share of children of the relevant age who finish primary school.',
    unit: 'Percent of the relevant age group',
    source: 'UNICEF',
    sdg: '4.1.2',
    countryCoverage: 111,
    years: '2010–2020',
    watchOut:
      'The thinnest series in this list — about one value per country, from whichever year that country ran its survey. Comparing two countries here is often comparing two different years.',
  },
  {
    dcid: 'undata/sdg/SG_GEN_PARL.SEX--F',
    name: 'Women in national parliament',
    topic: 'gender',
    what: 'The share of seats in the national parliament held by women.',
    unit: 'Percent of seats',
    source: 'Global SDG Indicators Database',
    sdg: '5.5.1',
    countryCoverage: 193,
    years: '2019–2026',
    watchOut:
      'Seats held, not power held. It also jumps on election dates rather than moving smoothly.',
  },
  {
    dcid: 'undata/sdg/SG_REG_BRTH.AGE--Y0T4',
    name: 'Birth registration (under 5)',
    topic: 'peace',
    what: 'The share of children under five whose birth has been registered with a civil authority.',
    unit: 'Percent of children under 5',
    source: 'Global SDG Indicators Database',
    sdg: '16.9.1',
    countryCoverage: 184,
    years: '2006–2025',
    watchOut:
      'A strong proxy for legal identity and access to services. Survey-based, so it updates only when a country runs a household survey.',
  },
  {
    dcid: 'undata/sdg/VC_IHR_PSRC',
    name: 'Homicide rate',
    topic: 'peace',
    what: 'Victims of intentional homicide per 100,000 people.',
    unit: 'Victims per 100,000 people',
    source: 'Global SDG Indicators Database / UNODC',
    sdg: '16.1.1',
    countryCoverage: 198,
    years: '2006–2024',
    watchOut:
      'Depends on national police and health recording. A low figure can mean low violence or weak recording, and the two are hard to tell apart.',
  },
  {
    dcid: 'undata/sdg/VC_DTH_TOTN',
    name: 'Conflict-related deaths',
    topic: 'peace',
    what: 'The number of people killed in armed conflict, civilians and combatants together.',
    unit: 'Number of deaths',
    source: 'Global SDG Indicators Database',
    sdg: '16.1.2',
    countryCoverage: 14,
    years: '2022–2024',
    watchOut:
      'Only reported for countries in active documented conflict — about fourteen. A country missing from this series is not necessarily at peace; it may simply not be reporting.',
  },
  {
    dcid: 'undata/sdg/SM_POP_REFG_OR',
    name: 'Refugees, by country of origin',
    topic: 'peace',
    what: 'People who have fled this country and are refugees elsewhere, per 100,000 of this country\'s population.',
    unit: 'Refugees per 100,000 population',
    source: 'Global SDG Indicators Database / UNHCR',
    sdg: '10.7.4',
    countryCoverage: 223,
    years: '2025',
    watchOut:
      'A rate, not a headcount. It measures displacement relative to the size of the country people left, which is why small countries can rank very high.',
  },
  {
    dcid: 'undata/unodc/PERC_SAFEWALK_PCT',
    name: 'Feeling safe walking alone at night',
    topic: 'peace',
    what: 'The share of people who say they feel safe walking alone in their area after dark.',
    unit: 'Percent of population',
    source: 'UNODC',
    sdg: '16.1.4',
    countryCoverage: 58,
    years: '2013–2025',
    watchOut:
      'Perception, not incidence — and available for only about 58 countries. It often diverges from the homicide rate, which is the interesting part, not an error.',
  },
  {
    dcid: 'undata/sdg/EN_ATM_CO2',
    name: 'CO₂ emissions from fuel combustion',
    topic: 'environment',
    what: 'Carbon dioxide released by burning fuel, in tonnes.',
    unit: 'Tonnes',
    source: 'Global SDG Indicators Database',
    sdg: '9.4.1',
    countryCoverage: 148,
    years: '2023',
    watchOut:
      'A national total, so big countries dominate. Divide by population before comparing countries of different sizes.',
  },
  {
    dcid: 'undata/unicef/SPP_GDPPC',
    name: 'GDP per person',
    topic: 'economy',
    what: 'The value of everything the country produced in a year, divided by its population.',
    unit: 'Current US dollars',
    source: 'UNICEF',
    countryCoverage: 210,
    years: '2024',
    watchOut:
      'In current dollars, so it moves with exchange rates and inflation as well as with real output. For comparisons over time, prefer the purchasing-power-adjusted income series.',
  },
];

/** Indicators grouped by topic, in the display order of TOPIC_LABELS. */
export function indicatorsByTopic(): Array<{ topic: Topic; label: string; items: CuratedIndicator[] }> {
  return (Object.keys(TOPIC_LABELS) as Topic[])
    .map((topic) => ({
      topic,
      label: TOPIC_LABELS[topic],
      items: INDICATORS.filter((indicator) => indicator.topic === topic),
    }))
    .filter((group) => group.items.length > 0);
}

export function findIndicator(dcid: string): CuratedIndicator | undefined {
  return INDICATORS.find((indicator) => indicator.dcid === dcid);
}
