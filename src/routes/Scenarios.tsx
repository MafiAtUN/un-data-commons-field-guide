import { Link } from 'react-router-dom';
import { PageHeader, Section, Takeaway } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';
import { RecipeBuilder } from '../components/RecipeBuilder';
import { RecipeTabs } from '../components/RecipeTabs';
import { Expander } from '../components/Expander';
import { SCENARIOS, OUTCOME_LABELS, type DiscoveryStep, type Scenario } from '../content/scenarios';

/**
 * Start from the question.
 *
 * Every other page here is organised by what the platform offers. This one is
 * organised by what someone actually walks up and asks for, because the gap
 * between those two is where the afternoons go.
 *
 * The lead scenario is a real request — conflict against GDP per capita, as a
 * scatter — and it is the lead because the honest answer is that the chart
 * should not be drawn. Getting to that answer takes one request and one count,
 * and the whole argument of this page is that the count belongs before the
 * chart rather than after it.
 */
export function Scenarios() {
  return (
    <>
      <PageHeader
        eyebrow="Scenarios · 14 minutes"
        title="Start from the question, not from the endpoint"
        lead={
          <>
            Three requests as they actually arrive, worked end to end: how the identifier was
            found, which of the three endpoints answers, the code in six tools, and the thing
            the data does that the question did not anticipate. The dead ends are left in,
            because a discovery trail with the failures edited out teaches nobody how to search.
          </>
        }
      />

      <Section
        title="First, the part nobody documents: how do you find the thing to call?"
        lead="There are three endpoints and about 85,000 identifiers. The endpoint is never the problem."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              rung: 'Start with the shortlist',
              cost: 'Seconds',
              body: 'Twenty indicators, checked for coverage, in the Data Finder. If your question is one of the common ones you are already finished.',
              when: 'Works for maybe a third of requests.',
            },
            {
              rung: 'Then the search box',
              cost: 'A minute',
              body: 'The platform’s own resolver, which is what the Prompt Lab and step 1 of the builder below both call. Read the whole result list rather than taking the top hit — the right answer is often fourth or eighth.',
              when: 'Good for common concepts. Returns nothing at all for some ordinary topics.',
            },
            {
              rung: 'Then walk the graph',
              cost: 'Five minutes',
              body: 'Descend from a collection or an SDG goal to the leaf. Slower, and exact: it cannot return a plausible wrong answer, and it shows you the variants of your indicator you did not know existed.',
              when: 'Always works. This is the rung to reach for when search disappoints.',
            },
          ].map((item, index) => (
            <div key={item.rung} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="tnum font-mono text-[0.76rem] font-semibold text-volt">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[0.7rem] uppercase tracking-wide text-ink-muted">
                  {item.cost}
                </span>
              </div>
              <h3 className="mt-1.5 text-[0.9rem] font-semibold text-ink-primary">{item.rung}</h3>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-secondary">{item.body}</p>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-muted">{item.when}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-hairline bg-surface-1 p-5">
          <h3 className="text-[0.92rem] font-semibold text-ink-primary">
            The walk, as five commands
          </h3>
          <p className="mt-2 max-w-3xl text-[0.85rem] leading-relaxed text-ink-secondary">
            Two relation expressions do all of it.{' '}
            <code className="text-volt">&lt;-specializationOf</code> descends one level of the
            hierarchy; <code className="text-volt">&lt;-memberOf</code> returns the leaves you can
            request observations for. Every level looks the same, so this is five variations on
            one command rather than five things to learn.
          </p>
          <div className="mt-4">
            <CodeBlock
              label="collection → indicator → group → leaf"
              code={`API=https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2/node
walk () { curl -s -G "$API" --data-urlencode "nodes=$1" \\
                --data-urlencode "property=\${2:-<-specializationOf}"; }

walk undata/g/Root                  # the 16 contributing collections
walk undata/g/sdgf/goal-16          # or start from an SDG goal
walk undata/g/sdgf/target-16-1      # its indicators — note "ind", not "indicator"
walk undata/g/sdgf/ind-16-1-2       # the variants: counts, rates, civilian, unknown
walk undata/g/sdg/VC_DTH_TOTR.000 '<-memberOf'   # the fetchable leaf`}
            />
          </div>
          <p className="mt-3 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
            Run those five lines and you have watched the whole discovery problem dissolve. The
            fourth walk is the one that pays: it reveals that conflict deaths are published as a rate
            as well as a count, which changes the chart you were about to draw.
          </p>
        </div>
      </Section>

      <Section
        title="Build your own, against the live platform"
        lead="Search for an indicator, say what you are drawing, measure what it covers, and take the code in your tool. Everything here is a real request from your browser to data.un.org."
      >
        <RecipeBuilder />
      </Section>

      {SCENARIOS.map((scenario, index) => (
        <ScenarioSection key={scenario.slug} scenario={scenario} index={index + 1} />
      ))}

      <Section title="What these three have in common">
        <div className="grid gap-4 md:grid-cols-2">
          <Takeaway>
            <strong className="text-ink-primary">The endpoint is decided by the shape.</strong>{' '}
            Trend over named places is the series endpoint. One value across a region is REST v2
            with a containment expression. There is no third decision, which is why the builder
            makes it for you.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Search is a shortcut, not a method.</strong>{' '}
            It buried GDP per capita at position eight and returned nothing at all for conflict
            deaths. The graph walk found both, plus a rate variant that changed the analysis.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Count before you chart.</strong> One line —
            how many places does each indicator return, and how many survive the join — is the
            difference between a defensible figure and a chart that answers a question nobody
            asked.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Absence has a pattern.</strong> The countries
            missing from a series are rarely a random sample. When the missing ones are missing
            for a reason connected to what you are measuring, the join has chosen your sample
            for you.
          </Takeaway>
        </div>
        <p className="mt-4 max-w-3xl text-[0.85rem] leading-relaxed text-ink-secondary">
          The same scenarios worked inside a tool:{' '}
          <Link to="/dashboards" className="text-volt underline decoration-volt/30 underline-offset-2">
            Power BI and Tableau
          </Link>
          , or{' '}
          <Link to="/notebooks" className="text-volt underline decoration-volt/30 underline-offset-2">
            Python, R and Julia
          </Link>
          . For the endpoints themselves, the{' '}
          <Link to="/cookbook" className="text-volt underline decoration-volt/30 underline-offset-2">
            query cookbook
          </Link>
          .
        </p>
      </Section>
    </>
  );
}

function ScenarioSection({ scenario, index }: { scenario: Scenario; index: number }) {
  return (
    <Section
      id={scenario.slug}
      title={`Scenario ${index} — ${scenario.question}`}
      lead={scenario.lead}
    >
      <p className="-mt-2 mb-5 text-[0.8rem] text-ink-muted">Asked by: {scenario.asker}</p>

      <h3 className="text-[0.92rem] font-semibold text-ink-primary">
        Finding the identifier
        <span className="ml-2 font-normal text-ink-muted">
          {scenario.discovery.length} {scenario.discovery.length === 1 ? 'step' : 'steps'}, failures
          included
        </span>
      </h3>
      <ol className="mt-3 space-y-2.5">
        {scenario.discovery.map((step, position) => (
          <DiscoveryRow key={step.action} step={step} position={position + 1} />
        ))}
      </ol>

      <h3 className="mt-8 text-[0.92rem] font-semibold text-ink-primary">What you end up with</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {scenario.variables.map((variable) => (
          <div key={variable.dcid} className="rounded-lg border border-hairline bg-surface-1 p-4">
            <p className="text-[0.86rem] font-semibold text-ink-primary">{variable.name}</p>
            <code className="mt-1 block break-all font-mono text-[0.72rem] text-volt">
              {variable.dcid}
            </code>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-secondary">
              {variable.agency} ·{' '}
              <span className="tnum font-semibold text-ink-primary">
                {variable.countryCoverage}
              </span>{' '}
              countries · {variable.years}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <RecipeTabs spec={scenario.spec} />
      </div>

      <div className="mt-6 rounded-lg border border-status-warning/40 bg-surface-1 p-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-status-warning">
          Then the data says something the question did not expect
        </p>
        <h3 className="mt-2 text-[1rem] font-semibold text-ink-primary">
          {scenario.finding.headline}
        </h3>
        <p className="mt-2 max-w-3xl text-[0.87rem] leading-relaxed text-ink-secondary">
          {scenario.finding.body}
        </p>
      </div>

      <div className="mt-4 rounded-lg border-l-2 border-volt bg-surface-1 p-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-volt">
          So draw this instead
        </p>
        <p className="mt-2 max-w-3xl text-[0.87rem] leading-relaxed text-ink-secondary">
          {scenario.chart}
        </p>
      </div>
    </Section>
  );
}

const OUTCOME_STYLES: Record<DiscoveryStep['outcome'], string> = {
  'dead-end': 'border-status-critical/50 text-status-critical',
  'near-miss': 'border-status-warning/50 text-status-warning',
  found: 'border-volt/50 text-volt',
};

function DiscoveryRow({ step, position }: { step: DiscoveryStep; position: number }) {
  return (
    <li className="rounded-lg border border-hairline bg-surface-1 p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="tnum font-mono text-[0.76rem] font-semibold text-ink-muted">
          {String(position).padStart(2, '0')}
        </span>
        <span className="min-w-0 flex-1 text-[0.88rem] font-medium text-ink-primary">
          {step.action}
        </span>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${
            OUTCOME_STYLES[step.outcome]
          }`}
        >
          {OUTCOME_LABELS[step.outcome]}
        </span>
      </div>

      {step.call && (
        <div className="mt-3">
          <Expander question="Show the request" time="copy and run">
            <CodeBlock code={step.call} />
          </Expander>
        </div>
      )}

      <p className="mt-2.5 max-w-3xl text-[0.84rem] leading-relaxed text-ink-secondary">
        {step.result}
      </p>
    </li>
  );
}
