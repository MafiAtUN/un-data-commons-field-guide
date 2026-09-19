import { useState } from 'react';
import { searchUrl } from '../../lib/undc/config';

/**
 * Before and after, because the change is easy to state and easy to disbelieve.
 *
 * The data was never behind a paywall. It was behind *forty front doors* — each
 * agency with its own database, its own export, its own country codes and its
 * own idea of what a year is. The work was never getting permission. It was
 * reconciling.
 *
 * So the demonstration is not "look, data" — it is one question landing across
 * all of it at once.
 */
const QUESTIONS = [
  {
    ask: 'maternal mortality in Bangladesh',
    was: 'WHO database → find indicator → export → fix country codes',
    now: 'One answer, with the agency and the year attached.',
  },
  {
    ask: 'compare homicide rate across countries in Africa',
    was: 'UNODC portal → 54 country pages → paste into a spreadsheet',
    now: 'A map and a ranking, in one request.',
  },
  {
    ask: 'refugees from South Sudan by year',
    was: 'UNHCR statistics → pick a population type → reconcile with SDG figures',
    now: 'The series, already joined to everything else.',
  },
] as const;

export function TheWand() {
  const [active, setActive] = useState(0);
  const question = QUESTIONS[active]!;

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      {/* ---------- Pick a question ---------- */}
      <div>
        <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-ink-muted">
          Try one
        </p>
        <ul className="mt-3 space-y-2">
          {QUESTIONS.map((item, index) => (
            <li key={item.ask}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={index === active}
                className={`w-full rounded-lg border px-3.5 py-3 text-left font-mono text-[0.8rem] leading-snug transition-colors ${
                  index === active
                    ? 'border-accent-aqua/50 bg-accent-aqua/10 text-ink-primary'
                    : 'border-hairline text-ink-secondary hover:border-ink-muted hover:text-ink-primary'
                }`}
              >
                “{item.ask}”
              </button>
            </li>
          ))}
        </ul>

        <a
          href={searchUrl(question.ask)}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-block rounded-lg bg-accent-aqua px-4 py-2.5 text-[0.85rem] font-semibold text-surface-0 transition-opacity hover:opacity-90"
        >
          Ask it for real ↗
        </a>
      </div>

      {/* ---------- Before / after ---------- */}
      <div className="grid content-start gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-surface-0 p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            The old way
          </p>
          <p className="mt-2.5 text-[0.86rem] leading-relaxed text-ink-secondary">{question.was}</p>
          <p className="mt-3 border-t border-hairline pt-3 text-[0.78rem] text-ink-muted">
            Free the whole time. Just scattered.
          </p>
        </div>

        <div className="rounded-lg border border-accent-aqua/40 bg-accent-aqua/[0.08] p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent-aqua-ink">
            The wand
          </p>
          <p className="mt-2.5 text-[0.86rem] leading-relaxed text-ink-secondary">{question.now}</p>
          <p className="mt-3 border-t border-accent-aqua/25 pt-3 text-[0.78rem] text-ink-muted">
            Same data. One question.
          </p>
        </div>
      </div>
    </div>
  );
}
