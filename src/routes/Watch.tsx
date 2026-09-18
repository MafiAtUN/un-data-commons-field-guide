import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Section } from '../components/Prose';
import { VideoEmbed } from '../components/VideoEmbed';
import { CopyButton } from '../components/CopyButton';
import { VIDEOS, type Video, type VideoAsset } from '../content/videos';
import { searchUrl } from '../lib/undc/config';

/**
 * The screen tutorials, as a course.
 *
 * Twelve videos, none longer than ninety seconds, each carrying one idea. The
 * page is built so that it is still worth reading with the sound off and before
 * a single video has been uploaded: every entry shows its transcript and the
 * things you would need in your own hands to follow along. A video that has not
 * been published yet simply shows its still and its transcript instead of a
 * player, which is why `id: ''` is a supported state rather than a bug.
 */
/**
 * The site spells small numbers out, so the counts on this page have to as
 * well — and they are counts, not constants, because a video appears the moment
 * its id is pasted in and the prose has to stay true without being edited.
 */
const WORDS = [
  'no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve',
] as const;

function spell(n: number): string {
  return WORDS[n] ?? String(n);
}

export function Watch() {
  const practical = VIDEOS.filter((v) => v.track === 'practical');
  const technical = VIDEOS.filter((v) => v.track === 'technical');
  const live = VIDEOS.filter((v) => v.id !== '');
  const pending = VIDEOS.filter((v) => v.id === '');
  const minutes = Math.round(live.reduce((t, v) => t + (v.seconds ?? 0), 0) / 60);
  const liveTechnical = technical.filter((v) => v.id !== '').length;

  return (
    <>
      <PageHeader
        eyebrow={`Screen tutorials · ${minutes} minutes in total`}
        title="Watch someone do it"
        lead={
          <>
            {spell(live.length).replace(/^./, (c) => c.toUpperCase())} recordings of the platform
            being used, none longer than ninety seconds. Each one lands a single idea and stops.
            Watch the first four in the time it takes a meeting to start, or read the transcripts —
            everything said out loud is written down here too.
          </>
        }
      />

      {pending.length > 0 && (
        <p className="mt-6 max-w-3xl rounded-lg border border-hairline bg-surface-1 p-4 text-[0.85rem] leading-relaxed text-ink-secondary">
          <span className="font-semibold text-ink-primary">
            {pending.length === 1
              ? 'One more is still being uploaded'
              : `${spell(pending.length).replace(/^./, (c) => c.toUpperCase())} more are still being uploaded`}
            :
          </span>{' '}
          {pending.map((v) => v.title).join(', ')}. Until it is live you get its opening still, its
          transcript and the material that goes with it, which between them carry the same content
          in a form you can skim.
        </p>
      )}

      <Section
        title="Everyone starts here"
        lead={`${spell(practical.length).replace(/^./, (c) => c.toUpperCase())} videos, in order. No technical background is assumed and nothing beyond a browser is needed.`}
      >
        <ol className="space-y-4">
          {practical.map((video, index) => (
            <Entry key={video.slug} video={video} n={index + 1} />
          ))}
        </ol>
      </Section>

      <Section
        title="If you write code"
        lead={
          liveTechnical === technical.length
            ? 'The same platform, reached programmatically. Both are run live on screen rather than described.'
            : 'The same platform, reached programmatically — run live on screen rather than described.'
        }
      >
        <ol className="space-y-4">
          {technical.map((video, index) => (
            <Entry key={video.slug} video={video} n={practical.length + index + 1} />
          ))}
        </ol>
      </Section>

      <Section
        title="Things to take away with you"
        lead="The videos are the explanation. These are the parts you actually use afterwards."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Resource
            href={`${import.meta.env.BASE_URL}un-data-commons.ipynb`}
            title="The companion notebook"
            body="Runs everything in videos 11 and 12 against the live platform — the series, the facet join, a whole region in one request, and the MCP calls. Pure standard library, so there is nothing to install and no key to obtain."
            meta="Jupyter · Python 3 · no dependencies"
            download
          />
          <Resource
            to="/tutorials"
            title="The written walkthroughs"
            body="The same ground covered in text, with every step stating both the action and what you should see if it worked. Better than video when you are following along in a second tab."
            meta="Six walkthroughs · about five minutes each"
          />
          <Resource
            to="/start"
            title="The five behaviours that cause corrections"
            body="One page. The platform habits behind videos 02, 04 and 05, written out so you can put them in front of a colleague who will not watch anything."
            meta="5 min read"
          />
          <Resource
            to="/cookbook"
            title="The REST cookbook"
            body="Every request from video 11 as copy-paste recipes, plus the identifier grammar and the five documented ways the API will trip you up."
            meta="Reference"
          />
        </div>
      </Section>
    </>
  );
}

/** One video: still or player, the idea, what you need, and the transcript. */
function Entry({ video, n }: { video: Video; n: number }) {
  const [openTranscript, setOpenTranscript] = useState(false);
  const live = video.id !== '';

  return (
    <li className="overflow-hidden rounded-lg border border-hairline bg-surface-1">
      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div>
          {live ? (
            <VideoEmbed spec={video} />
          ) : (
            <figure className="overflow-hidden rounded-lg border border-hairline bg-surface-0">
              <div className="relative aspect-video w-full bg-surface-2">
                <img
                  src={video.poster}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover opacity-55"
                />
                <span className="absolute inset-x-0 bottom-0 bg-surface-0/85 px-3 py-1.5 text-[0.72rem] text-ink-muted backdrop-blur-sm">
                  Not uploaded yet — transcript below
                </span>
              </div>
            </figure>
          )}
        </div>

        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-2.5 text-[0.72rem] text-ink-muted">
            <span className="tnum font-mono text-volt">{String(n).padStart(2, '0')}</span>
            <span className="tnum">{runtime(video.seconds ?? 0)}</span>
          </p>
          <h3 className="mt-1.5 text-[1.02rem] font-semibold leading-snug text-ink-primary">
            {video.title}
          </h3>
          <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-secondary">{video.idea}</p>

          {video.assets && video.assets.length > 0 && (
            <ul className="mt-3.5 space-y-2">
              {video.assets.map((asset, i) => (
                <li key={i}>
                  <Asset asset={asset} />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenTranscript((open) => !open)}
              aria-expanded={openTranscript}
              className="text-[0.78rem] font-medium text-ink-secondary underline decoration-hairline underline-offset-2 hover:text-ink-primary hover:decoration-volt"
            >
              {openTranscript ? 'Hide transcript' : 'Read the transcript'}
            </button>
            {video.page && (
              <Link
                to={video.page}
                className="text-[0.78rem] font-medium text-volt underline decoration-volt/30 underline-offset-2 hover:decoration-volt"
              >
                The page this belongs to →
              </Link>
            )}
          </div>
        </div>
      </div>

      {openTranscript && (
        <div className="border-t border-hairline bg-surface-0 px-5 py-4">
          <dl className="space-y-2">
            {video.transcript.map((line) => (
              <div key={line.at} className="flex gap-4">
                <dt className="tnum w-12 shrink-0 pt-0.5 font-mono text-[0.72rem] text-ink-muted">
                  {runtime(line.at)}
                </dt>
                <dd className="text-[0.85rem] leading-relaxed text-ink-secondary">{line.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </li>
  );
}

/** The one thing a viewer needs in their own hands for this video. */
function Asset({ asset }: { asset: VideoAsset }) {
  if (asset.kind === 'query') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={searchUrl(asset.value)}
          target="_blank"
          rel="noreferrer noopener"
          className="min-w-0 break-words rounded border border-hairline bg-surface-0 px-2.5 py-1.5 font-mono text-[0.76rem] text-volt transition-colors hover:border-volt/50"
        >
          {asset.value} ↗
        </a>
      </div>
    );
  }

  if (asset.kind === 'link') {
    return (
      <a
        href={asset.href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-[0.8rem] text-ink-secondary underline decoration-hairline underline-offset-2 hover:text-ink-primary hover:decoration-volt"
      >
        {asset.label} ↗
      </a>
    );
  }

  if (asset.kind === 'command') {
    return (
      <div className="rounded border border-hairline bg-surface-0 p-2.5">
        <code className="block break-all font-mono text-[0.74rem] leading-relaxed text-volt">
          {asset.value}
        </code>
        {asset.note && (
          <p className="mt-1.5 text-[0.74rem] leading-relaxed text-ink-muted">{asset.note}</p>
        )}
        <div className="mt-2">
          <CopyButton label="Copy" value={asset.value} />
        </div>
      </div>
    );
  }

  return (
    <p className="text-[0.78rem] leading-relaxed text-ink-muted">
      <span className="text-ink-secondary">{asset.label}: </span>
      {asset.value}
    </p>
  );
}

function Resource({
  to,
  href,
  title,
  body,
  meta,
  download,
}: {
  to?: string;
  href?: string;
  title: string;
  body: string;
  meta: string;
  download?: boolean;
}) {
  const inner = (
    <>
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-volt">{meta}</span>
      <h3 className="mt-2 text-[0.95rem] font-semibold text-ink-primary">{title}</h3>
      <p className="mt-1.5 flex-1 text-[0.82rem] leading-relaxed text-ink-secondary">{body}</p>
      <span className="mt-3 text-[0.78rem] font-medium text-ink-secondary">
        {download ? 'Download →' : 'Open →'}
      </span>
    </>
  );

  const className =
    'group flex flex-col rounded-lg border border-hairline bg-surface-1 p-4 transition-colors hover:border-volt/50';

  if (href) {
    return (
      <a href={href} download={download} className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={to!} className={className}>
      {inner}
    </Link>
  );
}

/** 80 seconds reads as "1:20", which is the unit people judge a tutorial in. */
function runtime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
}
