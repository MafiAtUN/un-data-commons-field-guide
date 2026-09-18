import { describe, expect, it } from 'vitest';
import { csvFilename, seriesToCsv, seriesToWideCsv } from '../src/lib/undc/csv';
import { CITATION_STYLE_LABELS, chartNote, formatCitation, type CitationStyle } from '../src/lib/undc/citation';
import type { NamedSeries } from '../src/lib/undc/select';

const series: NamedSeries[] = [
  {
    key: 'country/BGD',
    label: 'Bangladesh',
    points: [{ date: '2023', value: 99.4 }, { date: '2024', value: 99.6 }],
  },
  {
    // A name containing a comma, which is the case that breaks naive CSV writers.
    key: 'country/BOL',
    label: 'Bolivia, Plurinational State of',
    points: [{ date: '2024', value: 97.1 }],
  },
];

const meta = {
  indicator: 'Access to electricity',
  dcid: 'undata/sdg/EG_ACS_ELEC',
  unit: 'Percent of population',
  source: 'Global SDG Indicators Database',
  provenanceUrl: 'https://unstats.un.org/sdgs/dataportal',
  retrievedAt: '2026-09-18T11:02:00.000Z',
};

describe('seriesToCsv', () => {
  const csv = seriesToCsv(series, meta);
  const lines = csv.split('\n');

  it('carries its own provenance in comment rows', () => {
    expect(lines[0]).toContain('Access to electricity');
    expect(csv).toContain('# Source: Global SDG Indicators Database');
    expect(csv).toContain('# Indicator ID: undata/sdg/EG_ACS_ELEC');
    expect(csv).toContain('https://unstats.un.org/sdgs/dataportal');
    expect(csv).toContain('18 September 2026');
  });

  it('writes long format — one row per country-year', () => {
    const dataRows = lines.filter((line) => !line.startsWith('#') && !line.startsWith('country,'));
    expect(dataRows).toHaveLength(3);
  });

  it('quotes a country name containing a comma', () => {
    expect(csv).toContain('"Bolivia, Plurinational State of"');
  });

  it('keeps the country code so the row is machine-traceable', () => {
    expect(csv).toContain('country/BGD');
  });

  it('omits the methodology line when there is no provenance URL', () => {
    const withoutUrl = seriesToCsv(series, { ...meta, provenanceUrl: undefined });
    expect(withoutUrl).not.toContain('Methodology');
    expect(withoutUrl).toContain('# Source:');
  });

  it('escapes embedded quotes by doubling them', () => {
    const tricky = seriesToCsv(
      [{ key: 'x', label: 'A "quoted" name', points: [{ date: '2024', value: 1 }] }],
      meta,
    );
    expect(tricky).toContain('"A ""quoted"" name"');
  });
});

describe('seriesToWideCsv', () => {
  const wide = seriesToWideCsv(series);
  const lines = wide.split('\n');

  it('puts years down the side and countries across', () => {
    expect(lines[0]).toBe('year,Bangladesh,"Bolivia, Plurinational State of"');
  });

  it('leaves a missing year empty rather than writing zero', () => {
    const row2023 = lines.find((line) => line.startsWith('2023'))!;
    expect(row2023).toBe('2023,99.4,');
    expect(row2023).not.toContain('0,');
  });

  it('sorts years ascending', () => {
    const years = lines.slice(1).map((line) => line.split(',')[0]);
    expect(years).toEqual([...years].sort());
  });
});

describe('csvFilename', () => {
  it('produces a name that still makes sense months later', () => {
    const name = csvFilename('Access to electricity', 4);
    expect(name).toMatch(/^un-data_access-to-electricity_4-countries_\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('strips punctuation that breaks filesystems', () => {
    expect(csvFilename('CO₂ emissions (per capita)', 2)).not.toMatch(/[()₂]/);
  });
});

describe('citations', () => {
  const input = {
    indicator: 'Access to electricity',
    source: 'Global SDG Indicators Database',
    dcid: 'undata/sdg/EG_ACS_ELEC',
    places: 'Bangladesh, Ethiopia',
    period: '2000–2024',
    retrievedAt: '2026-09-18T11:02:00.000Z',
  };

  it('names the producing agency before the platform, in every style', () => {
    for (const style of Object.keys(CITATION_STYLE_LABELS) as CitationStyle[]) {
      const text = formatCitation(style, input);
      const agencyAt = text.indexOf('Global SDG Indicators Database');
      const platformAt = text.indexOf('data.un.org');

      expect(agencyAt, style).toBeGreaterThanOrEqual(0);
      expect(platformAt, style).toBeGreaterThanOrEqual(0);
      // The accountable body leads; the platform is the route.
      expect(agencyAt, style).toBeLessThan(platformAt);
    }
  });

  it('always carries an access date, because agencies revise history', () => {
    for (const style of Object.keys(CITATION_STYLE_LABELS) as CitationStyle[]) {
      expect(formatCitation(style, input), style).toContain('18 September 2026');
    }
  });

  it('includes the reproducible series identifier in the UN style', () => {
    expect(formatCitation('un', input)).toContain('undata/sdg/EG_ACS_ELEC');
  });

  it('keeps the chart note short enough to survive a screenshot', () => {
    const note = chartNote(input);
    expect(note.length).toBeLessThan(120);
    expect(note).toContain('Global SDG Indicators Database');
  });

  it('omits the scope when places and period are not supplied', () => {
    const bare = formatCitation('un', { ...input, places: undefined, period: undefined });
    expect(bare).not.toContain('()');
    expect(bare).toContain('Access to electricity');
  });
});

describe('Data Finder snapshot matching', () => {
  // Mirrors matchesBakedRequest in DataFinder.tsx. The rule it encodes is the
  // point: a fallback that does not match the question is worse than no data.
  const BAKED_INDICATOR = 'undata/sdg/EG_ACS_ELEC';
  const BAKED_COUNTRIES = ['country/BGD', 'country/ETH', 'country/IND', 'country/KEN'];

  function matches(dcid: string, countries: readonly string[]): boolean {
    if (dcid !== BAKED_INDICATOR) return false;
    if (countries.length !== BAKED_COUNTRIES.length) return false;
    const chosen = [...countries].sort();
    return [...BAKED_COUNTRIES].sort().every((code, index) => chosen[index] === code);
  }

  it('matches the baked request regardless of the order countries were picked', () => {
    expect(matches(BAKED_INDICATOR, ['country/KEN', 'country/BGD', 'country/IND', 'country/ETH'])).toBe(true);
  });

  it('refuses a different indicator, even with the same countries', () => {
    expect(matches('undata/sdg/VC_IHR_PSRC', BAKED_COUNTRIES)).toBe(false);
  });

  it('refuses a different country set', () => {
    expect(matches(BAKED_INDICATOR, ['country/BGD', 'country/ETH', 'country/IND'])).toBe(false);
    expect(matches(BAKED_INDICATOR, ['country/BGD', 'country/ETH', 'country/IND', 'country/ZAF'])).toBe(false);
  });
});
