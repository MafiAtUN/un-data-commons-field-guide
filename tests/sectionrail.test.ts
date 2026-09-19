import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { HOME_SECTIONS } from '../src/content/sections';

const home = readFileSync(new URL('../src/routes/Home.tsx', import.meta.url), 'utf8');
const chapter = readFileSync(new URL('../src/components/home/Chapter.tsx', import.meta.url), 'utf8');

/** Most chapters get their id via <Chapter id="…">; a couple are inline sections. */
function renderedByChapter(id: string): boolean {
  return home.includes(`<Chapter
        id="${id}"`) || home.includes(`<Chapter id="${id}"`);
}

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
    // Without scroll-mt the sticky header covers the heading just jumped to.
    // Chapters inherit it centrally; anything hand-rolled must carry its own.
    expect(chapter, 'Chapter').toContain('scroll-mt-');

    for (const section of HOME_SECTIONS.slice(1)) {
      if (renderedByChapter(section.id)) continue;
      const at = home.indexOf(`id="${section.id}"`);
      expect(at, section.id).toBeGreaterThan(-1);
      expect(home.slice(at, at + 260), section.id).toContain('scroll-mt-');
    }
  });

  it('gives every chapter its own accent, and reuses volt only at the ends', () => {
    // The point of the accents is that a long page reads as chapters. Two
    // adjacent chapters sharing a hue would undo that.
    const accents = HOME_SECTIONS.map((s) => s.accent);
    for (let i = 1; i < accents.length; i += 1) {
      expect(accents[i], `${HOME_SECTIONS[i]!.id} vs ${HOME_SECTIONS[i - 1]!.id}`)
        .not.toBe(accents[i - 1]);
    }
    // Volt is the brand colour and bookends the page.
    expect(accents[0]).toBe('volt');
    expect(accents[accents.length - 1]).toBe('volt');
  });

  it('offers a cue out of the hero, pointing at the second section', () => {
    expect(home).toContain('<ScrollCue');
    expect(home).toContain('HOME_SECTIONS[1]');
  });
});
