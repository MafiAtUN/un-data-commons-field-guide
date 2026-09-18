import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { HOME_SECTIONS } from '../src/content/sections';

const home = readFileSync(new URL('../src/routes/Home.tsx', import.meta.url), 'utf8');

/**
 * The rail is only honest if it names sections that exist.
 *
 * It is a manifest in one file and `id` attributes in another, with nothing at
 * compile time tying them together — so a section renamed on the page would
 * leave a rail entry that scrolls nowhere, silently.
 */
describe('the floating section rail', () => {
  it('lists enough sections to show the page has depth', () => {
    expect(HOME_SECTIONS.length).toBeGreaterThanOrEqual(5);
  });

  it('points every entry at an id that exists on the page', () => {
    const missing = HOME_SECTIONS.filter((section) => !home.includes(`id="${section.id}"`));
    expect(missing.map((s) => s.id)).toEqual([]);
  });

  it('starts at the top of the page', () => {
    expect(HOME_SECTIONS[0]!.id).toBe('top');
  });

  it('has no duplicate ids', () => {
    const ids = HOME_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps labels short enough to sit in the rail', () => {
    for (const section of HOME_SECTIONS) {
      expect(section.label.length, section.id).toBeLessThanOrEqual(28);
      expect(section.label.length, section.id).toBeGreaterThan(3);
    }
  });

  it('gives every jump target room under the sticky header', () => {
    // Without scroll-mt the header covers the heading that was jumped to.
    for (const section of HOME_SECTIONS.slice(1)) {
      const at = home.indexOf(`id="${section.id}"`);
      const nearby = home.slice(at, at + 220);
      expect(nearby, section.id).toContain('scroll-mt-');
    }
  });

  it('offers a cue out of the hero, pointing at the second section', () => {
    expect(home).toContain('<ScrollCue');
    expect(home).toContain('HOME_SECTIONS[1]');
  });
});
