import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

/**
 * Navigation is split into two tracks.
 *
 * The practical track is for a colleague who needs a figure today and does not
 * write code; the developer track is the original field guide. Twelve flat links
 * would serve neither, so the developer track sits behind one menu and the
 * practical track stays in the open — that is the audience most likely to arrive
 * from a shared link and bounce if the first thing they see is an API.
 */
const PRACTICAL = [
  { to: '/start', label: 'Start here' },
  { to: '/tutorials', label: 'Tutorials' },
  { to: '/toolkit', label: 'Data Finder' },
  { to: '/visualise', label: 'Visualise' },
  { to: '/cite', label: 'Cite' },
  { to: '/ai', label: 'AI tools' },
] as const;

const TECHNICAL = [
  { to: '/lab', label: 'Prompt Lab', hint: 'How the search box really works' },
  { to: '/cookbook', label: 'Query cookbook', hint: 'The REST API, with recipes' },
  { to: '/connect', label: 'Connect an agent', hint: 'MCP: six tools, no key' },
  { to: '/catalogue', label: 'Catalogue', hint: 'All 16 collections, counted live' },
  { to: '/peace-and-security', label: 'Peace & security case', hint: 'Worked end to end' },
  { to: '/development', label: 'Development case', hint: 'Worked end to end' },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const devRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMenuOpen(false);
    setDevOpen(false);
  }, [pathname]);

  // Close the developer menu on an outside click or Escape, as a menu should.
  useEffect(() => {
    if (!devOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (devRef.current && !devRef.current.contains(event.target as Node)) setDevOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDevOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [devOpen]);

  const isTechnical = TECHNICAL.some((item) => item.to === pathname);

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-volt focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-surface-0"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-hairline bg-surface-0/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
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

          <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
            {PRACTICAL.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded px-2.5 py-1.5 text-[0.78rem] font-medium transition-colors ${
                    isActive ? 'bg-surface-2 text-ink-primary' : 'text-ink-secondary hover:text-ink-primary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="relative ml-1" ref={devRef}>
              <button
                type="button"
                onClick={() => setDevOpen((open) => !open)}
                aria-expanded={devOpen}
                aria-haspopup="true"
                className={`rounded border px-2.5 py-1.5 text-[0.78rem] font-medium transition-colors ${
                  isTechnical
                    ? 'border-volt/50 bg-volt/10 text-ink-primary'
                    : 'border-hairline text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Developers <span aria-hidden="true">▾</span>
              </button>

              {devOpen && (
                <div className="absolute right-0 top-full z-40 mt-1.5 w-72 overflow-hidden rounded-lg border border-hairline bg-surface-1 shadow-xl">
                  {TECHNICAL.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className="block border-b border-hairline px-3.5 py-2.5 last:border-0 hover:bg-surface-2"
                    >
                      <span className="block text-[0.82rem] font-medium text-ink-primary">
                        {item.label}
                      </span>
                      <span className="block text-[0.72rem] text-ink-muted">{item.hint}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <button
            type="button"
            className="rounded border border-hairline px-2.5 py-1.5 text-[0.75rem] text-ink-secondary lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {menuOpen && (
          <nav id="mobile-nav" aria-label="Main" className="border-t border-hairline px-4 py-3 lg:hidden">
            <p className="px-2 pb-1 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-muted">
              Get started
            </p>
            {PRACTICAL.map((item) => (
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
            <p className="mt-3 border-t border-hairline px-2 pb-1 pt-3 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-muted">
              For developers
            </p>
            {TECHNICAL.map((item) => (
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
            A{' '}
            <a
              href="https://nerd-factory.github.io/nerd-lab/"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-volt"
            >
              Nerd Lab
            </a>{' '}
            product — unnecessarily clever, occasionally useful. An independent guide to the{' '}
            <a
              href="https://data.un.org"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-volt"
            >
              UN System Data Commons
            </a>
            , built and maintained by Mafizul Islam. Not an official United Nations
            publication, and not endorsed by the United Nations or by Google.
          </p>
          <p>
            All figures are retrieved from data.un.org at the moment you load the page, or
            from the snapshot committed in this repository when the platform cannot be
            reached — every chart says which. Each statistic carries its own source
            attribution and terms of use, which travel with the data, not with this site.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <a
              href="https://github.com/MafiAtUN/un-data-commons-field-guide"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-volt"
            >
              Source on GitHub
            </a>
            <a
              href="https://github.com/nerd-factory"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-volt"
            >
              More from Nerd Lab
            </a>
            <a
              href="https://data.un.org/undatacommons/docs/getting-started"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-volt"
            >
              Official getting-started guide
            </a>
            <a
              href="https://data.un.org/undatacommons/terms-of-use"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-volt"
            >
              Platform terms of use
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
