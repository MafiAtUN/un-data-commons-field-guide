import { PageHeader, Section } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';
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
        eyebrow="Visualise"
        title="Turning the numbers into something people will look at"
        lead={
          <>
            You do not need a design team or a licence. These are the free tools that get a
            UN colleague from a downloaded spreadsheet to a publishable, attributed chart in
            under ten minutes — and the rules that keep the chart honest once it is made.
          </>
        }
      />

      <Section
        title="Pick a tool"
        lead="Ordered by how fast a non-technical person gets a finished chart, not by how powerful the tool is."
      >
        <div className="space-y-3">
          {TOOLS.map((tool) => (
            <div key={tool.name} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[0.95rem] font-semibold text-ink-primary">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-hairline underline-offset-2 hover:decoration-volt"
                  >
                    {tool.name} ↗
                  </a>
                </h3>
                <span className="text-[0.75rem] text-ink-muted">{tool.cost}</span>
              </div>
              <dl className="mt-3 grid gap-2 text-[0.82rem] leading-relaxed sm:grid-cols-3">
                <div>
                  <dt className="text-ink-muted">Best for</dt>
                  <dd className="text-ink-secondary">{tool.bestFor}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Getting UN data in</dt>
                  <dd className="text-ink-secondary">{tool.getting}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Watch out</dt>
                  <dd className="text-ink-secondary">{tool.watch}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Choosing the right chart"
        lead="Four questions, four answers. This covers nearly everything a report needs."
      >
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

      <Section
        title="Five rules that keep a chart honest"
        lead="These are not style preferences. Each one is a way a chart can mislead without anybody intending it to."
      >
        <ol className="space-y-2.5">
          {[
            ['Start bars at zero.', 'Truncating the axis makes a small difference look enormous. Lines may be truncated; bars may not, because the length of a bar is the message.'],
            ['Never use two vertical axes.', 'Two measures on two scales in one plot invents a relationship. The alignment between the scales is arbitrary. Use two charts side by side instead.'],
            ['Say which year every number is from.', 'Especially in a ranking, where "latest available" can span a decade.'],
            ['Show the gaps.', 'If a country has no data for 2019, leave the gap. Joining the line across it, or writing zero, both state something untrue.'],
            ['Put the source on the chart itself.', 'Not in the surrounding text. The image will be screenshotted out of your document within a week.'],
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
        lead="For a recurring report. Requires a GitHub account, but no coding beyond copying this file."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 text-[0.86rem] leading-relaxed text-ink-secondary">
            <p>
              Datawrapper and Flourish can both link to a CSV at a public web address and
              re-read it on a schedule. The UN platform does not publish CSV files, so the
              missing piece is something that fetches the data and writes a CSV somewhere
              public.
            </p>
            <p>
              A free GitHub Action does exactly that. Put this file in a repository at{' '}
              <code className="text-ink-primary">.github/workflows/refresh.yml</code>, change
              the indicator and countries at the top, and enable GitHub Pages. You get a
              stable CSV URL that refreshes every Monday.
            </p>
            <p>
              Then in Datawrapper choose "Link to external dataset" and paste that URL. The
              chart updates itself from then on.
            </p>
            <p className="text-ink-muted">
              Ask a technical colleague if this is unfamiliar — it is fifteen minutes of
              their time, once, and then the report maintains itself.
            </p>
          </div>

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
        </div>
      </Section>
    </>
  );
}
