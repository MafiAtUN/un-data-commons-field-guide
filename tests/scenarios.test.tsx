import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { SCENARIOS, findScenario } from '../src/content/scenarios';
import { Scenarios } from '../src/routes/Scenarios';
import { chooseEndpoint, specProblems } from '../src/lib/undc/recipes';
import { parseDcid } from '../src/lib/undc/dcid';

/**
 * The scenarios are hand-written claims about the live platform.
 *
 * They quote counts — 210 countries, 14 countries — that were measured on
 * 19 September 2026 and that a reader will take at face value, so the risk here
 * is not a crash but a confident wrong number nobody re-checks. These tests
 * cannot re-measure; what they can do is hold the internal contract, so that a
 * scenario whose numbers are edited cannot drift away from the story told about
 * them, and a scenario cannot ship without the failure steps that make its
 * discovery trail honest.
 */
describe('every scenario is complete', () => {
  it('is phrased the way a colleague phrases it', () => {
    for (const scenario of SCENARIOS) {
      // Requests arrive as questions and as flat statements of need. Both are
      // fine; what is not fine is a heading written in the platform's voice.
      expect(scenario.question, scenario.slug).toMatch(/[?.]$/);
      expect(scenario.question.length, scenario.slug).toBeGreaterThan(25);
      expect(scenario.asker.length, scenario.slug).toBeGreaterThan(10);
      expect(scenario.lead.length, scenario.slug).toBeGreaterThan(80);
    }
  });

  it('has a unique slug and can be looked up by it', () => {
    const slugs = SCENARIOS.map((scenario) => scenario.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(findScenario(slug)?.slug).toBe(slug);
    expect(findScenario('no-such-scenario')).toBeUndefined();
  });

  it('carries a finding and a recommended chart, not just a recipe', () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.finding.headline.length, scenario.slug).toBeGreaterThan(20);
      expect(scenario.finding.body.length, scenario.slug).toBeGreaterThan(150);
      expect(scenario.chart.length, scenario.slug).toBeGreaterThan(80);
    }
  });
});

describe('the discovery trails are honest', () => {
  it('records what each step returned', () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.discovery.length, scenario.slug).toBeGreaterThan(0);
      for (const step of scenario.discovery) {
        expect(step.result.length, `${scenario.slug}: ${step.action}`).toBeGreaterThan(40);
      }
    }
  });

  it('keeps the failures in the lead scenario', () => {
    // A trail that only shows the successful queries teaches nobody how to
    // search — it just shows someone who already knew the answer.
    const trail = findScenario('conflict-and-income')!.discovery;
    expect(trail.some((step) => step.outcome === 'dead-end')).toBe(true);
    expect(trail.some((step) => step.outcome === 'near-miss')).toBe(true);
    expect(trail.some((step) => step.outcome === 'found')).toBe(true);
  });

  it('ends every trail somewhere', () => {
    for (const scenario of SCENARIOS) {
      expect(
        scenario.discovery.at(-1)?.outcome,
        `${scenario.slug} must not end on a dead end`,
      ).toBe('found');
    }
  });
});

describe('the specs are runnable', () => {
  it('has no outstanding problems', () => {
    for (const scenario of SCENARIOS) {
      expect(specProblems(scenario.spec), scenario.slug).toEqual([]);
    }
  });

  it('matches the endpoint to the declared shape', () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.spec.shape, scenario.slug).toBe(scenario.shape);
      const { path } = chooseEndpoint(scenario.spec);
      expect(path, scenario.slug).toBe(
        scenario.shape === 'trend' ? '/api/observations/series' : '/core/api/v2/observation',
      );
    }
  });

  it('uses well-formed identifiers that the page also documents', () => {
    for (const scenario of SCENARIOS) {
      for (const variable of scenario.variables) {
        expect(parseDcid(variable.dcid), variable.dcid).not.toBeNull();
        expect(variable.countryCoverage, variable.dcid).toBeGreaterThan(0);
        expect(variable.foundBy.length, variable.dcid).toBeGreaterThan(10);
      }
      // Every variable in the spec is explained, and nothing is explained that
      // is not fetched.
      expect(scenario.variables.map((v) => v.dcid).sort()).toEqual([...scenario.spec.variables].sort());
    }
  });
});

describe('the lead scenario keeps the number that stops the chart', () => {
  const scatter = findScenario('conflict-and-income')!;

  it('states both coverages, measured live', () => {
    const [gdp, conflict] = scatter.variables;
    expect(gdp!.countryCoverage).toBe(210);
    expect(conflict!.countryCoverage).toBe(14);
  });

  it('says why the fourteen are not a random sample', () => {
    // The point of the scenario is selection, not sparseness.
    expect(scatter.finding.body).toMatch(/absent|removed|sample/i);
    expect(scatter.finding.body).toContain('Norway');
  });
});

describe('the page renders', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <Scenarios />
    </MemoryRouter>,
  );

  it('shows every scenario question', () => {
    for (const scenario of SCENARIOS) {
      expect(html).toContain(scenario.question.replace(/'/g, '&#x27;'));
    }
  });

  it('gives each scenario a jump target matching its slug', () => {
    for (const scenario of SCENARIOS) {
      expect(html, scenario.slug).toContain(`id="${scenario.slug}"`);
    }
  });

  it('teaches the graph walk, which is the rung people skip', () => {
    expect(html).toContain('specializationOf');
    expect(html).toContain('memberOf');
    // The naming trap that makes guessing fail.
    expect(html).toContain('ind-16-1-2');
  });
});
