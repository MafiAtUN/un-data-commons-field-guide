import { Link } from 'react-router-dom';
import { RecipeTabs } from './RecipeTabs';
import type { Scenario } from '../content/scenarios';
import type { Tool } from '../lib/undc/recipes';

/**
 * A scenario, compressed to what a reader of a tool-specific page needs.
 *
 * The full trail lives on /scenarios. Here the question, the identifiers, the
 * call and the finding are enough — with the code opening on the tool whose
 * page this is, so a Power BI reader is not shown curl first and left to
 * translate.
 */
export function ScenarioBrief({
  scenario,
  tool,
  children,
}: {
  scenario: Scenario;
  tool: Tool;
  /** Tool-specific follow-through: the join, the model, the chart settings. */
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border-l-2 border-volt bg-surface-1 p-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-volt">
          Somebody asks
        </p>
        <p className="mt-2 text-[1.02rem] leading-snug text-ink-primary">
          “{scenario.question}”
        </p>
        <p className="mt-2 text-[0.8rem] text-ink-muted">{scenario.asker}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {scenario.variables.map((variable) => (
          <div key={variable.dcid} className="rounded-lg border border-hairline bg-surface-1 p-4">
            <p className="text-[0.86rem] font-semibold text-ink-primary">{variable.name}</p>
            <code className="mt-1 block break-all font-mono text-[0.72rem] text-volt">
              {variable.dcid}
            </code>
            <dl className="mt-2.5 space-y-1 text-[0.78rem] text-ink-secondary">
              <div className="flex gap-2">
                <dt className="shrink-0 text-ink-muted">Found by</dt>
                <dd>{variable.foundBy}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-ink-muted">Covers</dt>
                <dd>
                  <span className="tnum font-semibold text-ink-primary">
                    {variable.countryCoverage}
                  </span>{' '}
                  countries · {variable.years}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <RecipeTabs spec={scenario.spec} initialTool={tool} label="The call this scenario needs" />

      <div className="rounded-lg border border-status-warning/40 bg-surface-1 p-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-status-warning">
          What the data does that the question did not expect
        </p>
        <h3 className="mt-2 text-[0.98rem] font-semibold text-ink-primary">
          {scenario.finding.headline}
        </h3>
        <p className="mt-2 max-w-3xl text-[0.86rem] leading-relaxed text-ink-secondary">
          {scenario.finding.body}
        </p>
      </div>

      {children}

      <p className="text-[0.82rem] leading-relaxed text-ink-muted">
        The full discovery trail for this one — including the two searches that failed and the
        four graph walks that did not —{' '}
        <Link
          to="/scenarios"
          className="text-volt underline decoration-volt/30 underline-offset-2 hover:decoration-volt"
        >
          is on the scenarios page
        </Link>
        .
      </p>
    </div>
  );
}
