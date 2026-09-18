import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tutorial, type TutorialSpec } from '../src/components/Tutorial';
import { VideoEmbed } from '../src/components/VideoEmbed';
import { TUTORIALS } from '../src/content/tutorials';

const SPEC: TutorialSpec = {
  id: 'example',
  title: 'An example walkthrough',
  forWhom: 'Anyone.',
  minutes: 3,
  outcome: 'A figure and its source.',
  steps: [{ do: 'Open the platform search.', see: 'A page of charts.' }],
  lesson: 'A number needs a year.',
  video: { id: 'aaaaaaaaaaa', title: 'Finding one number', minutes: 3 },
};

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
