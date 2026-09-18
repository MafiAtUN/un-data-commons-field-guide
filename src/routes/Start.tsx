import { Link } from 'react-router-dom';
import { PageHeader, Section } from '../components/Prose';
import { searchUrl } from '../lib/undc/config';

/**
 * The front door for a colleague who does not write code and does not intend to.
 *
 * Everything here is deliberately concrete. No API, no identifiers in the
 * opening, and the first thing offered is a number on screen within a minute.
 */
export function Start() {
  return (
    <>
      <PageHeader
        eyebrow="Start here"
        title="You do not need to be technical to use this"
        lead={
          <>
            The UN put statistics from 26 of its own entities into one place, and made them
            free to anyone. If you write reports, brief managers, or just need a defensible
            number before a meeting, this page gets you there in about five minutes. No
            code, no login, no request form.
          </>
        }
      />

      <Section
        title="First, get a number on screen"
        lead="Before any explanation. Click one of these — it opens the UN platform in a new tab and answers immediately."
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            {
              q: 'access to electricity in Bangladesh',
              why: 'A simple one-country, one-indicator question. This is the shape most of your questions will take.',
            },
            {
              q: 'compare homicide rate across countries in Africa',
              why: 'Notice the words "compare … across countries in". That phrasing is what gets you a map and a ranking instead of one line.',
            },
            {
              q: 'women in national parliament in Kenya',
              why: 'An SDG indicator (5.5.1) phrased the way a person would say it.',
            },
            {
              q: 'how many people lack access to clean water worldwide',
              why: 'A plain-English question with an explicit "worldwide". Always say where you mean.',
            },
          ].map((item) => (
            <li key={item.q} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <a
                href={searchUrl(item.q)}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-[0.82rem] text-volt underline decoration-volt/30 underline-offset-2 hover:decoration-volt"
              >
                {item.q} ↗
              </a>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-secondary">{item.why}</p>
            </li>
          ))}
        </ul>

        <p className="mt-4 max-w-3xl text-[0.88rem] leading-relaxed text-ink-secondary">
          That is the whole platform, really: a search box over roughly 85,000 official
          statistics. Everything else on this site is about getting the <em>right</em> number
          out of it, and being able to defend it afterwards.
        </p>
      </Section>

      <Section
        title="Five words, and then you know the system"
        lead="The platform has its own vocabulary. It is smaller than it looks — five words cover almost everything."
      >
        <ol className="space-y-3">
          {[
            {
              word: 'Indicator',
              plain: 'The thing being measured.',
              example: '"Access to electricity", "Maternal mortality", "Homicide rate".',
              note: 'The platform calls these statistical variables. Same thing.',
            },
            {
              word: 'Place',
              plain: 'Who it is being measured for.',
              example: 'A country, a UN region such as Southern Asia, or the whole world.',
              note: 'If you do not say the place, the platform picks one for you — and it may not be the one you meant. This is the single most common mistake.',
            },
            {
              word: 'Year',
              plain: 'When it was measured.',
              example: '2023. Or every year from 2000 to 2024.',
              note: '"Latest" is not a year. Ask five countries for their latest figure and you can get five different years.',
            },
            {
              word: 'Breakdown',
              plain: 'A slice of the measurement.',
              example: 'By sex, by age group, by urban or rural, by wealth group.',
              note: 'A breakdown is a separate series, not a filter. The slices usually do not add up to the total, because "unknown" is kept separately.',
            },
            {
              word: 'Source',
              plain: 'Which UN body produced the number.',
              example: 'WHO, UNICEF, UNHCR, UNODC, the Global SDG Indicators Database.',
              note: 'This is who you cite. Not data.un.org — that is only how you got there.',
            },
          ].map((item, index) => (
            <li key={item.word} className="flex gap-4 rounded-lg border border-hairline bg-surface-1 p-4">
              <span className="tnum shrink-0 font-mono text-[0.8rem] font-semibold text-volt">
                {index + 1}
              </span>
              <div>
                <h3 className="text-[0.95rem] font-semibold text-ink-primary">
                  {item.word}
                  <span className="ml-2 font-normal text-ink-secondary">— {item.plain}</span>
                </h3>
                <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-secondary">
                  {item.example}
                </p>
                <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-muted">{item.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="Three rules that keep you out of trouble"
        lead="Almost every mistake made with this data is one of these three. None of them is technical."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Rule
            n="1"
            rule="Always name the place"
            wrong="violence"
            right="violence in South Sudan"
            why="Ask without a place and the platform still answers — about a country it chose. The charts look global. They are not. This has ended up in real briefings."
          />
          <Rule
            n="2"
            rule="Check the year on every number"
            wrong="“Country X has a homicide rate of 14.”"
            right="“Country X's most recent reported homicide rate, from 2012, is 14.”"
            why="Many countries report irregularly. A ranking of “latest” figures can quietly compare a 2024 number with a 2012 one."
          />
          <Rule
            n="3"
            rule="Missing is not zero"
            wrong="Leaving a country off the chart because it returned nothing."
            right="“No data was reported for Somalia for these years.”"
            why="A blank means the country did not report, which is a finding about statistical capacity — not evidence that the thing did not happen."
          />
        </div>
      </Section>

      <Section
        title="What the data actually looks like underneath"
        lead="You never have to see this. But two minutes here will save you an afternoon later."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 text-[0.88rem] leading-relaxed text-ink-secondary">
            <p>
              Every figure in the system is one <strong className="text-ink-primary">observation</strong>:
              a single value, for one indicator, one place and one year. That is all a data
              point is.
            </p>
            <p>
              Stack the observations for one indicator and one country across years and you
              have a <strong className="text-ink-primary">series</strong> — that is a line on a
              chart. Take one year across many countries instead and you have a
              cross-section — that is a map or a ranking.
            </p>
            <p>
              Attached to every observation is its{' '}
              <strong className="text-ink-primary">provenance</strong>: who published it, the
              unit it is measured in, and the period it covers. This is why the same
              "population" figure can differ slightly between two UN sources — they are
              genuinely different measurements, not an error.
            </p>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-1 p-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-ink-muted">
              One observation, in full
            </p>
            <dl className="mt-3 space-y-2 text-[0.84rem]">
              {[
                ['Indicator', 'Access to electricity'],
                ['Place', 'Bangladesh'],
                ['Year', '2024'],
                ['Value', '99.4'],
                ['Unit', 'Percent of population'],
                ['Published by', 'Global SDG Indicators Database'],
                ['SDG indicator', '7.1.1'],
              ].map(([term, value]) => (
                <div key={term} className="flex gap-3 border-b border-hairline pb-2 last:border-0">
                  <dt className="w-32 shrink-0 text-ink-muted">{term}</dt>
                  <dd className="text-ink-primary">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.78rem] leading-relaxed text-ink-muted">
              Seven facts. Every one of the 44 million figures in the platform has exactly
              this shape.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Where to go next" lead="Pick the one that matches what you are trying to do today.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Next
            to="/tutorials"
            title="Follow a tutorial"
            body="Six walkthroughs, each about five minutes, each ending with something you can put in a report."
          />
          <Next
            to="/toolkit"
            title="Just get me the data"
            body="Pick a topic and countries, get a chart, a spreadsheet, a citation and an AI prompt. No identifiers."
          />
          <Next
            to="/visualise"
            title="Make a chart"
            body="Which free tool to use, and how to get UN data into Datawrapper or Flourish in a few minutes."
          />
          <Next
            to="/cite"
            title="Cite it correctly"
            body="What to credit, what not to, and a citation you can copy in four styles."
          />
          <Next
            to="/ai"
            title="Use AI to help"
            body="Prompts that work, how to stop a chatbot inventing figures, and building a whole report with free tools."
          />
          <Next
            to="/lab"
            title="Go deeper"
            body="The technical track: how the search box really works, the API, and connecting an AI agent directly."
          />
        </div>
      </Section>
    </>
  );
}

function Rule({
  n,
  rule,
  wrong,
  right,
  why,
}: {
  n: string;
  rule: string;
  wrong: string;
  right: string;
  why: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-4">
      <h3 className="text-[0.92rem] font-semibold text-ink-primary">
        <span className="tnum mr-2 font-mono text-volt">{n}</span>
        {rule}
      </h3>
      <div className="mt-3 space-y-2">
        <p className="rounded border border-status-critical/25 bg-status-critical/5 p-2.5 text-[0.78rem] leading-relaxed text-ink-secondary">
          <span className="font-semibold text-status-critical">Don't: </span>
          {wrong}
        </p>
        <p className="rounded border border-status-good/25 bg-status-good/5 p-2.5 text-[0.78rem] leading-relaxed text-ink-secondary">
          <span className="font-semibold text-status-good">Do: </span>
          {right}
        </p>
      </div>
      <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-muted">{why}</p>
    </div>
  );
}

function Next({ to, title, body }: { to: string; title: string; body: string }) {
  return (
    <Link
      to={to}
      className="group rounded-lg border border-hairline bg-surface-1 p-4 transition-colors hover:border-volt/50"
    >
      <h3 className="text-[0.9rem] font-semibold text-ink-primary">{title}</h3>
      <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-secondary">{body}</p>
      <span className="mt-2 inline-block text-[0.78rem] font-medium text-volt">Open →</span>
    </Link>
  );
}
