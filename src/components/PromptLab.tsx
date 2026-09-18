import { useMemo, useState } from 'react';
import { resolveQuestion } from '../lib/undc/client';
import { searchUrl } from '../lib/undc/config';
import { summarizeResolution, type ResolutionSummary } from '../lib/undc/resolution';
import { SNAPSHOT_KEYS } from '../lib/undc/snapshots';
import { useSourcedData } from '../lib/undc/useSourcedData';
import { AGENCY_LABELS } from '../lib/undc/dcid';
import type { DetectAndFulfillResponse } from '../lib/undc/types';
import { OriginBadge } from './OriginBadge';

/**
 * Preset questions, chosen to isolate one variable of prompt design each.
 *
 * Each has a recorded snapshot, so the comparison is reproducible even when the
 * resolver is unreachable.
 */
const PRESETS = [
  {
    label: 'No place named',
    question: 'violence',
    snapshot: SNAPSHOT_KEYS.promptVague,
    lesson: 'One bare noun. Watch which country it decides you meant.',
  },
  {
    label: 'Indicator + place',
    question: 'number of total conflict-related deaths in South Sudan',
    snapshot: SNAPSHOT_KEYS.promptPrecise,
    lesson: 'Name the measure the way the database names it, and name the place.',
  },
  {
    label: 'Cross-country comparison',
    question: 'compare homicide rate across countries in Africa',
    snapshot: SNAPSHOT_KEYS.promptRegional,
    lesson: '"compare … across countries in X" is what turns a line into a map and a ranking.',
  },
  {
    label: 'Asking for a disaggregation',
    question: 'conflict related deaths of children under 18 in South Sudan by year',
    snapshot: SNAPSHOT_KEYS.promptDisaggregated,
    lesson: 'Naming the breakdown you want pulls the sliced variables to the front.',
  },
] as const;

type Preset = (typeof PRESETS)[number];

/**
 * The Prompt Lab.
 *
 * Send a question to the same resolver that powers the search box on data.un.org
 * and read back its two hidden decisions — the place it locked onto and the
 * variables it picked — before any chart is drawn over them.
 */
export function PromptLab() {
  const [selected, setSelected] = useState<Preset>(PRESETS[0]);
  const [draft, setDraft] = useState<string>(PRESETS[0].question);
  const [submitted, setSubmitted] = useState<string>(PRESETS[0].question);

  // A hand-typed question has no recording of its own, so it borrows the
  // selected preset's key; the badge then reports "cached", which is accurate —
  // the answer on screen is not for the question in the box.
  const isCustom = submitted !== selected.question;

  const state = useSourcedData<DetectAndFulfillResponse>(
    selected.snapshot,
    (signal) => resolveQuestion(submitted, { signal }),
    [submitted],
  );

  const summary = useMemo<ResolutionSummary | undefined>(
    () => (state.data ? summarizeResolution(submitted, state.data) : undefined),
    [state.data, submitted],
  );

  function choose(preset: Preset) {
    setSelected(preset);
    setDraft(preset.question);
    setSubmitted(preset.question);
  }

  return (
    <section className="rounded-lg border border-hairline bg-surface-1">
      <div className="border-b border-hairline p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink-primary">Prompt Lab</h2>
            <p className="mt-1 max-w-2xl text-[0.85rem] leading-relaxed text-ink-secondary">
              Every question you type into data.un.org is resolved into a place and a
              set of statistical variables before a single chart is drawn. Those two
              decisions are what determine whether you get the number you meant. Here
              they are, in the open.
            </p>
          </div>
          <OriginBadge
            origin={state.origin}
            retrievedAt={state.retrievedAt}
            liveError={state.liveError}
          />
        </div>

        {/* One control row above everything it scopes. */}
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.question}
              type="button"
              onClick={() => choose(preset)}
              aria-pressed={selected.question === preset.question && !isCustom}
              className={`rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${
                selected.question === preset.question && !isCustom
                  ? 'border-volt/60 bg-volt/10 text-ink-primary'
                  : 'border-hairline text-ink-secondary hover:border-ink-muted hover:text-ink-primary'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(draft.trim() || selected.question);
          }}
        >
          <label className="flex-1 basis-80">
            <span className="sr-only">Question to resolve</span>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask the UN System Data Commons something…"
              className="w-full rounded border border-hairline bg-surface-0 px-3 py-2 font-mono text-[0.8rem] text-ink-primary placeholder:text-ink-muted"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-volt px-4 py-2 text-[0.8rem] font-semibold text-surface-0 transition-opacity hover:opacity-90"
          >
            Resolve
          </button>
          <a
            href={searchUrl(submitted)}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded border border-hairline px-4 py-2 text-[0.8rem] font-medium text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink-primary"
          >
            Open on data.un.org ↗
          </a>
        </form>

        <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-muted">
          <span className="font-medium text-ink-secondary">What this preset isolates:</span>{' '}
          {selected.lesson}
        </p>
      </div>

      <div
        className={`p-5 transition-opacity duration-200 ${
          state.isLoading ? 'opacity-40' : 'opacity-100'
        }`}
      >
        {summary ? (
          <ResolutionReport question={submitted} summary={summary} />
        ) : (
          <p className="text-[0.85rem] text-ink-muted">
            {state.isLoading ? 'Resolving…' : 'No resolution available for this question.'}
          </p>
        )}
      </div>
    </section>
  );
}

function ResolutionReport({
  question,
  summary,
}: {
  question: string;
  summary: ResolutionSummary;
}) {
  const byAgency = useMemo(() => {
    const groups = new Map<string, number>();
    for (const indicator of summary.indicators) {
      groups.set(indicator.agency, (groups.get(indicator.agency) ?? 0) + 1);
    }
    return [...groups.entries()].sort((a, b) => b[1] - a[1]);
  }, [summary.indicators]);

  return (
    <div className="space-y-5">
      {summary.failure && (
        <p className="rounded border border-status-critical/30 bg-status-critical/5 p-3 text-[0.8rem] text-ink-secondary">
          <span className="font-semibold text-status-critical">Resolver could not answer.</span>{' '}
          {summary.failure}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Decision
          heading="Place it committed to"
          value={summary.place?.name ?? 'none'}
          mono={summary.place?.dcid}
          warning={
            summary.placeWasInferred
              ? 'Your question named no place, so the resolver supplied one. Every chart below is about this country — not a global figure.'
              : undefined
          }
        />
        <Decision heading="Variables it selected" value={String(summary.indicators.length)} />
        <Decision
          heading="Chart forms proposed"
          value={summary.tileTypes.length > 0 ? summary.tileTypes.join(', ') : '—'}
          mono={`${summary.blockCount} result ${summary.blockCount === 1 ? 'section' : 'sections'}`}
        />
      </div>

      {byAgency.length > 0 && (
        <div>
          <h4 className="text-[0.78rem] font-semibold uppercase tracking-wide text-ink-muted">
            Which collections answered
          </h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {byAgency.map(([agency, count]) => (
              <li
                key={agency}
                className="rounded border border-hairline bg-surface-2 px-2.5 py-1 text-[0.73rem] text-ink-secondary"
              >
                {AGENCY_LABELS[agency] ?? agency}
                <span className="tnum ml-1.5 text-ink-muted">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-[0.78rem] font-semibold uppercase tracking-wide text-ink-muted">
          The variables behind the answer
        </h4>
        <p className="mt-1 text-[0.75rem] text-ink-muted">
          These are the identifiers you would use to fetch the same numbers over the
          API — copy one and you have skipped the search box entirely.
        </p>
        <ul className="mt-3 divide-y divide-hairline overflow-hidden rounded border border-hairline">
          {summary.indicators.slice(0, 12).map((indicator) => (
            <li key={indicator.dcid} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 bg-surface-0 p-2.5">
              <code className="font-mono text-[0.72rem] text-volt">{indicator.dcid}</code>
              <span className="min-w-0 flex-1 text-[0.75rem] text-ink-secondary">
                {indicator.name}
              </span>
              {indicator.dimensions.length > 0 && (
                <span className="text-[0.7rem] text-ink-muted">
                  {indicator.dimensions.join(' · ')}
                </span>
              )}
            </li>
          ))}
        </ul>
        {summary.indicators.length > 12 && (
          <p className="mt-2 text-[0.72rem] text-ink-muted">
            …and {summary.indicators.length - 12} more for this one question.
          </p>
        )}
      </div>

      <p className="border-t border-hairline pt-4 font-mono text-[0.72rem] leading-relaxed text-ink-muted">
        POST /api/explore/detect-and-fulfill?q={encodeURIComponent(question)}
      </p>
    </div>
  );
}

function Decision({
  heading,
  value,
  mono,
  warning,
}: {
  heading: string;
  value: string;
  mono?: string;
  warning?: string;
}) {
  return (
    <div
      className={`rounded border p-3 ${
        warning ? 'border-status-warning/40 bg-status-warning/5' : 'border-hairline bg-surface-0'
      }`}
    >
      <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-muted">
        {heading}
      </div>
      <div className="mt-1.5 text-[0.95rem] font-semibold text-ink-primary">{value}</div>
      {mono && <div className="mt-0.5 font-mono text-[0.7rem] text-ink-muted">{mono}</div>}
      {warning && (
        <p className="mt-2 flex gap-1.5 text-[0.72rem] leading-relaxed text-ink-secondary">
          <span aria-hidden="true" className="font-semibold text-status-warning">!</span>
          <span>{warning}</span>
        </p>
      )}
    </div>
  );
}
