import { Link } from 'react-router-dom';
import { PageHeader, Section } from '../components/Prose';
import { Expander } from '../components/Expander';
import { CodeBlock } from '../components/CodeBlock';
import { PageVideo } from '../components/PageVideo';
import { searchUrl } from '../lib/undc/config';

/**
 * Orientation, written for someone who already does this for a living.
 *
 * The version this replaces opened with a glossary: Indicator, Place, Year,
 * Breakdown, Source, each with a one-line definition. The audience is reporting
 * officers who produce SDG returns — they have known those five words for
 * years, and spending their first four minutes on them says the site thinks
 * otherwise. It was also, and this is the worse charge, boring.
 *
 * What a professional does not already know is how *this particular platform*
 * behaves: where it answers confidently and wrongly, and which of its habits
 * produce a correction three weeks after the brief has gone out. That is what
 * is here, and every claim on the page is one that was checked against the live
 * deployment rather than assumed.
 */
export function Start() {
  return (
    <>
      <PageHeader
        eyebrow="Start here · 5 minutes"
        title="What this platform does that you would not predict"
        lead={
          <>
            You know what an indicator is. This is the shortlist of behaviours that produce a
            correction later — each one verified against the live deployment, not assumed.
          </>
        }
      />

      <PageVideo page="/start" />

      <Section
        title="Five behaviours worth knowing before you quote anything"
        lead="In rough order of how much trouble they cause."
      >
        <div className="space-y-3">
          <Behaviour
            n="1"
            rule="The search box always commits to a place — including when it should not"
            detail={
              <>
                It does not distinguish “you named no place” from “you named a place I do not
                recognise”. Both produce a confident chart about somewhere else, with nothing
                on it to say so.
              </>
            }
            evidence={[
              ['child mortality in Bengal', 'country/USA', false],
              ['child mortality in Bangladesh', 'country/BGD', true],
            ]}
            why={
              <>
                Both queries return charts titled “Total Child Mortality, by Age”. The first is
                United States data. Bengal is a real place that people say out loud; the
                resolver has no entry for it, and rather than return nothing it falls back to
                its default. The{' '}
                <Link to="/lab" className="text-volt underline decoration-volt/30 underline-offset-2">
                  Prompt Lab
                </Link>{' '}
                shows you the resolved place before any chart is drawn over it.
              </>
            }
          />

          <Behaviour
            n="2"
            rule="“Latest available” is not a year, and a ranking will hide that"
            detail={
              <>
                Countries report on their own cycles. A “most recent value” comparison can put
                a 2024 figure beside a 2012 one and present them as peers.
              </>
            }
            why={
              <>
                This is the failure that survives peer review, because the chart is not wrong —
                it is answering a different question than the one the reader assumes. State the
                year range on the face of the chart, or restrict to a year every country in the
                comparison actually reported. The ranking panels on this site compute the
                vintage spread of their own results and raise the warning themselves.
              </>
            }
          />

          <Behaviour
            n="3"
            rule="A blank is a statement about reporting, not a zero"
            detail={
              <>
                An absent value means the country did not report that series. It is evidence
                about statistical capacity, and it is not randomly distributed across countries.
              </>
            }
            why={
              <>
                Dropping the blank rows silently converts a gap in reporting into an apparent
                finding, and it biases in a predictable direction: the countries least able to
                report are frequently the ones a peace or development brief is about. Name the
                omission in the text. “No data was reported by X for this indicator” is a
                sentence that protects you.
              </>
            }
          />

          <Behaviour
            n="4"
            rule="Two UN sources disagreeing is normal, and both figures are official"
            detail={
              <>
                The Global SDG Indicators Database figure and the producing agency's own figure
                are different objects with different vintages, methods and revision cycles.
              </>
            }
            why={
              <>
                Neither is the error. The SDG database carries the series as harmonised for
                global reporting; the agency carries it as it publishes it. Pick one, say which
                in the note, and do not mix them inside a single chart. The identifier makes
                this explicit — <code className="font-mono text-ink-primary">undata/sdg/…</code>{' '}
                and <code className="font-mono text-ink-primary">undata/who/…</code> are visibly
                different series.
              </>
            }
          />

          <Behaviour
            n="5"
            rule="History is rewritten, so record when you looked"
            detail={
              <>
                Agencies revise past years when countries resubmit. The figure you quoted last
                quarter can legitimately differ from the same figure today.
              </>
            }
            why={
              <>
                This is correct behaviour, not a bug, and it is only a problem if your citation
                cannot survive it. An access date turns “your number is wrong” into “that was
                the published figure on that date”, which is the end of the conversation. The{' '}
                <Link to="/cite" className="text-volt underline decoration-volt/30 underline-offset-2">
                  citation generator
                </Link>{' '}
                includes it automatically.
              </>
            }
          />
        </div>
      </Section>

      <Section
        title="The identifier is the unit of precision"
        lead="The one piece of syntax worth learning, because it is what makes a figure reproducible."
      >
        <p className="max-w-3xl text-[0.9rem] leading-relaxed text-ink-secondary">
          A screenshot is not evidence and a search URL can drift. Every series in the graph has
          a structured address, and quoting it in a methodology note means anyone can re-run
          exactly what you ran.
        </p>

        <div className="mt-4">
          <CodeBlock
            language="text"
            code={`undata / sdg / VC_DTH_TOTN . AGE--Y0T17 __ SEX--F
──┬───   ─┬─   ─────┬─────   ────┬────      ──┬──
  │       │         │            │            └── second dimension
  │       │         │            └─────────────── first dimension
  │       │         └──────────────────────────── the series code
  │       └────────────────────────────────────── contributing UN entity
  └──────────────────────────────────────────────  namespace`}
          />
        </div>

        <p className="mt-4 max-w-3xl text-[0.9rem] leading-relaxed text-ink-secondary">
          <strong className="text-ink-primary">The trap is the absence of a dot.</strong> A
          series with no dimensions after it is the undisaggregated total — so{' '}
          <code className="font-mono text-ink-primary">undata/sdg/VC_DTH_TOTN</code> and{' '}
          <code className="font-mono text-ink-primary">undata/sdg/VC_DTH_TOTN.SEX--F</code> are
          not two views of one number, they are the total and one slice of it. Summing slices
          and comparing the result to the total is the most common way to produce a figure that
          disagrees with itself.
        </p>

        <div className="mt-4">
          <Expander question="Where do I get the identifier for a series I am looking at?" time="30 seconds">
            <ul className="space-y-1.5">
              <li>
                In the{' '}
                <Link to="/toolkit" className="text-volt underline decoration-volt/30 underline-offset-2">
                  Data Finder
                </Link>
                , the source line under every result has a “technical ID” toggle.
              </li>
              <li>
                The{' '}
                <Link to="/cookbook" className="text-volt underline decoration-volt/30 underline-offset-2">
                  query cookbook
                </Link>{' '}
                takes the grammar apart interactively and lets you build one by hand.
              </li>
              <li>
                The{' '}
                <Link to="/catalogue" className="text-volt underline decoration-volt/30 underline-offset-2">
                  catalogue
                </Link>{' '}
                lists every contributing collection and its agency segment.
              </li>
            </ul>
          </Expander>
        </div>
      </Section>

      <Section
        title="See behaviour 1 for yourself"
        lead="Two queries, one word apart. Both open data.un.org in a new tab."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <TryIt
            query="child mortality in Bengal"
            verdict="Returns United States figures"
            tone="bad"
          />
          <TryIt
            query="child mortality in Bangladesh"
            verdict="Returns Bangladesh, as asked"
            tone="good"
          />
        </div>

        <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-muted">
          Worth trying with your own country's informal names, regional groupings and
          historical spellings before you trust the search box with them.
        </p>
      </Section>

      <Section title="Next" lead="Pick one.">
        <div className="grid gap-3 sm:grid-cols-3">
          <NextCard
            to="/toolkit"
            time="15 sec"
            title="Get a number now"
            body="The Data Finder: chart, spreadsheet and citation in one go."
          />
          <NextCard
            to="/tutorials"
            time="5 min each"
            title="Follow a tutorial"
            body="Six walkthroughs, start to finish, with the wrong turns left in."
          />
          <NextCard
            to="/lab"
            time="6 min"
            title="Watch the resolver decide"
            body="Both hidden decisions, on any question you type."
          />
        </div>
      </Section>
    </>
  );
}

/** One platform behaviour: what it does, the evidence, and why it bites. */
function Behaviour({
  n,
  rule,
  detail,
  evidence,
  why,
}: {
  n: string;
  rule: string;
  detail: React.ReactNode;
  /** Optional verified query → resolved place pairs. */
  evidence?: [string, string, boolean][];
  why: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-5">
      <h3 className="flex gap-3 text-[1.02rem] font-semibold leading-snug text-ink-primary">
        <span className="tnum shrink-0 font-mono text-volt">{n}</span>
        {rule}
      </h3>

      <p className="mt-2 pl-[1.6rem] text-[0.88rem] leading-relaxed text-ink-secondary">
        {detail}
      </p>

      {evidence && (
        <dl className="mt-3 space-y-1.5 pl-[1.6rem]">
          {evidence.map(([query, resolved, ok]) => (
            <div
              key={query}
              className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded border px-3 py-2 font-mono text-[0.76rem] ${
                ok
                  ? 'border-status-good/25 bg-status-good/5'
                  : 'border-status-critical/25 bg-status-critical/5'
              }`}
            >
              <dt className="text-ink-secondary">{query}</dt>
              <dd className={ok ? 'text-status-good' : 'text-status-critical'}>→ {resolved}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-3 pl-[1.6rem]">
        <Expander question="Why it bites" time="30 seconds">
          {why}
        </Expander>
      </div>
    </div>
  );
}

function TryIt({
  query,
  verdict,
  tone,
}: {
  query: string;
  verdict: string;
  tone: 'good' | 'bad';
}) {
  const good = tone === 'good';
  return (
    <a
      href={searchUrl(query)}
      target="_blank"
      rel="noreferrer noopener"
      className={`block rounded-lg border bg-surface-1 p-4 transition-colors hover:border-volt/50 ${
        good ? 'border-status-good/30' : 'border-status-critical/30'
      }`}
    >
      <span className="block font-mono text-[0.82rem] text-ink-primary">{query} ↗</span>
      <span
        className={`mt-2 block text-[0.78rem] font-medium ${
          good ? 'text-status-good' : 'text-status-critical'
        }`}
      >
        {verdict}
      </span>
    </a>
  );
}

function NextCard({ to, time, title, body }: { to: string; time: string; title: string; body: string }) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-hairline bg-surface-1 p-4 transition-colors hover:border-volt/50"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[0.92rem] font-semibold text-ink-primary">{title}</h3>
        <span className="text-[0.7rem] text-ink-muted">{time}</span>
      </div>
      <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-secondary">{body}</p>
    </Link>
  );
}
