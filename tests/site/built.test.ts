import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Checks on the built site, run after `npm run build`.
 *
 * These are the promises a reader can see: every page previews properly when
 * shared, nothing is fetched from YouTube or Google before someone presses
 * play, every old address still lands somewhere, and no internal link is
 * broken. They read the HTML in dist/ as plain text; there is no browser.
 */
const DIST = join(__dirname, '..', '..', 'dist');
const LESSON_FILES = join(__dirname, '..', '..', 'src', 'content', 'lessons');
const BASE = '/un-data-commons-field-guide/';
const SITE = 'https://mafiatun.github.io';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

if (!existsSync(DIST)) throw new Error('Run `npm run build` before the site tests.');

const html = walk(DIST)
  .filter((f) => f.endsWith('.html'))
  .map((file) => ({ file: relative(DIST, file), text: readFileSync(file, 'utf8') }));

const forwarding = html.filter((p) => p.text.includes('<meta name="robots" content="noindex"') && p.text.includes('location.replace('));
const pages = html.filter((p) => !forwarding.includes(p) && !p.file.startsWith('404') && !p.file.startsWith('pagefind'));
const lessons = pages.filter((p) => /^courses\/[^/]+\/[^/]+\/index\.html$/.test(p.file));

function attr(text: string, pattern: RegExp): string | undefined {
  return text.match(pattern)?.[1];
}

/** A lesson page with a play button: its video is public. */
const PLAY = /\sdata-play[\s>]/;

describe('every page', () => {
  it('has its own title and description', () => {
    const titles = new Map<string, string>();
    for (const page of pages) {
      const title = attr(page.text, /<title>([^<]+)<\/title>/);
      const description = attr(page.text, /<meta name="description" content="([^"]+)"/);
      expect(title, page.file).toBeTruthy();
      expect(description?.length ?? 0, page.file).toBeGreaterThan(40);
      expect(titles.get(title!), `${page.file} shares its title with ${titles.get(title!)}`).toBeUndefined();
      titles.set(title!, page.file);
    }
  });

  it('names its canonical address and a preview image', () => {
    for (const page of pages) {
      const canonical = attr(page.text, /<link rel="canonical" href="([^"]+)"/);
      expect(canonical, page.file).toBe(`${SITE}${BASE}${page.file.replace(/index\.html$/, '')}`);
      expect(attr(page.text, /<meta property="og:image" content="([^"]+)"/), page.file).toMatch(/^https:\/\/.+\.jpg$/);
    }
  });

  it('loads nothing from YouTube or Google before anyone presses play', () => {
    for (const page of html) {
      expect(page.text, page.file).not.toMatch(/<iframe/i);
      expect(page.text, page.file).not.toMatch(/<(script|img|link|source)[^>]+(youtube(-nocookie)?|ytimg|googleapis|gstatic)\./i);
      expect(page.text, page.file).not.toMatch(/rel="preconnect"/);
    }
  });
});

describe('every lesson page', () => {
  it('exists for all 23 lessons', () => {
    expect(lessons).toHaveLength(23);
  });

  it('carries its whole transcript as text', () => {
    for (const page of lessons) {
      expect(page.text, page.file).toContain('data-transcript');
      expect((page.text.match(/data-at="/g) ?? []).length, page.file).toBeGreaterThan(4);
    }
  });

  it('describes a public video for search engines, with its chapters, and only a public one', () => {
    for (const page of lessons) {
      const playable = PLAY.test(page.text);
      const blocks = [...page.text.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]!) as unknown);
      const video = blocks.flat().find((b) => (b as { '@type'?: string })['@type'] === 'VideoObject') as
        | { duration: string; uploadDate: string; hasPart: { startOffset: number }[]; thumbnailUrl: string[] }
        | undefined;
      if (playable) {
        expect(video, page.file).toBeDefined();
        expect(video!.duration, page.file).toMatch(/^PT\d+M\d+S$/);
        expect(video!.uploadDate, page.file).toMatch(/^\d{4}-\d{2}-\d{2}T12:00:00\+00:00$/);
        expect(video!.hasPart[0]!.startOffset, page.file).toBe(0);
        expect(video!.thumbnailUrl[0], page.file).toMatch(/^https:\/\//);
      } else {
        expect(video, page.file).toBeUndefined();
        expect(page.text, page.file).toContain('Coming soon');
      }
    }
  });

  it('offers play exactly where the lesson file says the video is public', () => {
    const expected = readdirSync(LESSON_FILES).flatMap((course) =>
      readdirSync(join(LESSON_FILES, course))
        .filter((file) => {
          const lesson = JSON.parse(readFileSync(join(LESSON_FILES, course, file), 'utf8')) as { youtube: { status: string } };
          return lesson.youtube.status === 'public';
        })
        .map((file) => `courses/${course}/${file.replace(/\.json$/, '')}/index.html`),
    );
    const playable = lessons.filter((page) => PLAY.test(page.text)).map((page) => page.file);
    expect(playable.sort()).toEqual(expected.sort());
  });
});

describe('every old address', () => {
  const OLD = [
    'start', 'tutorials', 'watch', 'toolkit', 'cite', 'lab', 'visualise', 'ai', 'catalogue',
    'cookbook', 'notebooks', 'dashboards', 'connect', 'peace-and-security', 'development', 'scenarios',
  ];

  it('forwards to a page that was built, keeping any #section', () => {
    for (const old of OLD) {
      const page = html.find((p) => p.file === `${old}/index.html`);
      expect(page, old).toBeDefined();
      const target = attr(page!.text, /<link rel="canonical" href="([^"]+)"/)!;
      expect(target, old).toMatch(new RegExp(`^${SITE}${BASE}`));
      const path = target.slice(`${SITE}${BASE}`.length);
      expect(existsSync(join(DIST, path, 'index.html')), `${old} -> ${path}`).toBe(true);
      expect(page!.text, old).toContain('location.hash');
    }
  });
});

describe('internal links', () => {
  it('all lead to a file that exists', () => {
    const broken: string[] = [];
    for (const page of html) {
      for (const match of page.text.matchAll(/(?:href|src)="(\/un-data-commons-field-guide\/[^"#?]*)/g)) {
        const path = decodeURIComponent(match[1]!.slice(BASE.length));
        const file = path === '' || path.endsWith('/') ? join(DIST, path, 'index.html') : join(DIST, path);
        if (!existsSync(file)) broken.push(`${page.file} -> ${match[1]}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('all carry the base path, so none lands on the root of github.io', () => {
    const rootless: string[] = [];
    for (const page of html) {
      for (const match of page.text.matchAll(/(?:href|src)="(\/(?!\/|un-data-commons-field-guide\/)[^"]*)"/g)) {
        rootless.push(`${page.file} -> ${match[1]}`);
      }
    }
    expect(rootless).toEqual([]);
  });
});
