import { Link } from 'react-router-dom';
import { VideoEmbed } from '../components/VideoEmbed';
import { publishedVideos } from '../content/videos';
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
 * Two drafts were wrong before this one, in opposite directions. The first said
 * the UN had just opened its statistics to everyone — not true, they have been
 * free since 2008. The second corrected that with "UN data was never locked
 * away, it was just scattered", which is accurate and still wrong for this
 * page: it opens on a problem. A page whose whole job is to send people to the
 * platform should not begin by telling them what was wrong with it.
 *
 * UN data was already excellent. It just got a very large upgrade. That is both
 * true and the thing worth saying first; the "scattered" explanation still
 * earns its place, one chapter down, where it explains the upgrade instead of
 * undercutting it.
 *
 * Each chapter carries its own accent, so four screens read as six places
 * rather than one scroll. The Data Finder still exists on its own page; this
 * page fetches nothing at all.
 */
export function Home() {
  const span = timelineSpan();
  const firstVideo = publishedVideos()[0];

  return (
    <div className="pb-64 sm:pb-40 xl:pb-28">
      <SectionRail />

      {/* ---------- Hero ---------- */}
      <section
        id="top"
        className="grid scroll-mt-24 items-start gap-10 pt-2 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14"
      >
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-volt">
            An unofficial guide to data.un.org
          </p>

          <h1 className="mt-4 text-balance text-[2rem] font-semibold leading-[1] min-[380px]:text-[2.5rem] sm:leading-[0.95] tracking-tight text-ink-primary sm:text-[3.4rem] lg:text-[4.1rem]">
            <span className="block text-ink-muted">UN data was always good.</span>
            It just got a{' '}
            {/* A solid marker with the words knocked out of it. Volt at partial
                opacity over near-black turns olive, which is the opposite of
                the point; at full strength it is the loudest thing on the page,
                which is exactly the point. Dark-on-volt measures 13.4:1. */}
            <span className="relative inline-block px-[0.12em] max-[380px]:whitespace-normal sm:whitespace-nowrap">
              <span
                aria-hidden="true"
                className="absolute inset-0 -rotate-[0.8deg] rounded-md bg-volt"
              />
              <span className="relative text-surface-0">huge upgrade</span>
            </span>
            .
          </h1>

          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-secondary">
            The <strong className="font-semibold text-ink-primary">UN System Data Commons</strong>{' '}
            puts the official statistics of twenty-six UN entities into one knowledge graph.
            Roughly 44 million figures. Ask it a question in plain English and it answers
            across all of them at once, with the source and the year still attached.
          </p>

          <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-ink-secondary">
            <strong className="font-bold text-[#d55181]">
              Free, as UN data has always been — no login, no request form, no licence to
              negotiate.
            </strong>{' '}
            What's new is that an AI assistant can now fetch from it directly.{' '}
            <span className="text-ink-muted">It's genuinely brilliant, and almost nobody is
            using it properly yet.</span>
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
          <ScrollCue to={HOME_SECTIONS[1]!.id} label="See what the upgrade actually does" />
        </div>

        <IndexWall />
      </section>

      {/* ---------- What changed ---------- */}
      <Chapter
        id="wand"
        accent="aqua"
        kicker="What the upgrade actually does"
        title="One question. Twenty-six agencies. One answer."
        lead={
          <>
            The figures were always free — they just lived in forty separate databases, each
            with its own export, its own country codes and its own opinion about what counts
            as a year. Now they're joined, and the answers come back knowing about each other.
          </>
        }
        boxed
      >
        <TheWand />
      </Chapter>

      <Chapter
        id="video-tutorial"
        accent="magenta"
        kicker="Watch it happen"
        title="Your first number, in 80 seconds."
        lead="Follow a real search from question to figure, year and source. Then try it yourself."
      >
        <div className="grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
          {firstVideo && <VideoEmbed spec={firstVideo} />}
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent-magenta-ink">
              Video tutorials
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink-primary">
              See the steps. Try them yourself.
            </h3>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-secondary">
              Learn to check a result, download the data and cite its producer.
              Each short recording covers one task, with a transcript you can follow.
            </p>
            <Link
              to="/watch"
              className="mt-6 inline-flex min-h-11 items-center rounded-lg border border-accent-magenta/35 bg-accent-magenta/[0.07] px-5 py-3 text-[0.9rem] font-semibold text-accent-magenta-ink transition-colors hover:bg-accent-magenta/15"
            >
              Watch all tutorials →
            </Link>
          </div>
        </div>
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
    </div>
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
