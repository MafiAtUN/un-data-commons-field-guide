import { describe, expect, it } from 'vitest';
import { MOVED, url } from '../src/lib/paths';
import { GUIDES } from '../src/content/guides';

/**
 * Addresses. In tests the base path is "/", so these read as site paths; the
 * built-site tests check the same thing under the real base.
 */
describe('url()', () => {
  it('adds a trailing slash to a page', () => {
    expect(url('/courses/find')).toBe('/courses/find/');
    expect(url('/')).toBe('/');
  });

  it('translates an old address, keeping its section', () => {
    expect(url('/notebooks#undata')).toBe('/guides/python-r-julia/#undata');
    expect(url('/cookbook')).toBe('/guides/api/');
    expect(url('/cookbook/')).toBe('/guides/api/');
  });

  it('keeps a query string', () => {
    expect(url('/videos/?q=latest')).toBe('/videos/?q=latest');
  });

  it('leaves files, other sites and in-page anchors alone', () => {
    expect(url('/un-data-commons.ipynb')).toBe('/un-data-commons.ipynb');
    expect(url('https://data.un.org')).toBe('https://data.un.org');
    expect(url('#steps')).toBe('#steps');
  });
});

describe('every old address', () => {
  const live = new Set(['/videos/', ...GUIDES.map((g) => g.path)]);

  it('forwards to a page that exists', () => {
    for (const [from, to] of Object.entries(MOVED)) {
      expect(live.has(to), `${from} -> ${to}`).toBe(true);
    }
  });

  it('covers all sixteen pages of the old site', () => {
    expect(Object.keys(MOVED).sort()).toEqual(
      [
        '/ai', '/catalogue', '/cite', '/connect', '/cookbook', '/dashboards', '/development',
        '/lab', '/notebooks', '/peace-and-security', '/scenarios', '/start', '/toolkit',
        '/tutorials', '/visualise', '/watch',
      ].sort(),
    );
  });
});
