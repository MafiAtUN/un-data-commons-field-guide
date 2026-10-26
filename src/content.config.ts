import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * One lesson per file: src/content/lessons/<course>/<slug>.json.
 *
 * Each file describes one video and everything around it on its page. The
 * video pipelines know every chapter time and every spoken word, so those are
 * exported, never typed. The schema is strict on purpose: a lesson with no
 * transcript, a chapter that does not start at 0:00, or a public video with no
 * YouTube id fails the build instead of reaching a reader.
 */
const COURSES = ['find', 'analyse', 'present', 'automate'] as const;

const moment = z.object({ at: z.number().min(0) });

const tryIt = z.discriminatedUnion('kind', [
  /** A question to put into data.un.org's search box. */
  z.object({ kind: z.literal('query'), value: z.string().min(1) }),
  /** Code or a command to copy. */
  z.object({ kind: z.literal('code'), value: z.string().min(1), note: z.string().optional() }),
  /** A notebook that runs in Google Colab. */
  z.object({ kind: z.literal('colab'), href: z.url(), label: z.string().min(1) }),
  /** A page to open. */
  z.object({ kind: z.literal('link'), href: z.url(), label: z.string().min(1) }),
]);

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/lessons' }),
  schema: z
    .object({
      title: z.string().min(1),
      /** One line: the single idea the video lands. */
      idea: z.string().min(1).max(90),
      /** Two or three sentences, for the page description and search engines. */
      summary: z.string().min(1),
      course: z.enum(COURSES),
      order: z.number().int().min(1),
      /** Where it sits in the YouTube series it was made for. */
      series: z.object({ name: z.enum(['data.un.org', 'undata']), number: z.number().int().min(1) }),
      youtube: z.object({
        id: z.string(),
        status: z.enum(['public', 'private', 'not-uploaded']),
        /** Upload date, from YouTube, for search engines. */
        published: z.iso.date().optional(),
      }),
      seconds: z.number().int().positive(),
      /** When the data on screen was captured from the live platform. */
      recorded: z.iso.date(),
      captions: z.enum(['burned-in', 'track']),
      /** File name in src/assets/posters/. */
      poster: z.string().regex(/^[\w-]+\.jpg$/),
      chapters: z.array(moment.extend({ label: z.string().min(1) })).min(2),
      transcript: z.array(moment.extend({ text: z.string().min(1) })).min(1),
      tryIt: z.array(tryIt),
      /** The one line to remember. */
      keep: z.string().optional(),
      tools: z.array(z.enum(['browser', 'python', 'excel', 'flourish', 'powerpoint', 'ai', 'r', 'api'])).min(1),
      deeper: z.array(z.object({ href: z.string().min(1), label: z.string().min(1) })).default([]),
      /** Listed in a second course as well, at this position. */
      also: z.array(z.object({ course: z.enum(COURSES), order: z.number().int().min(1) })).default([]),
    })
    .superRefine((lesson, ctx) => {
      if (lesson.chapters[0]?.at !== 0) {
        ctx.addIssue({ code: 'custom', message: 'The first chapter must start at 0:00.' });
      }
      const times = lesson.chapters.map((c) => c.at);
      if (times.some((t, i) => i > 0 && t <= times[i - 1]!)) {
        ctx.addIssue({ code: 'custom', message: 'Chapters must be in time order.' });
      }
      if (times.some((t) => t >= lesson.seconds)) {
        ctx.addIssue({ code: 'custom', message: 'A chapter starts after the video ends.' });
      }
      if (lesson.youtube.status !== 'not-uploaded' && !/^[\w-]{11}$/.test(lesson.youtube.id)) {
        ctx.addIssue({ code: 'custom', message: 'An uploaded video needs its 11-character YouTube id.' });
      }
    }),
});

export const collections = { lessons };
