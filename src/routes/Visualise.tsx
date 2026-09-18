import { PageHeader, Section } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';
import { Expander } from '../components/Expander';
import { Link } from 'react-router-dom';

interface Tool {
  name: string;
  url: string;
  cost: string;
  bestFor: string;
  getting: string;
  watch: string;
}

/**
 * Charting tools, assessed for a UN colleague with no budget and no design team.
 *
 * Ordered by how quickly a non-technical person gets a publishable result, not
 * by capability.
 */
const TOOLS: readonly Tool[] = [
  {
    name: 'Datawrapper',
    url: 'https://www.datawrapper.de/',
    cost: 'Free tier is enough for most reporting; paid tiers add custom themes.',
    bestFor: 'Line charts, bar charts and choropleth maps for reports and intranet pages.',
    getting: 'Paste the tab-separated table straight into step 1. It detects columns automatically.',
    watch: 'Free charts are public once published. Check before using unpublished or sensitive figures.',
  },
  {
    name: 'Flourish',
    url: 'https://flourish.studio/',
    cost: 'Free tier for public projects; paid for private ones.',
    bestFor: 'Animated and narrative charts — racing bars, scrollytelling, story sequences.',
    getting: 'Upload the CSV, or use "Import from URL" if your file is hosted publicly.',
    watch: 'Animation is persuasive, which cuts both ways. For a factual report a static chart is usually the more honest choice.',
  },
  {
    name: 'Google Sheets or Excel',
    url: 'https://sheets.google.com/',
    cost: 'Free / already on your machine.',
    bestFor: 'Quick internal looks, pivot tables, and sharing with colleagues who will want to edit.',
    getting: 'Open the downloaded CSV directly. It is UTF-8 with a byte-order mark, so accented country names display correctly in Excel.',
    watch: 'Excel will silently reformat things that look like dates. Check any column that contains year ranges.',
  },
  {
    name: 'Observable / Plot',
    url: 'https://observablehq.com/',
    cost: 'Free tier.',
    bestFor: 'Analysts who want to go a step beyond a chart tool without setting up a local environment.',
    watch: 'Notebooks are public on the free tier.',
    getting: 'Paste the CSV into a cell, or fetch the API directly — it allows cross-origin requests.',
  },
  {
    name: 'The platform\'s own charts',
    url: 'https://data.un.org',
    cost: 'Free.',
    bestFor: 'A quick, already-attributed chart when you do not need control over the styling.',
    getting: 'Search, find the chart, use its download and share buttons.',
    watch: 'You get the platform\'s styling, not your office\'s. Fine for internal use, less so for a designed publication.',
  },
];

export function Visualise() {
  return (
    <>
      <PageHeader
        eyebrow="Make a chart · 8 minutes"
        title="From spreadsheet to publishable chart"
        lead={<>Free tools only. No design team, no licence.</>}
      />

      <Section title="Pick a tool" lead="Ordered by speed to a finished chart.">
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full border-collapse text-[0.82rem]">
            <caption className="sr-only">Free charting tools compared</caption>
            <thead className="bg-surface-2">
              <tr>
                <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">Tool</th>
                <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">Best for</th>
                <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">Getting data in</th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map((tool) => (
                <tr key={tool.name} className="align-top even:bg-surface-1">
                  <th scope="row" className="p-3 text-left font-normal">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-semibold text-ink-primary underline decoration-hairline underline-offset-2 hover:decoration-volt"
                    >
                      {tool.name} ↗
                    </a>
                    <span className="mt-0.5 block text-[0.72rem] text-ink-muted">{tool.cost}</span>
                  </th>
                  <td className="p-3 text-ink-secondary">{tool.bestFor}</td>
                  <td className="p-3 text-ink-secondary">
                    {tool.getting}
                    <span className="mt-1 block text-[0.74rem] text-ink-muted">
                      <span className="font-semibold text-status-warning">! </span>
                      {tool.watch}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Which chart?" lead="Four questions. This covers nearly every report.">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              q: 'How has this changed over time?',
              a: 'A line chart. One line per country, no more than about five before it turns into spaghetti.',
              warn: 'If the series has only two or three data points years apart, use a table. A line implies measurements you do not have.',
            },
            {
              q: 'Who is highest and lowest?',
              a: 'A horizontal bar chart, sorted. Long country names read better on the left than rotated underneath.',
              warn: 'Bars must start at zero. Cutting the axis to exaggerate a difference is the oldest trick there is, and reviewers spot it.',
            },
            {
              q: 'How does this vary geographically?',
              a: 'A choropleth map — but pair it with a ranking. Maps flatter large countries and hide small ones.',
              warn: 'Use one colour, light to dark. A rainbow scale has no natural order, so readers cannot tell which end is "more".',
            },
            {
              q: 'What is the single headline?',
              a: 'Just the number, large, with its year and source underneath. No chart at all.',
              warn: 'A one-bar bar chart is never the answer. The number is the chart.',
            },
          ].map((item) => (
            <div key={item.q} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <h3 className="text-[0.88rem] font-semibold text-ink-primary">{item.q}</h3>
              <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-secondary">{item.a}</p>
              <p className="mt-2 flex gap-2 text-[0.78rem] leading-relaxed text-ink-muted">
                <span aria-hidden="true" className="shrink-0 font-semibold text-status-warning">!</span>
                <span>{item.warn}</span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Five rules that keep a chart honest" lead="Not style preferences. Each is a way a chart misleads by accident.">
        <ol className="space-y-2.5">
          {[
            ['Start bars at zero.', 'A cut axis makes a small gap look huge. Lines may be cut; bars may not.'],
            ['Never use two vertical axes.', 'It invents a relationship. Use two charts side by side.'],
            ['Put the year on every number.', '"Latest available" can span a decade.'],
            ['Show the gaps.', 'No data for 2019? Leave it blank. Never write zero.'],
            ['Put the source on the chart itself.', 'Not in the text around it. The image gets screenshotted out within a week.'],
          ].map(([rule, why], index) => (
            <li key={rule} className="flex gap-4 rounded-lg border border-hairline bg-surface-1 p-4">
              <span className="tnum shrink-0 font-mono text-[0.8rem] font-semibold text-volt">
                {index + 1}
              </span>
              <div>
                <h3 className="text-[0.88rem] font-semibold text-ink-primary">{rule}</h3>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-secondary">{why}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-4 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
          Every chart on this site follows these rules, and the{' '}
          <Link to="/development" className="text-volt underline decoration-volt/30 underline-offset-2">
            development worked case
          </Link>{' '}
          shows two of them being applied to real decisions.
        </p>
      </Section>

      <Section
        title="Advanced: a chart that updates itself"
        lead="For a report you publish every quarter. Ask a technical colleague — fifteen minutes of their time, once."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 text-[0.86rem] leading-relaxed text-ink-secondary">
            <ul className="space-y-2">
              <li>Datawrapper and Flourish can read a CSV from a web address on a schedule.</li>
              <li>The UN platform does not publish CSV files, so something has to write one.</li>
              <li>A free GitHub Action does it. Copy the workflow file below into a repository.</li>
              <li>Change the indicator and countries at the top. Enable GitHub Pages.</li>
              <li>In Datawrapper, choose "Link to external dataset" and paste the URL.</li>
              <li>The chart now refreshes itself every Monday.</li>
            </ul>
          </div>

          <Expander question="Show the workflow file" time="copy and paste">
          <CodeBlock
            label=".github/workflows/refresh.yml"
            language="yaml"
            code={`name: Refresh UN data

on:
  schedule: [{ cron: '0 6 * * 1' }]   # every Monday, 06:00 UTC
  workflow_dispatch:

permissions:
  contents: write

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Fetch and write CSV
        run: |
          mkdir -p data
          node -e '
            const API = "https://unsd-datacommons.gcp.un-icc.cloud";

            // ---- change these two lines ----
            const VARIABLE  = "undata/sdg/EG_ACS_ELEC";
            const COUNTRIES = ["country/BGD","country/ETH","country/IND"];
            // --------------------------------

            const res = await fetch(API + "/api/observations/series", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ variables: [VARIABLE], entities: COUNTRIES }),
            });
            const json = await res.json();
            const byCountry = json.data[VARIABLE] ?? {};

            const rows = [["country","year","value"]];
            for (const [country, block] of Object.entries(byCountry)) {
              for (const point of block.series ?? []) {
                rows.push([country, point.date, point.value]);
              }
            }

            const fs = await import("node:fs/promises");
            await fs.writeFile("data/indicator.csv",
              rows.map(r => r.join(",")).join("\\n"));
            console.log("wrote " + (rows.length - 1) + " rows");
          ' --input-type=module

      - name: Commit if it changed
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/indicator.csv
          git diff --staged --quiet || git commit -m "chore: refresh UN data"
          git push`}
          />
          </Expander>
        </div>
      </Section>
    </>
  );
}
