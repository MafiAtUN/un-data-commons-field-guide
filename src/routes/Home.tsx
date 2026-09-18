import { Link } from 'react-router-dom';
import { DataFinder } from '../components/DataFinder';
import { Expander } from '../components/Expander';
import { searchUrl } from '../lib/undc/config';

/**
 * The front page is the tool.
 *
 * An earlier version opened with an argument about the platform and put the
 * picker three clicks away. Measured, that was 913 words before a reporting
 * officer could do anything. Everything explanatory now sits below the tool or
 * behind a question, so the page is short for someone in a hurry and complete
 * for someone who is not.
 */
export function Home() {
  return (
    <>
      {/* The hero is kept deliberately short: every pixel it takes is a pixel
          between the reader and the chart they came for. */}
      <section className="max-w-3xl">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-volt">
          Official UN statistics · free · no login
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-ink-primary sm:text-4xl">
          What number do you need?
        </h1>
        <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-secondary">
          Pick a topic and some countries. Get the figure, a chart, a spreadsheet and a
          citation — in about fifteen seconds.
        </p>
      </section>

      <div className="mt-5">
        <DataFinder showIntro={false} />
      </div>

      <section className="mt-10">
        <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Common questions
        </h2>
        <div className="mt-3 space-y-2">
          <Expander question="I've never used UN data before. What is this?" time="40 seconds">
            <ul className="space-y-2">
              <li>
                The UN put official statistics from 26 of its agencies into one place:{' '}
                <a
                  href="https://data.un.org"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-volt underline decoration-volt/30 underline-offset-2"
                >
                  data.un.org
                </a>
                .
              </li>
              <li>It is free. No login, no request form, no licence to negotiate.</li>
              <li>This site is an independent guide that makes it faster to use.</li>
              <li>The tool above pulls live figures straight from the UN as you use it.</li>
            </ul>
          </Expander>

          <Expander question="Can I trust these numbers in an official report?" time="30 seconds">
            <ul className="space-y-2">
              <li>
                <strong className="text-ink-primary">Yes</strong> — they come from the UN agency
                that produced them, not from this site.
              </li>
              <li>Every result names its source and the year. Always quote both.</li>
              <li>The green badge means the figure arrived from the UN just now.</li>
              <li>
                Cite the <strong className="text-ink-primary">agency</strong>, not data.un.org.
                The copy button above does this correctly.
              </li>
            </ul>
          </Expander>

          <Expander question="What if my country or topic isn't in the list?" time="30 seconds">
            <ul className="space-y-2">
              <li>The list above is 20 common indicators. The UN holds about 85,000.</li>
              <li>
                Search the platform directly in plain English — for example{' '}
                <a
                  href={searchUrl('under five mortality in Chad')}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-volt underline decoration-volt/30 underline-offset-2"
                >
                  “under five mortality in Chad” ↗
                </a>
              </li>
              <li>
                <strong className="text-ink-primary">Always name the country.</strong> Leave it
                out and the platform picks one for you.
              </li>
            </ul>
          </Expander>

          <Expander question="A country is missing from my results. Why?" time="20 seconds">
            <ul className="space-y-2">
              <li>It means that country did not report this figure.</li>
              <li>
                <strong className="text-ink-primary">It does not mean zero.</strong>
              </li>
              <li>Say so in your report rather than leaving the country out silently.</li>
            </ul>
          </Expander>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight text-ink-primary">
          Now that you have the data
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <NextCard
            to="/visualise"
            time="8 min"
            title="Make a chart"
            body="Free tools, and the five rules that keep a chart honest."
          />
          <NextCard
            to="/cite"
            time="2 min"
            title="Cite it properly"
            body="Credit the agency, not the website. Copy it in four styles."
          />
          <NextCard
            to="/ai"
            time="5 min"
            title="Use AI on it"
            body="Prompts that stop a chatbot inventing figures."
          />
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-hairline bg-surface-1 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[0.95rem] font-semibold text-ink-primary">
              Want to get good at this?
            </h2>
            <p className="mt-1 max-w-xl text-[0.85rem] leading-relaxed text-ink-secondary">
              Six short walkthroughs: find a defensible figure, compare countries without
              misleading anyone, build a chart, draft a report section with AI.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/start"
              className="rounded border border-hairline px-4 py-2 text-[0.82rem] font-medium text-ink-secondary transition-colors hover:border-volt/50 hover:text-ink-primary"
            >
              Read the basics
            </Link>
            <Link
              to="/tutorials"
              className="rounded bg-volt px-4 py-2 text-[0.82rem] font-semibold text-surface-0 transition-opacity hover:opacity-90"
            >
              Open the tutorials
            </Link>
          </div>
        </div>
      </section>

      <p className="mt-8 text-[0.8rem] leading-relaxed text-ink-muted">
        Writing code? There is a whole technical track — the{' '}
        <Link to="/lab" className="text-volt underline decoration-volt/30 underline-offset-2">
          search resolver
        </Link>
        , the{' '}
        <Link to="/cookbook" className="text-volt underline decoration-volt/30 underline-offset-2">
          REST API
        </Link>{' '}
        (no key, CORS open) and an{' '}
        <Link to="/connect" className="text-volt underline decoration-volt/30 underline-offset-2">
          MCP endpoint
        </Link>{' '}
        for AI agents — under Developers.
      </p>
    </>
  );
}

function NextCard({
  to,
  time,
  title,
  body,
}: {
  to: string;
  time: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-lg border border-hairline bg-surface-1 p-4 transition-colors hover:border-volt/50"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[0.92rem] font-semibold text-ink-primary">{title}</h3>
        <span className="text-[0.7rem] text-ink-muted">{time}</span>
      </div>
      <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-secondary">{body}</p>
    </Link>
  );
}
