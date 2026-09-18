import { describe, expect, it } from 'vitest';
import {
  clampToYears,
  sumByDate,
  toNamedSeries,
  toRanking,
  unitLabel,
  vintageSpread,
} from '../src/lib/undc/select';
import type { ObservationResponse, SeriesResponse } from '../src/lib/undc/types';

const seriesResponse: SeriesResponse = {
  data: {
    'undata/sdg/VC_DTH_TOTN': {
      'country/SSD': {
        facet: 'f1',
        series: [
          { date: '2017', value: 779 },
          { date: '2015', value: 2418 },
          { date: '2016', value: 2807 },
        ],
      },
      // Requested but unreported: present as an empty series.
      'country/SOM': { series: [] },
    },
  },
  facets: { f1: { provenanceId: 'undata/p/SDG', unit: 'undata/UNIT_MEASURE-COUNT', unitDisplayName: 'Number' } },
};

describe('toNamedSeries', () => {
  it('sorts observations chronologically regardless of response order', () => {
    const [entry] = toNamedSeries(seriesResponse, 'undata/sdg/VC_DTH_TOTN');
    expect(entry?.points.map((p) => p.date)).toEqual(['2015', '2016', '2017']);
  });

  it('drops entities that returned no observations rather than charting them as zero', () => {
    const result = toNamedSeries(seriesResponse, 'undata/sdg/VC_DTH_TOTN');
    expect(result.map((entry) => entry.key)).toEqual(['country/SSD']);
  });

  it('applies display labels but keeps the dcid as the colour key', () => {
    const [entry] = toNamedSeries(seriesResponse, 'undata/sdg/VC_DTH_TOTN', {
      'country/SSD': 'South Sudan',
    });
    expect(entry?.label).toBe('South Sudan');
    expect(entry?.key).toBe('country/SSD');
  });

  it('attaches the facet so provenance survives the transform', () => {
    const [entry] = toNamedSeries(seriesResponse, 'undata/sdg/VC_DTH_TOTN');
    expect(entry?.facet?.provenanceId).toBe('undata/p/SDG');
  });

  it('returns nothing for a variable that is not in the payload', () => {
    expect(toNamedSeries(seriesResponse, 'undata/sdg/NOPE')).toEqual([]);
  });
});

const observationResponse: ObservationResponse = {
  byVariable: {
    'undata/unodc/VIC_HOM_RT': {
      byEntity: {
        'country/ZAF': {
          orderedFacets: [{ facetId: 'f1', observations: [{ date: '2024', value: 39.72 }] }],
        },
        'country/SSD': {
          orderedFacets: [{ facetId: 'f1', observations: [{ date: '2012', value: 13.98 }] }],
        },
        'country/MUS': {
          orderedFacets: [{ facetId: 'f1', observations: [{ date: '2024', value: 2.67 }] }],
        },
        'country/XXX': { orderedFacets: [] },
      },
    },
  },
  facets: { f1: { provenanceUrl: 'https://data.unodc.org/' } },
};

describe('toRanking', () => {
  it('ranks descending by value', () => {
    const { rows } = toRanking(observationResponse, 'undata/unodc/VIC_HOM_RT');
    expect(rows.map((row) => row.key)).toEqual(['country/ZAF', 'country/SSD', 'country/MUS']);
  });

  it('carries each entity\'s own reference year', () => {
    const { rows } = toRanking(observationResponse, 'undata/unodc/VIC_HOM_RT');
    expect(rows.find((row) => row.key === 'country/SSD')?.date).toBe('2012');
  });

  it('skips entities with no facets', () => {
    const { rows } = toRanking(observationResponse, 'undata/unodc/VIC_HOM_RT');
    expect(rows.some((row) => row.key === 'country/XXX')).toBe(false);
  });

  it('surfaces the facet for attribution', () => {
    const { facet } = toRanking(observationResponse, 'undata/unodc/VIC_HOM_RT');
    expect(facet?.provenanceUrl).toBe('https://data.unodc.org/');
  });
});

describe('vintageSpread', () => {
  it('detects a mixed-vintage LATEST result and measures the span', () => {
    const { rows } = toRanking(observationResponse, 'undata/unodc/VIC_HOM_RT');
    expect(vintageSpread(rows)).toEqual({
      earliest: '2012',
      latest: '2024',
      spanYears: 12,
      isMixed: true,
    });
  });

  it('reports a uniform result as not mixed', () => {
    expect(
      vintageSpread([
        { key: 'a', label: 'A', value: 1, date: '2023' },
        { key: 'b', label: 'B', value: 2, date: '2023' },
      ]),
    ).toMatchObject({ isMixed: false, spanYears: 0 });
  });

  it('returns null for an empty ranking', () => {
    expect(vintageSpread([])).toBeNull();
  });
});

describe('sumByDate and clampToYears', () => {
  const series = [
    { key: 'a', label: 'A', points: [{ date: '2020', value: 1 }, { date: '2021', value: 2 }] },
    { key: 'b', label: 'B', points: [{ date: '2021', value: 3 }, { date: '2022', value: 4 }] },
  ];

  it('sums across entities by year', () => {
    expect(sumByDate(series)).toEqual([
      { date: '2020', value: 1 },
      { date: '2021', value: 5 },
      { date: '2022', value: 4 },
    ]);
  });

  it('clamps to a shared window and drops series left empty', () => {
    const clamped = clampToYears(series, 2022, 2022);
    expect(clamped).toHaveLength(1);
    expect(clamped[0]?.key).toBe('b');
  });
});

describe('unitLabel', () => {
  it('prefers the display name when present', () => {
    expect(unitLabel({ unitDisplayName: 'Number', unit: 'undata/UNIT_MEASURE-COUNT' })).toBe('Number');
  });

  it('humanises a deployment unit code', () => {
    expect(unitLabel({ unit: 'undata/UNIT_MEASURE-RATIO_COUNT_PER_100000_COUNT_POP' })).toBe(
      'ratio count per 100000 count pop',
    );
  });

  it('returns undefined when there is nothing to show', () => {
    expect(unitLabel(undefined)).toBeUndefined();
    expect(unitLabel({})).toBeUndefined();
  });
});
