import { useState } from 'react';

export interface VideoSpec {
  /** The 11-character YouTube id, from the share link after `?v=`. */
  id: string;
  /** Spoken aloud by screen readers, and shown under the poster. */
  title: string;
  /** Runtime, so nobody presses play not knowing what they are committing to. */
  minutes?: number;
  /**
   * A poster served from this site. Supplying one means the page touches no
   * Google domain at all before a click; without it the still comes from
   * `i.ytimg.com`, which is cookieless but is still Google.
   */
  poster?: string;
}

/** YouTube only guarantees `hqdefault`; `maxresdefault` exists for HD uploads. */
function posterUrl(id: string, size: 'maxresdefault' | 'hqdefault'): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/${size}.jpg`;
}

function watchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
}

/**
 * A YouTube video that is not a YouTube embed until someone asks for one.
 *
 * A stock `<iframe>` pulls well over a megabyte of third-party script and sets
 * cookies on render — before anyone has decided to watch. This site promises
 * the opposite, and `tests/video.test.tsx` holds it to the promise: at rest
 * this is a poster, a title and a button, and the first frame a crawler or a
 * reader on a slow connection gets contains no player at all.
 *
 * The click swaps in the real player, pointed at `youtube-nocookie.com` and
 * already playing, so the cost of the trade is one extra press.
 */
export function VideoEmbed({ spec }: { spec: VideoSpec }) {
  const [playing, setPlaying] = useState(false);
  const [still, setStill] = useState(spec.poster ?? posterUrl(spec.id, 'maxresdefault'));

  return (
    <figure className="overflow-hidden rounded-lg border border-hairline bg-surface-0">
      {/* Fixed ratio in both states, so pressing play never reflows the page. */}
      <div className="relative aspect-video w-full bg-surface-2">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(spec.id)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={spec.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play: ${spec.title}`}
            className="group absolute inset-0 size-full cursor-pointer"
          >
            <img
              src={still}
              alt=""
              loading="lazy"
              // The still is decorative: the button already carries the title.
              onError={() => setStill(posterUrl(spec.id, 'hqdefault'))}
              className="absolute inset-0 size-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-14 place-items-center rounded-full border border-volt/50 bg-surface-0/85 backdrop-blur-sm transition-colors group-hover:bg-volt group-hover:text-surface-0">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 size-6 fill-volt group-hover:fill-surface-0">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>

      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5 text-[0.76rem]">
        <span className="text-ink-secondary">
          {spec.title}
          {spec.minutes ? <span className="tnum text-ink-muted"> · {spec.minutes} min</span> : null}
        </span>
        <a
          href={watchUrl(spec.id)}
          target="_blank"
          rel="noreferrer noopener"
          className="text-ink-muted underline decoration-hairline underline-offset-2 hover:text-volt hover:decoration-volt"
        >
          Watch on YouTube ↗
        </a>
      </figcaption>
    </figure>
  );
}
