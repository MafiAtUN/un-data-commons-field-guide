import { PromptLab } from '../components/PromptLab';
import { PageHeader, Section, Takeaway } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';

export function Lab() {
  return (
    <>
      <PageHeader
        eyebrow="Prompt Lab"
        title="What the search box decides before it shows you anything"
        lead={
          <>
            A natural-language query is not a filter — it is an interpretation. The
            resolver has to commit to a place and to a set of statistical variables, and
            it will commit even when your question gave it nothing to go on. This page
            shows you those commitments for any question you like.
          </>
        }
      />

      <div className="mt-10">
        <PromptLab />
      </div>

      <Section
        title="The failure nobody warns you about"
        lead="Start with the first preset — the single word “violence” — and look at the place it resolved to."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 text-[0.9rem] leading-relaxed text-ink-secondary">
            <p>
              It answers <strong className="text-ink-primary">United States of America</strong>.
              Nothing in the question said so. The resolver needs a place to build a page
              around, so when it cannot find one it supplies a default — and then draws
              perfectly legitimate charts on top of that assumption.
            </p>
            <p>
              A chart titled “Number of Victims of Intentional Homicide” looks like a
              global figure. It is a US figure. If you screenshot it into a brief, the
              error is now yours and it is invisible.
            </p>
            <p>
              The fix is one word long: name the geography, every time. Say
              “worldwide”, or “in Sub-Saharan Africa”, or name the country. The Lab flags
              an inferred place with a warning so you can see the difference immediately.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-status-critical/30 bg-status-critical/5 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-status-critical">
                Don't
              </p>
              <code className="mt-2 block font-mono text-[0.8rem] text-ink-primary">violence</code>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-secondary">
                No place, no measure, no time frame. You get a country you did not choose.
              </p>
            </div>
            <div className="rounded-lg border border-status-good/30 bg-status-good/5 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-status-good">
                Do
              </p>
              <code className="mt-2 block font-mono text-[0.8rem] text-ink-primary">
                number of total conflict-related deaths in South Sudan
              </code>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-secondary">
                A measure phrased the way the database phrases it, and an explicit place.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="The four moves that make a prompt precise"
        lead="Each one changes the resolver's behaviour in a way you can watch in the Lab above."
      >
        <ol className="space-y-3">
          <Move
            n="1"
            move="Name the place — always"
            why="Omitting it does not give you a world total. It gives you a guess."
            example="… in South Sudan · … worldwide · … across countries in Africa"
          />
          <Move
            n="2"
            move="Use the database's noun, not yours"
            why="“War deaths” is not an indicator. “Conflict-related deaths” is SDG 16.1.2. Matching the official phrasing pulls the right series to the top instead of a near neighbour."
            example="conflict-related deaths · intentional homicide · access to electricity · human development index"
          />
          <Move
            n="3"
            move="Say “compare … across countries in X” to change the chart form"
            why="This phrasing is what promotes a single line into a map and a ranking across a whole region. Without it you get one place's time series."
            example="compare homicide rate across countries in Africa"
          />
          <Move
            n="4"
            move="Ask for the breakdown you need by name"
            why="Sex, age, urban/rural and wealth quintile all exist as separate variables. Naming one brings the sliced series forward; leaving it out gets you the total."
            example="… of children under 18 · … by sex · … in rural areas"
          />
        </ol>
      </Section>

      <Section
        title="When to stop prompting"
        lead="Natural language is for finding the indicator. Once you know its identifier, ask for it directly."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 text-[0.9rem] leading-relaxed text-ink-secondary">
            <p>
              Every variable in the Lab's results is listed with its dcid. That string is
              the durable address of the series. Once you have it, the search box is a
              detour: you can fetch the numbers directly, pin the exact slice, and get a
              response you can put in a script.
            </p>
            <p>
              This is also the honest answer to reproducibility. A prompt is a question
              whose interpretation may change as the resolver improves. A dcid is an
              address that will not.
            </p>
          </div>
          <CodeBlock
            label="the same answer, addressed directly"
            code={`curl -s -X POST \\
  'https://unsd-datacommons.gcp.un-icc.cloud/api/observations/series' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "variables": ["undata/sdg/VC_DTH_TOTN"],
    "entities":  ["country/SSD"]
  }'`}
          />
        </div>

        <div className="mt-6">
          <Takeaway>
            Use natural language to <em>discover</em> the indicator, then switch to its dcid
            to <em>retrieve</em> it. Prompting is a search strategy; identifiers are a data
            strategy. The <a href="/cookbook" className="text-un-blue underline decoration-un-blue/30 underline-offset-2">query cookbook</a> picks up from here.
          </Takeaway>
        </div>
      </Section>
    </>
  );
}

function Move({ n, move, why, example }: { n: string; move: string; why: string; example: string }) {
  return (
    <li className="flex gap-4 rounded-lg border border-hairline bg-surface-1 p-4">
      <span className="tnum shrink-0 font-mono text-[0.8rem] font-semibold text-un-blue">{n}</span>
      <div>
        <h3 className="text-[0.92rem] font-semibold text-ink-primary">{move}</h3>
        <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-secondary">{why}</p>
        <p className="mt-2 font-mono text-[0.74rem] leading-relaxed text-ink-muted">{example}</p>
      </div>
    </li>
  );
}
