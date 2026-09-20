import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Cookbook } from '../src/routes/Cookbook';

/**
 * The cookbook, which is a page of claims about a live API.
 *
 * Recipes 6 and 7 and the last two trip-ups were added on 20 September 2026
 * after calling the deployment. They are pinned here because each one is a
 * number a reader will act on, and each describes a call that *succeeds* while
 * being wrong — which is precisely the kind of claim that rots without anyone
 * noticing, because nothing errors.
 */
const html = renderToStaticMarkup(
  <MemoryRouter>
    <Cookbook />
  </MemoryRouter>,
);

describe('recipe 6 — name to dcid', () => {
  it('uses the resolve endpoint with a two-part relation expression', () => {
    expect(html).toContain('/core/api/v2/resolve');
    // A one-part expression returns 400; the two-part form is the whole point.
    expect(html).toContain('&lt;-description-&gt;dcid');
  });

  it('teaches candidates as a list, with the ambiguity that proves it', () => {
    expect(html).toContain('candidates');
    expect(html).toContain('geoId/13');
    expect(html).toContain('country/GEO');
  });

  it('explains that a 500 here means not-found', () => {
    expect(html).toContain('Kenyaa');
    expect(html.toLowerCase()).toContain('geocoder');
  });
});

describe('recipe 7 — pagination', () => {
  it('names the cap, the token and the real total', () => {
    expect(html).toContain('nextToken');
    expect(html).toContain('500');
    // Africa is the worked example: 2,739 nodes across 6 pages.
    expect(html).toContain('2,739');
  });

  it('says the absence of a token is the only end signal', () => {
    expect(html).toMatch(/until .{0,20}nextToken.{0,20} is absent/i);
  });

  it('scopes the cap to node walks, not observation queries', () => {
    // Readers must not start paginating Recipe 2, which is not capped.
    expect(html).toMatch(/observation endpoints are not capped/i);
  });
});

describe('the two traps that succeed while lying', () => {
  it('warns that sub-national queries return dependent territories', () => {
    expect(html).toContain('AdministrativeArea1');
    expect(html).toContain('13');
    expect(html).toContain('Hong Kong');
  });

  it('warns that one indicator under two agencies is one source', () => {
    expect(html).toContain('undata/sdg/SH_STA_MORT.SEX--F');
    expect(html).toContain('undata/unicef/MNCH_MMR.SEX--F');
    // The rounding pair is the evidence that they are the same estimate.
    expect(html).toContain('378.79578');
    expect(html).toContain('378.8');
  });
});

describe('the trip-up list stays honest about its own length', () => {
  it('counts what it actually lists', () => {
    const heading = html.match(/(\w+) things that will trip you up/)?.[1];
    const words: Record<string, number> = { Six: 6, Seven: 7, Eight: 8, Nine: 9, Ten: 10 };
    expect(heading, 'heading not found').toBeDefined();
    const claimed = words[heading!];
    expect(claimed, `unhandled number word: ${heading}`).toBeDefined();
    // Each trip-up renders one numbered <h3> inside the ordered list.
    const listed = html.split('things that will trip you up')[1] ?? '';
    const items = listed.match(/<h3 class="text-\[0\.9rem\] font-semibold text-ink-primary">/g)?.length ?? 0;
    expect(items).toBe(claimed);
  });
});
