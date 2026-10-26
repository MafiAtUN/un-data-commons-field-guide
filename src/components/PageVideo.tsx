import { lessonLink, type LessonLink } from '../content/lesson-index';
import { url } from '../lib/paths';

/**
 * "Watch first": the lessons that cover what a guide page explains.
 *
 * The page is the reference; the lesson is the two-minute version of it. This
 * is an offer, not a gate: a short list of links to the lesson pages, where
 * the player, chapters and transcript live. Nothing loads from YouTube here.
 */
const BY_PAGE: Readonly<Record<string, readonly string[]>> = {
  '/start': ['find/the-chip-that-decides', 'find/latest-is-not-a-year', 'find/two-agencies-two-numbers'],
  '/cite': ['find/two-agencies-two-numbers', 'find/cite-the-agency'],
  '/toolkit': ['find/download-and-metadata', 'find/share-the-query'],
  '/catalogue': ['find/browse-by-theme', 'find/your-country-sdg-page'],
  '/cookbook': ['automate/rest-api'],
  '/connect': ['automate/ai-assistant-mcp'],
};

const COUNT = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

function runtime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
}

function lessonsForPage(page: string): LessonLink[] {
  return (BY_PAGE[page] ?? []).map(lessonLink);
}

export function PageVideo({ page }: { page: string }) {
  const lessons = lessonsForPage(page);
  if (lessons.length === 0) return null;
  const seconds = lessons.reduce((total, lesson) => total + lesson.seconds, 0);

  return (
    <aside className="my-10 rounded-2xl border border-hairline bg-surface-1 p-4 sm:p-5" aria-label="Watch first">
      <p className="text-[0.95rem] font-semibold text-ink-primary">
        Watch first
        <span className="ml-2 font-normal text-ink-muted">
          {lessons.length === 1 ? 'one short lesson' : `${COUNT[lessons.length] ?? lessons.length} short lessons`} · {runtime(seconds)}
        </span>
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <a
              href={url(lesson.path)}
              className="group flex items-center gap-3 rounded-xl border border-hairline bg-surface-0 p-3 transition-colors hover:border-hairline-strong"
            >
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-volt text-on-volt">
                <svg viewBox="0 0 24 24" className="ml-0.5 size-4 fill-current"><path d="M8 5v14l11-7z" /></svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[0.92rem] font-semibold leading-snug text-ink-primary group-hover:underline group-hover:decoration-volt-line group-hover:underline-offset-4">
                  {lesson.title}
                </span>
                <span className="block text-[0.8rem] text-ink-muted">
                  {runtime(lesson.seconds)} · {lesson.playable ? lesson.idea : 'video coming soon, transcript ready'}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
