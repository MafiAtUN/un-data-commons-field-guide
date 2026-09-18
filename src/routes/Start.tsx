import { Link } from 'react-router-dom';
import { PageHeader, Section } from '../components/Prose';
import { Expander } from '../components/Expander';
import { searchUrl } from '../lib/undc/config';

/**
 * The basics, for someone who does not write code.
 *
 * Written to be scanned, not read: short sentences, bullets, and the reasoning
 * behind each rule tucked behind a question so the page stays brief. An earlier
 * version ran to 913 words of prose, which measured out at four minutes before
 * the reader could do anything.
 */
export function Start() {
  return (
    <>
      <PageHeader
        eyebrow="The basics · 4 minutes"
        title="Everything you need to know, on one page"
        lead={<>No code. No login. Five words, three rules, and you are done.</>}
      />

      <Section title="The five words" lead="This is the whole vocabulary.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              word: 'Indicator',
              plain: 'The thing being measured.',
              eg: 'Access to electricity. Homicide rate.',
            },
            {
              word: 'Place',
              plain: 'Who it is measured for.',
              eg: 'A country, a region, or the world.',
            },
            {
              word: 'Year',
              plain: 'When it was measured.',
              eg: '2024. Or every year since 2000.',
            },
            {
              word: 'Breakdown',
              plain: 'A slice of the measurement.',
              eg: 'By sex. By age. By urban or rural.',
            },
            {
              word: 'Source',
              plain: 'Which UN body produced it.',
              eg: 'WHO. UNICEF. UNHCR. UNODC.',
            },
          ].map((item) => (
            <div key={item.word} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <h3 className="text-[0.95rem] font-semibold text-ink-primary">{item.word}</h3>
              <p className="mt-1 text-[0.85rem] text-ink-secondary">{item.plain}</p>
              <p className="mt-1.5 text-[0.78rem] text-ink-muted">{item.eg}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="The three rules" lead="Nearly every mistake with this data is one of these.">
        <div className="space-y-3">
          <Rule
            n="1"
            rule="Always name the country"
            bad="violence"
            good="violence in South Sudan"
            why="Ask without a place and you still get an answer — about a country the platform chose for you. The charts look global. They are not. Type the word “violence” on its own and it returns figures for the United States."
          />
          <Rule
            n="2"
            rule="Always quote the year"
            bad="“The homicide rate is 14.”"
            good="“The most recent reported figure, from 2012, is 14.”"
            why="Countries report at different times. A ranking of “latest available” figures can put a 2024 number next to a 2012 one without saying so. Your reader will assume they are from the same year."
          />
          <Rule
            n="3"
            rule="Missing is not zero"
            bad="Quietly dropping a country that returned nothing."
            good="“No data was reported for Somalia.”"
            why="A blank means the country did not report. That is a finding about statistical capacity, not evidence that the thing did not happen. Dropping it silently turns a data gap into a false conclusion."
          />
        </div>
      </Section>

      <Section title="Try it now" lead="Each opens the UN platform in a new tab.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            'access to electricity in Bangladesh',
            'compare homicide rate across countries in Africa',
            'women in national parliament in Kenya',
            'how many people lack clean water worldwide',
          ].map((q) => (
            <li key={q}>
              <a
                href={searchUrl(q)}
                target="_blank"
                rel="noreferrer noopener"
                className="block rounded-lg border border-hairline bg-surface-1 p-3 font-mono text-[0.8rem] text-volt transition-colors hover:border-volt/50"
              >
                {q} ↗
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="If you want to go deeper" lead="Optional. Nothing above depends on it.">
        <div className="space-y-2">
          <Expander question="What does a data point actually look like?" time="30 seconds">
            <p className="mb-2">Every figure is seven facts. That is all.</p>
            <dl className="space-y-1.5">
              {[
                ['Indicator', 'Access to electricity'],
                ['Place', 'Bangladesh'],
                ['Year', '2024'],
                ['Value', '99.4'],
                ['Unit', 'Percent of population'],
                ['Published by', 'Global SDG Indicators Database'],
                ['SDG indicator', '7.1.1'],
              ].map(([term, value]) => (
                <div key={term} className="flex gap-3">
                  <dt className="w-32 shrink-0 text-ink-muted">{term}</dt>
                  <dd className="text-ink-primary">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3">All 44 million figures in the platform have this shape.</p>
          </Expander>

          <Expander question="Why do two UN sources give different numbers?" time="20 seconds">
            <ul className="space-y-1.5">
              <li>They are genuinely different measurements, not an error.</li>
              <li>Agencies use different methods, years and definitions.</li>
              <li>Pick one source and say which. Do not mix them in one chart.</li>
            </ul>
          </Expander>

          <Expander question="Why did last year's figure change?" time="20 seconds">
            <ul className="space-y-1.5">
              <li>Agencies revise history when countries resubmit data.</li>
              <li>This is normal and correct.</li>
              <li>
                Record your access date. It explains the difference without making you look
                wrong.
              </li>
            </ul>
          </Expander>
        </div>
      </Section>

      <Section title="Next" lead="Pick one.">
        <div className="grid gap-3 sm:grid-cols-3">
          <NextCard to="/" time="15 sec" title="Get a number now" body="The tool, on the front page." />
          <NextCard to="/tutorials" time="5 min each" title="Follow a tutorial" body="Six walkthroughs, start to finish." />
          <NextCard to="/cite" time="2 min" title="Cite it properly" body="Credit the agency, not the website." />
        </div>
      </Section>
    </>
  );
}

function Rule({
  n,
  rule,
  bad,
  good,
  why,
}: {
  n: string;
  rule: string;
  bad: string;
  good: string;
  why: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-4">
      <h3 className="text-[1rem] font-semibold text-ink-primary">
        <span className="tnum mr-2 font-mono text-volt">{n}</span>
        {rule}
      </h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <p className="rounded border border-status-critical/25 bg-status-critical/5 p-2.5 text-[0.8rem] leading-relaxed text-ink-secondary">
          <span className="font-semibold text-status-critical">Don't: </span>
          {bad}
        </p>
        <p className="rounded border border-status-good/25 bg-status-good/5 p-2.5 text-[0.8rem] leading-relaxed text-ink-secondary">
          <span className="font-semibold text-status-good">Do: </span>
          {good}
        </p>
      </div>
      <div className="mt-3">
        <Expander question="Why does this matter?" time="20 seconds">
          {why}
        </Expander>
      </div>
    </div>
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
