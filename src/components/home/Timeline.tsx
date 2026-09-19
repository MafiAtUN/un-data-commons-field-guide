import { useInView } from '../../lib/useInView';
import { orderedMilestones, type Milestone } from '../../content/timeline';

/**
 * Two threads that converge, drawn as two threads that converge.
 *
 * The version this replaces was a row of nine identical dots and one grey card.
 * It *said* "two strands meet in September 2026" and showed nothing of the kind:
 * every mark the same size, the same colour, carrying no quantity and no
 * structure. A timeline whose geometry means nothing is just a list with extra
 * steps.
 *
 * So the lanes are real. UN decisions run down one side, the technology down
 * the other, and at the launch the spine goes solid volt and the entry takes
 * the full width — the convergence is the layout, not a sentence about it. The
 * one entry that has not happened yet is drawn as an outline, because a plan
 * and a fact should not look alike.
 */

const STRAND = {
  un: {
    label: 'United Nations',
    year: 'text-accent-blue-ink',
    dot: 'bg-accent-blue',
    border: 'border-accent-blue/35',
    tint: 'bg-accent-blue/[0.06]',
    chip: 'bg-accent-blue/15 text-accent-blue-ink',
  },
  tech: {
    label: 'The technology',
    year: 'text-accent-violet-ink',
    dot: 'bg-accent-violet',
    border: 'border-accent-violet/35',
    tint: 'bg-accent-violet/[0.06]',
    chip: 'bg-accent-violet/15 text-accent-violet-ink',
  },
} as const;

export function Timeline() {
  const entries = orderedMilestones();

  return (
    <div className="relative">
      {/* ---------- Lane headings ---------- */}
      <div className="mb-6 hidden items-center justify-between gap-4 lg:flex">
        <p className="flex-1 text-right text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent-blue-ink">
          What the UN decided
        </p>
        <span aria-hidden="true" className="h-px w-16 bg-hairline" />
        <p className="flex-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent-violet-ink">
          What the technology could do
        </p>
      </div>

      {/* ---------- The spine ---------- */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-[0.4rem] top-0 w-px bg-gradient-to-b from-hairline via-hairline to-volt/60 lg:left-1/2 lg:-translate-x-1/2"
      />

      <ol className="relative space-y-4">
        {entries.map((entry) => (
          <Entry key={entry.sort} entry={entry} />
        ))}
      </ol>
    </div>
  );
}

function Entry({ entry }: { entry: Milestone }) {
  const { ref, inView } = useInView<HTMLLIElement>('-5% 0px -10% 0px');

  const isLaunch = Boolean(entry.headline);
  // 2027 has not happened. A plan should not be dressed as a fact.
  const isFuture = entry.sort > '2026-09';
  const strand = STRAND[entry.strand];
  const onRight = entry.strand === 'tech';

  const year = entry.sort.slice(0, 4);

  // The launch spans both lanes; that is the convergence.
  if (isLaunch) {
    return (
      <li ref={ref} data-reveal={inView ? 'shown' : 'hidden'} className="relative pl-9 lg:pl-0">
        <Node className="bg-volt ring-4 ring-volt/20" big />
        <div className="rounded-xl border border-volt/45 bg-volt/[0.08] p-5 sm:p-7 lg:mx-10">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="rounded-full bg-volt px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-surface-0">
              The upgrade
            </span>
            <span className="tnum text-[0.82rem] text-ink-secondary">{entry.when}</span>
          </div>
          {/* Stacked on narrow screens: a 4.6rem numeral and a wrapping title
              cannot share a baseline row at phone width without colliding. */}
          <div className="mt-3 sm:flex sm:items-baseline sm:gap-4">
            <span className="tnum block shrink-0 text-[3.4rem] font-semibold leading-[0.8] tracking-tight text-volt sm:text-[4.6rem]">
              {year}
            </span>
            <span className="mt-1.5 block text-[1.25rem] font-semibold leading-tight tracking-tight text-ink-primary sm:mt-0 sm:text-[1.6rem]">
              {entry.title}
            </span>
          </div>
          <p className="mt-4 max-w-3xl text-[0.93rem] leading-relaxed text-ink-secondary">
            {entry.body}
          </p>
          {entry.note && (
            <p className="mt-3 max-w-3xl border-l-2 border-volt/60 pl-3 text-[0.87rem] leading-relaxed text-ink-secondary">
              {entry.note}
            </p>
          )}
          <Footer entry={entry} />
        </div>
      </li>
    );
  }

  return (
    <li
      ref={ref}
      data-reveal={inView ? 'shown' : 'hidden'}
      className={`relative pl-9 lg:flex lg:pl-0 ${onRight ? 'lg:justify-end' : ''}`}
    >
      <Node className={isFuture ? 'bg-surface-0 ring-1 ring-ink-muted/60' : strand.dot} />

      <div
        className={`rounded-xl border p-4 sm:p-5 lg:w-[calc(50%-2.75rem)] ${
          isFuture
            ? 'border-dashed border-ink-muted/40 bg-transparent'
            : `${strand.border} ${strand.tint}`
        }`}
      >
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span
            className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide ${
              isFuture ? 'bg-surface-2 text-ink-muted' : strand.chip
            }`}
          >
            {isFuture ? 'Planned' : strand.label}
          </span>
          <span className="tnum text-[0.78rem] text-ink-muted">{entry.when}</span>
        </div>

        <div className="mt-2.5 sm:flex sm:items-baseline sm:gap-3">
          <span
            className={`tnum block shrink-0 text-[2.1rem] font-semibold leading-[0.8] tracking-tight sm:text-[2.6rem] ${
              isFuture ? 'text-ink-muted' : strand.year
            }`}
          >
            {year}
          </span>
          <span className="mt-1.5 block text-[1.02rem] font-semibold leading-tight tracking-tight text-ink-primary sm:mt-0">
            {entry.title}
          </span>
        </div>

        <p className="mt-2.5 text-[0.88rem] leading-relaxed text-ink-secondary">{entry.body}</p>

        {entry.note && (
          <p className="mt-2.5 border-l-2 border-hairline pl-3 text-[0.82rem] leading-relaxed text-ink-muted">
            {entry.note}
          </p>
        )}

        <Footer entry={entry} />
      </div>
    </li>
  );
}

/** The mark on the spine. Sits left on narrow screens, centred on wide ones. */
function Node({ className, big = false }: { className: string; big?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute left-0 top-6 z-10 rounded-full lg:left-1/2 lg:-translate-x-1/2 ${
        big ? 'size-[1.1rem]' : 'size-[0.8rem]'
      } ${className}`}
    />
  );
}

function Footer({ entry }: { entry: Milestone }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-t border-hairline pt-3 text-[0.72rem]">
      <p className="text-ink-muted">{entry.actors}</p>
      <a
        href={entry.source.href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:text-volt hover:decoration-volt"
      >
        {entry.source.label} ↗
      </a>
    </div>
  );
}
