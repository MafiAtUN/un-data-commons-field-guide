import { useMemo, useState } from 'react';
import { fetchSeries } from '../lib/undc/client';
import { toNamedSeries, type NamedSeries } from '../lib/undc/select';
import { SNAPSHOT_KEYS } from '../lib/undc/snapshots';
import { useSourcedData } from '../lib/undc/useSourcedData';
import type { SeriesResponse } from '../lib/undc/types';
import { INDICATORS, indicatorsByTopic, type CuratedIndicator } from '../content/indicators';
import { COUNTRIES, COUNTRY_PRESETS } from '../content/countries';
import { csvFilename, downloadCsv, seriesToCsv, seriesToWideCsv } from '../lib/undc/csv';
import { CITATION_STYLE_LABELS, formatCitation, type CitationStyle } from '../lib/undc/citation';
import { LineChart } from './charts/LineChart';
import { SeriesTable } from './charts/TableView';
import { OriginBadge } from './OriginBadge';
import { CopyButton } from './CopyButton';

/**
 * The opening view, which is also the only combination with a baked recording.
 *
 * `snapshot-data.json` holds one Data Finder request. Falling back to it for any
 * *other* selection would render electricity figures under a homicide heading —
 * precisely the silent mislabelling this guide warns about — so the fallback is
 * offered only when the selection still matches the recording.
 */
const DEFAULT_INDICATOR = 'undata/sdg/EG_ACS_ELEC';
const DEFAULT_COUNTRIES = ['country/BGD', 'country/ETH', 'country/IND', 'country/KEN'];

function matchesBakedRequest(dcid: string, countries: readonly string[]): boolean {
  if (dcid !== DEFAULT_INDICATOR) return false;
  if (countries.length !== DEFAULT_COUNTRIES.length) return false;
  const chosen = [...countries].sort();
  return [...DEFAULT_COUNTRIES].sort().every((code, index) => chosen[index] === code);
}

/**
 * The Data Finder.
 *
 * Three choices — what, where, and how far back — and then everything a
 * reporting officer needs to actually use the result: the chart, the table, a
 * CSV that carries its own provenance, a citation in four styles, and a prompt
 * that hands the whole thing to an AI assistant.
 *
 * No identifiers are required to operate it. They are shown throughout anyway,
 * because the fastest way to stop needing a tool like this is to see what it is
 * doing on your behalf.
 */
export function DataFinder() {
  const [dcid, setDcid] = useState<string>(DEFAULT_INDICATOR);
  const [selected, setSelected] = useState<string[]>(DEFAULT_COUNTRIES);
  const [fromYear, setFromYear] = useState<number>(2000);
  const [search, setSearch] = useState('');
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('un');
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const indicator = useMemo(
    () => INDICATORS.find((item) => item.dcid === dcid) ?? INDICATORS[0]!,
    [dcid],
  );

  // Only offer the recording when it is a recording of *this* question.
  const snapshotKey = matchesBakedRequest(dcid, selected) ? SNAPSHOT_KEYS.electricityAccess : null;

  const state = useSourcedData<SeriesResponse>(
    snapshotKey,
    (signal) => fetchSeries({ variables: [dcid], entities: selected }, { signal }),
    [dcid, selected.join(',')],
  );

  const series = useMemo<NamedSeries[]>(() => {
    if (!state.data) return [];
    const labels = Object.fromEntries(selected.map((c) => [c, COUNTRIES[c] ?? c]));
    return toNamedSeries(state.data, dcid, labels)
      .map((entry) => ({
        ...entry,
        points: entry.points.filter((p) => Number.parseInt(p.date, 10) >= fromYear),
      }))
      .filter((entry) => entry.points.length > 0);
  }, [state.data, dcid, selected, fromYear]);

  const colorKeys = useMemo(() => [...selected].sort(), [selected]);
  const facet = series.find((s) => s.facet)?.facet;
  const retrievedAt = state.retrievedAt ?? new Date().toISOString();

  /** Countries that were asked for but came back with nothing. */
  const missing = useMemo(
    () => selected.filter((country) => !series.some((s) => s.key === country)),
    [selected, series],
  );

  const period = useMemo(() => {
    const years = series.flatMap((s) => s.points.map((p) => p.date)).sort();
    return years.length > 0 ? `${years[0]}–${years.at(-1)}` : undefined;
  }, [series]);

  const citationInput = {
    indicator: indicator.name,
    source: indicator.source,
    dcid: indicator.dcid,
    places: series.length > 0 ? series.map((s) => s.label).join(', ') : undefined,
    period,
    retrievedAt,
  };

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    const entries = Object.entries(COUNTRIES);
    if (!query) return entries.slice(0, 0);
    return entries.filter(([, name]) => name.toLowerCase().includes(query)).slice(0, 8);
  }, [search]);

  function toggleCountry(code: string) {
    setSelected((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : current.length >= 8
          ? current
          : [...current, code],
    );
  }

  const aiPrompt = buildAiPrompt(indicator, series, fromYear);

  return (
    <section className="rounded-lg border border-hairline bg-surface-1">
      <div className="border-b border-hairline p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink-primary">Data Finder</h2>
            <p className="mt-1 max-w-2xl text-[0.85rem] leading-relaxed text-ink-secondary">
              Pick a topic and some countries. You get the chart, the table, a spreadsheet
              you can open in Excel, a citation you can paste into a report, and a prompt
              that hands it all to an AI assistant. No identifiers needed.
            </p>
          </div>
          <OriginBadge origin={state.origin} retrievedAt={state.retrievedAt} liveError={state.liveError} />
        </div>
      </div>

      {/* ---------- Step 1 ---------- */}
      <Step number={1} title="What do you want to know?">
        <select
          value={dcid}
          onChange={(event) => setDcid(event.target.value)}
          aria-label="Indicator"
          className="w-full max-w-xl rounded border border-hairline bg-surface-0 px-3 py-2 text-[0.85rem] text-ink-primary"
        >
          {indicatorsByTopic().map((group) => (
            <optgroup key={group.topic} label={group.label}>
              {group.items.map((item) => (
                <option key={item.dcid} value={item.dcid}>
                  {item.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <div className="mt-3 rounded border border-hairline bg-surface-0 p-3.5">
          <p className="text-[0.85rem] leading-relaxed text-ink-secondary">{indicator.what}</p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.75rem]">
            <Meta term="Measured in" value={indicator.unit} />
            <Meta term="Published by" value={indicator.source} />
            {indicator.sdg && <Meta term="SDG indicator" value={indicator.sdg} />}
            <Meta term="Available for" value={`~${indicator.countryCoverage} countries`} />
            <Meta term="Years" value={indicator.years} />
          </dl>
          {indicator.watchOut && (
            <p className="mt-3 flex gap-2 border-t border-hairline pt-3 text-[0.8rem] leading-relaxed text-ink-secondary">
              <span aria-hidden="true" className="shrink-0 font-semibold text-status-warning">!</span>
              <span>
                <span className="font-semibold text-status-warning">Watch out. </span>
                {indicator.watchOut}
              </span>
            </p>
          )}
          <p className="mt-3 font-mono text-[0.7rem] text-ink-muted">
            Identifier: <span className="text-volt">{indicator.dcid}</span>
          </p>
        </div>
      </Step>

      {/* ---------- Step 2 ---------- */}
      <Step number={2} title="Which countries?" hint="Up to eight, so the chart stays readable.">
        <div className="flex flex-wrap gap-2">
          {COUNTRY_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setSelected(preset.countries.slice(0, 8))}
              className="rounded-full border border-hairline px-3 py-1.5 text-[0.75rem] text-ink-secondary transition-colors hover:border-volt/50 hover:text-ink-primary"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <label className="mt-3 block max-w-sm">
          <span className="sr-only">Search for a country</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for a country to add…"
            className="w-full rounded border border-hairline bg-surface-0 px-3 py-2 text-[0.85rem] text-ink-primary placeholder:text-ink-muted"
          />
        </label>

        {filteredCountries.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {filteredCountries.map(([code, name]) => (
              <li key={code}>
                <button
                  type="button"
                  onClick={() => { toggleCountry(code); setSearch(''); }}
                  className="rounded border border-hairline bg-surface-0 px-2.5 py-1 text-[0.75rem] text-ink-secondary hover:border-volt/50 hover:text-ink-primary"
                >
                  + {name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-3 flex flex-wrap gap-2">
          {selected.map((code) => (
            <li key={code}>
              <button
                type="button"
                onClick={() => toggleCountry(code)}
                className="flex items-center gap-1.5 rounded-full border border-volt/40 bg-volt/10 px-3 py-1 text-[0.75rem] text-ink-primary"
                aria-label={`Remove ${COUNTRIES[code] ?? code}`}
              >
                {COUNTRIES[code] ?? code}
                <span aria-hidden="true" className="text-ink-muted">×</span>
              </button>
            </li>
          ))}
          {selected.length === 0 && (
            <li className="text-[0.8rem] text-ink-muted">Pick at least one country.</li>
          )}
        </ul>
      </Step>

      {/* ---------- Step 3 ---------- */}
      <Step number={3} title="How far back?">
        <div className="flex flex-wrap items-center gap-2">
          {[1990, 2000, 2010, 2015, 2020].map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setFromYear(year)}
              aria-pressed={fromYear === year}
              className={`tnum rounded border px-3 py-1.5 text-[0.75rem] transition-colors ${
                fromYear === year
                  ? 'border-volt/60 bg-volt/10 text-ink-primary'
                  : 'border-hairline text-ink-secondary hover:text-ink-primary'
              }`}
            >
              from {year}
            </button>
          ))}
          <span className="text-[0.75rem] text-ink-muted">
            2015 is the SDG baseline year.
          </span>
        </div>
      </Step>

      {/* ---------- Result ---------- */}
      <div className="border-t border-hairline p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[0.95rem] font-semibold text-ink-primary">
            {indicator.name}
            {series.length > 0 && (
              <span className="ml-2 font-normal text-ink-muted">
                · {series.length} {series.length === 1 ? 'country' : 'countries'}
                {period ? ` · ${period}` : ''}
              </span>
            )}
          </h3>
          <div role="group" aria-label="View as" className="flex overflow-hidden rounded border border-hairline">
            {(['chart', 'table'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                aria-pressed={view === option}
                className={`px-2.5 py-1 text-[0.7rem] font-medium capitalize ${
                  view === option ? 'bg-surface-3 text-ink-primary' : 'text-ink-muted hover:text-ink-secondary'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className={`mt-4 transition-opacity ${state.isLoading ? 'opacity-40' : 'opacity-100'}`}>
          {series.length > 0 ? (
            view === 'chart' ? (
              <LineChart series={series} colorKeys={colorKeys} valueLabel={indicator.name} />
            ) : (
              <SeriesTable series={series} valueHeading={indicator.unit} />
            )
          ) : state.isLoading ? (
            <p className="py-10 text-center text-[0.85rem] text-ink-muted">
              Fetching from data.un.org…
            </p>
          ) : state.liveError && !state.origin ? (
            <div className="py-8 text-center">
              <p className="text-[0.85rem] text-ink-secondary">
                Could not reach data.un.org, and there is no offline copy of this particular
                selection.
              </p>
              <p className="mx-auto mt-2 max-w-md text-[0.78rem] leading-relaxed text-ink-muted">
                Rather than show you a recording of a different question under this
                question's heading, the tool shows nothing. Try again in a moment, or reload
                the page to return to the default view, which does have an offline copy.
              </p>
              <button
                type="button"
                onClick={state.refresh}
                className="mt-4 rounded border border-hairline px-3 py-1.5 text-[0.78rem] font-medium text-ink-secondary hover:border-volt/50 hover:text-ink-primary"
              >
                Try again
              </button>
            </div>
          ) : (
            <p className="py-10 text-center text-[0.85rem] text-ink-muted">
              No data for this combination. Try different countries, or an earlier start year.
            </p>
          )}
        </div>

        {missing.length > 0 && series.length > 0 && (
          <p className="mt-4 flex gap-2 rounded border border-status-warning/25 bg-status-warning/5 p-3 text-[0.8rem] leading-relaxed text-ink-secondary">
            <span aria-hidden="true" className="shrink-0 font-semibold text-status-warning">!</span>
            <span>
              <span className="font-semibold text-status-warning">
                No data returned for {missing.map((c) => COUNTRIES[c] ?? c).join(', ')}.
              </span>{' '}
              That means this indicator was not reported for {missing.length === 1 ? 'that country' : 'those countries'} —
              it does not mean the value is zero. Say so in your report rather than leaving
              {missing.length === 1 ? ' it' : ' them'} out silently.
            </span>
          </p>
        )}

        <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-muted">
          Source: {indicator.source}
          {facet?.provenanceUrl && (
            <>
              {' · '}
              <a
                href={facet.provenanceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-volt"
              >
                methodology and terms of use
              </a>
            </>
          )}
        </p>
      </div>

      {/* ---------- Take it away ---------- */}
      {series.length > 0 && (
        <div className="grid gap-4 border-t border-hairline p-5 lg:grid-cols-3">
          <Takeaway title="1 · Get the spreadsheet">
            <p className="text-[0.82rem] leading-relaxed text-ink-secondary">
              Opens in Excel, Google Sheets, Datawrapper or Flourish. The file carries its own
              source note, so it is still attributable after it has been forwarded.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    csvFilename(indicator.name, series.length),
                    seriesToCsv(series, {
                      indicator: indicator.name,
                      dcid: indicator.dcid,
                      unit: indicator.unit,
                      source: indicator.source,
                      provenanceUrl: facet?.provenanceUrl,
                      retrievedAt,
                    }),
                  )
                }
                className="rounded bg-volt px-3 py-1.5 text-[0.78rem] font-semibold text-surface-0 hover:opacity-90"
              >
                Download CSV
              </button>
              <CopyButton
                label="Copy for pasting"
                value={seriesToWideCsv(series).replace(/,/g, '\t')}
                hint="Tab-separated — paste straight into a spreadsheet or Datawrapper."
              />
            </div>
          </Takeaway>

          <Takeaway title="2 · Cite it properly">
            <label className="block">
              <span className="sr-only">Citation style</span>
              <select
                value={citationStyle}
                onChange={(event) => setCitationStyle(event.target.value as CitationStyle)}
                className="w-full rounded border border-hairline bg-surface-0 px-2.5 py-1.5 text-[0.78rem] text-ink-primary"
              >
                {(Object.keys(CITATION_STYLE_LABELS) as CitationStyle[]).map((style) => (
                  <option key={style} value={style}>
                    {CITATION_STYLE_LABELS[style]}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 rounded border border-hairline bg-surface-0 p-2.5 text-[0.75rem] leading-relaxed text-ink-secondary">
              {formatCitation(citationStyle, citationInput)}
            </p>
            <div className="mt-2">
              <CopyButton label="Copy citation" value={formatCitation(citationStyle, citationInput)} />
            </div>
          </Takeaway>

          <Takeaway title="3 · Hand it to an AI assistant">
            <p className="text-[0.82rem] leading-relaxed text-ink-secondary">
              Paste this into ChatGPT, Claude or Gemini. It contains the data, the units and
              the caveat, so the assistant analyses what you actually have instead of
              inventing plausible numbers.
            </p>
            <div className="mt-3">
              <CopyButton label="Copy AI prompt" value={aiPrompt} />
            </div>
          </Takeaway>
        </div>
      )}
    </section>
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
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-hairline p-5">
      <h3 className="flex items-baseline gap-2.5 text-[0.9rem] font-semibold text-ink-primary">
        <span className="tnum grid size-5 shrink-0 place-items-center rounded-full bg-volt text-[0.7rem] font-bold text-surface-0">
          {number}
        </span>
        {title}
        {hint && <span className="text-[0.75rem] font-normal text-ink-muted">{hint}</span>}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Meta({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="inline text-ink-muted">{term}: </dt>
      <dd className="inline text-ink-secondary">{value}</dd>
    </div>
  );
}

function Takeaway({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-hairline bg-surface-0 p-4">
      <h4 className="text-[0.82rem] font-semibold text-ink-primary">{title}</h4>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/**
 * A prompt that carries the data with it.
 *
 * Assistants are far more reliable when the numbers are in the prompt than when
 * they are asked to recall them, so this embeds the table and states the unit,
 * the source and the caveat explicitly — and tells the model not to go beyond it.
 */
function buildAiPrompt(
  indicator: CuratedIndicator,
  series: readonly NamedSeries[],
  fromYear: number,
): string {
  const table = seriesToWideCsv(series);

  return `I am a UN reporting officer. Below is real data from the UN System Data Commons (data.un.org).

INDICATOR: ${indicator.name}
WHAT IT MEASURES: ${indicator.what}
UNIT: ${indicator.unit}
PUBLISHED BY: ${indicator.source}${indicator.sdg ? `\nSDG INDICATOR: ${indicator.sdg}` : ''}
SERIES IDENTIFIER: ${indicator.dcid}
PERIOD SHOWN: ${fromYear} onwards
${indicator.watchOut ? `KNOWN LIMITATION: ${indicator.watchOut}` : ''}

DATA (CSV, years down the side, countries across):
${table}

Please:
1. Summarise what this data shows in three short paragraphs, suitable for a UN report.
2. Point out the two or three most notable changes or differences, with the numbers.
3. Flag anything that would be misleading to state without a caveat.
4. Suggest one chart type that would communicate this well, and say why.

Important: use only the numbers above. Do not add figures from memory, do not
estimate missing years, and if a country is missing from a year say so rather
than filling the gap.`;
}
