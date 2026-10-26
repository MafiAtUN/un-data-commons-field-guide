/**
 * The lessons as plain data, for React components on the guide pages.
 *
 * Astro pages read lessons through the content collection, which validates
 * them. The guide pages are React and also run in the test suite, so they read
 * the same files directly.
 */
import type { CourseSlug } from './courses';

export interface LessonLink {
  id: string;
  title: string;
  idea: string;
  course: CourseSlug;
  order: number;
  seconds: number;
  playable: boolean;
  /** Site path without the base, for the url() helper. */
  path: string;
}

/*
 * One glob per field: JSON modules export their top-level keys by name, so the
 * bundler keeps only these and drops the transcripts, which a guide page never
 * needs.
 */
const titles = import.meta.glob<string>('./lessons/*/*.json', { eager: true, import: 'title' });
const ideas = import.meta.glob<string>('./lessons/*/*.json', { eager: true, import: 'idea' });
const courses = import.meta.glob<CourseSlug>('./lessons/*/*.json', { eager: true, import: 'course' });
const orders = import.meta.glob<number>('./lessons/*/*.json', { eager: true, import: 'order' });
const durations = import.meta.glob<number>('./lessons/*/*.json', { eager: true, import: 'seconds' });
const youtube = import.meta.glob<{ status: string }>('./lessons/*/*.json', { eager: true, import: 'youtube' });

export const LESSON_LINKS: readonly LessonLink[] = Object.keys(titles).map((file) => {
  const [, course, slug] = file.match(/\.\/lessons\/([^/]+)\/([^/]+)\.json$/) ?? [];
  return {
    id: `${course}/${slug}`,
    title: titles[file]!,
    idea: ideas[file]!,
    course: courses[file]!,
    order: orders[file]!,
    seconds: durations[file]!,
    playable: youtube[file]?.status === 'public',
    path: `/courses/${course}/${slug}/`,
  };
});

export function lessonLink(id: string): LessonLink {
  const found = LESSON_LINKS.find((lesson) => lesson.id === id);
  if (!found) throw new Error(`Unknown lesson: ${id}`);
  return found;
}
