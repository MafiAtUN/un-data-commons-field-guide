import { describe, expect, it } from 'vitest';
import { COUNTRIES, COUNTRY_PRESETS } from '../src/content/countries';
import { INDICATORS, TOPIC_LABELS, findIndicator, indicatorsByTopic } from '../src/content/indicators';
import { parseDcid } from '../src/lib/undc/dcid';

/**
 * The curated content is hand-written, so these guard the mistakes hand-written
 * content actually makes: a country code that does not exist, an indicator whose
 * identifier is malformed, a topic with no home in the picker.
 */
describe('country picker', () => {
  it('has a substantial list baked from the platform', () => {
    expect(Object.keys(COUNTRIES).length).toBeGreaterThan(200);
  });

  it('names every country', () => {
    const unnamed = Object.entries(COUNTRIES).filter(([, name]) => !name?.trim());
    expect(unnamed).toEqual([]);
  });

  it('only offers presets whose countries exist in the list', () => {
    const unknown = COUNTRY_PRESETS.flatMap((preset) =>
      preset.countries.filter((code) => !COUNTRIES[code]).map((code) => `${preset.label}: ${code}`),
    );
    expect(unknown).toEqual([]);
  });

  it('keeps presets within the eight-series chart limit', () => {
    for (const preset of COUNTRY_PRESETS) {
      expect(preset.countries.length, preset.label).toBeLessThanOrEqual(8);
      expect(preset.countries.length, preset.label).toBeGreaterThan(1);
    }
  });

  it('has no duplicate countries inside a preset', () => {
    for (const preset of COUNTRY_PRESETS) {
      expect(new Set(preset.countries).size, preset.label).toBe(preset.countries.length);
    }
  });
});

describe('curated indicators', () => {
  it('offers a useful shortlist', () => {
    expect(INDICATORS.length).toBeGreaterThanOrEqual(15);
  });

  it('uses well-formed identifiers from the undata namespace', () => {
    for (const indicator of INDICATORS) {
      const parsed = parseDcid(indicator.dcid);
      expect(parsed, indicator.name).not.toBeNull();
      expect(parsed!.namespace, indicator.name).toBe('undata');
    }
  });

  it('has no duplicate identifiers', () => {
    const dcids = INDICATORS.map((indicator) => indicator.dcid);
    expect(new Set(dcids).size).toBe(dcids.length);
  });

  it('gives every indicator a plain-language description, unit and source', () => {
    for (const indicator of INDICATORS) {
      expect(indicator.what.length, indicator.name).toBeGreaterThan(20);
      expect(indicator.unit.length, indicator.name).toBeGreaterThan(2);
      expect(indicator.source.length, indicator.name).toBeGreaterThan(2);
      // Coverage was measured, not guessed.
      expect(indicator.countryCoverage, indicator.name).toBeGreaterThan(0);
    }
  });

  it('warns about the thinly covered series, where misreading is most likely', () => {
    for (const indicator of INDICATORS.filter((i) => i.countryCoverage < 120)) {
      expect(indicator.watchOut, indicator.name).toBeTruthy();
    }
  });

  it('groups every indicator under a labelled topic', () => {
    const grouped = indicatorsByTopic().flatMap((group) => group.items);
    expect(grouped.length).toBe(INDICATORS.length);
    for (const indicator of INDICATORS) {
      expect(TOPIC_LABELS[indicator.topic], indicator.name).toBeTruthy();
    }
  });

  it('looks an indicator up by identifier', () => {
    expect(findIndicator(INDICATORS[0]!.dcid)?.name).toBe(INDICATORS[0]!.name);
    expect(findIndicator('undata/nope/NOPE')).toBeUndefined();
  });
});
