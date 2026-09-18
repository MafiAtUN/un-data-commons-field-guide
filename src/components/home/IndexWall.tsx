import { INDICATORS } from '../../content/indicators';
import { COLLECTIONS } from '../../content/catalog';
import { useInView } from '../../lib/useInView';

/**
 * The hero's visual: an index, not a diagram.
 *
 * The version this replaces was a ring of twenty-six spokes. It encoded
 * nothing — every spoke identical, the geometry carrying no quantity — so it
 * read as a loading spinner that had been dressed up. Decoration that pretends
 * to be information is worse on this site than no decoration at all.
 *
 * This is made of the same material the page is about: real indicator names
 * from the curated set and real contributing collections, set small and quiet,
 * fading up in sequence and then stopping. It supports the headline's claim by
 * being an instance of it rather than an illustration of it.
 */
const ROWS = [
  ...INDICATORS.map((indicator) => ({
    label: indicator.name,
    meta: indicator.source.replace('Global SDG Indicators Database', 'SDG'),
  })),
  ...COLLECTIONS.map((collection) => ({
    label: collection.name,
    meta: 'collection',
  })),
];

/** Rows lit in volt. Spread through the list so the eye has somewhere to land. */
const LIT = new Set([2, 9, 17, 24]);

export function IndexWall() {
  const { ref, inView } = useInView<HTMLDivElement>('0px');

  return (
    <div ref={ref} className="relative" aria-hidden="true">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-muted/70">
        A fraction of the index
      </p>

      {/*
        Masked at the bottom rather than cut off: a hard edge would read as a
        list that ends, and the point is a list that does not.
      */}
      <div
        className="mt-3 h-[22rem] overflow-hidden lg:h-[27rem]"
        style={{
          maskImage: 'linear-gradient(to bottom, black 62%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 62%, transparent 100%)',
        }}
      >
        <ul className="space-y-[3px]">
          {ROWS.map((row, index) => (
            <li
              key={`${row.label}-${index}`}
              data-reveal={inView ? 'shown' : 'hidden'}
              style={{ '--reveal-delay': `${index * 38}ms` } as React.CSSProperties}
              className="flex items-baseline justify-between gap-4 border-b border-hairline/60 pb-[3px]"
            >
              <span
                className={`truncate font-mono text-[0.72rem] ${
                  LIT.has(index) ? 'text-volt' : 'text-ink-muted'
                }`}
              >
                {row.label}
              </span>
              <span className="shrink-0 font-mono text-[0.62rem] text-ink-muted/50">
                {row.meta}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
