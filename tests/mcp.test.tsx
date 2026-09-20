import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Connect } from '../src/routes/Connect';
import { ENDPOINTS } from '../src/lib/undc/config';

/**
 * The MCP page, which is mostly claims about a server that can change.
 *
 * Everything here was verified by calling the live server, most recently on
 * 20 September 2026. Three of those claims are the ones a reader will act on
 * and be hurt by if they rot, so they are pinned:
 *
 *  - which tools actually work (five of six), and the place-argument rule:
 *    a plain name resolves, a dcid falls through to a disabled geocoder and
 *    answers 500;
 *  - the Accept header, without which every request is a 406;
 *  - that a wrong dcid returns success with an empty data object rather than an
 *    error, which is the failure mode that makes an assistant confabulate.
 *
 * The page previously claimed places always 500s and that search_child_indicators
 * was unreachable. Both were wrong — plain names work on both search tools — and
 * the regression test below exists so that wording cannot come back without
 * someone re-running the calls.
 */
const html = renderToStaticMarkup(
  <MemoryRouter>
    <Connect />
  </MemoryRouter>,
);

describe('setup instructions', () => {
  it('gives the endpoint the rest of the site uses', () => {
    expect(html).toContain(ENDPOINTS.mcp);
    expect(ENDPOINTS.mcp.endsWith('/mcp')).toBe(true);
  });

  it('covers the four clients people actually have', () => {
    for (const client of ['Claude Code', 'Claude Desktop', 'VS Code', 'Cursor']) {
      expect(html, client).toContain(client);
    }
  });

  it('tells a reader how to confirm the connection rather than assume it', () => {
    // A number with no tool call means the model is recalling, which is the
    // exact failure this page exists to prevent.
    expect(html).toContain('13.07');
    expect(html.toLowerCase()).toContain('no tool call');
  });

  it('has somewhere to send a reader whose assistant has no MCP', () => {
    expect(html).toContain('href="/ai"');
  });
});

describe('the tool reference is honest about what works', () => {
  it('names all six tools', () => {
    for (const tool of [
      'search_indicators',
      'search_child_indicators',
      'get_variable_metadata',
      'get_observations',
      'get_child_observations',
      'get_multi_entity_observations',
    ]) {
      expect(html, tool).toContain(tool);
    }
  });

  it('marks the one that cannot be used on this deployment', () => {
    // Rendered once: get_multi_entity_observations is the only dead tool here.
    // search_child_indicators was marked broken until 20 September 2026, when
    // calling it with plain place names turned out to work; see the geocoder test.
    expect(html.match(/No data here/g)?.length).toBe(1);
    expect(html).toContain('Five tools, not six');
  });

  it('explains the geocoder failure and gives the way around it', () => {
    expect(html).toContain('500');
    expect(html.toLowerCase()).toContain('geocoder');
    // The rule is the part that makes the trap actionable, and it is the
    // inverse of the REST rule: a name works where a dcid does not.
    expect(html).toContain('country/KEN');
    expect(html).toContain('Kenya');
  });

  it('does not tell readers to drop the places argument', () => {
    // The page said "do not pass places" and "search_child_indicators is
    // unreachable" until both were shown to be false. Guard the regression:
    // plain names work on both search tools.
    expect(html).not.toContain('Four tools, not six');
    expect(html).not.toMatch(/drop the optional places argument/i);
    expect(html).not.toMatch(/unreachable here/i);
  });
});

describe('the traps that cost real time', () => {
  it('states the mandatory Accept header and its failure code', () => {
    expect(html).toContain('406');
    expect(html).toContain('text/event-stream');
  });

  it('warns that a guessed identifier succeeds emptily', () => {
    expect(html).toContain('undata/sdg/SH_STA_MORT');
    expect(html).toContain('isError: false');
  });

  it('carries the newline rule that applies to every POST route here', () => {
    expect(html).toContain('403');
  });
});

describe('steering instructions', () => {
  it('ships a paste-ready block rather than only describing the problem', () => {
    expect(html).toContain('WITHOUT the &quot;places&quot; argument');
    expect(html).toContain('Never call search_child_indicators');
  });
});

describe('the worked example is real', () => {
  it('quotes the observation values the live server returns', () => {
    // Verified 19 September 2026 against get_observations for South Sudan.
    for (const value of ['21.76896', '13.06997', '25.9185']) {
      expect(html, value).toContain(value);
    }
    expect(html).toContain('unstats.un.org/sdgs/dataportal');
  });

  it('shows the three-step pipeline in the order the playbook demands', () => {
    // The step headings, not tool names: the JSON-RPC calls sit inside
    // Expanders and so are absent from the first paint by design.
    const playbook = html.indexOf('reads the playbook first');
    const discovery = html.indexOf('Discovery — it finds candidate variables');
    const assessment = html.indexOf('Assessment — it qualifies before it fetches');
    const retrieval = html.indexOf('Retrieval — and only now the numbers');

    for (const [name, at] of Object.entries({ playbook, discovery, assessment, retrieval })) {
      expect(at, `${name} step is missing`).toBeGreaterThan(-1);
    }
    expect(playbook).toBeLessThan(discovery);
    expect(discovery).toBeLessThan(assessment);
    expect(assessment).toBeLessThan(retrieval);
  });
});
