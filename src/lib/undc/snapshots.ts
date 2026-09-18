/**
 * Baked snapshots — the site's honesty mechanism.
 *
 * Every figure here is fetched live from data.un.org when you open the page. But
 * a demo in a meeting room, an offline laptop, or a UN API maintenance window
 * should not produce an empty chart, so `npm run snapshots` records each payload
 * into `snapshot-data.json` and the loader falls back to it.
 *
 * The fallback is always *disclosed*: `useSourcedData` returns the origin, and
 * every chart renders a badge saying whether the number in front of you arrived
 * over the wire or came from the committed recording.
 *
 * The recordings are loaded with a dynamic import, so a reader whose requests all
 * succeed never downloads them. They are a contingency, and contingencies should
 * not sit in the critical path.
 */


export interface SnapshotRecord {
  /** The request that produced this payload, for reproducibility. */
  request: { method: string; url: string; body?: unknown };
  /** When `npm run snapshots` recorded it. */
  fetchedAt: string;
  payload: unknown;
}

interface SnapshotFile {
  generatedAt: string;
  records: Record<string, SnapshotRecord>;
}

/** Resolved once, then reused for every subsequent fallback in the session. */
let pending: Promise<SnapshotFile> | undefined;

function load(): Promise<SnapshotFile> {
  pending ??= import('../../data/snapshot-data.json').then(
    (module) => (module.default ?? module) as unknown as SnapshotFile,
  );
  return pending;
}

/**
 * Snapshot keys.
 *
 * Declared as a const map rather than free strings so a typo is a type error and
 * the snapshot script and the components cannot drift apart.
 */
export const SNAPSHOT_KEYS = {
  catalogue: 'catalogue.collections',
  themes: 'catalogue.themes',
  conflictDeaths: 'peace.conflict-deaths.series',
  conflictDeathsByAge: 'peace.conflict-deaths.by-age',
  conflictCivilianSplit: 'peace.conflict-deaths.civilian-split',
  homicideAfrica: 'peace.homicide.africa-countries',
  refugeesByOrigin: 'peace.refugees.by-origin',
  poverty: 'development.poverty.series',
  hdiSouthernAsia: 'development.hdi.southern-asia',
  electricityAccess: 'development.electricity.access',
  internetUse: 'development.internet.use',
  maternalMortality: 'development.maternal-mortality',
  promptVague: 'lab.prompt.vague',
  promptPrecise: 'lab.prompt.precise',
  promptRegional: 'lab.prompt.regional',
  promptDisaggregated: 'lab.prompt.disaggregated',
} as const;

export type SnapshotKey = (typeof SNAPSHOT_KEYS)[keyof typeof SNAPSHOT_KEYS];

/** Read a recorded payload, or `undefined` if the key was never baked. */
export async function readSnapshot<T>(
  key: SnapshotKey,
): Promise<(SnapshotRecord & { payload: T }) | undefined> {
  try {
    const file = await load();
    const record = file.records[key];
    return record as (SnapshotRecord & { payload: T }) | undefined;
  } catch {
    // The chunk itself failed to load; the caller reports "no data" rather than
    // masking one failure with another.
    return undefined;
  }
}

/** When the committed recordings were last refreshed. */
export async function snapshotGeneratedAt(): Promise<string | undefined> {
  try {
    return (await load()).generatedAt;
  } catch {
    return undefined;
  }
}
