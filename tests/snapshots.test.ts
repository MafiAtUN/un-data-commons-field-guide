import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { SNAPSHOT_KEYS } from '../src/lib/undc/snapshots';
import snapshotFile from '../src/data/snapshot-data.json';

const file = snapshotFile as {
  generatedAt: string;
  records: Record<string, { request: { method: string; url: string }; fetchedAt: string; payload: unknown }>;
};

/**
 * Guards the contract between `scripts/fetch-snapshots.mjs` and the components.
 *
 * The script and the app are separate runtimes, so nothing at compile time stops
 * a key being renamed in one and not the other. This test is that check.
 */
describe('snapshot fallbacks', () => {
  it('has a recording for every declared key', () => {
    const missing = Object.values(SNAPSHOT_KEYS).filter((key) => !(key in file.records));
    expect(missing).toEqual([]);
  });

  it('declares a key for every recording, so nothing is fetched but unused', () => {
    const declared = new Set<string>(Object.values(SNAPSHOT_KEYS));
    const orphaned = Object.keys(file.records).filter((key) => !declared.has(key));
    expect(orphaned).toEqual([]);
  });

  it('lists every key in the fetch script', () => {
    const script = readFileSync(new URL('../scripts/fetch-snapshots.mjs', import.meta.url), 'utf8');
    const absent = Object.values(SNAPSHOT_KEYS).filter((key) => !script.includes(`'${key}'`));
    expect(absent).toEqual([]);
  });

  it('records the request that produced each payload', () => {
    for (const [key, record] of Object.entries(file.records)) {
      expect(record.request?.url, key).toContain('un-icc.cloud');
      expect(record.request?.method, key).toMatch(/^(GET|POST)$/);
      expect(Date.parse(record.fetchedAt), key).not.toBeNaN();
    }
  });

  it('has a parseable generation timestamp', () => {
    expect(Date.parse(file.generatedAt)).not.toBeNaN();
  });

  it('holds a non-empty payload for every record', () => {
    for (const [key, record] of Object.entries(file.records)) {
      expect(record.payload, key).toBeTruthy();
      expect(JSON.stringify(record.payload).length, key).toBeGreaterThan(50);
    }
  });
});
