import type { TutorialSpec } from '../components/Tutorial';
import { searchUrl } from '../lib/undc/config';

/**
 * Six walkthroughs, each ending in something a colleague can actually hand over.
 *
 * Every link and every expected result was checked against the live platform on
 * 18 September 2026. Where a figure is quoted it is quoted as "around", because
 * the data updates and a tutorial that promises an exact number ages badly.
 */
export const TUTORIALS: readonly TutorialSpec[] = [
  {
    id: 'first-number',
    title: 'Find one number and be able to defend it',
    forWhom: 'Anyone who has been asked for a statistic and needs it to hold up.',
    minutes: 4,
    outcome: 'A figure, its year, its source, and a citation.',
    steps: [
      {
        do: 'Open the UN platform search and ask for the indicator and the country, in plain English.',
        link: { href: searchUrl('access to electricity in Bangladesh'), label: 'access to electricity in Bangladesh' },
        see: 'A page of charts, with a large headline figure near the top — around 99% for recent years.',
      },
      {
        do: 'Look at the year on the chart before you write the number down.',
        see: 'A year label such as 2024. This is the year your sentence must name.',
        note: 'If you quote a figure without its year, the first person to check it will find a different number and assume you were wrong.',
      },
      {
        do: 'Find the source line underneath the chart and click through to it.',
        see: 'The producing body — here the Global SDG Indicators Database — and a link to its methodology.',
        note: 'This is who you cite. data.un.org is how you found it, not who measured it.',
      },
      {
        do: 'Write the sentence with all three parts: figure, year, source.',
        see: '"99.4% of Bangladesh\'s population had access to electricity in 2024 (SDG indicator 7.1.1, Global SDG Indicators Database)."',
      },
    ],
    lesson: (
      'A number on its own is not evidence. A number with a year and a named producer is. ' +
      'Those three things take ten extra seconds and are the whole difference.'
    ),
  },

  {
    id: 'compare-countries',
    title: 'Compare several countries without misleading anyone',
    forWhom: 'Reporting officers writing a regional or comparative section.',
    minutes: 6,
    outcome: 'A comparison chart with an honest caveat attached.',
    steps: [
      {
        do: 'Open the Data Finder on this site and choose an indicator from the topic list.',
        link: { href: '#toolkit', label: 'Data Finder (on this site)' },
        see: 'A plain-English description, the unit, who publishes it, and how many countries it covers.',
        note: 'That coverage number matters. An indicator covering 58 countries and one covering 224 are different tools for different jobs.',
      },
      {
        do: 'Use a regional preset, or search for countries and add them one at a time.',
        see: 'Your countries as removable tags, and the chart redrawing each time you change the set.',
      },
      {
        do: 'Check whether every country you asked for actually appears in the chart.',
        see: 'If one is missing, an orange warning naming it explicitly.',
        note: 'A missing country means it did not report. Say that in your text — do not silently drop it, and never let a reader assume the value was zero.',
      },
      {
        do: 'Read the "Watch out" note for the indicator before you draw a conclusion.',
        see: 'The specific way this indicator is usually misread — for example, that CO₂ totals favour large countries unless divided by population.',
      },
      {
        do: 'Download the CSV, and copy the citation.',
        see: 'A spreadsheet that opens in Excel with a source note in the first rows, and a citation naming the producing agency.',
      },
    ],
    lesson: (
      'Comparison is where most reporting errors happen, and almost always for one of two reasons: ' +
      'a country quietly missing, or two countries being compared across different years. Check both, every time.'
    ),
  },

  {
    id: 'latest-trap',
    title: 'Avoid the "latest available" trap',
    forWhom: 'Anyone building a ranking, a map, or a league table.',
    minutes: 5,
    outcome: 'A ranking you can publish, with the right caveat.',
    steps: [
      {
        do: 'Ask the platform to compare an indicator across a whole region.',
        link: { href: searchUrl('compare homicide rate across countries in Africa'), label: 'compare homicide rate across countries in Africa' },
        see: 'A map and a ranking of African countries.',
        note: 'The phrase "compare … across countries in" is what produces a map instead of a single line. Worth memorising.',
      },
      {
        do: 'Now look at the worked example on this site, which shows each country\'s own reference year beside its bar.',
        link: { href: '#peace', label: 'Peace and security worked case' },
        see: 'Years ranging from around 2009 to 2025 in the same chart.',
      },
      {
        do: 'Ask yourself whether your sentence claims a single point in time.',
        see: 'If it does, it is wrong. "Latest available" mixes years.',
      },
      {
        do: 'Either pin one year for everyone, or label the chart as "most recent available" and show the years.',
        see: 'Pinning a year loses the countries that did not report it. That is a real trade-off — choose it deliberately.',
      },
    ],
    lesson: (
      '"Latest" is a per-country answer, not a date. A ranking of latest figures is a ranking ' +
      'of different years, which is fine as long as the chart says so.'
    ),
  },

  {
    id: 'chart-it',
    title: 'Turn UN data into a chart in Datawrapper',
    forWhom: 'Colleagues who need a publishable graphic and have no design tools.',
    minutes: 8,
    outcome: 'An embeddable, accessible chart with a source line.',
    steps: [
      {
        do: 'In the Data Finder, build the view you want and press "Copy for pasting".',
        see: 'A confirmation that it copied. The clipboard now holds a tab-separated table.',
        note: 'Tab-separated is what spreadsheet and chart tools expect from a paste. The CSV download is the alternative if you prefer files.',
      },
      {
        do: 'Go to datawrapper.de, create a free account, and start a new chart.',
        link: { href: 'https://www.datawrapper.de/', label: 'datawrapper.de' },
        see: 'An empty data table on step 1 of 4.',
      },
      {
        do: 'Click into the table and paste. Datawrapper will detect the columns.',
        see: 'Your years down the side and countries across the top, with a green tick on the columns it read as numbers.',
        note: 'If a column shows as text rather than numbers, the usual cause is an empty cell for a missing year. Leave it empty — do not type 0.',
      },
      {
        do: 'On the "Visualize" step, choose a line chart for change over time, or bars for a ranking.',
        see: 'A live preview.',
      },
      {
        do: 'Fill in the title, and paste your citation into the source field.',
        see: 'The source line appearing under the chart. This is not optional — it travels with the image when someone screenshots it.',
      },
      {
        do: 'Publish, and copy the embed code or the PNG.',
        see: 'A public link you can put in a report or an intranet page.',
      },
    ],
    lesson: (
      'The source field is the most important box on the page. A chart without it will be ' +
      'screenshotted into a slide deck and become unattributable within a week.'
    ),
  },

  {
    id: 'ai-report',
    title: 'Draft a report section with an AI assistant, safely',
    forWhom: 'Anyone using ChatGPT, Claude or Gemini for a first draft.',
    minutes: 7,
    outcome: 'A drafted section grounded in real figures, not invented ones.',
    steps: [
      {
        do: 'Build your view in the Data Finder and press "Copy AI prompt".',
        see: 'A prompt containing the actual data table, the unit, the source and the known limitation.',
        note: 'This is the whole trick. An assistant asked to recall UN statistics will produce confident, plausible, wrong numbers. An assistant handed the table will not.',
      },
      {
        do: 'Paste it into your assistant and send it.',
        see: 'A summary, the notable changes with figures, and a flag on anything needing a caveat.',
      },
      {
        do: 'Check three figures in the reply against the table you sent.',
        see: 'They should match exactly. If any do not, the assistant is paraphrasing rather than reading — say so and ask it to quote from the table only.',
        note: 'Do this every time. It takes thirty seconds and it is the reason you can sign your name to the output.',
      },
      {
        do: 'Ask it to rewrite in your house style, and to list every claim it cannot support from the data.',
        see: 'A shorter list of claims than you expected. Remove or source each one.',
      },
      {
        do: 'Add your citation to the section before you file it.',
        see: 'The producing agency named, with the access date.',
      },
    ],
    lesson: (
      'Never ask an AI assistant what a statistic is. Give it the statistic and ask what it means. ' +
      'The first is a guess; the second is analysis.'
    ),
  },

  {
    id: 'track-over-time',
    title: 'Set up a figure you need to refresh every quarter',
    forWhom: 'Anyone maintaining a recurring report or dashboard.',
    minutes: 6,
    outcome: 'A repeatable process and a link you can hand to a colleague.',
    steps: [
      {
        do: 'Find your indicator once, and write down its identifier.',
        see: 'Something like undata/sdg/EG_ACS_ELEC, shown under every indicator in the Data Finder.',
        note: 'This identifier is permanent. A search phrase is not — the search may be improved and return something slightly different next quarter.',
      },
      {
        do: 'Record the identifier, the countries and the source in your report\'s method note.',
        see: 'Three lines that let anyone — including you in six months — reproduce the exact figure.',
      },
      {
        do: 'Next quarter, return to the Data Finder, select the same indicator and countries, and re-download.',
        see: 'The same table with any newly published years added.',
      },
      {
        do: 'Compare the old and new files before you republish.',
        see: 'Agencies revise history. A figure for 2022 can change after a country resubmits, so last quarter\'s numbers may no longer match.',
        note: 'This surprises people. Revision is normal and correct — but if your report quoted the old figure, you need to know before a reader tells you.',
      },
      {
        do: 'If you need it fully automatic, hand the identifier to a colleague who codes, or use the recipe on the Visualise page.',
        see: 'A scheduled job that writes a CSV your chart reads directly.',
      },
    ],
    lesson: (
      'Identifiers are the unit of reproducibility. A search phrase describes what you wanted; ' +
      'an identifier describes what you got.'
    ),
  },
];
