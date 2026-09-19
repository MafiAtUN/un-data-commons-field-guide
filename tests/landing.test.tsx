import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../src/components/Layout';
import { GuideContents } from '../src/components/nav/GuideContents';
import { Home } from '../src/routes/Home';
import { DESTINATIONS } from '../src/content/navigation';
import { AUTHOR } from '../src/components/SiteCredit';
import { NERD_LAB } from '../src/components/NerdLab';

/**
 * The landing page, rendered.
 *
 * Every other suite here reasons about source text. This one mounts components,
 * because the front page has moving parts whose whole point is what they look
 * like at rest — and "at rest" includes the first frame, which is what a reader
 * on a slow connection, a crawler and a screen reader all get.
 *
 * Effects do not run in a server render, so this sees precisely that frame:
 * before the film has played a beat and before anything has scrolled into view.
 * Nothing important is allowed to be missing from it.
 */
function render(children: React.ReactNode, at = '/'): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[at]}>{children}</MemoryRouter>,
  );
}

/** Rendered markup escapes `&`, so "Peace & security" is not found literally. */
function asRendered(text: string): string {
  return text.replace(/&/g, '&amp;');
}

describe('the front page is a door, not a tool', () => {
  const html = render(<Home />);
  const source = readFileSync(new URL('../src/routes/Home.tsx', import.meta.url), 'utf8');

  it('fetches nothing', () => {
    // The guide's job is to get people onto data.un.org, not to be a second
    // copy of it. The front page is the one page that must never wait on the
    // network, so the dependency is banned rather than merely discouraged.
    expect(source).not.toMatch(/from '.*undc\/client'/);
    expect(source).not.toMatch(/useSourcedData/);
    expect(source).not.toMatch(/DataFinder/);
  });

  it('does not put the Data Finder on the front page', () => {
    expect(html).not.toContain('What do you want to know?');
    expect(html).not.toContain('Which countries?');
  });

  it('offers the platform itself as the primary action', () => {
    expect(html).toContain('href="https://data.un.org"');
    expect(html).toContain('Open data.un.org');
  });

  it('still routes a reader who only wants a figure today', () => {
    expect(html).toContain('href="/toolkit"');
  });

  it('lists every chapter with its own link', () => {
    for (const destination of DESTINATIONS) {
      expect(html, destination.label).toContain(asRendered(destination.label));
      expect(html, destination.label).toContain(`href="${destination.to}"`);
    }
  });
});

describe('the resolver film', () => {
  const html = render(<Home />);

  it('states the finding in text before a single beat has played', () => {
    // A crawler and a screen reader both get this render, so the point of the
    // animation has to survive in the markup without the animation.
    expect(html).toContain('child mortality in Bengal');
    expect(html).toContain('Total Child Mortality, by Age');
    expect(html).toMatch(/substituted country\/USA/);
    expect(html).toContain('child mortality in Bangladesh');
    expect(html).toMatch(/resolves correctly to\s+country\/BGD/);
  });

  it('starts with an empty search box', () => {
    // The query is typed a letter at a time; if a beat had been baked into the
    // initial state it would start mid-word.
    const stage = html.slice(html.indexOf('You typed'));
    expect(stage.slice(0, 600)).not.toContain('child mortality in Bengal');
  });

  it('hides the animated stage, and puts a real link in the text that replaces it', () => {
    expect(html).toContain('aria-hidden="true"');
    const summary = html.slice(html.indexOf('did not recognise Bengal'));
    expect(summary).toContain('href="/lab"');
  });
});

describe('chrome', () => {
  const html = render(<Layout><p /></Layout>);

  it('puts an unmissable contents trigger in the header, not a subtle one', () => {
    // The rail this replaced was three-pixel ticks. Whatever the trigger looks
    // like in future, it has to be a real labelled control.
    expect(html).toMatch(/<button[^>]*aria-haspopup="dialog"[^>]*>/);
    expect(html).toContain('Contents');
  });

  it('does not call the navigation an index', () => {
    // On a statistics site an index is the Human Development Index.
    expect(html).not.toMatch(/>\s*Index\s*</);
  });

  it('keeps the platform one click away from every page', () => {
    expect(html).toContain('href="https://data.un.org"');
  });

  it('keeps the index out of the document until it is opened', () => {
    expect(html).not.toContain('role="dialog"');
  });

  it('names the current chapter in the header on an inner page', () => {
    const target = DESTINATIONS[7]!;
    expect(render(<Layout><p /></Layout>, target.to)).toContain(asRendered(target.label));
  });

  it('credits the author with both profiles, safely targeted', () => {
    expect(html).toContain(AUTHOR.name);
    expect(html).toContain(`href="${AUTHOR.linkedin}"`);
    expect(html).toContain(`href="${AUTHOR.github}"`);

    for (const link of html.match(/<a[^>]*target="_blank"[^>]*>/g) ?? []) {
      expect(link, link).toContain('rel="noreferrer noopener"');
    }
  });

  it('still carries the disclaimer the credit sits next to', () => {
    expect(html).toContain('Not an official United Nations publication');
  });

  it('presents the guide under the lab, top and bottom, the way UNAIVERSE does', () => {
    // The sibling site says "<mark> presents". Two sites out of one lab that
    // credit it in two different phrasings read as two labs.
    expect(html.match(new RegExp(`href="${NERD_LAB.href}"`, 'g'))).toHaveLength(2);
    expect(html.match(/>\s*presents\s*</g)).toHaveLength(2);
    expect(html).toContain(NERD_LAB.tagline);
  });

  it('draws the wordmark rather than spelling the lab out in text', () => {
    // The mark inherits `currentColor` so one copy serves the volt header and
    // the dimmed footer. If that is ever swapped for a coloured asset, the
    // second placement silently stops matching its surroundings.
    expect(html.match(/stroke="currentColor"/g)).toHaveLength(2);
    expect(html).toContain(`aria-label="${NERD_LAB.name} presents"`);
  });
});

describe('the guide contents', () => {
  const open = (at = '/') =>
    render(<GuideContents open onClose={() => undefined} />, at);

  it('renders every chapter it lets you arrow onto', () => {
    // The bug this pins: the keyboard list once began with the front page while
    // the grouped view rendered only the twelve chapters, so opening the dialog
    // and pressing Enter navigated somewhere the reader had never been shown.
    const html = open();
    const rendered = [...html.matchAll(/data-row="([^"]+)"/g)].map((match) => match[1]);
    expect(rendered).toEqual(DESTINATIONS.map((destination) => destination.to));
  });

  it('makes every chapter a real link', () => {
    // Buttons cannot be ⌘-clicked, opened in a new tab, or copied as a URL.
    // Attribute order is React's business, so match the tag then its contents.
    const anchors = open().match(/<a\b[^>]*>/g) ?? [];
    for (const destination of DESTINATIONS) {
      const row = anchors.find((tag) => tag.includes(`data-row="${destination.to}"`));
      expect(row, destination.to).toBeDefined();
      expect(row, destination.to).toContain(`href="${destination.to}"`);
    }
  });

  it('marks the page you are on, and only that one', () => {
    const target = DESTINATIONS[4]!;
    const html = open(target.to);
    const marked = [...html.matchAll(/<a[^>]*aria-current="page"[^>]*>/g)];

    expect(marked).toHaveLength(1);
    expect(marked[0]![0]).toContain(`href="${target.to}"`);
    expect(html).toContain('You are here');
  });

  it('reserves aria-current for the current page, not the keyboard cursor', () => {
    // Rendered at a path that is not a chapter, nothing is current.
    expect(open('/')).not.toContain('aria-current');
  });

  it('numbers a filtered chapter the same as an unfiltered one', () => {
    // The number is the chapter's place in the guide, so it must not renumber
    // itself when the list is filtered.
    const all = open();
    const cookbook = DESTINATIONS.findIndex((d) => d.to === '/cookbook') + 1;
    expect(all).toContain(`${String(cookbook).padStart(2, '0')}`);
  });
});

describe('copy that outlived the front page being a tool', () => {
  it('never tells a reader the tool is on the front page', () => {
    // The Data Finder moved to /toolkit. Three pages still pointed at "/".
    const files = [
      'src/routes/Start.tsx',
      'src/routes/AiTools.tsx',
      'src/routes/Toolkit.tsx',
      'src/routes/Tutorials.tsx',
      'src/routes/Visualise.tsx',
      'src/routes/Cite.tsx',
    ];
    for (const file of files) {
      const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
      expect(source, file).not.toMatch(/tool on the front page/i);
      expect(source, file).not.toMatch(/same tool as the front page/i);
      expect(source, file).not.toMatch(/The tool, on the front page/i);
    }
  });
});
