/**
 * Worked scenarios: a colleague's question, end to end.
 *
 * The rest of the guide is organised by what the platform offers. This file is
 * organised by what someone walks up and asks for, because that is the form the
 * request actually arrives in — "can I get conflict against GDP per capita as a
 * scatter" — and the hard part is never the HTTP.
 *
 * The hard part is twofold. Finding the identifier, which the search box is
 * unreliable at and the graph walk is exact at. And then discovering, usually
 * too late, that the two series you joined do not cover the same countries.
 *
 * Every number, response and dead end below was produced against the live
 * deployment on 19 September 2026. The dead ends are kept deliberately: a
 * discovery trail with the failures edited out teaches nobody how to search.
 */

import type { RecipeSpec, Shape } from '../lib/undc/recipes';

/** One rung of the discovery ladder, with what it actually returned. */
export interface DiscoveryStep {
  /** What you do, in the imperative. */
  action: string;
  /** The request, where there is one. */
  call?: string;
  /** What came back. Verified, not paraphrased. */
  result: string;
  outcome: 'dead-end' | 'near-miss' | 'found';
}

export interface ScenarioVariable {
  dcid: string;
  name: string;
  /** The collection it lives in — often not the agency you would guess. */
  agency: string;
  /** Countries that returned a value in the 19 September 2026 whole-world check. */
  countryCoverage: number;
  /** Reference years seen in that check. */
  years: string;
  /** Which rung of the ladder actually produced this identifier. */
  foundBy: string;
}

export interface Scenario {
  slug: string;
  /** The question in the colleague's words, not the platform's. */
  question: string;
  /** Who tends to ask it, so a reader can recognise themselves. */
  asker: string;
  shape: Shape;
  lead: string;
  discovery: DiscoveryStep[];
  variables: ScenarioVariable[];
  spec: RecipeSpec;
  /** The thing the data does that the question did not anticipate. */
  finding: { headline: string; body: string };
  /** What to draw instead, once the finding is known. */
  chart: string;
}

const API = 'https://unsd-datacommons.gcp.un-icc.cloud';

export const SCENARIOS: readonly Scenario[] = [
  {
    slug: 'conflict-and-income',
    question: 'Can I get conflict deaths against GDP per capita, as a scatter?',
    asker: 'A colleague preparing a background note, who has seen the chart elsewhere',
    shape: 'scatter',
    lead: 'Two indicators, two agencies, one scatter plot. The API part takes four minutes. Finding the two identifiers takes longer, and the answer to the question turns out to be that this chart should not be drawn at all — which the data tells you in one line, if you ask it before you plot.',
    discovery: [
      {
        action: 'Ask the platform search box for GDP per capita, the way you would ask a person.',
        call: `curl -s -X POST '${API}/api/explore/detect-and-fulfill?q=GDP%20per%20capita' \\
  -H 'Content-Type: application/json' -d '{}'`,
        result:
          'Eleven variables, and the one you want is eighth. Above it: real GDP per worker at PPP (ILO), gross national income per capita (UNDP), gross domestic product at current prices (UNIDO — a total, not a per-capita), and the HDI itself. The resolver also silently committed to the United States, because the question named no place.',
        outcome: 'near-miss',
      },
      {
        action: 'Read the list rather than taking the top hit. The name you need is spelled out in full.',
        result:
          'undata/unicef/SPP_GDPPC — "Gross Domestic Product (GDP) per capita (current United States dollars)". Published inside the UNICEF collection, which is not where anyone would have looked for it.',
        outcome: 'found',
      },
      {
        action: 'Now ask the same search box for conflict-related deaths.',
        call: `curl -s -X POST '${API}/api/explore/detect-and-fulfill?q=conflict%20related%20deaths' \\
  -H 'Content-Type: application/json' -d '{}'`,
        result:
          'No variables at all. The resolver returns a place — the United States again — and an empty variable list. For this topic the search box is not a tool you can build on.',
        outcome: 'dead-end',
      },
      {
        action: 'Switch to walking the SDG framework, which is exact. Conflict deaths are SDG 16.1.2, so start at the goal and descend.',
        call: `curl -s -G '${API}/core/api/v2/node' \\
  --data-urlencode 'nodes=undata/g/sdgf/goal-16' \\
  --data-urlencode 'property=<-specializationOf'`,
        result:
          'Twelve targets. 16.1 is "significantly reduce all forms of violence and related death rates everywhere" — undata/g/sdgf/target-16-1.',
        outcome: 'found',
      },
      {
        action: 'Descend again, to the indicators under that target.',
        call: `curl -s -G '${API}/core/api/v2/node' \\
  --data-urlencode 'nodes=undata/g/sdgf/target-16-1' \\
  --data-urlencode 'property=<-specializationOf'`,
        result:
          'Four indicators, and the identifier is undata/g/sdgf/ind-16-1-2 — "ind", not "indicator". Guessing the longer spelling returns an empty response with no error, which is the whole argument against constructing identifiers by analogy.',
        outcome: 'found',
      },
      {
        action: 'Descend once more. This is the rung that changes the analysis.',
        call: `curl -s -G '${API}/core/api/v2/node' \\
  --data-urlencode 'nodes=undata/g/sdgf/ind-16-1-2' \\
  --data-urlencode 'property=<-specializationOf'`,
        result:
          'Six groups, not one: total deaths, civilian, non-civilian, unknown — and two rates. undata/g/sdg/VC_DTH_TOTR is "Number of total conflict-related deaths per 100,000 population". A rate exists. Plotting the raw count against income would mostly have plotted population size.',
        outcome: 'found',
      },
      {
        action: 'Take the last step, from the group to the variable you can actually fetch.',
        call: `curl -s -G '${API}/core/api/v2/node' \\
  --data-urlencode 'nodes=undata/g/sdg/VC_DTH_TOTR.000' \\
  --data-urlencode 'property=<-memberOf'`,
        result: 'undata/sdg/VC_DTH_TOTR. This is a leaf, and observations can be requested for it.',
        outcome: 'found',
      },
    ],
    variables: [
      {
        dcid: 'undata/unicef/SPP_GDPPC',
        name: 'GDP per capita, current US dollars',
        agency: 'UNICEF collection',
        countryCoverage: 210,
        years: '2024 for every country — a genuine cross-section',
        foundBy: 'Search, read down to the eighth result',
      },
      {
        dcid: 'undata/sdg/VC_DTH_TOTR',
        name: 'Conflict-related deaths per 100,000 population',
        agency: 'SDG collection (indicator 16.1.2)',
        countryCoverage: 14,
        years: '2022, 2023 and 2024',
        foundBy: 'Four graph walks down the SDG framework',
      },
    ],
    spec: {
      variables: ['undata/unicef/SPP_GDPPC', 'undata/sdg/VC_DTH_TOTR'],
      entities: [],
      parentPlace: 'Earth',
      shape: 'scatter',
    },
    finding: {
      headline: '210 countries, 14 countries, and every point you plot is a country at war',
      body: 'GDP per capita returns 210 countries. The conflict death rate returns 14. The inner join keeps 14, and those 14 are Afghanistan, the Central African Republic, DR Congo, Ethiopia, Iraq, Lebanon, Libya, Mali, Myanmar, the Palestinian Territories, the Philippines, South Sudan, Syria and Ukraine. Norway, Costa Rica and Japan are not zero on this indicator — they are absent from the response entirely, because a country with no conflict files no conflict-death return. A scatter of these two series cannot say anything about whether conflict and income are related across countries, because every peaceful country has been removed from the sample before the chart is drawn. The chart would not be imprecise. It would be answering a different question from the one asked.',
    },
    chart: 'Draw it, but label it for what it is: among the fourteen countries reporting conflict deaths, how does the death rate vary with income. Put n = 14 in the title, log the income axis because it spans 353 to 7,330 dollars, and state the reference years — the rate is 2022, 2023 or 2024 depending on the country, against income that is uniformly 2024. If the question really was about conflict and income across all countries, the honest answer is that this platform cannot support it, and the note should say so rather than showing fourteen dots.',
  },
  {
    slug: 'report-on-an-sdg-target',
    question: 'My office reports on SDG 16.1. What can I actually show for our region?',
    asker: 'A reporting officer with a target number and no identifiers',
    shape: 'ranking',
    lead: 'This is the friendliest version of the discovery problem, because the SDG framework is in the graph as a branch you can walk. You start from the target your mandate names and finish with a list of leaf variables, without guessing anything.',
    discovery: [
      {
        action: 'Walk from the target to its indicators.',
        call: `curl -s -G '${API}/core/api/v2/node' \\
  --data-urlencode 'nodes=undata/g/sdgf/target-16-1' \\
  --data-urlencode 'property=<-specializationOf'`,
        result:
          'Four: 16.1.1 intentional homicide per 100,000, 16.1.2 conflict-related deaths, 16.1.3 population subjected to violence, 16.1.4 feeling safe walking alone after dark.',
        outcome: 'found',
      },
      {
        action: 'Check coverage before choosing, not after. Ask each candidate for the whole region at once.',
        call: `curl -s -G '${API}/core/api/v2/observation' \\
  --data-urlencode 'date=LATEST' \\
  --data-urlencode 'variable.dcids=undata/unodc/VIC_HOM_RT' \\
  --data-urlencode 'entity.expression=africa<-containedInPlace+{typeOf:Country}' \\
  --data-urlencode 'select=date' --data-urlencode 'select=value' \\
  --data-urlencode 'select=entity' --data-urlencode 'select=variable'`,
        result:
          '16.1.1 returns 37 African countries. 16.1.2 returns 6. For a regional page, the homicide indicator is the one that can carry a map; the conflict indicator can carry a sentence about six countries and nothing more.',
        outcome: 'found',
      },
    ],
    variables: [
      {
        dcid: 'undata/unodc/VIC_HOM_RT',
        name: 'Intentional homicide rate per 100,000 population',
        agency: 'UNODC',
        countryCoverage: 37,
        years: '2009 to 2025 — eleven distinct years across the region',
        foundBy: 'Walked from SDG target 16.1',
      },
    ],
    spec: {
      variables: ['undata/unodc/VIC_HOM_RT'],
      entities: [],
      parentPlace: 'africa',
      shape: 'ranking',
    },
    finding: {
      headline: 'Good coverage, eleven different reference years',
      body: 'Thirty-seven countries is enough for a regional ranking. But date=LATEST resolves per country, and across those 37 the newest available year ranges from 2009 to 2025. That is not a cross-section, and a map coloured from it compares a figure from before the Arab Spring with one from this year. Either pin a year and accept the countries that drop out, or keep LATEST and label every value with its own year.',
    },
    chart: 'A sorted horizontal bar chart with the reference year printed on each bar, not a choropleth. A map cannot show the year per country, so it hides exactly the thing that makes this ranking questionable.',
  },
  {
    slug: 'trend-for-a-few-countries',
    question: 'I need electricity access for our five programme countries, 2000 to now.',
    asker: 'Almost everyone, most weeks',
    shape: 'trend',
    lead: 'The easy case, included because most requests are this one and it is worth seeing what "easy" looks like: one request, no discovery, no trap beyond remembering that a gap is not a zero.',
    discovery: [
      {
        action: 'Skip the API. This indicator is on the shortlist in the Data Finder, already checked for coverage.',
        result:
          'undata/sdg/EG_ACS_ELEC — SDG 7.1.1, access to electricity as a percentage of population. 217 countries, all reporting 2024.',
        outcome: 'found',
      },
    ],
    variables: [
      {
        dcid: 'undata/sdg/EG_ACS_ELEC',
        name: 'Access to electricity, % of population',
        agency: 'SDG collection (indicator 7.1.1)',
        countryCoverage: 217,
        years: '2024 for every country',
        foundBy: 'The curated shortlist in the Data Finder',
      },
    ],
    spec: {
      variables: ['undata/sdg/EG_ACS_ELEC'],
      entities: ['country/BGD', 'country/ETH', 'country/IND', 'country/KEN', 'country/SSD'],
      shape: 'trend',
    },
    finding: {
      headline: 'Nothing goes wrong, and that is worth knowing too',
      body: 'A modelled series published annually for almost every country gives you a dense, uniform result. The only care needed is at the edges: a country that has not reported comes back with an empty series rather than a row of zeros, and the chart must draw that as a gap. This is the shape of request the platform is best at, and it is most of them.',
    },
    chart: 'A line chart from a zero baseline, because this is a bounded percentage approaching a ceiling and the distance from 100 is the story.',
  },
] as const;

export function findScenario(slug: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.slug === slug);
}

/** Label and tone for a discovery outcome. */
export const OUTCOME_LABELS: Record<DiscoveryStep['outcome'], string> = {
  'dead-end': 'Dead end',
  'near-miss': 'Near miss',
  found: 'Found it',
};
