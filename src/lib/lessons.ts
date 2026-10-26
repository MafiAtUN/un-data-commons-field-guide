import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { COURSES, type CourseSlug } from '../content/courses';
import { url } from './paths';

export type Lesson = CollectionEntry<'lessons'>;

/** The URL segment: find/your-first-number → your-first-number. */
export function slugOf(lesson: Lesson): string {
  return lesson.id.split('/').pop()!;
}

/** A lesson's one canonical address, in its home course. */
export function lessonHref(lesson: Lesson): string {
  return url(`/courses/${lesson.data.course}/${slugOf(lesson)}/`);
}

/** Its position in a course: its own, or the one it is cross-listed at. */
export function positionIn(lesson: Lesson, course: CourseSlug): number {
  if (lesson.data.course === course) return lesson.data.order;
  const also = lesson.data.also.find((entry) => entry.course === course);
  if (!also) throw new Error(`${lesson.id} is not in ${course}`);
  return also.order;
}

function courseIndex(slug: CourseSlug): number {
  return COURSES.findIndex((c) => c.slug === slug);
}

/** Every lesson, in course order and then lesson order. */
export async function allLessons(): Promise<Lesson[]> {
  const lessons = await getCollection('lessons');
  return lessons.sort(
    (a, b) =>
      courseIndex(a.data.course) - courseIndex(b.data.course) || a.data.order - b.data.order,
  );
}

/** The lessons of one course, cross-listed ones included, in course order. */
export async function courseLessons(course: CourseSlug): Promise<Lesson[]> {
  const lessons = await getCollection('lessons');
  return lessons
    .filter((l) => l.data.course === course || l.data.also.some((a) => a.course === course))
    .sort((a, b) => positionIn(a, course) - positionIn(b, course));
}

export function isPlayable(lesson: Lesson): boolean {
  return lesson.data.youtube.status === 'public';
}

/** 80 → "1:20", the unit people judge a video in. */
export function runtime(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** ISO 8601 duration for structured data: 80 → "PT1M20S". */
export function isoDuration(seconds: number): string {
  const s = Math.round(seconds);
  return `PT${Math.floor(s / 60)}M${s % 60}S`;
}

export function totalMinutes(lessons: readonly Lesson[]): number {
  return Math.round(lessons.reduce((sum, l) => sum + l.data.seconds, 0) / 60);
}

const posters = import.meta.glob<{ default: ImageMetadata }>('../assets/posters/*.jpg', {
  eager: true,
});

export function posterOf(lesson: Lesson): ImageMetadata {
  const found = posters[`../assets/posters/${lesson.data.poster}`];
  if (!found) throw new Error(`No poster ${lesson.data.poster} for ${lesson.id}`);
  return found.default;
}
