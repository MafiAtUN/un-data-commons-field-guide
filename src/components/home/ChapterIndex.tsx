import { Link } from 'react-router-dom';
import { DESTINATIONS, type Destination } from '../../content/navigation';
import { useInView } from '../../lib/useInView';

/**
 * The guide's contents, on the page, at the same size as in the overlay.
 *
 * Deliberately the same visual language as the index that opens from the
 * header: numbered rows, a rule that draws itself under the one you are
 * pointing at. A reader who meets it here already knows how the navigation
 * behaves when they meet it there, which is cheaper than teaching them twice.
 */
export function ChapterIndex() {
  const { ref, inView } = useInView<HTMLDivElement>('-5% 0px -5% 0px');

  const practical = DESTINATIONS.filter((destination) => destination.track === 'practical');
  const technical = DESTINATIONS.filter((destination) => destination.track === 'technical');

  return (
    <div ref={ref} className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
      <Column
        heading="Practical"
        note="No technical background assumed"
        items={practical}
        inView={inView}
        from={1}
      />
      <Column
        heading="Developer"
        note="The resolver, the REST API and MCP"
        items={technical}
        inView={inView}
        from={1 + practical.length}
      />
    </div>
  );
}

function Column({
  heading,
  note,
  items,
  inView,
  from,
}: {
  heading: string;
  note: string;
  items: readonly Destination[];
  inView: boolean;
  from: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 border-b border-hairline pb-2">
        <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-volt">
          {heading}
        </h3>
        <span className="text-[0.7rem] text-ink-muted">{note}</span>
      </div>

      <ul>
        {items.map((destination, index) => (
          <li key={destination.to}>
            <Link
              to={destination.to}
              data-reveal={inView ? 'shown' : 'hidden'}
              style={{ '--reveal-delay': `${index * 55}ms` } as React.CSSProperties}
              className="group relative block border-b border-hairline py-3.5"
            >
              <span className="flex items-baseline gap-3.5 sm:gap-5">
                <span aria-hidden="true" className="tnum w-6 shrink-0 text-[0.72rem] text-ink-muted/60 transition-colors group-hover:text-volt">
                  {String(from + index).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-balance text-[1.15rem] font-medium leading-tight text-ink-primary transition-colors group-hover:text-volt sm:text-[1.4rem]">
                    {destination.label}
                  </span>
                  <span className="mt-0.5 block text-[0.78rem] leading-snug text-ink-muted">
                    {destination.hint}
                  </span>
                </span>
                <span className="shrink-0 text-[0.7rem] text-ink-muted">{destination.time}</span>
              </span>

              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
