/**
 * Display names for the places this site charts.
 *
 * Held locally rather than fetched: they are short, stable, and resolving them
 * would cost a round trip on every page for strings that never change. The dcid
 * remains the key everywhere — this map only decides what a reader sees.
 */
export const PLACE_LABELS: Record<string, string> = {
  'country/AFG': 'Afghanistan',
  'country/BGD': 'Bangladesh',
  'country/BTN': 'Bhutan',
  'country/COD': 'DR Congo',
  'country/ETH': 'Ethiopia',
  'country/IND': 'India',
  'country/IRN': 'Iran',
  'country/KEN': 'Kenya',
  'country/LKA': 'Sri Lanka',
  'country/MDV': 'Maldives',
  'country/NPL': 'Nepal',
  'country/PAK': 'Pakistan',
  'country/SOM': 'Somalia',
  'country/SSD': 'South Sudan',
  'country/SYR': 'Syria',
  'country/UKR': 'Ukraine',
  'country/ZAF': 'South Africa',
};

/**
 * ISO3 fallback for any country the map above does not name.
 *
 * The containment queries return whole continents, so a hard-coded list can
 * never be complete; showing `ZWE` is better than showing `country/ZWE`.
 */
export function placeLabel(dcid: string): string {
  return PLACE_LABELS[dcid] ?? dcid.replace(/^country\//, '').replace(/^wikidataId\//, '');
}

/** Build a label lookup for a set of dcids, for the transform layer. */
export function labelsFor(dcids: readonly string[]): Record<string, string> {
  return Object.fromEntries(dcids.map((dcid) => [dcid, placeLabel(dcid)]));
}
