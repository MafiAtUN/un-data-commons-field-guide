import { useState } from 'react';
import { Link } from '../components/Link';
import { PageHeader, Section } from '../components/Prose';
import { Tutorial } from '../components/Tutorial';
import { TUTORIALS } from '../content/tutorials';
import { LESSON_LINKS } from '../content/lesson-index';

/** Shown before the list has to earn more of the reader's attention. */
const SHOWN_BY_DEFAULT = 3;

/** The Find course covers the same ground on video. */
const FIND = LESSON_LINKS.filter((lesson) => lesson.course === 'find');
const FIND_MINUTES = Math.round(FIND.reduce((total, lesson) => total + lesson.seconds, 0) / 60);

export function Tutorials() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? TUTORIALS : TUTORIALS.slice(0, SHOWN_BY_DEFAULT);
  const hidden = TUTORIALS.length - SHOWN_BY_DEFAULT;

  return (
    <>
      <PageHeader
        eyebrow="Walkthroughs · 4 to 8 minutes each"
        title="Six walkthroughs"
        lead={<>Each ends with something you can put in front of a manager. Open one and follow along in a second tab.</>}
      />

      <Link
        to="/courses/find/"
        className="group mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-hairline bg-surface-1 p-5 transition-colors hover:border-hairline-strong"
      >
        <div className="max-w-2xl">
          <span className="text-meta font-semibold text-ink-muted">
            {FIND.length} videos · {FIND_MINUTES} minutes
          </span>
          <h2 className="mt-1.5 text-lead font-semibold text-ink-primary">
            Would you rather watch it done once first?
          </h2>
          <p className="mt-1.5 text-body text-ink-secondary">
            The same ground as these walkthroughs, recorded on data.un.org itself. About a minute
            each, one idea each, each with a transcript.
          </p>
        </div>
        <span className="text-meta font-semibold text-ink-primary group-hover:underline group-hover:decoration-volt-line group-hover:underline-offset-4">
          Watch the Find course →
        </span>
      </Link>

      <Section title="Start with the first one" lead="Each also works on its own.">
        <div className="space-y-2.5">
          {visible.map((spec, index) => (
            <Tutorial key={spec.id} spec={spec} defaultOpen={index === 0} />
          ))}
        </div>

        {!showAll && hidden > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-3 w-full rounded-lg border border-dashed border-hairline py-2.5 text-[0.82rem] font-medium text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink-primary"
          >
            Show {hidden} more walkthroughs
          </button>
        )}
      </Section>

      <Section title="If something does not work" lead="The three that most often go wrong.">
        <dl className="space-y-3">
          {[
            {
              problem: 'The chart is about a country I did not ask for.',
              meaning:
                'Your question had no place in it, so the platform chose one. Add the country, the region, or the word "worldwide" and ask again.',
            },
            {
              problem: 'My country is missing from the results.',
              meaning:
                'That country did not report this indicator. It is a genuine finding about reporting, not a fault in the platform or in your search. Say so in your text.',
            },
            {
              problem: 'The number is different from the one in last year\'s report.',
              meaning:
                'Agencies revise historical figures when countries resubmit. Check the year and the producing agency on both. Usually the older report is quoting a since-revised figure, and the new number is the correct one.',
            },
          ].map((item) => (
            <div key={item.problem} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <dt className="text-[0.9rem] font-semibold text-ink-primary">“{item.problem}”</dt>
              <dd className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-secondary">{item.meaning}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
