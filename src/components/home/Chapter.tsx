import type { ReactNode } from 'react';
import { Reveal } from '../Reveal';
import { ACCENT_CLASSES, type Accent } from '../../content/sections';

interface ChapterProps {
  id: string;
  accent: Accent;
  /** The small line above the heading. Says what kind of thing this is. */
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
  /** Sit the whole chapter in a tinted, bordered block. */
  boxed?: boolean;
}

/**
 * One chapter of the front page, in its own colour.
 *
 * A long page in a single hue reads as one undifferentiated scroll. Giving each
 * chapter an accent — carried by the kicker, the rule and the tint rather than
 * by the body text — turns four screens into six places, and tells a reader at
 * a glance when one idea has ended and another begun.
 */
export function Chapter({ id, accent, kicker, title, lead, children, boxed = false }: ChapterProps) {
  const colour = ACCENT_CLASSES[accent];

  return (
    <section
      id={id}
      className={`mt-20 scroll-mt-24 sm:mt-28 ${
        boxed ? `rounded-2xl border ${colour.border} ${colour.bg} p-6 sm:p-10` : ''
      }`}
    >
      <Reveal>
        <p className={`flex items-center gap-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${colour.text}`}>
          <span aria-hidden="true" className={`h-[2px] w-7 rounded-full ${colour.dot}`} />
          {kicker}
        </p>

        <h2 className="mt-4 max-w-4xl text-balance text-[1.9rem] font-semibold leading-[1.05] tracking-tight text-ink-primary sm:text-[2.6rem] lg:text-[3rem]">
          {title}
        </h2>

        {lead && (
          <div className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-ink-secondary">{lead}</div>
        )}
      </Reveal>

      <div className={lead || title ? 'mt-10' : ''}>{children}</div>
    </section>
  );
}
