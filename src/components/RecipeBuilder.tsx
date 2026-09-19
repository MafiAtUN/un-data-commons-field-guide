import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RecipeTabs } from './RecipeTabs';
import { COUNTRIES } from '../content/countries';
import { INDICATORS } from '../content/indicators';
import { fetchObservationsByCountry, resolveQuestion } from '../lib/undc/client';
import { summarizeResolution, type ResolvedIndicator } from '../lib/undc/resolution';
import { specProblems, type RecipeSpec, type Shape } from '../lib/undc/recipes';
import { UndcRequestError } from '../lib/undc/http';

/**
 * Find the identifier, check what it covers, take the code.
 *
 * This is the site's answer to the question every other page only answers in
 * prose: *how do I find the thing to call?* The endpoints are three and fixed.
 * The identifier is one of about 85,000 and is the entire difficulty.
 *
 * Three things happen here that a documentation page cannot do:
 *
 *  1. The search is the platform's own resolver, so what you see is what the
 *     site's search box would have matched — including when it matches nothing,
 *     which for some topics it does.
 *  2. Coverage is measured, not promised. Picking two indicators and pressing
 *     the check runs the real regional call for each and reports how many
 *     places came back — and, for a scatter, how many survive the join. That
 *     number is the one that decides whether the chart is worth drawing, and it
 *     is normally discovered after an afternoon of work rather than before.
 *  3. The code comes out in six tools, generated from the same spec, so nobody
 *     has to translate a curl example into M by hand.
 *
 * Nothing is stored and nothing is proxied: every request goes from the
 * reader's browser to data.un.org, which is why the deployment's permissive
 * CORS matters.
 */

type Status =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'done'; indicators: ResolvedIndicator[]; placeWasInferred: boolean; place?: string };

interface Coverage {
  dcid: string;
  count: number;
  years: string[];
}

type CoverageStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'done'; rows: Coverage[]; shared: number };

/** Regions worth offering. The graph holds thirty; these are the ones people ask for. */
const REGIONS: readonly { dcid: string; label: string }[] = [
  { dcid: 'Earth', label: 'Every country' },
  { dcid: 'africa', label: 'Africa' },
  { dcid: 'asia', label: 'Asia' },
  { dcid: 'europe', label: 'Europe' },
  { dcid: 'EasternAfrica', label: 'Eastern Africa' },
  { dcid: 'WesternAfrica', label: 'Western Africa' },
  { dcid: 'SouthernAsia', label: 'Southern Asia' },
  { dcid: 'LatinAmericaAndCaribbean', label: 'Latin America & Caribbean' },
];

const SHAPES: readonly { value: Shape; label: string; hint: string }[] = [
  { value: 'trend', label: 'Trend over time', hint: 'Every year, for places you name' },
  { value: 'ranking', label: 'Ranking or map', hint: 'One value per country in a region' },
  { value: 'scatter', label: 'Scatter', hint: 'Two indicators, one point per country' },
];

const DEFAULT_COUNTRIES = ['country/BGD', 'country/ETH', 'country/KEN'];

export function RecipeBuilder() {
  const [shape, setShape] = useState<Shape>('scatter');
  const [chosen, setChosen] = useState<string[]>([
    'undata/unicef/SPP_GDPPC',
    'undata/sdg/VC_DTH_TOTR',
  ]);
  const [names, setNames] = useState<Record<string, string>>({
    'undata/unicef/SPP_GDPPC': 'GDP per capita, current US dollars',
    'undata/sdg/VC_DTH_TOTR': 'Conflict-related deaths per 100,000 population',
  });
  const [region, setRegion] = useState('Earth');
  const [countries, setCountries] = useState<string[]>(DEFAULT_COUNTRIES);
  const [date, setDate] = useState('LATEST');

  const [query, setQuery] = useState('');
  const [search, setSearch] = useState<Status>({ state: 'idle' });
  const [coverage, setCoverage] = useState<CoverageStatus>({ state: 'idle' });

  const inFlight = useRef<AbortController | null>(null);
  useEffect(() => () => inFlight.current?.abort(), []);

  const spec = useMemo<RecipeSpec>(
    () => ({
      variables: chosen,
      entities: shape === 'trend' ? countries : [],
      parentPlace: shape === 'trend' ? undefined : region,
      shape,
      date: shape === 'trend' ? undefined : date,
    }),
    [chosen, countries, region, shape, date],
  );

  const problems = useMemo(() => specProblems(spec), [spec]);

  // Any change to what is being fetched invalidates a measured coverage.
  useEffect(() => setCoverage({ state: 'idle' }), [chosen, region, date, shape]);

  const runSearch = useCallback(async () => {
    const question = query.trim();
    if (!question) return;

    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    setSearch({ state: 'loading' });

    try {
      const { data } = await resolveQuestion(question, { signal: controller.signal });
      const summary = summarizeResolution(question, data);
      setSearch({
        state: 'done',
        indicators: summary.indicators,
        placeWasInferred: summary.placeWasInferred,
        place: summary.place?.name,
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      setSearch({
        state: 'error',
        message:
          error instanceof UndcRequestError
            ? `The resolver ${error.message}.`
            : 'The resolver could not be reached.',
      });
    }
  }, [query]);

  const runCoverage = useCallback(async () => {
    if (chosen.length === 0) return;
    setCoverage({ state: 'loading' });

    try {
      const results = await Promise.all(
        chosen.map(async (dcid) => {
          const { data } = await fetchObservationsByCountry({
            variable: dcid,
            parentPlace: shape === 'trend' ? 'Earth' : region,
            date: shape === 'trend' ? 'LATEST' : date,
          });
          const byEntity = data.byVariable?.[dcid]?.byEntity ?? {};
          const entities: string[] = [];
          const years = new Set<string>();

          for (const [entity, block] of Object.entries(byEntity)) {
            const observation = block.orderedFacets?.[0]?.observations?.[0];
            if (!observation) continue;
            entities.push(entity);
            years.add(observation.date);
          }
          return { dcid, entities, count: entities.length, years: [...years].sort() };
        }),
      );

      // The number that decides whether a scatter is worth drawing.
      const shared = results
        .map((result) => new Set(result.entities))
        .reduce((left, right) => new Set([...left].filter((entity) => right.has(entity))));

      setCoverage({
        state: 'done',
        rows: results.map(({ dcid, count, years }) => ({ dcid, count, years })),
        shared: shared.size,
      });
    } catch (error) {
      setCoverage({
        state: 'error',
        message:
          error instanceof UndcRequestError
            ? `The platform ${error.message}.`
            : 'The coverage check could not be run.',
      });
    }
  }, [chosen, region, date, shape]);

  function toggleIndicator(dcid: string, name: string) {
    setChosen((current) => {
      if (current.includes(dcid)) return current.filter((entry) => entry !== dcid);
      // Two is the useful maximum: a scatter needs two and nothing here needs three.
      return current.length >= 2 ? [current[1]!, dcid] : [...current, dcid];
    });
    setNames((current) => ({ ...current, [dcid]: name }));
  }

  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-5">
      <Step number={1} title="Find the indicator" hint="Searches data.un.org as you would">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runSearch();
          }}
          className="flex flex-wrap gap-2"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="maternal mortality, GDP per capita, access to electricity…"
            aria-label="Describe the indicator you need"
            className="min-w-0 flex-1 rounded border border-hairline bg-surface-0 px-3 py-2 text-[0.85rem] text-ink-primary outline-none placeholder:text-ink-muted/70 focus:border-volt/60"
          />
          <button
            type="submit"
            disabled={search.state === 'loading' || !query.trim()}
            className="min-h-10 rounded bg-volt px-4 text-[0.8rem] font-semibold text-surface-0 transition-opacity disabled:opacity-40"
          >
            {search.state === 'loading' ? 'Searching…' : 'Search'}
          </button>
        </form>

        <SearchResults
          status={search}
          chosen={chosen}
          onToggle={toggleIndicator}
        />

        <details className="mt-3">
          <summary className="cursor-pointer text-[0.8rem] text-ink-muted hover:text-ink-secondary">
            Or pick from the checked shortlist
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {INDICATORS.map((indicator) => (
              <button
                key={indicator.dcid}
                type="button"
                onClick={() => toggleIndicator(indicator.dcid, indicator.name)}
                aria-pressed={chosen.includes(indicator.dcid)}
                className={`rounded border px-2.5 py-1 text-[0.74rem] transition-colors ${
                  chosen.includes(indicator.dcid)
                    ? 'border-volt bg-volt/10 text-volt'
                    : 'border-hairline text-ink-secondary hover:border-volt/50 hover:text-ink-primary'
                }`}
              >
                {indicator.name}
              </button>
            ))}
          </div>
        </details>

        {chosen.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {chosen.map((dcid) => (
              <li
                key={dcid}
                className="flex items-start justify-between gap-3 rounded border border-volt/30 bg-volt/5 px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block text-[0.82rem] text-ink-primary">
                    {names[dcid] ?? dcid}
                  </span>
                  <code className="block break-all font-mono text-[0.7rem] text-volt">{dcid}</code>
                </span>
                <button
                  type="button"
                  onClick={() => setChosen((current) => current.filter((entry) => entry !== dcid))}
                  aria-label={`Remove ${names[dcid] ?? dcid}`}
                  className="shrink-0 text-[0.75rem] text-ink-muted hover:text-ink-primary"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Step>

      <Step number={2} title="Say what you are drawing" hint="This picks the endpoint for you">
        <div className="flex flex-wrap gap-2">
          {SHAPES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setShape(option.value)}
              aria-pressed={shape === option.value}
              className={`rounded border px-3 py-2 text-left transition-colors ${
                shape === option.value
                  ? 'border-volt bg-volt/10'
                  : 'border-hairline hover:border-volt/50'
              }`}
            >
              <span
                className={`block text-[0.82rem] font-medium ${
                  shape === option.value ? 'text-volt' : 'text-ink-primary'
                }`}
              >
                {option.label}
              </span>
              <span className="block text-[0.72rem] text-ink-muted">{option.hint}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {shape === 'trend' ? (
            <label className="block">
              <span className="block text-[0.76rem] text-ink-muted">Countries</span>
              <select
                multiple
                value={countries}
                onChange={(event) =>
                  setCountries([...event.target.selectedOptions].map((option) => option.value))
                }
                className="mt-1 h-32 w-full rounded border border-hairline bg-surface-0 px-2 py-1 text-[0.8rem] text-ink-primary"
              >
                {Object.entries(COUNTRIES)
                  .sort((a, b) => a[1].localeCompare(b[1]))
                  .map(([dcid, name]) => (
                    <option key={dcid} value={dcid}>
                      {name}
                    </option>
                  ))}
              </select>
            </label>
          ) : (
            <>
              <label className="block">
                <span className="block text-[0.76rem] text-ink-muted">Compare across</span>
                <select
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  className="mt-1 w-full rounded border border-hairline bg-surface-0 px-2 py-2 text-[0.8rem] text-ink-primary"
                >
                  {REGIONS.map((option) => (
                    <option key={option.dcid} value={option.dcid}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-[0.76rem] text-ink-muted">
                  Reference year — LATEST mixes vintages
                </span>
                <input
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  placeholder="LATEST or 2024"
                  className="mt-1 w-full rounded border border-hairline bg-surface-0 px-2 py-2 font-mono text-[0.8rem] text-ink-primary outline-none focus:border-volt/60"
                />
              </label>
            </>
          )}
        </div>
      </Step>

      <Step
        number={3}
        title="Check what it covers, before you build anything"
        hint="Runs the real call"
      >
        <button
          type="button"
          onClick={() => void runCoverage()}
          disabled={chosen.length === 0 || coverage.state === 'loading'}
          className="min-h-10 rounded border border-volt/50 px-4 text-[0.8rem] font-semibold text-volt transition-colors hover:bg-volt/10 disabled:opacity-40"
        >
          {coverage.state === 'loading' ? 'Measuring…' : 'Measure coverage'}
        </button>
        <CoverageReport status={coverage} names={names} shape={shape} />
      </Step>

      <Step number={4} title="Take the code" hint="Same request, six tools">
        {problems.length > 0 ? (
          <ul className="space-y-1.5">
            {problems.map((problem) => (
              <li key={problem} className="flex gap-2 text-[0.82rem] text-ink-secondary">
                <span aria-hidden="true" className="font-semibold text-status-warning">
                  !
                </span>
                {problem}
              </li>
            ))}
          </ul>
        ) : (
          <RecipeTabs spec={spec} label="Your call" />
        )}
      </Step>
    </div>
  );
}

function Step({
  number,
  title,
  hint,
  children,
}: {
  number: number;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-hairline py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-baseline gap-3">
        <span className="tnum font-mono text-[0.76rem] font-semibold text-volt">
          {String(number).padStart(2, '0')}
        </span>
        <h3 className="text-[0.95rem] font-semibold text-ink-primary">{title}</h3>
        <span className="text-[0.72rem] text-ink-muted">{hint}</span>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SearchResults({
  status,
  chosen,
  onToggle,
}: {
  status: Status;
  chosen: readonly string[];
  onToggle: (dcid: string, name: string) => void;
}) {
  if (status.state === 'idle') return null;

  if (status.state === 'loading') {
    return <p className="mt-3 text-[0.82rem] text-ink-muted">Asking data.un.org…</p>;
  }

  if (status.state === 'error') {
    return (
      <p className="mt-3 text-[0.82rem] text-status-warning">
        {status.message} The shortlist below still works offline.
      </p>
    );
  }

  if (status.indicators.length === 0) {
    return (
      <div className="mt-3 rounded border border-status-warning/40 bg-surface-0 p-3">
        <p className="text-[0.82rem] leading-relaxed text-ink-secondary">
          <span className="font-semibold text-ink-primary">No variables matched.</span> This is a
          real answer, not an outage — the resolver returns nothing for some perfectly ordinary
          topics, conflict deaths among them. When it does, walk the graph instead: start at{' '}
          <code className="text-volt">undata/g/Root</code> or at the SDG goal your indicator
          belongs to.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {status.placeWasInferred && status.place && (
        <p className="mb-2 text-[0.78rem] text-ink-muted">
          The resolver also committed to a place you did not name —{' '}
          <span className="text-status-warning">{status.place}</span>. It always does. It does not
          affect the identifiers below, but it is why its charts can be about the wrong country.
        </p>
      )}
      <ul className="max-h-64 space-y-1 overflow-y-auto">
        {status.indicators.map((indicator) => {
          const selected = chosen.includes(indicator.dcid);
          return (
            <li key={indicator.dcid}>
              <button
                type="button"
                onClick={() => onToggle(indicator.dcid, indicator.name)}
                aria-pressed={selected}
                className={`w-full rounded border px-3 py-2 text-left transition-colors ${
                  selected
                    ? 'border-volt bg-volt/10'
                    : 'border-hairline hover:border-volt/50 hover:bg-surface-2/40'
                }`}
              >
                <span className="block text-[0.82rem] text-ink-primary">{indicator.name}</span>
                <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                  <code className="break-all font-mono text-[0.7rem] text-volt">
                    {indicator.dcid}
                  </code>
                  <span className="text-[0.68rem] uppercase tracking-wide text-ink-muted">
                    {indicator.agency}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CoverageReport({
  status,
  names,
  shape,
}: {
  status: CoverageStatus;
  names: Record<string, string>;
  shape: Shape;
}) {
  if (status.state === 'idle') {
    return (
      <p className="mt-3 max-w-3xl text-[0.8rem] leading-relaxed text-ink-muted">
        Two indicators from two agencies rarely cover the same countries. This runs the real
        request for each and reports how many places answered — and how many survive the join.
      </p>
    );
  }

  if (status.state === 'loading') {
    return <p className="mt-3 text-[0.82rem] text-ink-muted">Running the live call…</p>;
  }

  if (status.state === 'error') {
    return <p className="mt-3 text-[0.82rem] text-status-warning">{status.message}</p>;
  }

  const smallest = Math.min(...status.rows.map((row) => row.count));
  const lost = smallest - status.shared;

  return (
    <div className="mt-3 space-y-2">
      {status.rows.map((row) => (
        <div
          key={row.dcid}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded border border-hairline bg-surface-0 px-3 py-2"
        >
          <span className="text-[0.82rem] text-ink-primary">{names[row.dcid] ?? row.dcid}</span>
          <span className="flex items-baseline gap-3 text-[0.78rem]">
            <span className="tnum font-semibold text-volt">{row.count} places</span>
            <span className={row.years.length > 1 ? 'text-status-warning' : 'text-ink-muted'}>
              {row.years.length === 1
                ? `all ${row.years[0]}`
                : `${row.years.length} reference years (${row.years[0]}–${row.years[row.years.length - 1]})`}
            </span>
          </span>
        </div>
      ))}

      {status.rows.length > 1 && (
        <div className="rounded border-l-2 border-volt bg-surface-0 px-3 py-2.5">
          <p className="text-[0.84rem] text-ink-primary">
            <span className="tnum font-semibold text-volt">{status.shared}</span> places have all of
            them — {shape === 'scatter' ? 'that is every point you would plot' : 'that is your row count'}.
          </p>
          {lost > 0 && (
            <p className="mt-1 text-[0.8rem] leading-relaxed text-ink-secondary">
              The join discards {lost} more. Ask what those places have in common before you
              plot: if the indicator with the smaller coverage is only reported by countries in a
              particular condition, the join has selected your sample for you.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
