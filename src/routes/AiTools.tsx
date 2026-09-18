import { PageHeader, Section } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';
import { CopyButton } from '../components/CopyButton';
import { Expander } from '../components/Expander';
import { Link } from 'react-router-dom';

interface VibeTool {
  name: string;
  url: string;
  free: string;
  bestFor: string;
  note: string;
}

/**
 * Tools a colleague can reach without a purchase order.
 *
 * "Free" is stated as of September 2026 and deliberately specific — vague claims
 * about free tiers age into inaccuracy within months.
 */
const TOOLS: readonly VibeTool[] = [
  {
    name: 'Google AI Studio',
    url: 'https://aistudio.google.com/',
    free: 'Genuinely free, with a generous daily request allowance. No card required.',
    bestFor: 'Building a small data page or dashboard by describing it. The most forgiving starting point.',
    note: 'Best free option if you have no budget at all and want to build something rather than just chat.',
  },
  {
    name: 'Claude',
    url: 'https://claude.ai/',
    free: 'Free tier with daily limits; Artifacts included.',
    bestFor: 'Analysis, drafting report sections, and generating a working chart page you can preview immediately.',
    note: 'Ask for an "artifact" and you get a live, running page instead of a block of code to copy somewhere.',
  },
  {
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    free: 'Free tier with daily limits.',
    bestFor: 'Drafting, summarising and reformatting a table you paste in.',
    note: 'Paste the CSV into the message rather than describing it. Attached files and pasted tables both work; recalled statistics do not.',
  },
  {
    name: 'Bolt / Lovable',
    url: 'https://bolt.new/',
    free: 'Limited free generations per month.',
    bestFor: 'Turning a description into a deployed web page without touching an editor.',
    note: 'Fast and impressive, but the free allowance runs out quickly. Plan the prompt before you spend a generation.',
  },
  {
    name: 'Claude Code / Gemini CLI',
    url: 'https://claude.com/claude-code',
    free: 'Paid for Claude Code; Gemini CLI has a free tier.',
    bestFor: 'Colleagues comfortable in a terminal who want repeatable scripts rather than one-off pages.',
    note: 'This is also where the MCP connection becomes useful — the assistant queries the UN platform itself. See Connect.',
  },
];

const PROMPTS = [
  {
    title: 'Draft a report section from data you already have',
    when: 'You have the numbers and need a first draft.',
    prompt: `I am a UN reporting officer drafting a section for an internal report.

Below is real data from the UN System Data Commons. Use ONLY these numbers.

[paste the table from the Data Finder here]

Write three short paragraphs suitable for a UN report:
1. What the data shows overall.
2. The two or three most notable changes or differences, with the figures.
3. What a reader should be careful about when interpreting this.

Rules:
- Quote only figures that appear above.
- Do not estimate, interpolate or fill missing years.
- If a country is missing for a year, say so explicitly.
- Use neutral, factual language. No adjectives that the data does not support.`,
  },
  {
    title: 'Check a draft for claims the data does not support',
    when: 'Before you file anything that quotes statistics.',
    prompt: `Here is a draft report section, and the data it is supposed to be based on.

DRAFT:
[paste your draft]

DATA:
[paste the table from the Data Finder]

Go through the draft sentence by sentence. For each sentence that makes a factual
claim, tell me:
- whether the data above supports it, contradicts it, or is silent on it;
- if supported, the exact figure and year it relies on;
- if not supported, what would need to change.

Be strict. Flag comparisons across different years, trends inferred from two data
points, and any figure that does not appear in the data.`,
  },
  {
    title: 'Ask an assistant to find the right indicator',
    when: 'You know the question but not which statistic answers it.',
    prompt: `I need a statistic from the UN System Data Commons (data.un.org) and I am not
sure which indicator is the right one.

My question: [describe what you need, e.g. "how many children in Chad are not in
school"]

Please:
1. Suggest two or three candidate indicators, with the UN body that publishes each.
2. Explain the difference between them in plain language — what each actually measures.
3. Say which you would use for a UN report, and why.
4. Warn me about anything commonly misread about the one you recommend.

Do not give me figures. I will fetch those myself. I need to choose the indicator.`,
  },
  {
    title: 'Build a small chart page you can share',
    when: 'You want something interactive without a chart tool account.',
    prompt: `Build me a single self-contained HTML page that displays this data as a line chart.

DATA (CSV):
[paste the table from the Data Finder]

TITLE: [your title]
SOURCE LINE (must appear under the chart): [paste the citation from the Data Finder]

Requirements:
- One HTML file, no build step, works when opened directly in a browser.
- A clear legend, labelled axes, and the unit stated on the y-axis.
- Bars or lines must start at zero unless I say otherwise.
- Gaps in the data must render as gaps, not as zero or a straight line across.
- Readable on a phone.
- Include a small table of the same data underneath the chart, for accessibility.`,
  },
] as const;

export function AiTools() {
  return (
    <>
      <PageHeader
        eyebrow="Use AI on it · 5 minutes"
        title="Let AI do the analysis, not the remembering"
        lead={<>One rule, four prompts. That is the whole page.</>}
      />

      <Section title="The one rule" lead="Everything else follows from this.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-status-critical/30 bg-status-critical/5 p-5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-status-critical">
              Never
            </p>
            <p className="mt-2 font-mono text-[0.85rem] leading-relaxed text-ink-primary">
              “What is the maternal mortality rate in South Sudan?”
            </p>
            <ul className="mt-3 space-y-1.5 text-[0.83rem] leading-relaxed text-ink-secondary">
              <li>The model answers from memory.</li>
              <li>You get a number that looks right, in the right units.</li>
              <li>You cannot tell if it is real, outdated or invented.</li>
              <li>This is how wrong figures end up in real documents.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-status-good/30 bg-status-good/5 p-5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-status-good">
              Always
            </p>
            <p className="mt-2 font-mono text-[0.85rem] leading-relaxed text-ink-primary">
              “Here is the maternal mortality data for South Sudan [table]. What does it show?”
            </p>
            <ul className="mt-3 space-y-1.5 text-[0.83rem] leading-relaxed text-ink-secondary">
              <li>Now it is reading, not recalling.</li>
              <li>You can check every figure against the table you sent.</li>
              <li>That takes seconds.</li>
              <li>This is the difference between work you can sign and work you cannot.</li>
            </ul>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-[0.88rem] leading-relaxed text-ink-secondary">
          The{' '}
          <Link to="/" className="text-volt underline decoration-volt/30 underline-offset-2">
            tool on the front page
          </Link>{' '}
          has a <strong className="text-ink-primary">Copy AI prompt</strong> button that does
          this for you. It packages the real table, the unit, the source and the caveat.
        </p>
      </Section>

      <Section title="Four prompts worth keeping" lead="Copy, then replace the bracketed parts.">
        <div className="space-y-4">
          {PROMPTS.map((item) => (
            <div key={item.title} className="rounded-lg border border-hairline bg-surface-1 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-[0.95rem] font-semibold text-ink-primary">{item.title}</h3>
                  <p className="mt-1 text-[0.8rem] text-ink-muted">Use it when: {item.when}</p>
                </div>
                {/* Copy stays reachable without expanding — most people never need
                    to read the prompt, only to use it. */}
                <CopyButton label="Copy prompt" value={item.prompt} />
              </div>
              <div className="mt-3">
                <Expander question="Show the prompt" time={`${item.prompt.split(/\s+/).length} words`}>
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[0.75rem] leading-relaxed text-ink-secondary">
                    {item.prompt}
                  </pre>
                </Expander>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Which free tool" lead="Free tiers as of September 2026. Check before a deadline.">
        <Expander question="Compare the free AI tools" time={`${TOOLS.length} tools`}>
          <div className="overflow-x-auto rounded border border-hairline">
            <table className="w-full border-collapse text-[0.8rem]">
              <caption className="sr-only">Free AI tools compared</caption>
              <thead className="bg-surface-2">
                <tr>
                  <th scope="col" className="border-b border-hairline p-2.5 text-left font-semibold text-ink-primary">Tool</th>
                  <th scope="col" className="border-b border-hairline p-2.5 text-left font-semibold text-ink-primary">Best for</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((tool) => (
                  <tr key={tool.name} className="align-top even:bg-surface-1">
                    <th scope="row" className="p-2.5 text-left font-normal">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-semibold text-ink-primary underline decoration-hairline underline-offset-2 hover:decoration-volt"
                      >
                        {tool.name} ↗
                      </a>
                      <span className="mt-0.5 block text-[0.72rem] text-ink-muted">{tool.free}</span>
                    </th>
                    <td className="p-2.5 text-ink-secondary">
                      {tool.bestFor}
                      <span className="mt-1 block text-[0.73rem] text-ink-muted">{tool.note}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Expander>
      </Section>

      <Section
        title="Fetching data by describing it"
        lead="Describe what you want; a coding assistant writes the request. You do not need to read the code — but you do need to check the result."
      >
        <div className="space-y-4">
          <div className="text-[0.87rem] leading-relaxed text-ink-secondary">
            <ul className="space-y-2">
              <li>The UN data needs no key and no account.</li>
              <li>So an assistant can write you a working script from a plain description.</li>
              <li>
                The prompt below gives it the three things it cannot guess: the address, the
                request shape, and the answer shape.
              </li>
              <li>
                Without those it invents an API that does not exist. That is the most common
                failure here.
              </li>
              <li>Ask it to explain each line back to you.</li>
            </ul>
          </div>

          <div>
            <Expander question="Show the prompt to copy" time="reference">
            <CodeBlock
              label="prompt — copy this whole block"
              language="text"
              code={`Write me a short script that fetches data from the UN System Data Commons.

The API needs no key and allows cross-origin requests.

ENDPOINT
  POST https://unsd-datacommons.gcp.un-icc.cloud/api/observations/series
  Content-Type: application/json

REQUEST BODY
  {
    "variables": ["undata/sdg/EG_ACS_ELEC"],
    "entities":  ["country/BGD", "country/ETH"]
  }

RESPONSE SHAPE
  {
    "data": {
      "<variable id>": {
        "<country id>": {
          "series": [ { "date": "2024", "value": 99.4 }, ... ],
          "facet": "<id into the facets object>"
        }
      }
    },
    "facets": { "<id>": { "provenanceUrl": "...", "unitDisplayName": "..." } }
  }

WHAT I WANT
  - Fetch the indicator above for the countries above.
  - Print a table: country, year, value.
  - If a country returns an empty series, print "no data reported" for it
    rather than skipping it silently or printing zero.
  - Print the source URL from the facets object at the end.

Explain each step in plain language as a comment. I am not a programmer.`}
            />
            </Expander>
          </div>
        </div>
      </Section>

      <Section title="The data, in plain language" lead="What to tell an assistant, and what to check in its answer.">
        <div className="space-y-4">
          <div>
            <Expander question="What the data looks like underneath" time="5 terms">
            <dl className="space-y-2.5">
              {[
                [
                  'Variable (indicator)',
                  'undata/sdg/EG_ACS_ELEC',
                  'What is measured. The middle part names the publisher: sdg, who, unicef, unhcr, unodc.',
                ],
                [
                  'Entity (place)',
                  'country/BGD',
                  'Who it is measured for. Countries use three-letter codes. Regions use names like SouthernAsia.',
                ],
                [
                  'Observation',
                  '{ "date": "2024", "value": 99.4 }',
                  'One measurement: a year and a number. This is the atom of the whole system.',
                ],
                [
                  'Facet (provenance)',
                  '{ "provenanceUrl": "…", "unitDisplayName": "Percent" }',
                  'Where the number came from and what it is measured in. Always carry this through to your report.',
                ],
                [
                  'Dimension (breakdown)',
                  '.SEX--F, .AGE--Y0T17',
                  'A slice, added to the end of the indicator id. No suffix usually means the total — but not always, so check.',
                ],
              ].map(([term, code, meaning]) => (
                <div key={term} className="rounded-lg border border-hairline bg-surface-1 p-4">
                  <dt className="flex flex-wrap items-baseline gap-3">
                    <span className="text-[0.88rem] font-semibold text-ink-primary">{term}</span>
                    <code className="break-all font-mono text-[0.74rem] text-volt">{code}</code>
                  </dt>
                  <dd className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-secondary">{meaning}</dd>
                </div>
              ))}
            </dl>
            </Expander>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-1 p-5">
            <h3 className="text-[0.88rem] font-semibold text-ink-primary">
              Three things to check in any AI answer
            </h3>
            <ol className="mt-3 grid gap-3 text-[0.82rem] leading-relaxed text-ink-secondary sm:grid-cols-3">
              <li>
                <span className="font-semibold text-ink-primary">Do the figures match your table?</span>{' '}
                Pick three at random. If any differ, the model is paraphrasing rather than
                reading.
              </li>
              <li>
                <span className="font-semibold text-ink-primary">Did it invent a year?</span> Models
                fill gaps helpfully. A year that is not in your data is the most common
                fabrication, and the hardest to notice.
              </li>
              <li>
                <span className="font-semibold text-ink-primary">Did it keep the unit?</span>{' '}
                Percentages silently becoming counts, or rates per 100,000 becoming plain
                numbers, changes the meaning entirely.
              </li>
            </ol>
            <p className="mt-4 border-t border-hairline pt-3 text-[0.78rem] leading-relaxed text-ink-muted">
              If you would rather the assistant fetch the data itself, rather than being
              handed it, the platform has an MCP endpoint for exactly that — see{' '}
              <Link to="/connect" className="text-volt underline decoration-volt/30 underline-offset-2">
                Connect
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
