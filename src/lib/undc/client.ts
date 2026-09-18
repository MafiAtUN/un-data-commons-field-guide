/**
 * Typed client for the UN System Data Commons.
 *
 * Each function maps to one documented endpoint and returns the parsed payload
 * together with the exact request that produced it, so the UI can display the
 * call next to its result. No function needs credentials: the deployment serves
 * these routes anonymously and with permissive CORS.
 */

import { ENDPOINTS } from './config';
import { getJson, postJson, type Traced } from './http';
import { childCountriesOf } from './dcid';
import type {
  DetectAndFulfillResponse,
  NodeResponse,
  ObservationResponse,
  SeriesResponse,
  VariableGroupInfoResponse,
} from './types';

interface Options {
  signal?: AbortSignal;
  timeoutMs?: number;
}

/** Time series for every combination of the given variables and entities. */
export function fetchSeries(
  args: { variables: readonly string[]; entities: readonly string[] },
  options?: Options,
): Promise<Traced<SeriesResponse>> {
  return postJson<SeriesResponse>(
    ENDPOINTS.series,
    { variables: [...args.variables], entities: [...args.entities] },
    options,
  );
}

/**
 * One observation per entity for each variable.
 *
 * `date: 'LATEST'` asks each entity for *its own* most recent year, which is
 * rarely the same year across a region — see {@link vintageSpread}.
 */
export function fetchObservations(
  args: {
    variables: readonly string[];
    entities: readonly string[];
    date?: string;
  },
  options?: Options,
): Promise<Traced<ObservationResponse>> {
  return getJson<ObservationResponse>(
    ENDPOINTS.restObservation,
    {
      date: args.date ?? 'LATEST',
      'variable.dcids': args.variables,
      'entity.dcids': args.entities,
      select: ['date', 'value', 'variable', 'entity'],
    },
    options,
  );
}

/**
 * One observation for every country contained in `parentPlace`.
 *
 * This is the single most useful request in the API: it replaces a loop over
 * ~200 country codes with one call, because the containment expression is
 * evaluated inside the graph.
 */
export function fetchObservationsByCountry(
  args: { variable: string; parentPlace: string; date?: string },
  options?: Options,
): Promise<Traced<ObservationResponse>> {
  return getJson<ObservationResponse>(
    ENDPOINTS.restObservation,
    {
      date: args.date ?? 'LATEST',
      'variable.dcids': args.variable,
      'entity.expression': childCountriesOf(args.parentPlace),
      select: ['date', 'value', 'variable', 'entity'],
    },
    options,
  );
}

/** Follow a relation expression out of (or into) a node. */
export function fetchNode(
  args: { nodes: string | readonly string[]; property: string },
  options?: Options,
): Promise<Traced<NodeResponse>> {
  return getJson<NodeResponse>(
    ENDPOINTS.restNode,
    { nodes: args.nodes, property: args.property },
    options,
  );
}

/** Indicator counts for the children of a node in the variable-group tree. */
export function fetchVariableGroupInfo(
  dcid: string,
  options?: Options,
): Promise<Traced<VariableGroupInfoResponse>> {
  return postJson<VariableGroupInfoResponse>(
    ENDPOINTS.variableGroupInfo,
    { dcid, entities: [] },
    options,
  );
}

/** Display names for place dcids. */
export function fetchPlaceNames(
  dcids: readonly string[],
  options?: Options,
): Promise<Traced<Record<string, string>>> {
  return getJson<Record<string, string>>(ENDPOINTS.placeName, { dcids }, options);
}

/**
 * Run a question through the platform's own natural-language resolver.
 *
 * This is the endpoint behind the search box on data.un.org. It reports which
 * place it locked onto and which statistical variables it selected — which is
 * exactly what makes prompt phrasing inspectable rather than mysterious.
 */
export function resolveQuestion(
  question: string,
  options?: Options,
): Promise<Traced<DetectAndFulfillResponse>> {
  const url = `${ENDPOINTS.detectAndFulfill}?q=${encodeURIComponent(question)}`;
  return postJson<DetectAndFulfillResponse>(url, { contextHistory: [] }, options);
}
