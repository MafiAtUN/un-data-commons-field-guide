import { useState } from 'react';
import { VideoEmbed } from './VideoEmbed';
import { videosForPage, type Video } from '../content/videos';

/** "4:46" for a group, so the heading can be honest about the commitment. */
function totalRuntime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
}

function runtime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
}

/**
 * The videos belonging to a page — as an offer, not as the page.
 *
 * The version this replaces rendered every video for a page as a stacked,
 * full-width 16:9 player. On `/start` that was four of them: roughly three
 * thousand pixels of video above the first sentence of the actual guide, so a
 * reader who simply wanted to read met a wall of players instead. Video is an
 * alternative to this page, not a toll gate in front of it.
 *
 * So this is a strip of small stills. It states the commitment up front, costs
 * about a tenth of the height, and expands one video in place when a reader
 * chooses it. Nothing loads from YouTube until that click, exactly as before.
 *
 * Placement still lives in `content/videos.ts`, so a video appears the moment
 * its id is pasted in and no page has to be edited to receive one.
 */
export function PageVideo({ page }: { page: string }) {
  const videos = videosForPage(page);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  if (videos.length === 0) return null;

  const seconds = videos.reduce((total, video) => total + (video.seconds ?? 0), 0);
  const open = videos.find((video) => video.slug === openSlug);

  return (
    <aside className="my-10 rounded-lg border border-hairline bg-surface-1 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[0.82rem] font-semibold text-ink-primary">
          Prefer to watch?
          <span className="ml-2 font-normal text-ink-muted">
            {videos.length === 1
              ? `One video · ${totalRuntime(seconds)}`
              : `${videos.length} short videos · ${totalRuntime(seconds)} in total`}
          </span>
        </p>
        {open && (
          <button
            type="button"
            onClick={() => setOpenSlug(null)}
            className="text-[0.76rem] text-ink-muted underline decoration-hairline underline-offset-2 hover:text-ink-secondary hover:decoration-volt"
          >
            Close the player
          </button>
        )}
      </div>

      {open ? (
        <div className="mt-3">
          <VideoEmbed spec={open} />
          <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-muted">{open.idea}</p>
        </div>
      ) : (
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((video, index) => (
            <li key={video.slug}>
              <Thumbnail video={video} index={index + 1} onOpen={() => setOpenSlug(video.slug)} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[0.76rem] leading-relaxed text-ink-muted">
        Everything in {videos.length === 1 ? 'it' : 'them'} is written out on this page too —
        the text version is the one you can search, quote and skim.
      </p>
    </aside>
  );
}

/**
 * One small still.
 *
 * The image is a plain `<img>` rather than a background so it can be lazy, and
 * the whole card is the button: a 16:9 still at this size is a small target,
 * and the title beneath it is part of what a reader is aiming at.
 */
function Thumbnail({
  video,
  index,
  onOpen,
}: {
  video: Video;
  index: number;
  onOpen: () => void;
}) {
  const [still, setStill] = useState(
    video.poster ?? `https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`,
  );

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full text-left"
      aria-label={`Play video ${index}: ${video.title}`}
    >
      <span className="relative block aspect-video w-full overflow-hidden rounded border border-hairline bg-surface-2">
        <img
          src={still}
          alt=""
          loading="lazy"
          onError={() =>
            setStill(`https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`)
          }
          className="absolute inset-0 size-full object-cover opacity-70 transition-opacity group-hover:opacity-100"
        />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-8 place-items-center rounded-full border border-volt/50 bg-surface-0/85 backdrop-blur-sm transition-colors group-hover:bg-volt">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 size-4 fill-volt group-hover:fill-surface-0">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
        {video.seconds ? (
          <span className="tnum absolute bottom-1 right-1 rounded bg-surface-0/85 px-1.5 py-0.5 text-[0.65rem] text-ink-secondary">
            {runtime(video.seconds)}
          </span>
        ) : null}
      </span>
      <span className="mt-1.5 block text-[0.76rem] leading-snug text-ink-secondary group-hover:text-ink-primary">
        {video.title}
      </span>
    </button>
  );
}
