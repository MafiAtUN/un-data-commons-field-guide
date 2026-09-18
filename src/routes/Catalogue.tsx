import { useMemo, useState } from 'react';
import { PageHeader, Section } from '../components/Prose';
import { fetchVariableGroupInfo } from '../lib/undc/client';
import { SNAPSHOT_KEYS } from '../lib/undc/snapshots';
import { useSourcedData } from '../lib/undc/useSourcedData';
import type { VariableGroupInfoResponse } from '../lib/undc/types';
import { COLLECTIONS, THEME_IDS, type Pillar } from '../content/catalog';
import { OriginBadge } from '../components/OriginBadge';

const PILLAR_FILTERS: ReadonlyArray<{ id: Pillar | 'all'; label: string }> = [
  { id: 'all', label: 'All collections' },
  { id: 'peace', label: 'Peace & security' },
  { id: 'development', label: 'Development' },
  { id: 'both', label: 'Cross-cutting' },
];

/** The catalogue, with counts read from the graph rather than written down. */
export function Catalogue() {
  const [pillar, setPillar] = useState<Pillar | 'all'>('all');

  const collections = useSourcedData<VariableGroupInfoResponse>(
    SNAPSHOT_KEYS.catalogue,
    (signal) => fetchVariableGroupInfo('undata/g/Root', { signal }),
  );

  const themes = useSourcedData<VariableGroupInfoResponse>(
    SNAPSHOT_KEYS.themes,
    (signal) => fetchVariableGroupInfo('dc/g/UN', { signal }),
  );

  /** Live indicator count per collection dcid. */
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const group of collections.data?.childStatVarGroups ?? []) {
      map.set(group.id, group.descendentStatVarCount ?? 0);
    }
    return map;
  }, [collections.data]);

  const visible = useMemo(() => {
    const rows = COLLECTIONS.filter(
      (collection) => pillar === 'all' || collection.pillar === pillar,
    );
    // Order by live size, so the list reflects the graph rather than this file.
    return [...rows].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
  }, [pillar, counts]);

  const themeRows = useMemo(() => {
    const rows = themes.data?.childStatVarGroups ?? [];
    return [...rows]
      .map((row) => ({
        id: row.id,
        name: THEME_IDS[row.id] ?? row.displayName,
        count: row.descendentStatVarCount ?? 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [themes.data]);

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="What is actually in the graph, and who put it there"
        lead={
          <>
            Sixteen agency collections, each with its own provenance, methodology and terms
            of use. The counts below are read from the platform when this page loads — so
            they move as entities onboard, and you are not reading a number somebody typed
            into a repository last year.
          </>
        }
      />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {/* One filter row, above everything it scopes. */}
        <div role="group" aria-label="Filter by pillar" className="flex flex-wrap gap-2">
          {PILLAR_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setPillar(filter.id)}
              aria-pressed={pillar === filter.id}
              className={`rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${
                pillar === filter.id
                  ? 'border-volt/60 bg-volt/10 text-ink-primary'
                  : 'border-hairline text-ink-secondary hover:border-ink-muted hover:text-ink-primary'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <OriginBadge
          origin={collections.origin}
          retrievedAt={collections.retrievedAt}
          liveError={collections.liveError}
        />
      </div>

      <div
        className={`mt-6 overflow-hidden rounded-lg border border-hairline transition-opacity duration-200 ${
          collections.isLoading ? 'opacity-40' : 'opacity-100'
        }`}
      >
        <table className="w-full border-collapse text-[0.84rem]">
          <caption className="sr-only">
            Contributing collections with live indicator counts and their primary use
          </caption>
          <thead className="bg-surface-2">
            <tr>
              <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">
                Collection
              </th>
              <th scope="col" className="border-b border-hairline p-3 text-right font-semibold text-ink-primary">
                Indicators
              </th>
              <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">
                Come here for
              </th>
              <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">
                dcid prefix
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((collection) => (
              <tr key={collection.id} className="even:bg-surface-1">
                <th scope="row" className="p-3 text-left align-top font-normal">
                  <span className="block font-semibold text-ink-primary">{collection.name}</span>
                  <span className="block text-[0.74rem] text-ink-muted">{collection.fullName}</span>
                </th>
                <td className="tnum p-3 text-right align-top text-ink-secondary">
                  {counts.has(collection.id)
                    ? counts.get(collection.id)!.toLocaleString('en')
                    : '—'}
                </td>
                <td className="p-3 align-top text-ink-secondary">{collection.useFor}</td>
                <td className="p-3 align-top">
                  <code className="font-mono text-[0.72rem] text-volt">
                    undata/{collection.agencySegment}/
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-muted">
        Showing {visible.length} of {COLLECTIONS.length} collections. Sorted by live indicator
        count. The <span className="font-mono text-ink-secondary">dcid prefix</span> column is
        the practical one: it is the second segment of every identifier that collection
        publishes, so it tells you who stands behind a number you are already holding.
      </p>

      <Section
        title="The same data, arranged by theme"
        lead={
          <>
            The platform's Explore page is organised around twelve thematic areas rather than
            by agency. The counts differ from the table above because a theme draws on
            several collections — and because not every indicator is themed.
          </>
        }
      >
        <div
          className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${
            themes.isLoading ? 'opacity-40' : 'opacity-100'
          }`}
        >
          {themeRows.map((theme) => (
            <div key={theme.id} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[0.88rem] font-semibold leading-snug text-ink-primary">
                  {theme.name}
                </h3>
                <span className="tnum shrink-0 text-[0.8rem] text-ink-secondary">
                  {theme.count.toLocaleString('en')}
                </span>
              </div>
              <code className="mt-2 block font-mono text-[0.68rem] text-ink-muted">{theme.id}</code>
            </div>
          ))}
        </div>

        <p className="mt-4 max-w-3xl rounded-lg border border-status-warning/25 bg-status-warning/5 p-4 text-[0.82rem] leading-relaxed text-ink-secondary">
          <span aria-hidden="true" className="mr-1.5 font-semibold text-status-warning">!</span>
          <span className="font-semibold text-status-warning">Worth knowing.</span> “Governance and
          peace” carries the fewest themed indicators of any area, while “Health” carries tens of
          thousands. That imbalance is real and it shapes what the peace and security pillar can
          currently evidence — it is a statement about what the international system measures,
          not about what matters. Work from the SDG 16 branch and the UNODC, UNHCR, OHCHR and
          IOM collections directly rather than through the theme.
        </p>
      </Section>

      <Section
        title="Cross-cutting views of the same series"
        lead="Three more branches sit alongside the collections, and they are views rather than new data — which is why the site does not add their counts to the headline total."
      >
        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            {
              root: 'undata/g/sdgf/goal-1 … goal-17',
              name: 'The SDG framework',
              body: 'Goal → target → indicator. The route to take when your reporting obligation is goal-shaped.',
            },
            {
              root: 'undata/g/abas/sec-1 … sec-7',
              name: 'Antigua and Barbuda Agenda',
              body: 'The seven ABAS priorities for Small Island Developing States, for SIDS-specific analysis.',
            },
            {
              root: 'dc/g/UN_THEME_1 … 12',
              name: 'UN thematic areas',
              body: 'The twelve themes above, as the platform’s own Explore page groups them.',
            },
          ].map((item) => (
            <li key={item.name} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <h3 className="text-[0.88rem] font-semibold text-ink-primary">{item.name}</h3>
              <code className="mt-1.5 block break-all font-mono text-[0.7rem] text-volt">
                {item.root}
              </code>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-secondary">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
