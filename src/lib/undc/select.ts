/**
 * Pure transforms from API payloads to chart-ready shapes.
 *
 * Kept free of React and of `fetch` so they can be unit-tested against recorded
 * payloads, which is also what the snapshots in `src/data/snapshots` are.
 */

import type { Facet, Observation, ObservationResponse, SeriesResponse } from './types';

export interface NamedSeries {
  /** Entity dcid — the stable key that a colour is bound to. */
  key: string;
  /** Display label. */
  label: string;
  points: Observation[];
  facet?: Facet;
}

export interface RankedValue {
  key: string;
  label: string;
  value: number;
  /** The year this particular entity's value is from. */
  date: string;
}

/** Flatten a series response into one entry per entity, for a single variable. */
export function toNamedSeries(
  response: SeriesResponse,
  variable: string,
  labels: Readonly<Record<string, string>> = {},
): NamedSeries[] {
  const byEntity = response.data?.[variable] ?? {};

  return Object.entries(byEntity)
    .map(([entity, block]) => ({
      key: entity,
      label: labels[entity] ?? entity,
      points: [...(block.series ?? [])].sort(compareByDate),
      facet: block.facet ? response.facets?.[block.facet] : undefined,
    }))
    .filter((series) => series.points.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Flatten an observation response into a ranking.
 *
 * Takes the first ordered facet per entity: the API returns facets in the
 * deployment's own preference order, so the first is the one the platform itself
 * would display.
 */
export function toRanking(
  response: ObservationResponse,
  variable: string,
  labels: Readonly<Record<string, string>> = {},
): { rows: RankedValue[]; facet?: Facet } {
  const byEntity = response.byVariable?.[variable]?.byEntity ?? {};
  let facet: Facet | undefined;

  const rows = Object.entries(byEntity)
    .flatMap(([entity, block]) => {
      const preferred = block.orderedFacets?.[0];
      const observation = preferred?.observations?.[0];
      if (!preferred || !observation) return [];
      facet ??= response.facets?.[preferred.facetId];
      return [{
        key: entity,
        label: labels[entity] ?? entity,
        value: observation.value,
        date: observation.date,
      }];
    })
    .sort((a, b) => b.value - a.value);

  return { rows, facet };
}

/**
 * The range of years present in a `date: 'LATEST'` result.
 *
 * `LATEST` resolves per entity, so a single "latest" map can mix a 2024 reading
 * for one country with a 2012 reading for its neighbour. Surfacing that spread is
 * the difference between a chart and a misleading chart.
 */
export function vintageSpread(rows: readonly RankedValue[]): {
  earliest: string;
  latest: string;
  spanYears: number;
  isMixed: boolean;
} | null {
  if (rows.length === 0) return null;

  const years = rows.map((r) => r.date).sort();
  const earliest = years[0]!;
  const latest = years[years.length - 1]!;
  const span = Number.parseInt(latest, 10) - Number.parseInt(earliest, 10);

  return {
    earliest,
    latest,
    spanYears: Number.isFinite(span) ? span : 0,
    isMixed: earliest !== latest,
  };
}

/** Sum a series across entities by year — used for regional totals. */
export function sumByDate(series: readonly NamedSeries[]): Observation[] {
  const totals = new Map<string, number>();
  for (const s of series) {
    for (const point of s.points) {
      totals.set(point.date, (totals.get(point.date) ?? 0) + point.value);
    }
  }
  return [...totals.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort(compareByDate);
}

/** Restrict every series to a shared year window. */
export function clampToYears(
  series: readonly NamedSeries[],
  from: number,
  to: number,
): NamedSeries[] {
  return series
    .map((s) => ({
      ...s,
      points: s.points.filter((p) => {
        const year = Number.parseInt(p.date, 10);
        return Number.isFinite(year) && year >= from && year <= to;
      }),
    }))
    .filter((s) => s.points.length > 0);
}

function compareByDate(a: Observation, b: Observation): number {
  return a.date.localeCompare(b.date);
}

/** Resolve the unit a facet describes into something printable. */
export function unitLabel(facet: Facet | undefined): string | undefined {
  if (!facet) return undefined;
  if (facet.unitDisplayName) return facet.unitDisplayName;
  if (!facet.unit) return undefined;
  // Deployment units look like `undata/UNIT_MEASURE-RATIO_COUNT_PER_100000_COUNT_POP`.
  const tail = facet.unit.split('/').pop() ?? facet.unit;
  return tail
    .replace(/^UNIT_MEASURE-/, '')
    .replace(/_/g, ' ')
    .toLowerCase();
}
