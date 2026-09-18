import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const NAV = [
  { to: '/lab', label: 'Prompt Lab' },
  { to: '/peace-and-security', label: 'Peace & security' },
  { to: '/development', label: 'Development' },
  { to: '/cookbook', label: 'Query cookbook' },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/connect', label: 'Connect' },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Route changes should land at the top of the new page and close the menu.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-un-blue focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-surface-0"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-hairline bg-surface-0/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded bg-un-blue text-[0.8rem] font-bold text-surface-0"
            >
              N
            </span>
            <span className="text-[0.88rem] font-semibold leading-tight text-ink-primary">
              UN Data Commons
              <span className="block text-[0.72rem] font-normal text-ink-muted">Field Guide</span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded px-2.5 py-1.5 text-[0.78rem] font-medium transition-colors ${
                    isActive
                      ? 'bg-surface-2 text-ink-primary'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

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
          <nav id="mobile-nav" aria-label="Main" className="border-t border-hairline px-4 py-2 md:hidden">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded px-2 py-2 text-[0.85rem] ${
                    isActive ? 'bg-surface-2 text-ink-primary' : 'text-ink-secondary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-10">
        {children}
      </main>

      <footer className="mt-16 border-t border-hairline">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 text-[0.75rem] leading-relaxed text-ink-muted">
          <p>
            An independent guide to the{' '}
            <a
              href="https://data.un.org"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-un-blue"
            >
              UN System Data Commons
            </a>
            , built and maintained by Mafizul Islam. Not an official United Nations
            publication, and not endorsed by the United Nations or by Google.
          </p>
          <p>
            All figures are retrieved from data.un.org at the moment you load the page,
            or from the snapshot committed in this repository when the platform cannot
            be reached — every chart says which. Each statistic carries its own source
            attribution and terms of use, which travel with the data, not with this site.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <a
              href="https://github.com/MafiAtUN/un-data-commons-field-guide"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-un-blue"
            >
              Source on GitHub
            </a>
            <a
              href="https://data.un.org/undatacommons/docs/getting-started"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-un-blue"
            >
              Official getting-started guide
            </a>
            <a
              href="https://data.un.org/undatacommons/terms-of-use"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-un-blue"
            >
              Platform terms of use
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
