import { PageHeader, Section } from '../components/Prose';
import { Tutorial } from '../components/Tutorial';
import { TUTORIALS } from '../content/tutorials';

export function Tutorials() {
  return (
    <>
      <PageHeader
        eyebrow="Tutorials"
        title="Six walkthroughs, each about five minutes"
        lead={
          <>
            Every one of these ends with something you could put in front of a manager: a
            defensible figure, a chart, a citation, a drafted paragraph. They assume no
            technical background and no tools beyond a browser. Open the first one and
            follow along in a second tab.
          </>
        }
      />

      <Section
        title="Start with the first one"
        lead="They build on each other, but each also works on its own if you already know what you need."
      >
        <div className="space-y-3">
          {TUTORIALS.map((spec, index) => (
            <Tutorial key={spec.id} spec={spec} defaultOpen={index === 0} />
          ))}
        </div>
      </Section>

      <Section
        title="If something does not work"
        lead="The three things that most often go wrong, and what they actually mean."
      >
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
