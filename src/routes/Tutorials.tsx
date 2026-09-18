import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Section } from '../components/Prose';
import { Tutorial } from '../components/Tutorial';
import { TUTORIALS } from '../content/tutorials';
import { publishedVideos, seriesMinutes } from '../content/videos';

/** Shown before the list has to earn more of the reader's attention. */
const SHOWN_BY_DEFAULT = 3;

export function Tutorials() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? TUTORIALS : TUTORIALS.slice(0, SHOWN_BY_DEFAULT);
  const hidden = TUTORIALS.length - SHOWN_BY_DEFAULT;

  return (
    <>
      <PageHeader
        eyebrow="Tutorials · 5 minutes each"
        title="Six walkthroughs"
        lead={<>Each ends with something you can put in front of a manager. Open one and follow along in a second tab.</>}
      />

      <Link
        to="/watch"
        className="group mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-hairline bg-surface-1 p-5 transition-colors hover:border-volt/50"
      >
        <div className="max-w-2xl">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-volt">
            {publishedVideos().length} videos · {seriesMinutes()} minutes
          </span>
          <h2 className="mt-1.5 text-[1.05rem] font-semibold text-ink-primary">
            Would you rather watch it done once first?
          </h2>
          <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-secondary">
            The same ground as these walkthroughs, recorded on the platform itself. Ninety seconds
            each, one idea each, transcripts and a companion notebook included.
          </p>
        </div>
        <span className="text-[0.82rem] font-medium text-ink-secondary group-hover:text-ink-primary">
          Watch the series →
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
            className="mt-3 w-full rounded-lg border border-dashed border-hairline py-2.5 text-[0.82rem] font-medium text-ink-secondary transition-colors hover:border-volt/50 hover:text-ink-primary"
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
