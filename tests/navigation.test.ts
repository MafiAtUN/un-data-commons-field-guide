import { describe, expect, it } from 'vitest';
import {
  DESTINATIONS,
  FIRST_TECHNICAL,
  HOME,
  searchDestinations,
} from '../src/content/navigation';

/**
 * The navigation is now an ordered axis rather than two buckets, which makes a
 * few things breakable that a dropdown could not break: a stop in the wrong
 * place, a track that is not contiguous, a destination nobody can find by
 * typing the obvious word for it.
 */
describe('the depth rail', () => {
  it('carries every destination exactly once', () => {
    const paths = DESTINATIONS.map((destination) => destination.to);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('runs practical first, then technical, without interleaving', () => {
    const tracks = DESTINATIONS.map((destination) => destination.track);
    const firstTechnical = tracks.indexOf('technical');

    expect(firstTechnical).toBe(FIRST_TECHNICAL);
    expect(firstTechnical).toBeGreaterThan(0);
    // Once the rail turns technical it must stay technical, or the boundary
    // marker on the ladder lands in the middle of the practical track.
    expect(tracks.slice(firstTechnical).every((track) => track === 'technical')).toBe(true);
  });

  it('gives every stop a hint and an honest reading time', () => {
    for (const destination of [HOME, ...DESTINATIONS]) {
      expect(destination.hint.length, destination.label).toBeGreaterThan(10);
      expect(destination.time, destination.label).toMatch(/^\d+ (sec|min)$/);
    }
  });

  it('points every stop at an absolute in-app path', () => {
    for (const destination of [HOME, ...DESTINATIONS]) {
      expect(destination.to, destination.label).toMatch(/^\//);
    }
  });
});

describe('command palette search', () => {
  it('returns everything for an empty query', () => {
    expect(searchDestinations('').length).toBe(DESTINATIONS.length + 1);
  });

  it('ranks a label match above a keyword match', () => {
    const results = searchDestinations('chart');
    expect(results[0]?.to).toBe('/visualise');
  });

  it('finds pages by the word a reader would actually type', () => {
    // None of these words appear in the label of the page they should find.
    const expectations: Record<string, string> = {
      excel: '/toolkit',
      apa: '/cite',
      chatgpt: '/ai',
      curl: '/cookbook',
      mcp: '/connect',
    };

    for (const [query, to] of Object.entries(expectations)) {
      expect(searchDestinations(query)[0]?.to, query).toBe(to);
    }
  });

  it('returns nothing rather than guessing at a query it cannot match', () => {
    expect(searchDestinations('zzzzqx')).toEqual([]);
  });
});
