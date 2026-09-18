import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

/**
 * Two menus and a logo.
 *
 * An earlier version put thirteen destinations in front of a reader who did not
 * yet know which one was theirs, which is a choice a person in a hurry cannot
 * make. The front page is now the tool itself, so the only navigation needed is
 * "teach me" and "I write code" — and each entry says what it is for, because a
 * label like "Toolkit" means nothing to someone who has not read the site.
 */
const LEARN = [
  { to: '/start', label: 'The basics', hint: 'Five words, three rules, four minutes' },
  { to: '/tutorials', label: 'Tutorials', hint: 'Six walkthroughs, five minutes each' },
  { to: '/visualise', label: 'Make a chart', hint: 'Free tools, and what makes a chart honest' },
  { to: '/cite', label: 'Cite the data', hint: 'Credit the agency, not the website' },
  { to: '/ai', label: 'Use AI on it', hint: 'Prompts that stop invented figures' },
  { to: '/toolkit', label: 'Data Finder', hint: 'The tool on its own page' },
] as const;

const DEVELOPERS = [
  { to: '/lab', label: 'Prompt Lab', hint: 'How the search box really works' },
  { to: '/cookbook', label: 'Query cookbook', hint: 'The REST API, with recipes' },
  { to: '/connect', label: 'Connect an agent', hint: 'MCP: six tools, no key' },
  { to: '/catalogue', label: 'Catalogue', hint: 'All 16 collections, counted live' },
  { to: '/peace-and-security', label: 'Peace & security case', hint: 'Worked end to end' },
  { to: '/development', label: 'Development case', hint: 'Worked end to end' },
] as const;

interface MenuItem { to: string; label: string; hint: string }

/** A labelled dropdown whose entries say what they are for. */
function Menu({
  label,
  items,
  open,
  setOpen,
  active,
  menuRef,
}: {
  label: string;
  items: readonly MenuItem[];
  open: boolean;
  setOpen: (value: boolean) => void;
  active: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`rounded border px-3 py-1.5 text-[0.8rem] font-medium transition-colors ${
          active || open
            ? 'border-volt/50 bg-volt/10 text-ink-primary'
            : 'border-hairline text-ink-secondary hover:text-ink-primary'
        }`}
      >
        {label} <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-72 overflow-hidden rounded-lg border border-hairline bg-surface-1 shadow-xl">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="block border-b border-hairline px-3.5 py-2.5 last:border-0 hover:bg-surface-2"
            >
              <span className="block text-[0.82rem] font-medium text-ink-primary">{item.label}</span>
              <span className="block text-[0.72rem] text-ink-muted">{item.hint}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const devRef = useRef<HTMLDivElement>(null);
  const learnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMenuOpen(false);
    setDevOpen(false);
    setLearnOpen(false);
  }, [pathname]);

  // Close menus on an outside click or Escape, as menus should.
  useEffect(() => {
    if (!devOpen && !learnOpen) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (devRef.current && !devRef.current.contains(target)) setDevOpen(false);
      if (learnRef.current && !learnRef.current.contains(target)) setLearnOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { setDevOpen(false); setLearnOpen(false); }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [devOpen, learnOpen]);

  const isDeveloper = DEVELOPERS.some((item) => item.to === pathname);
  const isLearn = LEARN.some((item) => item.to === pathname);

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

          <nav aria-label="Main" className="hidden items-center gap-2 md:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded px-3 py-1.5 text-[0.8rem] font-medium transition-colors ${
                  isActive ? 'bg-surface-2 text-ink-primary' : 'text-ink-secondary hover:text-ink-primary'
                }`
              }
            >
              Find data
            </NavLink>

            <Menu
              label="Learn"
              items={LEARN}
              open={learnOpen}
              setOpen={(value) => { setLearnOpen(value); if (value) setDevOpen(false); }}
              active={isLearn}
              menuRef={learnRef}
            />

            <Menu
              label="Developers"
              items={DEVELOPERS}
              open={devOpen}
              setOpen={(value) => { setDevOpen(value); if (value) setLearnOpen(false); }}
              active={isDeveloper}
              menuRef={devRef}
            />
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
          <nav id="mobile-nav" aria-label="Main" className="border-t border-hairline px-4 py-3 md:hidden">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `block rounded px-2 py-2 text-[0.88rem] font-medium ${
                  isActive ? 'bg-surface-2 text-ink-primary' : 'text-ink-secondary'
                }`
              }
            >
              Find data
            </NavLink>
            <p className="mt-3 border-t border-hairline px-2 pb-1 pt-3 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-muted">
              Learn
            </p>
            {LEARN.map((item) => (
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
            {DEVELOPERS.map((item) => (
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
