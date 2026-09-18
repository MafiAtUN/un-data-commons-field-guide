/** Shapes returned by the UN System Data Commons APIs, narrowed to what we read. */

/** A single dated measurement. */
export interface Observation {
  date: string;
  value: number;
}

/**
 * Provenance for a block of observations. Every number on this site is rendered
 * with its facet, because an unattributed statistic is not a statistic.
 */
export interface Facet {
  provenanceUrl?: string;
  provenanceId?: string;
  observationPeriod?: string;
  unit?: string;
  unitDisplayName?: string;
  importName?: string;
}

/** `POST /api/observations/series` */
export interface SeriesResponse {
  data: Record<string, Record<string, {
    series?: Observation[];
    facet?: string;
    earliestDate?: string;
    latestDate?: string;
    obsCount?: number;
  }>>;
  facets: Record<string, Facet>;
}

/** `GET /core/api/v2/observation` */
export interface ObservationResponse {
  byVariable: Record<string, {
    byEntity: Record<string, {
      orderedFacets?: Array<{
        facetId: string;
        observations: Observation[];
        obsCount?: number;
        earliestDate?: string;
        latestDate?: string;
      }>;
    }>;
  }>;
  facets: Record<string, Facet>;
}

/** A node reached by following a relation expression out of another node. */
export interface GraphNode {
  dcid?: string;
  name?: string;
  value?: string;
  types?: string[];
  provenanceId?: string;
}

/** `GET /core/api/v2/node` */
export interface NodeResponse {
  data: Record<string, {
    arcs?: Record<string, { nodes?: GraphNode[] }>;
    properties?: string[];
  }>;
}

/** `POST /api/variable-group/info` */
export interface VariableGroupInfoResponse {
  absoluteName?: string;
  childStatVarGroups?: Array<{
    id: string;
    displayName: string;
    descendentStatVarCount: number;
  }>;
  childStatVars?: Array<{ id: string; displayName: string }>;
}

/** A tile in the chart configuration the natural-language resolver returns. */
export interface ResolvedTile {
  type?: string;
  title?: string;
  statVarKey?: string[];
}

/** `POST /api/explore/detect-and-fulfill?q=…` */
export interface DetectAndFulfillResponse {
  place?: { dcid?: string; name?: string; types?: string[] };
  entities?: Array<{ dcid?: string; name?: string }>;
  variables?: string[];
  failure?: string | null;
  userMessage?: string | null;
  config?: {
    categories?: Array<{
      statVarSpec?: Record<string, { statVar?: string; name?: string; unit?: string }>;
      blocks?: Array<{
        title?: string;
        columns?: Array<{ tiles?: ResolvedTile[] }>;
      }>;
    }>;
  };
}

/** Where a rendered number came from — surfaced in the UI, never hidden. */
export type DataOrigin = 'live' | 'snapshot';

export interface Sourced<T> {
  value: T;
  origin: DataOrigin;
  /** ISO timestamp: when the live call succeeded, or when the snapshot was baked. */
  retrievedAt: string;
  /** Present when the live call failed and the snapshot was used instead. */
  liveError?: string;
}
