/**
 * Progress through the lessons, kept in this browser and nowhere else.
 *
 * One small record per lesson: how far in you got, whether you finished, and
 * when. Pages mark the places that show progress with data attributes, and
 * `paint()` fills them in, so the markup is complete without any of this and a
 * first-time visitor sees exactly what a crawler sees.
 */
import { announce } from './announce';

const KEY = 'fg-progress-v1';

export interface Entry {
  /** Seconds reached. */
  t: number;
  done: boolean;
  /** Last update, ms since the epoch. */
  at: number;
}

export type Store = Record<string, Entry>;

export function read(): Store {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}') as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Storage is blocked (a private window, or site data turned off). Progress
    // simply is not remembered; nothing else depends on it.
  }
}

export function update(id: string, patch: Partial<Omit<Entry, 'at'>>): void {
  const store = read();
  const previous = store[id] ?? { t: 0, done: false, at: 0 };
  store[id] = { ...previous, ...patch, at: Date.now() };
  write(store);
  paint();
}

export function clear(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
  paint();
  document.dispatchEvent(new CustomEvent('fg:cleared'));
  announce('Your progress is cleared.');
}

function started(entry: Entry | undefined): boolean {
  return Boolean(entry && (entry.done || entry.t > 5));
}

/** Reflect the stored progress anywhere the page asks for it. */
export function paint(root: ParentNode = document): void {
  const store = read();

  root.querySelectorAll<HTMLElement>('[data-lesson-id]').forEach((el) => {
    const entry = store[el.dataset.lessonId ?? ''];
    const seconds = Number(el.dataset.seconds) || 0;
    const state = entry?.done ? 'done' : started(entry) ? 'started' : 'new';
    el.dataset.progress = state;
    const share = entry?.done ? 1 : seconds ? Math.min(1, (entry?.t ?? 0) / seconds) : 0;
    el.querySelectorAll<HTMLElement>('[data-progress-bar]').forEach((bar) => {
      bar.style.width = `${Math.round(share * 100)}%`;
    });
    // What the check mark and the bar show, for anyone who cannot see them.
    el.querySelectorAll<HTMLElement>('[data-progress-label]').forEach((label) => {
      label.textContent = state === 'done' ? ' (watched)' : state === 'started' ? ` (${Math.round(share * 100)}% watched)` : '';
    });
  });

  root.querySelectorAll<HTMLElement>('[data-course-ids]').forEach((el) => {
    const ids = (el.dataset.courseIds ?? '').split(',').filter(Boolean);
    const hrefs = (el.dataset.courseHrefs ?? '').split(',');
    const done = ids.filter((id) => store[id]?.done).length;
    const any = ids.some((id) => started(store[id]));
    el.dataset.progress = ids.length && done === ids.length ? 'done' : any ? 'started' : 'new';
    el.querySelectorAll<HTMLElement>('[data-course-bar]').forEach((bar) => {
      bar.style.width = `${ids.length ? Math.round((done / ids.length) * 100) : 0}%`;
    });
    el.querySelectorAll<HTMLElement>('[data-course-count]').forEach((count) => {
      count.textContent = any ? `${done} of ${ids.length} done` : (count.dataset.empty ?? '');
    });
    const nextIndex = ids.findIndex((id) => !store[id]?.done);
    el.querySelectorAll<HTMLAnchorElement>('[data-course-next]').forEach((link) => {
      link.dataset.startHref ??= link.getAttribute('href') ?? '';
      const label = link.querySelector<HTMLElement>('[data-course-next-label]');
      if (label) label.dataset.startLabel ??= label.textContent ?? '';
      if (!any) {
        link.href = link.dataset.startHref;
        if (label) label.textContent = label.dataset.startLabel ?? '';
        return;
      }
      const index = nextIndex === -1 ? 0 : nextIndex;
      if (hrefs[index]) link.href = hrefs[index]!;
      if (label) label.textContent = nextIndex === -1 ? 'Watch again' : 'Continue';
    });
  });
}

export interface LessonMeta {
  title: string;
  href: string;
  seconds: number;
  where: string;
  poster: string;
}

/** The lesson someone was last part-way through, if any. */
export function lastUnfinished(meta: Record<string, LessonMeta>): { id: string; entry: Entry } | null {
  const store = read();
  const candidates = Object.entries(store)
    .filter(([id, entry]) => meta[id] && !entry.done && entry.t > 5 && entry.t < meta[id]!.seconds - 5)
    .sort(([, a], [, b]) => b.at - a.at);
  const first = candidates[0];
  return first ? { id: first[0], entry: first[1] } : null;
}
