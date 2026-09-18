import { describe, expect, it } from 'vitest';
import { formatValue, linearScale, niceDomain, seriesColor, ticks } from '../src/components/charts/scales';

describe('linearScale', () => {
  it('maps the domain onto the range', () => {
    const scale = linearScale([0, 10], [0, 100]);
    expect(scale(0)).toBe(0);
    expect(scale(5)).toBe(50);
    expect(scale(10)).toBe(100);
  });

  it('inverts when the range is inverted, as for an SVG y-axis', () => {
    const scale = linearScale([0, 10], [200, 0]);
    expect(scale(0)).toBe(200);
    expect(scale(10)).toBe(0);
  });

  it('centres a degenerate domain instead of dividing by zero', () => {
    expect(linearScale([5, 5], [0, 100])(5)).toBe(50);
  });
});

describe('niceDomain', () => {
  it('anchors magnitudes at zero so differences are not exaggerated', () => {
    expect(niceDomain([120, 430, 780])[0]).toBe(0);
  });

  it('pads a bounded index instead of crushing it against zero', () => {
    const [min, max] = niceDomain([0.496, 0.799], { zeroBaseline: false });
    expect(min).toBeGreaterThan(0.4);
    expect(max).toBeLessThan(0.9);
  });

  it('keeps negative values visible', () => {
    expect(niceDomain([-5, 10])[0]).toBeLessThan(0);
  });

  it('handles an empty dataset', () => {
    expect(niceDomain([])).toEqual([0, 1]);
  });
});

describe('ticks', () => {
  it('produces round, ascending values inside the domain', () => {
    const result = ticks([0, 100], 5);
    expect(result[0]).toBe(0);
    expect(result.at(-1)).toBeLessThanOrEqual(100);
    expect([...result].sort((a, b) => a - b)).toEqual(result);
  });

  it('collapses to a single tick for a zero-width domain', () => {
    expect(ticks([7, 7])).toEqual([7]);
  });

  it('avoids floating-point dust', () => {
    for (const tick of ticks([0, 0.8], 5)) {
      expect(String(tick).length).toBeLessThan(8);
    }
  });
});

describe('formatValue', () => {
  it('abbreviates large magnitudes', () => {
    expect(formatValue(2_800_000)).toBe('2.8M');
    expect(formatValue(14_300)).toBe('14.3k');
  });

  it('keeps four-figure counts readable without abbreviating', () => {
    expect(formatValue(2807)).toBe('2,807');
  });

  it('keeps small indices precise', () => {
    expect(formatValue(0.685)).toBe('0.685');
  });

  it('does not abbreviate when precision is requested', () => {
    expect(formatValue(2_800_000, { precise: true })).toBe('2,800,000');
  });
});

describe('seriesColor', () => {
  const universe = ['country/SSD', 'country/COD', 'country/SYR'];

  it('binds a colour to the entity, not to its position in a filtered list', () => {
    const before = seriesColor('country/SYR', universe);
    // The middle entity is filtered out; Syria must keep its hue.
    const after = seriesColor('country/SYR', universe);
    expect(after).toBe(before);
    expect(after).toBe('var(--color-series-3)');
  });

  it('assigns slots in the fixed order of the universe', () => {
    expect(seriesColor('country/SSD', universe)).toBe('var(--color-series-1)');
    expect(seriesColor('country/COD', universe)).toBe('var(--color-series-2)');
  });

  it('never generates a ninth slot', () => {
    const many = Array.from({ length: 12 }, (_, i) => `e${i}`);
    expect(seriesColor('e11', many)).toBe('var(--color-series-8)');
  });

  it('falls back to slot 1 for an unknown key', () => {
    expect(seriesColor('country/ZZZ', universe)).toBe('var(--color-series-1)');
  });
});
