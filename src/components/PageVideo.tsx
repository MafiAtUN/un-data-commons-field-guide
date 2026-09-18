import { VideoEmbed } from './VideoEmbed';
import { videosForPage } from '../content/videos';

/** "4:46" for a group, so the heading can be honest about the commitment. */
function totalRuntime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
}

/**
 * The videos belonging to a page, or nothing at all.
 *
 * Placement lives in `content/videos.ts` rather than in twelve routes, so a
 * video appears the moment its id is pasted in and no page has to be edited to
 * receive one. A page whose videos are not yet uploaded renders nothing — not a
 * gap, not a placeholder, not a broken player.
 *
 * Several videos can belong to one page, and they stack. That costs nothing
 * until one is clicked: each is a still image and a button until then.
 */
export function PageVideo({ page }: { page: string }) {
  const videos = videosForPage(page);
  if (videos.length === 0) return null;

  const seconds = videos.reduce((total, video) => total + (video.seconds ?? 0), 0);

  return (
    <div className="my-8">
      <p className="mb-2.5 flex flex-wrap items-baseline gap-x-2 text-[0.7rem] font-semibold uppercase tracking-wide text-volt">
        Watch it instead
        <span className="tnum font-normal normal-case tracking-normal text-ink-muted">
          {videos.length === 1 ? totalRuntime(seconds) : `${videos.length} videos · ${totalRuntime(seconds)}`}
        </span>
      </p>

      <div className="space-y-3">
        {videos.map((video) => (
          <div key={video.slug}>
            <VideoEmbed spec={video} />
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink-muted">{video.idea}</p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-muted">
        The page below says the same things in text, and is the version you can search.
      </p>
    </div>
  );
}
