import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Every curl sample on the site, checked for the one defect that makes it fail.
 *
 * This deployment sits behind a filter that rejects any POST whose body
 * contains a line break: `curl -d '{ \n "variables": … }'` comes back **403
 * Forbidden**, deterministically, on every POST route including /mcp. Spaces
 * and tabs are fine; a single trailing newline is not.
 *
 * That is a uniquely cruel failure for this API, because there are no
 * credentials anywhere in it — so a reader who meets a 403 has no reason to
 * suspect their JSON formatting and every reason to suspect the platform. Five
 * samples shipped on this site with pretty-printed bodies before anyone ran
 * them end to end.
 *
 * Prettifying a JSON body is exactly the kind of edit that looks like tidying,
 * which is why this is a test and not a comment.
 */
function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry) ? [path] : [];
  });
}

/** Each `-d '…'` payload in a file, with the line it starts on. */
function payloads(source: string): { body: string; line: number }[] {
  const found: { body: string; line: number }[] = [];
  const marker = /-d '/g;

  let match: RegExpExecArray | null;
  while ((match = marker.exec(source)) !== null) {
    const start = match.index + match[0].length;
    const end = source.indexOf("'", start);
    if (end === -1) continue;
    found.push({
      body: source.slice(start, end),
      line: source.slice(0, match.index).split('\n').length,
    });
  }
  return found;
}

const files = sourceFiles('src');

describe('curl POST samples', () => {
  it('finds the samples it is meant to be guarding', () => {
    const total = files.reduce((count, file) => count + payloads(readFileSync(file, 'utf8')).length, 0);
    // If this drops to zero the regex has rotted and the suite is asserting
    // nothing, which is worse than failing.
    expect(total).toBeGreaterThan(4);
  });

  it('keeps every JSON body on a single line', () => {
    const offenders: string[] = [];

    for (const file of files) {
      for (const { body, line } of payloads(readFileSync(file, 'utf8'))) {
        if (/[\r\n]/.test(body)) offenders.push(`${file}:${line}`);
      }
    }

    expect(offenders, 'a line break in a POST body returns 403 from this deployment').toEqual([]);
  });

  it('emits single-line bodies from the recipe generator too', async () => {
    const { buildRecipe } = await import('../src/lib/undc/recipes');
    const spec = {
      variables: ['undata/sdg/VC_DTH_TOTN'],
      entities: ['country/SSD', 'country/COD'],
      shape: 'trend',
    } as const;

    for (const tool of ['curl', 'jq'] as const) {
      for (const { body } of payloads(buildRecipe(spec, tool))) {
        expect(body, tool).not.toMatch(/[\r\n]/);
      }
    }
  });
});
