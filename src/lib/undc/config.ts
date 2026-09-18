/**
 * Connection details for the UN System Data Commons.
 *
 * Launched 17 September 2026, data.un.org unifies public statistics from 26 UN
 * System entities into a single Data Commons knowledge graph. It exposes three
 * public surfaces, none of which requires an API key:
 *
 *   1. the web UI, whose search route is deep-linkable;
 *   2. a REST v2 graph/observation API, served with `Access-Control-Allow-Origin: *`
 *      — which is why this site can query it straight from the browser;
 *   3. an MCP endpoint, for AI agents.
 *
 * Verified against the live deployment on 18 September 2026.
 */

/** Root of the Data Commons deployment that backs data.un.org. */
export const API_ROOT: string =
  import.meta.env.VITE_UNDC_API_ROOT ?? 'https://unsd-datacommons.gcp.un-icc.cloud';

/** The public-facing site, used to build deep links a reader can click through to. */
export const SITE_ROOT = 'https://data.un.org';

export const ENDPOINTS = {
  /** REST v2 — graph traversal. `?nodes=<dcid>&property=<relation expression>` */
  restNode: `${API_ROOT}/core/api/v2/node`,
  /** REST v2 — observations, by explicit dcids or by a containment expression. */
  restObservation: `${API_ROOT}/core/api/v2/observation`,
  /** REST v2 — name/id resolution. */
  restResolve: `${API_ROOT}/core/api/v2/resolve`,
  /** Time series for a set of (variable, entity) pairs. */
  series: `${API_ROOT}/api/observations/series`,
  /** Human-readable names for a list of place dcids. */
  placeName: `${API_ROOT}/api/place/name`,
  /** Indicator counts for a node in the variable-group tree. */
  variableGroupInfo: `${API_ROOT}/api/variable-group/info`,
  /**
   * The natural-language resolver behind the platform's search box. Given a
   * question it returns the places and statistical variables it matched, plus a
   * ready-made chart configuration. This is what the Prompt Lab calls.
   */
  detectAndFulfill: `${API_ROOT}/api/explore/detect-and-fulfill`,
  /** Streamable-HTTP MCP endpoint: 6 tools and 3 SKILL.md research playbooks. */
  mcp: `${API_ROOT}/mcp`,
} as const;

/** Deep-link into the platform's own natural-language search. */
export function searchUrl(query: string): string {
  return `${SITE_ROOT}/search?q=${encodeURIComponent(query)}`;
}

/** How long a live request may take before the baked snapshot is used instead. */
export const LIVE_REQUEST_TIMEOUT_MS = 7_000;
