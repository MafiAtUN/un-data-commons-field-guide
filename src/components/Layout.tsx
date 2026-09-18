import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { DESTINATIONS, FIRST_TECHNICAL, HOME } from '../content/navigation';
import { paletteHint, usePaletteHotkey } from '../lib/palette';
import { CommandPalette } from './nav/CommandPalette';
import { DepthRail } from './nav/DepthRail';
import { SiteCredit } from './SiteCredit';

/**
 * Chrome: a logo, one axis, and a keystroke.
 *
 * Two earlier versions of this file. The first put thirteen destinations in
 * front of a reader who did not yet know which one was theirs. The second hid
 * twelve of them behind two dropdowns, which is not the same as solving it — a
 * dropdown can say what exists, but it cannot say where you are in a body of
 * material or what sensibly comes next.
 *
 * So the destinations are ordered instead of hidden. The rail lays all twelve on
 * the single axis the site actually has, running from a reporting officer who
 * has never opened data.un.org to someone wiring an MCP endpoint into an agent,
 * and lights the one you are on. Readers who already know where they are going
 * press the key and skip the whole apparatus.
 *
 * The manifest itself lives in `src/content/navigation.ts`, shared by the rail,
 * the palette, the mobile menu and the front page's table of contents, so a new
 * page is added in exactly one place.
 */
export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  usePaletteHotkey(useCallback(() => setPaletteOpen(true), []));

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMenuOpen(false);
    setPaletteOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-volt focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-surface-0"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-hairline bg-surface-0/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded bg-volt text-[0.8rem] font-bold text-surface-0"
            >
              N
            </span>
            <span className="wordmark text-[0.88rem] font-semibold leading-tight text-ink-primary">
              UN Data Commons
              <span className="block font-sans text-[0.7rem] font-normal text-ink-muted">
                Field Guide · a Nerd Lab product
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-4 md:flex">
            <NavLink
              to={HOME.to}
              end
              className={({ isActive }) =>
                `shrink-0 rounded px-2.5 py-1.5 text-[0.8rem] font-medium transition-colors ${
                  isActive ? 'bg-surface-2 text-ink-primary' : 'text-ink-secondary hover:text-ink-primary'
                }`
              }
            >
              {HOME.label}
            </NavLink>

            <DepthRail />

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded border border-hairline px-2.5 py-1.5 text-[0.72rem] text-ink-muted transition-colors hover:border-volt/50 hover:text-ink-secondary"
            >
              <span aria-hidden="true">Search</span>
              <kbd className="rounded bg-surface-2 px-1 py-px text-[0.66rem] text-ink-secondary">
                {paletteHint()}
              </kbd>
              <span className="sr-only">Open the section search</span>
            </button>
          </div>

          <button
            type="button"
            className="rounded border border-hairline px-2.5 py-1.5 text-[0.75rem] text-ink-secondary md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="All sections"
            className="max-h-[70vh] overflow-y-auto border-t border-hairline px-4 py-3 md:hidden"
          >
            <NavLink
              to={HOME.to}
              end
              className={({ isActive }) =>
                `block rounded px-2 py-2 text-[0.88rem] font-medium ${
                  isActive ? 'bg-surface-2 text-ink-primary' : 'text-ink-secondary'
                }`
              }
            >
              {HOME.label}
            </NavLink>

            {/* Same order as the rail, so the two teach the same shape. */}
            {DESTINATIONS.map((destination, index) => (
              <div key={destination.to}>
                {index === 0 && <MenuHeading>Practical</MenuHeading>}
                {index === FIRST_TECHNICAL && <MenuHeading>Below here, a terminal helps</MenuHeading>}
                <NavLink
                  to={destination.to}
                  className={({ isActive }) =>
                    `flex items-baseline justify-between gap-3 rounded px-2 py-2 ${
                      isActive ? 'bg-surface-2' : ''
                    }`
                  }
                >
                  <span className="min-w-0">
                    <span className="block text-[0.85rem] text-ink-primary">{destination.label}</span>
                    <span className="block text-[0.72rem] text-ink-muted">{destination.hint}</span>
                  </span>
                  <span className="shrink-0 text-[0.68rem] text-ink-muted">{destination.time}</span>
                </NavLink>
              </div>
            ))}
          </nav>
        )}
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <main id="main" className="mx-auto max-w-6xl px-4 pb-10 pt-7">
        {children}
      </main>

      <footer className="mt-16 border-t border-hairline">
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-8">
          <div className="space-y-3 text-[0.75rem] leading-relaxed text-ink-muted">
            <p>
              A{' '}
              <FooterLink href="https://nerd-factory.github.io/nerd-lab/">Nerd Lab</FooterLink>{' '}
              product — unnecessarily clever, occasionally useful. An independent guide to the{' '}
              <FooterLink href="https://data.un.org">UN System Data Commons</FooterLink>. Not an
              official United Nations publication, and not endorsed by the United Nations or by
              Google.
            </p>
            <p>
              All figures are retrieved from data.un.org at the moment you load the page, or
              from the snapshot committed in this repository when the platform cannot be
              reached — every chart says which. Each statistic carries its own source
              attribution and terms of use, which travel with the data, not with this site.
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <FooterLink href="https://github.com/MafiAtUN/un-data-commons-field-guide">
                Source on GitHub
              </FooterLink>
              <FooterLink href="https://github.com/nerd-factory">More from Nerd Lab</FooterLink>
              <FooterLink href="https://data.un.org/undatacommons/docs/getting-started">
                Official getting-started guide
              </FooterLink>
              <FooterLink href="https://data.un.org/undatacommons/terms-of-use">
                Platform terms of use
              </FooterLink>
            </p>
          </div>

          <SiteCredit />
        </div>
      </footer>
    </div>
  );
}

function MenuHeading({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 border-t border-hairline px-2 pb-1 pt-3 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-muted">
      {children}
    </p>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-volt"
    >
      {children}
    </a>
  );
}
