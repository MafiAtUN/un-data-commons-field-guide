/**
 * Build a CSV in the browser.
 *
 * The platform offers CSV download from its own charts, but not from the API —
 * there is no CSV endpoint. So the Data Finder assembles the file here, which
 * has a happy side effect: the export can carry provenance rows that a raw API
 * dump would not, so the file still knows where it came from after it has been
 * emailed to three people.
 */

import type { NamedSeries } from './select';

export interface CsvMeta {
  indicator: string;
  dcid: string;
  unit: string;
  source: string;
  /** Where the methodology and terms of use live. */
  provenanceUrl?: string;
  /** When the data was pulled. */
  retrievedAt: string;
}

/**
 * Long format: one row per country-year.
 *
 * Chosen over a wide country-by-year grid because every charting tool,
 * spreadsheet pivot and statistics package accepts long data, whereas wide data
 * has to be reshaped first. Datawrapper and Flourish both prefer it too.
 */
export function seriesToCsv(series: readonly NamedSeries[], meta: CsvMeta): string {
  const rows: string[][] = [['country', 'country_code', 'year', 'value', 'indicator', 'unit', 'source']];

  for (const entry of series) {
    for (const point of entry.points) {
      rows.push([
        entry.label,
        entry.key,
        point.date,
        String(point.value),
        meta.indicator,
        meta.unit,
        meta.source,
      ]);
    }
  }

  // Comment rows the tools ignore but a human opening the file will read.
  const header = [
    `# ${meta.indicator}`,
    `# Source: ${meta.source}`,
    `# Indicator ID: ${meta.dcid}`,
    meta.provenanceUrl ? `# Methodology and terms of use: ${meta.provenanceUrl}` : undefined,
    `# Retrieved from the UN System Data Commons (https://data.un.org) on ${formatDate(meta.retrievedAt)}`,
    '#',
  ].filter(Boolean) as string[];

  return [...header, ...rows.map((row) => row.map(escapeCell).join(','))].join('\n');
}

/** Wide format: years down the side, countries across. Easier to read by eye. */
export function seriesToWideCsv(series: readonly NamedSeries[]): string {
  const years = [...new Set(series.flatMap((s) => s.points.map((p) => p.date)))].sort();
  const header = ['year', ...series.map((s) => s.label)];

  const rows = years.map((year) => [
    year,
    ...series.map((s) => {
      const point = s.points.find((p) => p.date === year);
      return point ? String(point.value) : '';
    }),
  ]);

  return [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
}

/**
 * Quote a cell if it could otherwise break the row.
 *
 * Country names genuinely contain commas — "Bolivia (Plurinational State of)"
 * is fine but "Korea, Democratic People's Republic of" is not — so this is not
 * theoretical tidiness.
 */
function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Hand the browser a file to save. */
export function downloadCsv(filename: string, contents: string): void {
  // The BOM makes Excel open UTF-8 correctly, which matters for country names
  // such as Côte d'Ivoire and São Tomé and Príncipe.
  const blob = new Blob([`\ufeff${contents}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/** A filename that will still make sense in a downloads folder in six months. */
export function csvFilename(indicatorName: string, countryCount: number): string {
  const slug = indicatorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  const today = new Date().toISOString().slice(0, 10);
  return `un-data_${slug}_${countryCount}-countries_${today}.csv`;
}
