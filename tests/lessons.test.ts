import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COURSES } from '../src/content/courses';

/**
 * The lesson files. The build validates each one against its schema; these
 * check what a schema cannot see on its own: how the files sit together.
 */
interface LessonFile {
  title: string;
  course: string;
  order: number;
  seconds: number;
  poster: string;
  series: { name: string; number: number };
  youtube: { id: string; status: string; published?: string };
  chapters: { at: number; label: string }[];
  transcript: { at: number; text: string }[];
  also?: { course: string; order: number }[];
}

const ROOT = join(__dirname, '..', 'src', 'content', 'lessons');
const lessons: (LessonFile & { id: string })[] = readdirSync(ROOT).flatMap((course) =>
  readdirSync(join(ROOT, course)).map((file) => ({
    id: `${course}/${file.replace(/\.json$/, '')}`,
    ...(JSON.parse(readFileSync(join(ROOT, course, file), 'utf8')) as LessonFile),
  })),
);

describe('the lesson files', () => {
  it('are the 23 videos of the two series', () => {
    expect(lessons).toHaveLength(23);
    expect(lessons.filter((l) => l.series.name === 'data.un.org')).toHaveLength(12);
    expect(lessons.filter((l) => l.series.name === 'undata')).toHaveLength(11);
  });

  it('sit in the folder of the course they name', () => {
    for (const lesson of lessons) expect(lesson.id.startsWith(`${lesson.course}/`), lesson.id).toBe(true);
  });

  it('number each course 1, 2, 3 … with no gaps, cross-listings included', () => {
    for (const course of COURSES) {
      const positions = lessons
        .flatMap((l) => [
          ...(l.course === course.slug ? [l.order] : []),
          ...(l.also ?? []).filter((a) => a.course === course.slug).map((a) => a.order),
        ])
        .sort((a, b) => a - b);
      expect(positions, course.slug).toEqual(positions.map((_, i) => i + 1));
      expect(positions.length, course.slug).toBeGreaterThan(0);
    }
  });

  it('each have a poster on disk', () => {
    for (const lesson of lessons) {
      expect(existsSync(join(__dirname, '..', 'src', 'assets', 'posters', lesson.poster)), lesson.poster).toBe(true);
    }
  });

  it('run their chapters and transcript in time order, from the start', () => {
    for (const lesson of lessons) {
      expect(lesson.chapters[0]?.at, lesson.id).toBe(0);
      for (const list of [lesson.chapters, lesson.transcript]) {
        const times = list.map((entry) => entry.at);
        expect(times, lesson.id).toEqual([...new Set(times)].sort((a, b) => a - b));
      }
    }
  });

  it('say nothing after the video ends', () => {
    for (const lesson of lessons) {
      for (const line of [...lesson.chapters, ...lesson.transcript]) expect(line.at, lesson.id).toBeLessThan(lesson.seconds);
    }
  });

  it('give every public video its upload date, for search engines', () => {
    for (const lesson of lessons.filter((l) => l.youtube.status === 'public')) {
      expect(lesson.youtube.published, lesson.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('carry no YouTube id for a video that was never uploaded', () => {
    for (const lesson of lessons.filter((l) => l.youtube.status === 'not-uploaded')) {
      expect(lesson.youtube.id, lesson.id).toBe('');
    }
  });
});
