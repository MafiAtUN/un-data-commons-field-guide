import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { Chapter } from '../components/home/Chapter';
import { ChapterIndex } from '../components/home/ChapterIndex';
import { IndexWall } from '../components/home/IndexWall';
import { ResolverFilm } from '../components/home/ResolverFilm';
import { TheWand } from '../components/home/TheWand';
import { Timeline } from '../components/home/Timeline';
import { WaysIn } from '../components/home/WaysIn';
import { ScrollCue, SectionRail } from '../components/home/SectionRail';
import { HOME_SECTIONS } from '../content/sections';
import { timelineSpan } from '../content/timeline';
import { SITE_ROOT } from '../lib/undc/config';

/**
 * The front page is a door, not a tool.
 *
 * The correction that shaped this version: UN data was never locked away. It
 * has been free since UNdata opened in 2008, and free was never the problem —
 * it was spread across dozens of agency databases that did not speak to each
 * other. What arrived in September 2026 is not access. It is a wand: one
 * question, across all of it, with the provenance still attached.
 *
 * An earlier draft opened with "the UN opened its statistics to everyone, for
 * free", which is both wrong and a smaller claim than the true one.
 *
 * Each chapter carries its own accent, so four screens read as six places
 * rather than one scroll. The Data Finder still exists on its own page; this
 * page fetches nothing at all.
 */
export function Home() {
  const span = timelineSpan();

  return (
    <>
      <SectionRail />

      {/* ---------- Hero ---------- */}
      <section
        id="top"
        className="grid items-start gap-10 pt-2 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14"
      >
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-volt">
            An unofficial guide to data.un.org
          </p>

          <h1 className="mt-4 text-balance text-[2.5rem] font-semibold leading-[0.95] tracking-tight text-ink-primary sm:text-[3.4rem] lg:text-[4.1rem]">
            <span className="block text-ink-muted">UN data was never locked away.</span>
            It was just{' '}
            {/* A solid marker with the word knocked out of it. Volt at partial
                opacity over near-black turns olive, which is the opposite of
                the point; at full strength it is the loudest thing on the page,
                which is exactly the point. Dark-on-volt measures 13.4:1. */}
            <span className="relative inline-block whitespace-nowrap px-[0.12em]">
              <span
                aria-hidden="true"
                className="absolute inset-0 -rotate-[0.8deg] rounded-md bg-volt"
              />
              <span className="relative text-surface-0">scattered</span>
            </span>
            .
          </h1>

          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-secondary">
            Every figure has been free for years. The catch was that it lived in forty
            different databases, each with its own export, its own country codes and its own
            opinion about what counts as a year. Getting a number was never the hard part.
            Getting two that agreed was.
          </p>

          <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-ink-secondary">
            The <strong className="font-semibold text-ink-primary">UN System Data Commons</strong>{' '}
            is the magic wand. Twenty-six entities, one knowledge graph, one question — and
            an AI that can go and fetch it for you.{' '}
            <span className="text-ink-muted">It's genuinely brilliant, and almost nobody
            is using it properly yet.</span>
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
              Teach me the basics
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

          {/* Nothing from the next chapter reaches above the fold on any
              viewport, so the hero reads as the whole page without this. */}
          <ScrollCue to={HOME_SECTIONS[1]!.id} label="See what the wand actually does" />
        </div>

        <IndexWall />
      </section>

      {/* ---------- What changed ---------- */}
      <Chapter
        id="wand"
        accent="aqua"
        kicker="What actually changed"
        title="The data didn't get freer. It got joined up."
        lead={
          <>
            That sounds like a smaller thing than it is. Joined up means one question reaches
            every agency at once, and the answers come back knowing about each other.
          </>
        }
        boxed
      >
        <TheWand />
      </Chapter>

      {/* ---------- How we got here ---------- */}
      <Chapter
        id="history"
        accent="blue"
        kicker={`${span.years} years in the making`}
        title="How the UN ended up with a knowledge graph"
        lead={
          <>
            Two threads: what the UN decided, and what the technology it now runs on could
            do. They meet in September 2026. Every date links to where it came from.
          </>
        }
      >
        <Timeline />
      </Chapter>

      {/* ---------- The one catch ---------- */}
      <Chapter
        id="trap"
        accent="orange"
        kicker="Read this before you quote anything"
        title="The search box will answer a question you didn't ask."
        lead={
          <>
            It always commits to a place. If it can't find yours, it picks one — and nothing
            on the resulting chart mentions that it did. This is the one thing worth knowing
            before you put a figure in front of anybody.
          </>
        }
      >
        <ResolverFilm />
      </Chapter>

      {/* ---------- Three ways in ---------- */}
      <Chapter
        id="ways-in"
        accent="violet"
        kicker="Pick your altitude"
        title="Three ways in, and nobody mentions the last two"
        lead={
          <>
            Search it like a website, query it like a database, or hand it to an AI assistant
            and let that do the fetching. All three are open, and none needs a key.
          </>
        }
      >
        <WaysIn />
      </Chapter>

      {/* ---------- The guide ---------- */}
      <Chapter
        id="guide"
        accent="magenta"
        kicker="What's in here"
        title="Everything else on this site"
        lead={
          <>
            Two tracks. One assumes you write reports, the other assumes you write code.
            Neither assumes you have read the other.
          </>
        }
      >
        <ChapterIndex />
      </Chapter>

      {/* ---------- Closing ---------- */}
      <section
        id="start"
        className="mt-20 scroll-mt-24 rounded-2xl border border-volt/30 bg-volt/[0.06] p-8 sm:mt-28 sm:p-12"
      >
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-volt">
                Right then
              </p>
              <h2 className="mt-3 text-balance text-[1.7rem] font-semibold leading-tight tracking-tight text-ink-primary sm:text-[2.2rem]">
                Go and get a number.
              </h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-secondary">
                Five minutes on the basics will save you an afternoon, but nothing here is a
                prerequisite. The platform is open right now and it doesn't care whether you
                read this first.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={SITE_ROOT}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-lg bg-volt px-5 py-3 text-[0.9rem] font-semibold text-surface-0 transition-opacity hover:opacity-90"
              >
                Open data.un.org ↗
              </a>
              <Link
                to="/toolkit"
                className="rounded-lg border border-hairline px-5 py-3 text-[0.9rem] font-medium text-ink-secondary transition-colors hover:border-volt/60 hover:text-ink-primary"
              >
                Or use the Data Finder
              </Link>
            </div>
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
          className={`block text-[1.75rem] font-semibold leading-none tracking-tight ${
            accent ? 'text-volt' : 'text-ink-primary'
          }`}
        >
          {value}
        </span>
        <span className="mt-1.5 block text-[0.66rem] uppercase tracking-[0.12em] text-ink-muted">
          {label}
        </span>
      </dd>
    </div>
  );
}
