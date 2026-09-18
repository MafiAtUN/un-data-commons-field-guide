/**
 * The dcid grammar of the UN System Data Commons.
 *
 * Every one of the ~85,000 statistical variables in the graph is addressed by a
 * structured identifier. Learn the grammar and you can hand-write the address of
 * a slice you have never seen:
 *
 *   undata / sdg / VC_DTH_TOTN . AGE--Y0T17 __ SEX--F
 *   ──┬───   ─┬─   ─────┬─────   ────┬────      ──┬──
 *     │       │         │            │            └── second dimension filter
 *     │       │         │            └─────────────── first dimension filter
 *     │       │         └──────────────────────────── the indicator's series code
 *     │       └────────────────────────────────────── contributing UN entity
 *     └────────────────────────────────────────────── namespace ("undata")
 *
 * `.` opens the dimension list, `--` binds a dimension to a value, and `__`
 * separates dimensions. A variable with no `.` is the total — the undisaggregated
 * series. Dimensions are always alphabetical in the graph's own identifiers, which
 * is why {@link buildDcid} sorts them: the same slice must always produce the same
 * address, or caching and snapshot keys silently diverge.
 */

export interface DimensionFilter {
  /** Dimension name as the graph spells it, e.g. `AGE`, `SEX`, `LETHAL_INSTRUMENT`. */
  dimension: string;
  /** Coded value, e.g. `Y0T17`, `F`, `WEAPON_LIGHT`. */
  value: string;
}

export interface ParsedDcid {
  /** Namespace segment — `undata` for variables native to this deployment. */
  namespace: string;
  /** Contributing entity or collection, e.g. `sdg`, `unodc`, `unhcr`, `who`. */
  agency: string;
  /** The indicator code, without any dimension filters. */
  code: string;
  /** Dimension filters, in the order they appear in the identifier. */
  dimensions: DimensionFilter[];
  /** The undisaggregated parent, i.e. the dcid with all dimensions stripped. */
  base: string;
  /** True when this identifier carries no dimension filters (the total series). */
  isTotal: boolean;
}

const DIMENSION_SEPARATOR = '__';
const DIMENSION_BINDING = '--';

/**
 * Parse a UN System Data Commons variable dcid.
 *
 * Returns `null` rather than throwing for anything that is not a three-or-more
 * segment path, so callers can treat unrecognised identifiers as opaque instead
 * of crashing on a graph that is still growing.
 */
export function parseDcid(dcid: string): ParsedDcid | null {
  const trimmed = dcid.trim();
  if (!trimmed) return null;

  const segments = trimmed.split('/');
  if (segments.length < 3) return null;

  const namespace = segments[0]!;
  const agency = segments[1]!;
  // Topic dcids nest one level deeper (undata/topic/sdg/…); keep the tail intact.
  const tail = segments.slice(2).join('/');

  const [code, dimensionPart] = splitOnce(tail, '.');
  if (!code) return null;

  const dimensions = dimensionPart ? parseDimensions(dimensionPart) : [];

  return {
    namespace,
    agency,
    code,
    dimensions,
    base: [namespace, agency, code].join('/'),
    isTotal: dimensions.length === 0,
  };
}

function parseDimensions(part: string): DimensionFilter[] {
  return part
    .split(DIMENSION_SEPARATOR)
    .map((chunk) => {
      const [dimension, value] = splitOnce(chunk, DIMENSION_BINDING);
      if (!dimension || value === undefined) return null;
      return { dimension, value };
    })
    .filter((d): d is DimensionFilter => d !== null);
}

/** Split on the first occurrence only — dimension values may contain the delimiter. */
function splitOnce(input: string, delimiter: string): [string, string | undefined] {
  const at = input.indexOf(delimiter);
  if (at === -1) return [input, undefined];
  return [input.slice(0, at), input.slice(at + delimiter.length)];
}

/**
 * Build a variable dcid from its parts.
 *
 * Dimensions are sorted by name so that a given slice always yields a byte-identical
 * identifier regardless of the order the caller supplied them in.
 */
export function buildDcid(
  base: string | Pick<ParsedDcid, 'namespace' | 'agency' | 'code'>,
  dimensions: readonly DimensionFilter[] = [],
): string {
  const stem =
    typeof base === 'string' ? base : [base.namespace, base.agency, base.code].join('/');

  if (dimensions.length === 0) return stem;

  const encoded = [...dimensions]
    .sort((a, b) => a.dimension.localeCompare(b.dimension))
    .map((d) => `${d.dimension}${DIMENSION_BINDING}${d.value}`)
    .join(DIMENSION_SEPARATOR);

  return `${stem}.${encoded}`;
}

/** A human-readable gloss of an identifier, for annotating code samples. */
export function describeDcid(dcid: string): string {
  const parsed = parseDcid(dcid);
  if (!parsed) return dcid;

  const source = AGENCY_LABELS[parsed.agency] ?? parsed.agency.toUpperCase();
  if (parsed.isTotal) return `${source} · ${parsed.code} (total)`;

  const slice = parsed.dimensions.map((d) => `${d.dimension}=${d.value}`).join(', ');
  return `${source} · ${parsed.code} [${slice}]`;
}

/**
 * Display names for the collection segment of a dcid.
 *
 * Keyed by the identifier the graph uses, which is not always the agency's
 * public acronym (`sdg` is the Global SDG Indicators Database, contributed by
 * UNSD rather than an agency of that name).
 */
export const AGENCY_LABELS: Record<string, string> = {
  sdg: 'Global SDG Indicators Database',
  sdgf: 'SDG framework',
  eclac: 'ECLAC',
  ilo: 'ILO',
  iomdtm: 'IOM DTM',
  itu: 'ITU',
  ohchr: 'OHCHR',
  unaids: 'UNAIDS',
  undphdro: 'UNDP HDRO',
  undrr: 'UNDRR',
  unesco: 'UNESCO',
  unfpa: 'UNFPA',
  unhcr: 'UNHCR',
  unicef: 'UNICEF',
  unido: 'UNIDO',
  unodc: 'UNODC',
  who: 'WHO',
  topic: 'Topic',
};

/**
 * Relation expression for "every country inside this place".
 *
 * `<-containedInPlace+` walks containment edges inward and recursively, so one
 * request covers a whole continent; `{typeOf:Country}` keeps sub-national areas
 * out of the result. The REST layer requires this URL-encoded, which
 * `URLSearchParams` handles for us.
 */
export function childCountriesOf(placeDcid: string): string {
  return `${placeDcid}<-containedInPlace+{typeOf:Country}`;
}
