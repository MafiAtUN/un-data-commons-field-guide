/**
 * Record every live payload the site depends on into src/data/snapshot-data.json.
 *
 * Run with `npm run snapshots`. The committed output is the fallback the browser
 * uses when data.un.org is unreachable, so the site never shows an empty chart —
 * and, because the file is in git, every figure on the site is reviewable and its
 * changes over time are diffable.
 *
 * The request list below is the single source of truth for what the site fetches.
 * `tests/snapshots.test.ts` asserts it stays in step with SNAPSHOT_KEYS.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_ROOT = process.env.VITE_UNDC_API_ROOT ?? 'https://unsd-datacommons.gcp.un-icc.cloud';
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../src/data/snapshot-data.json');

const REST_OBSERVATION = `${API_ROOT}/core/api/v2/observation`;
const SERIES = `${API_ROOT}/api/observations/series`;
const VARIABLE_GROUP_INFO = `${API_ROOT}/api/variable-group/info`;
const DETECT_AND_FULFILL = `${API_ROOT}/api/explore/detect-and-fulfill`;

/** A GET against the REST v2 observation endpoint, selecting the standard fields. */
function observationUrl(params) {
  const search = new URLSearchParams();
  search.append('date', params.date ?? 'LATEST');
  search.append('variable.dcids', params.variable);
  if (params.entities) for (const e of params.entities) search.append('entity.dcids', e);
  if (params.expression) search.append('entity.expression', params.expression);
  for (const field of ['date', 'value', 'variable', 'entity']) search.append('select', field);
  return `${REST_OBSERVATION}?${search.toString()}`;
}

const seriesRequest = (variables, entities) => ({
  method: 'POST',
  url: SERIES,
  body: { variables, entities },
});

const promptRequest = (question) => ({
  method: 'POST',
  url: `${DETECT_AND_FULFILL}?q=${encodeURIComponent(question)}`,
  body: { contextHistory: [] },
});

const CONFLICT_COUNTRIES = ['country/SSD', 'country/COD', 'country/SYR', 'country/AFG', 'country/SOM'];
const DEVELOPMENT_COUNTRIES = ['country/BGD', 'country/ETH', 'country/SSD', 'country/IND'];

/** key -> the exact request to record. */
const REQUESTS = {
  'catalogue.collections': {
    method: 'POST', url: VARIABLE_GROUP_INFO, body: { dcid: 'undata/g/Root', entities: [] },
  },
  'catalogue.themes': {
    method: 'POST', url: VARIABLE_GROUP_INFO, body: { dcid: 'dc/g/UN', entities: [] },
  },

  // Peace and security
  'peace.conflict-deaths.series': seriesRequest(['undata/sdg/VC_DTH_TOTN'], CONFLICT_COUNTRIES),
  'peace.conflict-deaths.by-age': seriesRequest(
    ['undata/sdg/VC_DTH_TOTN.AGE--Y0T17', 'undata/sdg/VC_DTH_TOTN.AGE--Y_GE18'],
    ['country/SSD', 'country/COD'],
  ),
  'peace.conflict-deaths.civilian-split': seriesRequest(
    ['undata/sdg/VC_DTH_TOCVN', 'undata/sdg/VC_DTH_TONCVN'],
    ['country/SSD', 'country/COD'],
  ),
  'peace.homicide.africa-countries': {
    method: 'GET',
    url: observationUrl({
      variable: 'undata/unodc/VIC_HOM_RT',
      expression: 'africa<-containedInPlace+{typeOf:Country}',
    }),
  },
  'peace.refugees.by-origin': seriesRequest(
    ['undata/sdg/SM_POP_REFG_OR'],
    ['country/SSD', 'country/SYR', 'country/AFG', 'country/UKR'],
  ),

  // Development
  'development.poverty.series': seriesRequest(['undata/sdg/SI_POV_DAY1'], DEVELOPMENT_COUNTRIES),
  'development.hdi.southern-asia': {
    method: 'GET',
    url: observationUrl({
      variable: 'undata/undphdro/HDI_hdi',
      expression: 'SouthernAsia<-containedInPlace+{typeOf:Country}',
    }),
  },
  'development.electricity.access': seriesRequest(['undata/sdg/EG_ACS_ELEC'], DEVELOPMENT_COUNTRIES),
  'development.internet.use': seriesRequest(
    ['undata/sdg/IT_USE_ii99'],
    ['country/BGD', 'country/IND', 'country/KEN'],
  ),
  'development.maternal-mortality': seriesRequest(
    ['undata/sdg/SH_STA_MORT.SEX--F'],
    ['country/BGD', 'country/IND', 'country/SSD'],
  ),

  // Prompt Lab — four phrasings of increasing precision, recorded so the
  // comparison on the page is reproducible even when the resolver is offline.
  'lab.prompt.vague': promptRequest('violence'),
  'lab.prompt.precise': promptRequest('number of total conflict-related deaths in South Sudan'),
  'lab.prompt.regional': promptRequest('compare homicide rate across countries in Africa'),
  'lab.prompt.disaggregated': promptRequest(
    'conflict related deaths of children under 18 in South Sudan by year',
  ),
};

/**
 * Keep recorded payloads to the fields the app actually reads.
 *
 * The natural-language resolver returns a complete page configuration — tens of
 * kilobytes of layout the site never renders. Projecting to the shape declared in
 * `src/lib/undc/types.ts` cuts the committed file by roughly 90% and keeps the
 * snapshot honest: what is stored is exactly what is consumed.
 */
function projectPrompt(payload) {
  const categories = (payload.config?.categories ?? []).slice(0, 4).map((category) => ({
    statVarSpec: category.statVarSpec,
    blocks: (category.blocks ?? []).slice(0, 6).map((block) => ({
      title: block.title,
      columns: (block.columns ?? []).slice(0, 3).map((column) => ({
        tiles: (column.tiles ?? []).slice(0, 4).map((tile) => ({
          type: tile.type,
          title: tile.title,
          statVarKey: tile.statVarKey,
        })),
      })),
    })),
  }));

  return {
    place: payload.place
      ? { dcid: payload.place.dcid, name: payload.place.name, types: payload.place.types }
      : undefined,
    entities: (payload.entities ?? []).map((e) => ({ dcid: e.dcid, name: e.name })),
    variables: payload.variables ?? [],
    failure: payload.failure ?? null,
    userMessage: payload.userMessage ?? null,
    config: { categories },
  };
}

/** Projections applied before a payload is written, keyed by snapshot key. */
const PROJECTIONS = {
  'lab.prompt.vague': projectPrompt,
  'lab.prompt.precise': projectPrompt,
  'lab.prompt.regional': projectPrompt,
  'lab.prompt.disaggregated': projectPrompt,
};

async function record(key, request) {
  const init = { method: request.method, signal: AbortSignal.timeout(120_000) };
  if (request.body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(request.body);
  }

  const response = await fetch(request.url, init);
  if (!response.ok) throw new Error(`${key}: HTTP ${response.status}`);

  const raw = await response.json();
  const project = PROJECTIONS[key];

  return {
    request,
    fetchedAt: new Date().toISOString(),
    payload: project ? project(raw) : raw,
  };
}

const records = {};
let failures = 0;

for (const [key, request] of Object.entries(REQUESTS)) {
  try {
    records[key] = await record(key, request);
    const size = JSON.stringify(records[key].payload).length;
    console.log(`  ok    ${key.padEnd(42)} ${size.toLocaleString()} bytes`);
  } catch (error) {
    failures += 1;
    console.error(`  FAIL  ${key.padEnd(42)} ${error.message}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} request(s) failed — not overwriting the snapshot file.`);
  process.exit(1);
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2)}\n`,
);

console.log(`\nWrote ${Object.keys(records).length} records to ${OUT}`);
