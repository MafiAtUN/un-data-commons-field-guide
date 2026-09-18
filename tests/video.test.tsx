import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tutorial, type TutorialSpec } from '../src/components/Tutorial';
import { VideoEmbed } from '../src/components/VideoEmbed';
import { TUTORIALS } from '../src/content/tutorials';
import { VIDEOS, publishedVideos, seriesMinutes, videosForPage } from '../src/content/videos';
import { PageVideo } from '../src/components/PageVideo';
import { DESTINATIONS } from '../src/content/navigation';

const SPEC: TutorialSpec = {
  id: 'example',
  title: 'An example walkthrough',
  forWhom: 'Anyone.',
  minutes: 3,
  outcome: 'A figure and its source.',
  steps: [{ do: 'Open the platform search.', see: 'A page of charts.' }],
  lesson: 'A number needs a year.',
  video: { id: 'aaaaaaaaaaa', title: 'Finding one number', seconds: 80 },
};

/**
 * Rendered markup escapes `&` and `"`, so the title of video 04 — which carries
 * quotation marks by design, because "Latest" is a label and not a year — is
 * not found literally in the HTML.
 */
function asRendered(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Effects do not run in a server render, so this is the resting frame: what a
 * crawler, a screen reader and a reader on a slow connection are handed before
 * anyone has decided to watch anything.
 */
function atRest(node: React.ReactNode): string {
  return renderToStaticMarkup(node);
}

describe('a video costs nothing until it is asked for', () => {
  const html = atRest(<VideoEmbed spec={SPEC.video!} />);

  it('mounts no player before the click', () => {
    // The whole reason this component exists. A stock embed would ship well
    // over a megabyte of third-party script and set cookies on render.
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('youtube-nocookie.com/embed');
  });

  it('offers a still and a labelled control instead', () => {
    expect(html).toContain('i.ytimg.com/vi/aaaaaaaaaaa/');
    expect(html).toContain('aria-label="Play: Finding one number"');
    expect(html).toContain('<button');
  });

  it('still says what the video is, and where it lives, without JavaScript', () => {
    expect(html).toContain('Finding one number');
    expect(html).toContain('youtube.com/watch?v=aaaaaaaaaaa');
  });

  it('reserves the space the player will occupy, so pressing play cannot reflow the page', () => {
    expect(html).toContain('aspect-video');
  });
});

describe('when it does load, it loads the private-mode player', () => {
  const source = readFileSync(new URL('../src/components/VideoEmbed.tsx', import.meta.url), 'utf8');

  it('never points at the cookie-setting domain', () => {
    expect(source).toContain('youtube-nocookie.com/embed');
    expect(source).not.toMatch(/www\.youtube\.com\/embed/);
  });

  it('warms no connection to Google on hover, which would leak intent early', () => {
    expect(source).not.toContain('preconnect');
  });
});

describe('walkthroughs with a recording', () => {
  it('renders the video above the steps, and only once opened', () => {
    const closed = atRest(<Tutorial spec={SPEC} />);
    expect(closed).not.toContain('i.ytimg.com');

    const open = atRest(<Tutorial spec={SPEC} defaultOpen />);
    expect(open).toContain('i.ytimg.com');
    expect(open.indexOf('i.ytimg.com')).toBeLessThan(open.indexOf('Open the platform search'));
  });

  it('works just as well without one', () => {
    const silent: TutorialSpec = { ...SPEC, video: undefined };
    const html = atRest(<Tutorial spec={silent} defaultOpen />);
    expect(html).toContain('Open the platform search');
    expect(html).not.toContain('ytimg');
  });

  it('carries a real YouTube id wherever one has been filled in', () => {
    // Guards the commonest paste error: the whole share URL, or a Shorts id.
    for (const spec of TUTORIALS.filter((t) => t.video)) {
      expect(spec.video!.id, spec.title).toMatch(/^[\w-]{11}$/);
      expect(spec.video!.title.length, spec.title).toBeGreaterThan(5);
    }
  });
});

/**
 * The series manifest is filled in by hand as videos are uploaded, one id at a
 * time, so these guard the half-filled states rather than only the finished one.
 */
describe('the tutorial series', () => {
  it('lists all twelve, uploaded or not', () => {
    expect(VIDEOS.length).toBe(12);
    expect(new Set(VIDEOS.map((v) => v.slug)).size).toBe(12);
  });

  it('carries the real runtime of every one, so no page has to estimate', () => {
    for (const video of VIDEOS) {
      expect(video.seconds, video.slug).toBeGreaterThan(30);
      expect(video.seconds, video.slug).toBeLessThan(120);
      expect(video.idea.length, video.slug).toBeGreaterThan(20);
    }
  });

  it('only ever renders a video that has an id', () => {
    // The empty string is the "recorded but not uploaded yet" state. It must
    // never reach a player, or the page ships an embed pointing at nothing.
    for (const video of publishedVideos()) {
      expect(video.id, video.slug).toMatch(/^[\w-]{11}$/);
    }
    expect(publishedVideos().length).toBe(VIDEOS.filter((v) => v.id !== '').length);
  });

  it('points every video at a page that exists', () => {
    const routes = new Set(DESTINATIONS.map((d) => d.to));
    for (const video of VIDEOS.filter((v) => v.page)) {
      expect(routes.has(video.page!), `${video.slug} → ${video.page}`).toBe(true);
    }
  });

  it('hands a page every one of its videos, not just the first', () => {
    // Four of the twelve belong to /start. An earlier single-video lookup
    // returned 01 and silently dropped 02, 03 and 04.
    for (const page of new Set(VIDEOS.map((v) => v.page).filter(Boolean))) {
      const expected = VIDEOS.filter((v) => v.page === page && v.id !== '');
      expect(videosForPage(page!).length, page).toBe(expected.length);
    }
  });
});

describe('a page offers its video only once that video exists', () => {
  it('renders nothing for a page whose video has not been uploaded', () => {
    // Every route not in the manifest is permanently in this state, so the
    // empty render is the common case, not the edge case.
    expect(atRest(<PageVideo page="/nowhere" />)).toBe('');
  });

  it('renders resting stills, not a player, for one that has', () => {
    const uploaded = publishedVideos()[0];
    if (!uploaded?.page) return;

    const html = atRest(<PageVideo page={uploaded.page} />);
    expect(html).toContain('Prefer to watch?');
    expect(html).not.toContain('<iframe');
    // Every video on that page, not merely the first one.
    for (const video of videosForPage(uploaded.page)) {
      expect(html, video.slug).toContain(asRendered(video.title));
    }
  });

  it('offers the videos as a strip rather than as the page', () => {
    // The version this replaces stacked a full-width 16:9 player per video, so
    // /start opened with roughly three thousand pixels of video above its first
    // sentence. Video is an alternative to the page, not a toll gate in front
    // of it — at rest each entry is one small still in a grid.
    const uploaded = publishedVideos().find((v) => v.page === '/start');
    if (!uploaded) return;

    const html = atRest(<PageVideo page="/start" />);
    expect(html).toContain('grid');
    expect(html).toContain('aspect-video');
    // The commitment is stated before anyone presses anything.
    expect(html).toMatch(/\d short videos · \d+:\d\d in total/);
    // And the text remains the canonical version.
    expect(html).toContain('written out on this page too');
  });

  it('states the runtime of every still, so no click is a surprise', () => {
    const html = atRest(<PageVideo page="/start" />);
    for (const video of videosForPage('/start')) {
      if (!video.seconds) continue;
      const mmss = `${Math.floor(video.seconds / 60)}:${String(Math.round(video.seconds % 60)).padStart(2, '0')}`;
      expect(html, video.slug).toContain(mmss);
    }
  });
});

describe('the posters ship with the site', () => {
  it('never points two entries at the same upload', () => {
    // Twelve ids are pasted in by hand from twelve browser tabs. Pasting the
    // same one twice is the likeliest way this file goes wrong, and the page
    // would look entirely correct while doing it.
    const ids = publishedVideos().map((video) => video.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tells the contents dialog the truth about how long the series runs', () => {
    const entry = DESTINATIONS.find((d) => d.to === '/watch');
    expect(entry?.time).toBe(`${seriesMinutes()} min`);
  });

  it('has a local still for every video, uploaded or not', () => {
    // Without the file the img falls back to i.ytimg.com, which would contact
    // Google before any click — the exact thing local posters exist to prevent.
    for (const video of VIDEOS) {
      const file = new URL(`../public/posters/${video.slug}.jpg`, import.meta.url);
      expect(existsSync(file), `public/posters/${video.slug}.jpg`).toBe(true);
    }
  });
});
