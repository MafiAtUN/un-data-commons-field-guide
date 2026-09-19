import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Dashboards } from '../src/routes/Dashboards';
import { Notebooks } from '../src/routes/Notebooks';
import { ENDPOINTS, API_ROOT } from '../src/lib/undc/config';

/**
 * The two pages that ship runnable code for someone else's tool.
 *
 * Every other page on the site can be wrong in a way a reader notices. These
 * two cannot: a colleague pastes the M into Power Query or the function into a
 * notebook, and a wrong endpoint or a missing guard costs them an afternoon
 * before they conclude the platform is broken.
 *
 * So this suite guards the parts that were verified against the live API by
 * hand — the endpoints, the response keys the code navigates, and the three
 * defects that make the snippets longer than a one-liner. It cannot prove the
 * code runs. It can prove nobody has quietly edited the URL, dropped the
 * empty-series branch, or started recommending a wide table.
 */
function render(page: React.ReactNode): string {
  return renderToStaticMarkup(<MemoryRouter>{page}</MemoryRouter>);
}

const dashboards = render(<Dashboards />);
const notebooks = render(<Notebooks />);
const both = [
  ['Power BI & Tableau', dashboards],
  ['Python, R & Julia', notebooks],
] as const;

describe('the integration pages quote the real deployment', () => {
  it('uses the same API root as the rest of the site', () => {
    for (const [name, html] of both) {
      expect(html, name).toContain(API_ROOT);
      // A stale deployment address is the one error that makes every snippet
      // on the page fail at once, so no other host may appear.
      expect(html.includes('datacommons.org/api'), name).toBe(false);
    }
  });

  it('names the endpoints the code actually calls', () => {
    for (const [name, html] of both) {
      expect(html, name).toContain('/api/observations/series');
      expect(html, name).toContain('/core/api/v2/observation');
    }
    expect(dashboards).toContain('/api/place/name');
    expect(ENDPOINTS.series.endsWith('/api/observations/series')).toBe(true);
    expect(ENDPOINTS.placeName.endsWith('/api/place/name')).toBe(true);
  });

  it('navigates the response keys the live API returns', () => {
    // Verified by hand against the deployment: the series endpoint nests
    // data → variable → entity → series, and the v2 endpoint adds a ranked
    // orderedFacets level above the observations.
    for (const [name, html] of both) {
      expect(html, name).toContain('facet');
      expect(html, name).toContain('orderedFacets');
    }
    expect(notebooks).toContain('byVariable');
    expect(notebooks).toContain('byEntity');
  });
});

describe('the integration pages keep the three guards', () => {
  it('handles a series that came back empty', () => {
    // An entity with no observations is absent from the response, not zero.
    // Every snippet has to say so, or a data gap is charted as a measurement.
    expect(dashboards).toContain('Table.RowCount');
    expect(notebooks).toContain('no data for');
    expect(notebooks.toLowerCase()).toContain('absent is not zero');
  });

  it('guards the facet fields that are genuinely optional', () => {
    // HDI facets carry no unitDisplayName at all.
    expect(dashboards).toContain('Record.FieldOrDefault');
    expect(notebooks).toContain('%||%');
    expect(notebooks).toContain('missing');
  });

  it('keeps the year as a year rather than inventing a date', () => {
    for (const [name, html] of both) {
      expect(html, name).toContain('year');
    }
    expect(dashboards).toContain('Text.Start');
  });
});

describe('the integration pages carry the provenance through', () => {
  it('joins the facet onto every row rather than dropping it', () => {
    for (const [name, html] of both) {
      expect(html, name).toContain('provenanceUrl');
      expect(html, name).toContain('unitDisplayName');
    }
  });

  it('argues for long, not wide', () => {
    expect(dashboards).toContain('One row per observation');
    expect(notebooks).toContain('One row per observation');
  });
});

describe('the integration pages are reachable from each other', () => {
  it('links the BI page to the language page and back', () => {
    expect(dashboards).toContain('href="/notebooks"');
    expect(notebooks).toContain('href="/dashboards"');
  });

  it('sends a reader back to the cookbook for the API itself', () => {
    for (const [name, html] of both) {
      expect(html, name).toContain('href="/cookbook"');
    }
  });
});
