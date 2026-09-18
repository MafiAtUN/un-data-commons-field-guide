import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../src/components/Layout';
import { Home } from '../src/routes/Home';
import { DESTINATIONS } from '../src/content/navigation';
import { AUTHOR } from '../src/components/SiteCredit';

/**
 * The landing page, rendered.
 *
 * Every other suite here reasons about source text. This one actually mounts
 * the components, because the front page now has moving parts whose whole point
 * is what they look like at rest — and "at rest" includes the first frame, which
 * is what a reader on a slow connection, a crawler, and a screen reader all get.
 *
 * Effects do not run in a server render, so this sees precisely that first
 * frame: before the film has played a beat, before IntersectionObserver has
 * revealed anything, and before any data has arrived. Nothing important is
 * allowed to be missing from it.
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

describe('the front page at its first frame', () => {
  const html = render(<Home />);

  it('renders the tool, not a splash screen', () => {
    // The animation must never be standing between the reader and the picker.
    expect(html).toContain('What do you want to know?');
    expect(html).toContain('Which countries?');
    expect(html).toContain('How far back?');
  });

  it('states the resolver finding in text, before the film has played a beat', () => {
    // A crawler and a screen reader both get this render. The point of the
    // animation has to survive in the markup without it.
    expect(html).toContain('Number of Victims of Intentional Homicide');
    expect(html).toMatch(/found none in the question, and supplied/);
  });

  it('starts the film with an empty search box', () => {
    // If a beat had already been baked in, the typing would start mid-word.
    expect(html).not.toContain('>violence<');
  });

  it('hides the animated stage, and puts a real link in the text that replaces it', () => {
    // The stage is aria-hidden and its own link is taken out of the tab order,
    // so the static summary has to carry a working route to the Prompt Lab or
    // that destination is unreachable for anyone not looking at the animation.
    expect(html).toContain('aria-hidden="true"');

    const summary = html.slice(html.indexOf('found none in the question'));
    expect(summary).toContain('href="/lab"');
  });

  it('lists every destination in the guide contents', () => {
    for (const destination of DESTINATIONS) {
      expect(html, destination.label).toContain(asRendered(destination.label));
      expect(html, destination.label).toContain(`href="${destination.to}"`);
    }
  });
});

describe('the depth rail', () => {
  it('renders one tick per destination, in manifest order', () => {
    const html = render(<Layout><p /></Layout>);
    const rail = html.slice(
      html.indexOf('aria-describedby="rail-help"'),
      html.indexOf('</ul>'),
    );

    const order = [...rail.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    expect(order).toEqual(DESTINATIONS.map((destination) => destination.to));
  });

  it('exposes exactly one tab stop, as the roving-tabindex pattern requires', () => {
    const html = render(<Layout><p /></Layout>);
    const rail = html.slice(
      html.indexOf('aria-describedby="rail-help"'),
      html.indexOf('</ul>'),
    );

    expect([...rail.matchAll(/tabindex="0"/g)]).toHaveLength(1);
    expect([...rail.matchAll(/tabindex="-1"/g)]).toHaveLength(DESTINATIONS.length - 1);
  });

  it('puts the tab stop and the current-page marker on the page you are on', () => {
    const target = DESTINATIONS[7]!;
    const html = render(<Layout><p /></Layout>, target.to);
    const rail = html.slice(
      html.indexOf('aria-describedby="rail-help"'),
      html.indexOf('</ul>'),
    );

    const current = rail.match(/<a[^>]*aria-current="page"[^>]*>/);
    expect(current?.[0]).toContain(`href="${target.to}"`);
    expect(current?.[0]).toContain('tabindex="0"');
  });

  it('describes each tick for a reader who cannot see the rail', () => {
    const html = render(<Layout><p /></Layout>);
    for (const destination of DESTINATIONS) {
      expect(html, destination.label).toContain(
        asRendered(`${destination.label} — ${destination.hint} (${destination.time})`),
      );
    }
  });
});

describe('chrome', () => {
  const html = render(<Layout><p /></Layout>);

  it('keeps the command palette out of the document until it is opened', () => {
    expect(html).not.toContain('role="dialog"');
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
