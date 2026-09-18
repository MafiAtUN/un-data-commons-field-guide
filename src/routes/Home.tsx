import { Link } from 'react-router-dom';
import { CatalogueCounters } from '../components/CatalogueCounters';
import { searchUrl } from '../lib/undc/config';

/**
 * The landing page carries one argument and two doors.
 *
 * The argument: the platform is enormous, and the limiting factor is not access
 * but knowing how to ask. The doors: a short tour for someone who arrived from a
 * link, and the Prompt Lab for someone who needs a number today.
 */
export function Home() {
  return (
    <>
      <section className="max-w-3xl">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-volt">
          Launched 17 September 2026 · data.un.org
        </p>
        <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-ink-primary sm:text-5xl">
          The UN just put 44 million data points behind one search box.
          <span className="block text-ink-muted">Most people will find 1% of it.</span>
        </h1>
        <p className="mt-6 text-[1rem] leading-relaxed text-ink-secondary">
          The UN System Data Commons unifies statistics from 26 UN entities into a single
          knowledge graph. It is genuinely open — no key, no licence negotiation, no
          scraping. But the difference between a vague question and a precise one is the
          difference between someone else's country and the number you needed.
        </p>
        <p className="mt-4 text-[1rem] leading-relaxed text-ink-secondary">
          This guide is the part that is not in the documentation: how to phrase the ask,
          how to address an indicator directly, how to pull a whole region in one request —
          and where the data will quietly mislead you if you don't look.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/start"
            className="rounded bg-volt px-5 py-2.5 text-[0.85rem] font-semibold text-surface-0 transition-opacity hover:opacity-90"
          >
            Start here — no coding needed
          </Link>
          <Link
            to="/toolkit"
            className="rounded border border-hairline px-5 py-2.5 text-[0.85rem] font-medium text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink-primary"
          >
            Just get me the data →
          </Link>
        </div>

        <p className="mt-4 text-[0.82rem] leading-relaxed text-ink-muted">
          Developer? The{' '}
          <Link to="/lab" className="text-volt underline decoration-volt/30 underline-offset-2">
            Prompt Lab
          </Link>
          ,{' '}
          <Link to="/cookbook" className="text-volt underline decoration-volt/30 underline-offset-2">
            REST cookbook
          </Link>{' '}
          and{' '}
          <Link to="/connect" className="text-volt underline decoration-volt/30 underline-offset-2">
            MCP setup
          </Link>{' '}
          are all still here, under Developers.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight text-ink-primary">
          If you write reports rather than code
        </h2>
        <p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-ink-secondary">
          Most people who need this data are not developers. They are reporting officers,
          analysts and programme staff who need a defensible figure before a meeting. This
          whole track assumes no technical background and nothing beyond a browser.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Practical
            to="/start"
            step="Five minutes"
            title="Start here"
            body="The five words the system uses, the three rules that keep you out of trouble, and your first number on screen."
          />
          <Practical
            to="/tutorials"
            step="Six walkthroughs"
            title="Tutorials"
            body="Find a defensible figure. Compare countries honestly. Make a chart. Draft a section with AI. Each about five minutes."
          />
          <Practical
            to="/toolkit"
            step="Three clicks"
            title="Data Finder"
            body="Pick a topic and countries. Leave with a chart, a spreadsheet, a citation and an AI prompt. No identifiers."
          />
          <Practical
            to="/visualise"
            step="Free tools"
            title="Make a chart"
            body="Datawrapper, Flourish and the rest — which to use, how to get UN data in, and five rules that keep a chart honest."
          />
          <Practical
            to="/cite"
            step="Copy and paste"
            title="Cite it properly"
            body="Credit the agency, not the website. Four styles, generated for the indicator you used."
          />
          <Practical
            to="/ai"
            step="Prompts included"
            title="Use AI safely"
            body="Never ask a chatbot what a statistic is — give it the statistic and ask what it means. Four prompts that do exactly that."
          />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          What is in there, counted live
        </h2>
        <p className="mt-2 max-w-2xl text-[0.85rem] leading-relaxed text-ink-secondary">
          These figures are read from the platform's own catalogue endpoint when this page
          loads, not typed into this repository — so as entities onboard, the numbers move.
        </p>
        <div className="mt-6">
          <CatalogueCounters />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight text-ink-primary">
          For developers: three ways in, and the one nobody mentions
        </h2>
        <p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-ink-secondary">
          The platform has three public surfaces. The search box is the one everybody finds.
          The other two are what turn it from a website into infrastructure.
        </p>

        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          <Door
            step="01"
            title="Ask"
            summary="Natural-language search, and the results are deep-linkable — you can send a colleague the exact query, not a screenshot."
            detail="Best for orientation and for questions you can phrase in one sentence."
            to="/lab"
            cta="Learn to phrase it"
          />
          <Door
            step="02"
            title="Query"
            summary="A REST API over the knowledge graph. No API key, and it answers cross-origin — this site's charts are calling it from your browser right now."
            detail="Best when you know what you want, need a whole region at once, or are building something."
            to="/cookbook"
            cta="Read the cookbook"
          />
          <Door
            step="03"
            title="Delegate"
            summary="An MCP endpoint with six tools and three research playbooks, so an AI assistant can look statistics up itself instead of guessing."
            detail="Best for analysis you want to hold a conversation with, and for agent workflows."
            to="/connect"
            cta="Connect an agent"
          />
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight text-ink-primary">Two pillars, worked end to end</h2>
        <p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-ink-secondary">
          Abstract advice about querying is easy to nod along to and hard to use. These are
          two real analytical questions taken from first search to attributed chart, with
          the wrong turns left in.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PillarCard
            to="/peace-and-security"
            pillar="Peace and security"
            question="How much of South Sudan's conflict mortality falls on children — and can I compare it with its neighbours?"
            sources="SDG 16 · UNODC · UNHCR · OHCHR · IOM DTM"
          />
          <PillarCard
            to="/development"
            pillar="Development"
            question="Is Bangladesh's human development gain keeping pace with its region, and what is the honest way to show it?"
            sources="SDG 1–17 · UNDP HDRO · ITU · WHO · UNICEF"
          />
        </div>
      </section>

      <section className="mt-16 rounded-lg border border-hairline bg-surface-1 p-6">
        <h2 className="text-lg font-semibold text-ink-primary">Try it without leaving this page</h2>
        <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-ink-secondary">
          These open the platform's own search. The point of the guide is that you will
          soon stop needing the search box — but it is the right place to start.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {[
            'number of total conflict-related deaths in South Sudan',
            'compare homicide rate across countries in Africa',
            'human development index in Southern Asia',
            'access to electricity in Bangladesh',
          ].map((question) => (
            <li key={question}>
              <a
                href={searchUrl(question)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block rounded-full border border-hairline bg-surface-0 px-3 py-1.5 font-mono text-[0.73rem] text-ink-secondary transition-colors hover:border-volt/50 hover:text-ink-primary"
              >
                {question} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Practical({
  to,
  step,
  title,
  body,
}: {
  to: string;
  step: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-lg border border-hairline bg-surface-1 p-4 transition-colors hover:border-volt/50"
    >
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-volt">
        {step}
      </span>
      <h3 className="mt-2 text-[0.95rem] font-semibold text-ink-primary">{title}</h3>
      <p className="mt-1.5 flex-1 text-[0.81rem] leading-relaxed text-ink-secondary">{body}</p>
      <span className="mt-3 text-[0.78rem] font-medium text-ink-secondary group-hover:text-ink-primary">
        Open →
      </span>
    </Link>
  );
}

function Door({
  step,
  title,
  summary,
  detail,
  to,
  cta,
}: {
  step: string;
  title: string;
  summary: string;
  detail: string;
  to: string;
  cta: string;
}) {
  return (
    <li className="flex flex-col rounded-lg border border-hairline bg-surface-1 p-5">
      <span className="tnum font-mono text-[0.7rem] text-ink-muted">{step}</span>
      <h3 className="mt-2 text-base font-semibold text-ink-primary">{title}</h3>
      <p className="mt-2 flex-1 text-[0.82rem] leading-relaxed text-ink-secondary">{summary}</p>
      <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-muted">{detail}</p>
      <Link
        to={to}
        className="mt-4 text-[0.8rem] font-medium text-volt underline decoration-volt/30 underline-offset-2 hover:decoration-volt"
      >
        {cta} →
      </Link>
    </li>
  );
}

function PillarCard({
  to,
  pillar,
  question,
  sources,
}: {
  to: string;
  pillar: string;
  question: string;
  sources: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-lg border border-hairline bg-surface-1 p-5 transition-colors hover:border-volt/50"
    >
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-volt">
        {pillar}
      </span>
      <p className="mt-3 flex-1 text-[0.95rem] leading-snug text-ink-primary">“{question}”</p>
      <span className="mt-4 font-mono text-[0.7rem] text-ink-muted">{sources}</span>
      <span className="mt-3 text-[0.8rem] font-medium text-ink-secondary group-hover:text-ink-primary">
        Work through it →
      </span>
    </Link>
  );
}
