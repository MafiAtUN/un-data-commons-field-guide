import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const navigation = readFileSync(new URL('../src/content/navigation.ts', import.meta.url), 'utf8');
const postbuild = readFileSync(new URL('../scripts/postbuild.mjs', import.meta.url), 'utf8');

/** The route paths the build materialises as static directories. */
const emitted = [...postbuild.matchAll(/^ {2}'([a-z-]+)',$/gm)].map((match) => match[1]!);

/**
 * Guards the contract between the router, the navigation and the build.
 *
 * A route the router knows about but the build does not materialise still works
 * when clicked, and returns HTTP 404 when opened cold — which is exactly the
 * case that breaks social-preview cards on a shared link. Nothing at compile
 * time catches that, because the build script is plain Node.
 */
describe('route manifest', () => {
  it('materialises a static directory for every declared route', () => {
    expect(emitted.length).toBeGreaterThan(0);
  });

  it('emits every route the router serves', () => {
    const routed = [...app.matchAll(/path="\/([a-z-]+)"/g)].map((match) => match[1]!);
    const missing = routed.filter((route) => !emitted.includes(route));
    expect(missing).toEqual([]);
  });

  it('routes everything it emits', () => {
    const unrouted = emitted.filter((route) => !app.includes(`path="/${route}"`));
    expect(unrouted).toEqual([]);
  });

  it('has a page component for every route', () => {
    // Each Route element must reference an element, not be left as a stub.
    for (const route of emitted) {
      const pattern = new RegExp(`path="/${route}" element=\\{<\\w+ ?/>\\}`);
      expect(app, route).toMatch(pattern);
    }
  });

  it('links every emitted route from the navigation manifest', () => {
    // The manifest feeds the rail, the command palette, the mobile menu and the
    // front page's contents list at once, so this one assertion covers all four.
    const unlinked = emitted.filter((route) => !navigation.includes(`to: '/${route}'`));
    expect(unlinked).toEqual([]);
  });

  it('keeps a catch-all so unknown paths render the not-found page', () => {
    expect(app).toContain('path="*"');
  });
});
