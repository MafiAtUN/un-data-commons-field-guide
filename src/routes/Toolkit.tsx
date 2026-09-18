import { PageHeader, Section } from '../components/Prose';
import { DataFinder } from '../components/DataFinder';
import { Link } from 'react-router-dom';

export function Toolkit() {
  return (
    <>
      <PageHeader
        eyebrow="Data Finder"
        title="Get the data, the citation and the chart in one go"
        lead={
          <>
            Three choices — what, where, how far back — and you leave with a spreadsheet, a
            citation and a prompt you can hand to an AI assistant. Built for the afternoon
            when someone needs a figure by five o'clock.
          </>
        }
      />

      <div className="mt-8">
        <DataFinder />
      </div>

      <Section
        title="What just happened"
        lead="Worth thirty seconds, because it explains why the result is trustworthy."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'The numbers came from the UN, just now',
              body: 'Your browser asked data.un.org directly. Nothing was stored, copied or edited in between. If the platform were unreachable you would see a "cached snapshot" badge instead — it never quietly shows you old data.',
            },
            {
              title: 'The spreadsheet remembers where it came from',
              body: 'The CSV carries the indicator, the source, the identifier and the retrieval date in its first rows. Forward it three times and it is still attributable.',
            },
            {
              title: 'The citation credits the right body',
              body: 'It names the agency that produced the figure, with data.un.org as the route. Citing only the platform loses the accountable source, which is the part a reader needs to check the method.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <h3 className="text-[0.88rem] font-semibold text-ink-primary">{item.title}</h3>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-secondary">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="This list is deliberately short"
        lead="Twenty indicators, not eighty-five thousand."
      >
        <div className="max-w-3xl space-y-3 text-[0.88rem] leading-relaxed text-ink-secondary">
          <p>
            The platform holds roughly 85,000 statistical variables. That is a gift to a
            developer and an obstacle to everyone else. The indicators offered here were
            chosen because they answer the questions colleagues actually ask, and each one
            was checked against the live platform for coverage before it was included.
          </p>
          <p>
            If what you need is not in the list, that is expected — it means it is time to
            use the platform's own search, or the{' '}
            <Link to="/lab" className="text-volt underline decoration-volt/30 underline-offset-2">
              Prompt Lab
            </Link>{' '}
            to find the right identifier. The{' '}
            <Link to="/catalogue" className="text-volt underline decoration-volt/30 underline-offset-2">
              catalogue
            </Link>{' '}
            shows all sixteen contributing collections and what each is good for.
          </p>
        </div>
      </Section>
    </>
  );
}
