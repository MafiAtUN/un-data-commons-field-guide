import { describe, expect, it } from 'vitest';
import { MILESTONES, orderedMilestones, timelineSpan } from '../src/content/timeline';

/**
 * A timeline is the easiest kind of page to fill with plausible-sounding dates
 * that nobody checks. These hold the file to the one rule that makes it
 * trustworthy: every claim carries a source, and the order cannot drift from
 * the labels.
 */
describe('the history of the platform', () => {
  it('covers the whole arc, not just the launch', () => {
    expect(MILESTONES.length).toBeGreaterThanOrEqual(8);
  });

  it('sorts into the order it displays', () => {
    const keys = orderedMilestones().map((m) => m.sort);
    expect(keys).toEqual([...keys].sort());
  });

  it('uses a sort key that agrees with the label it shows', () => {
    for (const milestone of MILESTONES) {
      const year = milestone.sort.slice(0, 4);
      expect(milestone.when, milestone.title).toContain(year);
      expect(milestone.sort, milestone.title).toMatch(/^\d{4}-\d{2}$/);
    }
  });

  it('gives every entry a source that is a real link', () => {
    for (const milestone of MILESTONES) {
      expect(milestone.source.href, milestone.title).toMatch(/^https:\/\//);
      expect(milestone.source.label.length, milestone.title).toBeGreaterThan(2);
    }
  });

  it('names who did each thing, so no milestone is authorless', () => {
    for (const milestone of MILESTONES) {
      expect(milestone.actors.length, milestone.title).toBeGreaterThan(3);
      expect(milestone.body.split(/\s+/).length, milestone.title).toBeGreaterThan(15);
    }
  });

  it('marks exactly one entry as the headline', () => {
    const headlines = MILESTONES.filter((m) => m.headline);
    expect(headlines).toHaveLength(1);
    // The launch this whole site exists to explain.
    expect(headlines[0]!.sort).toBe('2026-09');
  });

  it('carries both strands, because the convergence is the story', () => {
    const strands = new Set(MILESTONES.map((m) => m.strand));
    expect(strands).toEqual(new Set(['un', 'tech']));
  });

  it('starts before the platform and ends after it', () => {
    const ordered = orderedMilestones();
    expect(Number(ordered[0]!.sort.slice(0, 4))).toBeLessThan(2026);
    expect(Number(ordered[ordered.length - 1]!.sort.slice(0, 4))).toBeGreaterThanOrEqual(2026);
  });

  it('reports a span the heading can state without going stale', () => {
    const span = timelineSpan();
    expect(span.years).toBe(Number(span.to) - Number(span.from));
    expect(span.years).toBeGreaterThan(15);
  });

  it('has no duplicate dates', () => {
    const keys = MILESTONES.map((m) => m.sort);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
