import { describe, expect, it } from 'vitest';
import {
  buildAllRecipes,
  buildRecipe,
  chooseEndpoint,
  sanitizeDcid,
  specProblems,
  TOOL_LABELS,
  type RecipeSpec,
  type Tool,
} from '../src/lib/undc/recipes';

/**
 * The generator emits code that a colleague pastes into a tool and runs.
 *
 * Nothing downstream will catch a mistake here: a wrong endpoint, an
 * unencoded relation expression or a dropped variable produces code that fails
 * in somebody else's Power BI, hours later, with no connection back to this
 * repository. So the properties that make output safe to paste are asserted for
 * every tool and every shape rather than spot-checked.
 */
const TOOLS = Object.keys(TOOL_LABELS) as Tool[];

const TREND: RecipeSpec = {
  variables: ['undata/sdg/EG_ACS_ELEC'],
  entities: ['country/BGD', 'country/ETH'],
  shape: 'trend',
};
const RANKING: RecipeSpec = {
  variables: ['undata/undphdro/HDI_hdi'],
  entities: [],
  parentPlace: 'SouthernAsia',
  shape: 'ranking',
};
const SCATTER: RecipeSpec = {
  variables: ['undata/unicef/SPP_GDPPC', 'undata/sdg/VC_DTH_TOTR'],
  entities: [],
  parentPlace: 'Earth',
  shape: 'scatter',
};
const ALL = [
  ['trend', TREND],
  ['ranking', RANKING],
  ['scatter', SCATTER],
] as const;

describe('endpoint choice', () => {
  it('sends a trend to the series endpoint and everything else to REST v2', () => {
    expect(chooseEndpoint(TREND).path).toBe('/api/observations/series');
    expect(chooseEndpoint(TREND).method).toBe('POST');

    for (const spec of [RANKING, SCATTER]) {
      expect(chooseEndpoint(spec).path).toBe('/core/api/v2/observation');
      expect(chooseEndpoint(spec).method).toBe('GET');
    }
  });

  it('explains itself in words a reader can act on', () => {
    for (const [, spec] of ALL) {
      expect(chooseEndpoint(spec).why.length).toBeGreaterThan(40);
    }
  });
});

describe('every tool, every shape', () => {
  it('mentions each requested variable', () => {
    for (const [name, spec] of ALL) {
      for (const tool of TOOLS) {
        const code = buildRecipe(spec, tool);
        for (const variable of spec.variables) {
          expect(code, `${tool}/${name}/${variable}`).toContain(variable);
        }
      }
    }
  });

  it('points at the right host and endpoint', () => {
    for (const [name, spec] of ALL) {
      const { path } = chooseEndpoint(spec);
      for (const tool of TOOLS) {
        const code = buildRecipe(spec, tool);
        expect(code, `${tool}/${name}`).toContain('unsd-datacommons.gcp.un-icc.cloud');
        // Power Query splits host and path across Base and RelativePath.
        const wanted = tool === 'powerquery' ? path.replace(/^\//, '') : path;
        expect(code, `${tool}/${name}`).toContain(wanted);
      }
    }
  });

  it('never leaves a template placeholder in the output', () => {
    for (const [name, spec] of ALL) {
      for (const tool of TOOLS) {
        expect(buildRecipe(spec, tool), `${tool}/${name}`).not.toMatch(/\$\{|undefined|\[object/);
      }
    }
  });

  it('produces something substantial rather than a stub', () => {
    for (const [name, spec] of ALL) {
      for (const tool of TOOLS) {
        expect(buildRecipe(spec, tool).split('\n').length, `${tool}/${name}`).toBeGreaterThan(5);
      }
    }
  });

  it('builds every tool at once for the tabbed view', () => {
    const all = buildAllRecipes(SCATTER);
    expect(Object.keys(all).sort()).toEqual([...TOOLS].sort());
  });
});

describe('the containment expression survives each language intact', () => {
  it('carries the arrows and braces the graph needs', () => {
    for (const tool of TOOLS) {
      const code = buildRecipe(RANKING, tool);
      expect(code, tool).toContain('containedInPlace');
      expect(code, tool).toContain('typeOf:Country');
    }
  });

  it('escapes the braces Python would read as a format spec', () => {
    // f"{PARENT}<-containedInPlace+{typeOf:Country}" is not a literal brace —
    // Python parses `:Country` as a format specifier and emits the wrong URL.
    const python = buildRecipe(RANKING, 'python');
    expect(python).toContain('{{typeOf:Country}}');
  });

  it('tells R to explode repeated keys rather than join them', () => {
    // A comma-joined select= is accepted by the server and comes back with
    // every entity present and no observations inside — a silent empty result.
    expect(buildRecipe(RANKING, 'r')).toContain('.multi');
    expect(buildRecipe(RANKING, 'r')).toContain('explode');
  });

  it('keeps Power Query off the Query record for repeated keys', () => {
    const m = buildRecipe(RANKING, 'powerquery');
    expect(m).toContain('RelativePath');
    expect(m).toContain('Uri.EscapeDataString');
    expect(m).toContain('select=date&select=value&select=entity&select=variable');
  });
});

describe('the scatter always carries its own warning', () => {
  it('counts both sides and the join in every language', () => {
    for (const tool of TOOLS) {
      const code = buildRecipe(SCATTER, tool).toLowerCase();
      expect(code, tool).toMatch(/inner join|joinkind\.inner|innerjoin|merge|to_entries/);
    }
    // The four that produce a frame say the count out loud.
    for (const tool of ['python', 'r', 'julia', 'powerquery'] as const) {
      expect(buildRecipe(SCATTER, tool).toLowerCase(), tool).toContain('countries');
    }
  });
});

describe('input handling', () => {
  it('strips anything that could escape a generated string literal', () => {
    // Quotes, semicolons and spaces go; the characters a dcid legitimately
    // uses — slash, dot, underscore, hyphen — stay.
    expect(sanitizeDcid('undata/sdg/VC"_DTH\'; rm -rf /')).toBe('undata/sdg/VC_DTHrm-rf/');
    expect(sanitizeDcid('africa<-containedInPlace+{typeOf:Country}')).toBe(
      'africa<-containedInPlace+{typeOf:Country}',
    );
  });

  it('keeps a quote out of the output whatever the reader typed', () => {
    const hostile: RecipeSpec = {
      variables: ['a"b', "c'd"],
      entities: ['country/X"Y'],
      shape: 'trend',
    };
    for (const tool of TOOLS) {
      const code = buildRecipe(hostile, tool);
      expect(code, tool).not.toContain('a"b');
      expect(code, tool).not.toContain("c'd");
    }
  });
});

describe('spec problems are reported, not thrown', () => {
  it('asks for a second indicator before a scatter', () => {
    const problems = specProblems({ ...SCATTER, variables: ['undata/unicef/SPP_GDPPC'] });
    expect(problems.join(' ')).toContain('two indicators');
  });

  it('asks for places before a trend', () => {
    expect(specProblems({ ...TREND, entities: [] }).join(' ')).toContain('named places');
  });

  it('rejects a date that is not a year', () => {
    expect(specProblems({ ...RANKING, date: 'last tuesday' }).join(' ')).toContain('four-digit');
    expect(specProblems({ ...RANKING, date: '2024' })).toEqual([]);
    expect(specProblems({ ...RANKING, date: 'LATEST' })).toEqual([]);
  });

  it('is silent when the spec is complete', () => {
    for (const [, spec] of ALL) expect(specProblems(spec)).toEqual([]);
  });
});
