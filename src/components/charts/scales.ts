/** Scale and tick helpers. Pure functions, so they are unit-testable. */

export interface LinearScale {
  (value: number): number;
  domain: readonly [number, number];
  range: readonly [number, number];
}

export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;

  const scale = ((value: number) =>
    span === 0 ? (r0 + r1) / 2 : r0 + ((value - d0) / span) * (r1 - r0)) as LinearScale;

  Object.assign(scale, { domain, range });
  return scale;
}

/**
 * A domain that starts at zero for magnitudes and hugs the data for indices.
 *
 * Truncating a magnitude axis exaggerates differences, so counts and rates get a
 * zero baseline. Bounded indices (HDI, shares near a ceiling) would be unreadable
 * squashed against zero, so they get a padded window instead — declared by the
 * caller, never inferred.
 */
export function niceDomain(
  values: readonly number[],
  options: { zeroBaseline?: boolean } = {},
): [number, number] {
  if (values.length === 0) return [0, 1];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const zeroBaseline = options.zeroBaseline ?? true;

  if (zeroBaseline) {
    if (max === 0) return [0, 1];
    return [Math.min(0, min), roundUpToStep(max)];
  }

  const pad = (max - min) * 0.12 || Math.abs(max) * 0.1 || 1;
  return [min - pad, max + pad];
}

function roundUpToStep(max: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / (magnitude / 2)) * (magnitude / 2);
}

/** Evenly spaced, human-readable tick values across a domain. */
export function ticks(domain: readonly [number, number], count = 5): number[] {
  const [min, max] = domain;
  if (min === max) return [min];

  const rawStep = (max - min) / Math.max(1, count - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalised = rawStep / magnitude;
  const step = (normalised >= 5 ? 5 : normalised >= 2 ? 2 : 1) * magnitude;

  const out: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + step / 1000; t += step) {
    out.push(Number.parseFloat(t.toPrecision(12)));
  }
  return out;
}

/** Compact value formatting: 1.2M, 14.3k, 0.685. */
export function formatValue(value: number, options: { precise?: boolean } = {}): string {
  const abs = Math.abs(value);

  if (!options.precise) {
    if (abs >= 1_000_000_000) return `${trim(value / 1_000_000_000)}bn`;
    if (abs >= 1_000_000) return `${trim(value / 1_000_000)}M`;
    if (abs >= 10_000) return `${trim(value / 1_000)}k`;
  }

  if (abs >= 1000) return value.toLocaleString('en', { maximumFractionDigits: 0 });
  if (abs >= 100) return value.toFixed(0);
  if (abs >= 1) return trim(value);
  return value.toPrecision(3).replace(/0+$/, '').replace(/\.$/, '');
}

function trim(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '');
}

/**
 * Bind a colour to an entity key, never to its position in the current list.
 *
 * Filtering a chart must not repaint the series that survive: a reader who learned
 * "South Sudan is blue" would otherwise be misled. The order of `allKeys` is the
 * stable universe of entities, decided once by the dataset, not by the filter.
 */
export function seriesColor(key: string, allKeys: readonly string[]): string {
  const index = allKeys.indexOf(key);
  const slot = index === -1 ? 0 : Math.min(index, 7);
  return `var(--color-series-${slot + 1})`;
}

/** Slots available before the palette must fold into "Other". */
export const MAX_SERIES = 8;
/** Slots that validate when every pair is on screen at once (maps, scatter). */
export const MAX_ALL_PAIRS_SERIES = 3;
