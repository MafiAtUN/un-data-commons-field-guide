/**
 * Reading the natural-language resolver's answer.
 *
 * When you type a question into data.un.org, the resolver decides two things
 * before it draws anything: **which place** you meant, and **which statistical
 * variables** answer you. Both decisions are in the response, and both can be
 * wrong in ways a finished chart hides.
 *
 * The most consequential behaviour to know: the resolver always commits to a
 * place. Ask it something with no geography in it and it will still pick one —
 * see {@link ResolutionSummary.placeWasInferred}.
 */

import type { DetectAndFulfillResponse } from './types';
import { parseDcid } from './dcid';

export interface ResolvedIndicator {
  dcid: string;
  name: string;
  /** The contributing collection, from the dcid's agency segment. */
  agency: string;
  /** Dimension filters carried by this identifier, if any. */
  dimensions: string[];
}

export interface ResolutionSummary {
  /** The place the resolver committed to. */
  place: { dcid: string; name: string } | undefined;
  /**
   * True when the question contained no recognisable place name, so the
   * resolver supplied one of its own. Charts built on an inferred place are
   * about a country the reader never asked about.
   */
  placeWasInferred: boolean;
  /** Every statistical variable the resolver selected, deduplicated. */
  indicators: ResolvedIndicator[];
  /** Chart forms the resolver proposed, e.g. LINE, MAP, RANKING, HIGHLIGHT. */
  tileTypes: string[];
  /** How many result sections it built. */
  blockCount: number;
  /** Set when the resolver could not answer at all. */
  failure: string | undefined;
}

/**
 * Place names, as spelled in the question, that mean "the resolver was told".
 *
 * The response does not flag inference, so we detect it the only way available:
 * if the resolved place's name (or a recognisable part of it) does not appear in
 * the question, the resolver chose it rather than read it.
 */
function questionMentionsPlace(question: string, placeName: string): boolean {
  const haystack = question.toLowerCase();
  const name = placeName.toLowerCase();

  if (haystack.includes(name)) return true;

  // "United States of America" should match "United States" / "USA" / "US".
  const words = name.split(/[\s,]+/).filter((word) => word.length > 3);
  if (words.length > 1 && words.every((word) => haystack.includes(word))) return true;

  // Match a leading distinctive word, so "Congo" matches "Congo [DRC]".
  const lead = words[0];
  return Boolean(lead && lead.length > 4 && haystack.includes(lead));
}

export function summarizeResolution(
  question: string,
  response: DetectAndFulfillResponse,
): ResolutionSummary {
  const place =
    response.place?.dcid && response.place.name
      ? { dcid: response.place.dcid, name: response.place.name }
      : undefined;

  const categories = response.config?.categories ?? [];

  const specs = new Map<string, string>();
  for (const category of categories) {
    for (const [key, spec] of Object.entries(category.statVarSpec ?? {})) {
      specs.set(spec.statVar ?? key, spec.name ?? key);
    }
  }

  const tileTypes = new Set<string>();
  const seen = new Set<string>();
  const indicators: ResolvedIndicator[] = [];
  let blockCount = 0;

  for (const category of categories) {
    for (const block of category.blocks ?? []) {
      blockCount += 1;
      for (const column of block.columns ?? []) {
        for (const tile of column.tiles ?? []) {
          if (tile.type) tileTypes.add(tile.type);
          for (const key of tile.statVarKey ?? []) {
            // Multi-place bar blocks suffix the key; the variable is the stem.
            const dcid = key.replace(/_multiple_place_bar_block$/, '');
            if (seen.has(dcid)) continue;
            seen.add(dcid);

            const parsed = parseDcid(dcid);
            indicators.push({
              dcid,
              name: specs.get(dcid) ?? specs.get(key) ?? dcid,
              agency: parsed?.agency ?? 'unknown',
              dimensions: parsed?.dimensions.map((d) => `${d.dimension}=${d.value}`) ?? [],
            });
          }
        }
      }
    }
  }

  return {
    place,
    placeWasInferred: Boolean(place && !questionMentionsPlace(question, place.name)),
    indicators,
    tileTypes: [...tileTypes].sort(),
    blockCount,
    failure: response.failure ?? undefined,
  };
}
