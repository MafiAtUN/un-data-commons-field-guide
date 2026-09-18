import { describe, expect, it } from 'vitest';
import { summarizeResolution } from '../src/lib/undc/resolution';
import type { DetectAndFulfillResponse } from '../src/lib/undc/types';
import snapshotFile from '../src/data/snapshot-data.json';

const records = (snapshotFile as {
  records: Record<string, { payload: DetectAndFulfillResponse }>;
}).records;

describe('summarizeResolution', () => {
  it('flags a place the resolver supplied rather than read', () => {
    // Recorded from the live resolver: the bare word "violence" resolves to the
    // United States. This is the behaviour the Prompt Lab exists to expose.
    const summary = summarizeResolution('violence', records['lab.prompt.vague']!.payload);
    expect(summary.place?.dcid).toBe('country/USA');
    expect(summary.placeWasInferred).toBe(true);
  });

  it('does not flag a place the question named', () => {
    const summary = summarizeResolution(
      'number of total conflict-related deaths in South Sudan',
      records['lab.prompt.precise']!.payload,
    );
    expect(summary.place?.dcid).toBe('country/SSD');
    expect(summary.placeWasInferred).toBe(false);
  });

  it('matches a place named loosely against its official name', () => {
    const summary = summarizeResolution('conflict deaths in Congo', {
      place: { dcid: 'country/COD', name: 'Congo [DRC]' },
      config: { categories: [] },
    });
    expect(summary.placeWasInferred).toBe(false);
  });

  it('collects the variables the resolver selected, deduplicated', () => {
    const summary = summarizeResolution(
      'number of total conflict-related deaths in South Sudan',
      records['lab.prompt.precise']!.payload,
    );
    expect(summary.indicators.length).toBeGreaterThan(0);
    expect(new Set(summary.indicators.map((i) => i.dcid)).size).toBe(summary.indicators.length);
    expect(summary.indicators.some((i) => i.dcid === 'undata/sdg/VC_DTH_TOTN')).toBe(true);
  });

  it('parses the agency and dimensions out of each resolved identifier', () => {
    const summary = summarizeResolution(
      'conflict related deaths of children under 18 in South Sudan by year',
      records['lab.prompt.disaggregated']!.payload,
    );
    const sliced = summary.indicators.find((i) => i.dimensions.length > 0);
    expect(sliced?.agency).toBe('sdg');
    expect(sliced?.dimensions[0]).toMatch(/=/);
  });

  it('reports the chart forms a regional comparison produces', () => {
    const summary = summarizeResolution(
      'compare homicide rate across countries in Africa',
      records['lab.prompt.regional']!.payload,
    );
    // The "across countries in X" phrasing is what promotes a line into a map.
    expect(summary.tileTypes).toContain('MAP');
    expect(summary.blockCount).toBeGreaterThan(0);
  });

  it('strips the multi-place bar-block suffix from a statVarKey', () => {
    const summary = summarizeResolution('refugees', {
      place: { dcid: 'country/SSD', name: 'South Sudan' },
      config: {
        categories: [
          {
            statVarSpec: {},
            blocks: [
              {
                title: 'b',
                columns: [
                  {
                    tiles: [
                      {
                        type: 'BAR',
                        statVarKey: ['undata/unhcr/END_YEAR_POPULATION.COO--G1_multiple_place_bar_block'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    expect(summary.indicators[0]?.dcid).toBe('undata/unhcr/END_YEAR_POPULATION.COO--G1');
  });

  it('handles an empty response without throwing', () => {
    const summary = summarizeResolution('nonsense', {});
    expect(summary.indicators).toEqual([]);
    expect(summary.placeWasInferred).toBe(false);
  });
});
