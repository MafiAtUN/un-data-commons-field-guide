import { describe, expect, it } from 'vitest';
import { buildDcid, childCountriesOf, describeDcid, parseDcid } from '../src/lib/undc/dcid';

describe('parseDcid', () => {
  it('parses an undisaggregated variable', () => {
    expect(parseDcid('undata/unodc/VIC_HOM_RT')).toEqual({
      namespace: 'undata',
      agency: 'unodc',
      code: 'VIC_HOM_RT',
      dimensions: [],
      base: 'undata/unodc/VIC_HOM_RT',
      isTotal: true,
    });
  });

  it('parses a single dimension filter', () => {
    const parsed = parseDcid('undata/sdg/VC_DTH_TOTN.AGE--Y0T17');
    expect(parsed?.isTotal).toBe(false);
    expect(parsed?.dimensions).toEqual([{ dimension: 'AGE', value: 'Y0T17' }]);
    expect(parsed?.base).toBe('undata/sdg/VC_DTH_TOTN');
  });

  it('parses several dimensions in identifier order', () => {
    const parsed = parseDcid('undata/sdg/VC_DTH_TOTN.AGE--Y0T17__SEX--F');
    expect(parsed?.dimensions).toEqual([
      { dimension: 'AGE', value: 'Y0T17' },
      { dimension: 'SEX', value: 'F' },
    ]);
  });

  it('keeps dimension values that themselves contain the binding delimiter', () => {
    // UNHCR country-of-origin codes and ISCED levels both carry inner separators.
    const parsed = parseDcid(
      'undata/unicef/ED_CR.EDUCATION_LEVEL--ISCED11_1__SCHOOL_AGE--L1',
    );
    expect(parsed?.dimensions).toEqual([
      { dimension: 'EDUCATION_LEVEL', value: 'ISCED11_1' },
      { dimension: 'SCHOOL_AGE', value: 'L1' },
    ]);
  });

  it('handles the deeper topic namespace without losing the tail', () => {
    const parsed = parseDcid('undata/topic/sdg/VC_DTH_TOTN.002');
    expect(parsed?.agency).toBe('topic');
    expect(parsed?.code).toBe('sdg/VC_DTH_TOTN');
  });

  it('returns null for anything that is not a variable path', () => {
    expect(parseDcid('country/SSD')).toBeNull();
    expect(parseDcid('')).toBeNull();
    expect(parseDcid('   ')).toBeNull();
  });
});

describe('buildDcid', () => {
  it('round-trips an identifier whose dimensions are already sorted', () => {
    const dcid = 'undata/sdg/VC_DTH_TOTN.AGE--Y0T17__SEX--F';
    const parsed = parseDcid(dcid)!;
    expect(buildDcid(parsed.base, parsed.dimensions)).toBe(dcid);
  });

  it('normalises dimension order, so one slice has exactly one address', () => {
    const fromUnsorted = buildDcid('undata/sdg/VC_DTH_TOTN', [
      { dimension: 'SEX', value: 'F' },
      { dimension: 'AGE', value: 'Y0T17' },
    ]);
    expect(fromUnsorted).toBe('undata/sdg/VC_DTH_TOTN.AGE--Y0T17__SEX--F');
  });

  it('emits the bare stem when there are no dimensions', () => {
    expect(buildDcid('undata/unodc/VIC_HOM_RT')).toBe('undata/unodc/VIC_HOM_RT');
  });

  it('accepts parsed parts instead of a stem string', () => {
    expect(buildDcid({ namespace: 'undata', agency: 'who', code: 'HOMICIDE_R' }, [
      { dimension: 'SEX', value: 'F' },
    ])).toBe('undata/who/HOMICIDE_R.SEX--F');
  });
});

describe('describeDcid', () => {
  it('names the contributing collection and flags a total', () => {
    expect(describeDcid('undata/unodc/VIC_HOM_RT')).toBe('UNODC · VIC_HOM_RT (total)');
  });

  it('spells out the slice', () => {
    expect(describeDcid('undata/sdg/VC_DTH_TOTN.AGE--Y0T17__SEX--F')).toBe(
      'Global SDG Indicators Database · VC_DTH_TOTN [AGE=Y0T17, SEX=F]',
    );
  });

  it('passes unrecognised input through unchanged', () => {
    expect(describeDcid('not-a-dcid')).toBe('not-a-dcid');
  });
});

describe('childCountriesOf', () => {
  it('builds a recursive containment expression limited to countries', () => {
    expect(childCountriesOf('africa')).toBe('africa<-containedInPlace+{typeOf:Country}');
  });
});
