import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../src/components/Layout';
import { Home } from '../src/routes/Home';
import { DESTINATIONS } from '../src/content/navigation';
import { AUTHOR } from '../src/components/SiteCredit';

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

  it('puts an unmissable index trigger in the header, not a subtle one', () => {
    // The rail this replaced was three-pixel ticks. Whatever the trigger looks
    // like in future, it has to be a real labelled control.
    expect(html).toMatch(/<button[^>]*aria-haspopup="dialog"[^>]*>/);
    expect(html).toContain('Index');
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
});
