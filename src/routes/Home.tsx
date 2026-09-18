import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { ChapterIndex } from '../components/home/ChapterIndex';
import { IndexWall } from '../components/home/IndexWall';
import { ResolverFilm } from '../components/home/ResolverFilm';
import { WaysIn } from '../components/home/WaysIn';
import { SITE_ROOT } from '../lib/undc/config';

/**
 * The front page is a door, not a tool.
 *
 * It used to be the Data Finder. That was a reasonable answer to the wrong
 * question: this site's job is to get a reporting officer onto data.un.org
 * knowing how to ask, not to become a thin second copy of the platform. The
 * Data Finder still exists, on its own page, for when a figure is wanted
 * without leaving; the front page now argues and hands off, and it fetches
 * nothing at all.
 *
 * The order is the order of a decision: what this is → the one way it will
 * mislead you → the three doors in → everything else.
 */
export function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="grid items-start gap-10 pt-2 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-volt">
            Independent field guide · data.un.org
          </p>

          <h1 className="mt-4 text-balance text-[2.35rem] font-semibold leading-[0.98] tracking-tight text-ink-primary sm:text-[3.2rem] lg:text-[3.75rem]">
            The UN opened its statistics.
            <span className="block text-ink-muted">Asking well is the hard part.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[1rem] leading-relaxed text-ink-secondary">
            Twenty-six UN System entities put their official statistics into a single
            knowledge graph: free, no login, no licence to negotiate. What it does not come
            with is a guide to asking it a precise question. That is this.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={SITE_ROOT}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-lg bg-volt px-5 py-3 text-[0.9rem] font-semibold text-surface-0 transition-opacity hover:opacity-90"
            >
              Open data.un.org ↗
            </a>
            <Link
              to="/start"
              className="rounded-lg border border-hairline px-5 py-3 text-[0.9rem] font-medium text-ink-secondary transition-colors hover:border-volt/60 hover:text-ink-primary"
            >
              Start with the basics
            </Link>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 border-t border-hairline pt-6 sm:grid-cols-4">
            <Figure value="26" label="UN entities" />
            <Figure value="16" label="Collections" />
            <Figure value="~85k" label="Indicators" />
            <Figure value="0" label="API keys" accent />
          </dl>
          <p className="mt-3 text-[0.68rem] text-ink-muted">
            As published at launch, 17 September 2026. Counted live on the{' '}
            <Link to="/catalogue" className="underline decoration-hairline underline-offset-2 hover:decoration-volt">
              catalogue page
            </Link>
            .
          </p>
        </div>

        <IndexWall />
      </section>

      {/* ---------- The trap ---------- */}
      <section className="mt-24">
        <Reveal>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Before you trust a chart
          </p>
          <h2 className="mt-3 max-w-3xl text-balance text-[1.7rem] font-semibold leading-tight tracking-tight text-ink-primary sm:text-[2.2rem]">
            The search box will answer a question you did not ask, and will not mention it.
          </h2>
          <p className="mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-ink-secondary">
            It always commits to a place. If it cannot find yours, it supplies one — and the
            chart it draws over the top looks exactly like the chart you wanted.
          </p>
        </Reveal>

        <div className="mt-8">
          <ResolverFilm />
        </div>
      </section>

      {/* ---------- Three ways in ---------- */}
      <section className="mt-24">
        <Reveal>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Three ways in
          </p>
          <h2 className="mt-3 max-w-3xl text-balance text-[1.7rem] font-semibold leading-tight tracking-tight text-ink-primary sm:text-[2.2rem]">
            Type it, query it, or hand it to an agent.
          </h2>
          <p className="mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-ink-secondary">
            Every one of these is open to the public and none of them asks who you are.
          </p>
        </Reveal>

        <div className="mt-8">
          <WaysIn />
        </div>
      </section>

      {/* ---------- The guide ---------- */}
      <section className="mt-24">
        <Reveal>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            The guide
          </p>
          <h2 className="mt-3 max-w-3xl text-balance text-[1.7rem] font-semibold leading-tight tracking-tight text-ink-primary sm:text-[2.2rem]">
            Twelve chapters, shortest first.
          </h2>
          <p className="mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-ink-secondary">
            Start anywhere. This is only the order things get harder in — and the same index
            opens from the header on any page.
          </p>
        </Reveal>

        <div className="mt-8">
          <ChapterIndex />
        </div>
      </section>

      {/* ---------- Closing ---------- */}
      <section className="mt-24 rounded-xl border border-hairline bg-surface-1 p-8 sm:p-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-balance text-[1.6rem] font-semibold leading-tight tracking-tight text-ink-primary sm:text-[2rem]">
                Just need a figure today?
              </h2>
              <p className="mt-2.5 text-[0.92rem] leading-relaxed text-ink-secondary">
                The Data Finder pulls a chart, a spreadsheet and a correctly formatted
                citation straight from the UN in about fifteen seconds — no identifiers, no
                reading first.
              </p>
            </div>
            <Link
              to="/toolkit"
              className="rounded-lg bg-volt px-5 py-3 text-[0.9rem] font-semibold text-surface-0 transition-opacity hover:opacity-90"
            >
              Open the Data Finder →
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Figure({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span
          className={`tnum block text-[1.7rem] font-semibold leading-none ${
            accent ? 'text-volt' : 'text-ink-primary'
          }`}
        >
          {value}
        </span>
        <span className="mt-1.5 block text-[0.72rem] uppercase tracking-[0.1em] text-ink-muted">
          {label}
        </span>
      </dd>
    </div>
  );
}
