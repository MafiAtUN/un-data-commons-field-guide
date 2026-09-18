/**
 * Bake the country picker list used by the Data Finder.
 *
 * The graph has no single reliable "list all countries" call — the node endpoint
 * rejects a containment filter here — so the list is derived the way a user
 * would experience it: the union of the entities two very high-coverage
 * indicators actually return. That yields the countries and areas the platform
 * can really answer for, rather than a political list it cannot.
 *
 * Names come from /api/place/name, which is fetched in small batches because
 * long URLs are rejected, and retried because it intermittently drops entries.
 *
 * Run with `npm run countries`. Output: src/data/countries.json
 */

import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_ROOT = process.env.VITE_UNDC_API_ROOT ?? 'https://unsd-datacommons.gcp.un-icc.cloud';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/countries.json');

/** Two indicators with near-universal coverage, from different agencies. */
const COVERAGE_PROBES = ['undata/unicef/DM_POP', 'undata/sdg/IT_USE_ii99'];

/**
 * Names the endpoint has never returned for us across repeated retries, in any
 * batch size. Supplied locally rather than shipping a blank picker entry; both
 * are the plain English short names the rest of the list uses.
 */
const NAME_OVERRIDES = {
  'country/GRC': 'Greece',
  'country/SVN': 'Slovenia',
};

async function entitiesWithData(variable) {
  const url = new URL(`${API_ROOT}/core/api/v2/observation`);
  url.searchParams.append('date', 'LATEST');
  url.searchParams.append('variable.dcids', variable);
  url.searchParams.append('entity.expression', 'Earth<-containedInPlace+{typeOf:Country}');
  for (const field of ['date', 'value', 'entity']) url.searchParams.append('select', field);

  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`coverage probe ${variable}: HTTP ${response.status}`);

  const payload = await response.json();
  return Object.keys(payload.byVariable?.[variable]?.byEntity ?? {});
}

async function resolveNames(dcids) {
  const names = {};

  // Batches of 20 first; then shrink, because the failures are batch-shaped
  // rather than entity-shaped.
  for (const size of [20, 8, 1]) {
    const outstanding = dcids.filter((dcid) => !names[dcid]);
    if (outstanding.length === 0) break;

    for (let i = 0; i < outstanding.length; i += size) {
      const url = new URL(`${API_ROOT}/api/place/name`);
      for (const dcid of outstanding.slice(i, i + size)) url.searchParams.append('dcids', dcid);

      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
        if (response.ok) Object.assign(names, await response.json());
      } catch {
        // Retried by the next, smaller pass.
      }
      await new Promise((done) => setTimeout(done, 150));
    }
  }

  return names;
}

const dcids = [...new Set((await Promise.all(COVERAGE_PROBES.map(entitiesWithData))).flat())].sort();
console.log(`found ${dcids.length} countries and areas with data`);

const resolved = await resolveNames(dcids);
const countries = {};
let supplied = 0;

for (const dcid of dcids) {
  const name = resolved[dcid] ?? NAME_OVERRIDES[dcid];
  if (!name) {
    console.warn(`  no name for ${dcid} — omitted from the picker`);
    continue;
  }
  if (!resolved[dcid]) supplied += 1;
  countries[dcid] = name;
}

const total = Object.keys(countries).length;
console.log(`named ${total} (${supplied} supplied locally, ${total - supplied} from the API)`);

if (total < dcids.length * 0.95) {
  console.error('too many names missing — not overwriting the file');
  process.exit(1);
}

await writeFile(
  OUT,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), countries }, null, 2)}\n`,
);
console.log(`wrote ${OUT}`);
