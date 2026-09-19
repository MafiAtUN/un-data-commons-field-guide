import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DESTINATIONS } from '../content/navigation';
import { paletteHint, usePaletteHotkey } from '../lib/palette';
import { SITE_ROOT } from '../lib/undc/config';
import { GuideContents } from './nav/GuideContents';
import { NerdLabNavCredit, NerdLabStrip } from './NerdLab';
import { SiteCredit } from './SiteCredit';

/** Shared navigation keeps Home and every guide chapter within reach. */
export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [contentsOpen, setContentsOpen] = useState(false);

  usePaletteHotkey(useCallback(() => setContentsOpen(true), []));

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setContentsOpen(false);
  }, [pathname]);

  const here = DESTINATIONS.find((destination) => destination.to === pathname);
  const position = DESTINATIONS.findIndex((destination) => destination.to === pathname);
  const previous = DESTINATIONS[position - 1];
  const next = DESTINATIONS[position + 1];

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
          <div className="flex min-w-0 shrink items-center gap-2.5">
            <NerdLabNavCredit />
            <span aria-hidden="true" className="h-7 w-px shrink-0 bg-hairline" />
            <Link
              to="/"
              className="wordmark min-w-0 text-[0.88rem] font-semibold leading-tight text-ink-primary"
            >
              <span className="block truncate">UN Data Commons</span>
              <span className="block truncate font-sans text-[0.7rem] font-normal text-ink-muted">
                {/* On an inner page the header doubles as a breadcrumb. */}
                {here ? here.label : 'Field Guide'}
              </span>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/"
              aria-current={pathname === '/' ? 'page' : undefined}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-[0.8rem] font-semibold text-ink-primary transition-colors hover:bg-volt/10 hover:text-volt"
            >
              Home
            </Link>
            <a
              href={SITE_ROOT}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden rounded-lg border border-hairline px-3.5 py-2 text-[0.78rem] font-medium text-ink-secondary transition-colors hover:border-volt/60 hover:text-ink-primary sm:block"
            >
              data.un.org ↗
            </a>

            <button
              type="button"
              onClick={() => setContentsOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={contentsOpen}
              className="relative flex items-center gap-2.5 rounded-lg border border-volt/55 bg-volt/10 px-3.5 py-2 text-[0.8rem] font-semibold text-ink-primary transition-colors hover:bg-volt/20"
            >
              <span aria-hidden="true" className="flex flex-col gap-[3px]">
                <span className="block h-px w-4 bg-volt" />
                <span className="block h-px w-4 bg-volt" />
                <span className="block h-px w-4 bg-volt" />
              </span>
              Contents
              <svg aria-hidden="true" viewBox="0 0 40 30" className="pointer-events-none absolute right-3 top-full h-7 w-10 fill-none stroke-volt" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 25C20 28 30 19 29 5M23 11l6-7 6 7" />
              </svg>
              <kbd className="hidden text-[0.66rem] font-normal text-ink-muted sm:block">
                {paletteHint()}
              </kbd>
            </button>
          </div>
        </div>
      </header>

      <GuideContents open={contentsOpen} onClose={() => setContentsOpen(false)} />

      <div className={here ? 'mx-auto grid max-w-[90rem] gap-10 px-4 lg:grid-cols-[13rem_minmax(0,1fr)]' : ''}>
        {here && (
          <aside className="hidden pt-8 lg:block">
            <nav aria-label="Guide pages" className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-hairline bg-surface-1/60 p-3">
              <Link to="/" className="mb-4 flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink-primary hover:bg-volt/10 hover:text-volt">
                <span aria-hidden="true">←</span> Home
              </Link>
              {(['practical', 'technical'] as const).map((track) => (
                <div key={track} className="mb-4 last:mb-0">
                  <p className="mb-2 px-3 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    {track === 'practical' ? 'Learn & use' : 'Developer'}
                  </p>
                  <ul className="space-y-1">
                    {DESTINATIONS.filter((page) => page.track === track).map((page) => (
                      <li key={page.to}>
                        <Link
                          to={page.to}
                          aria-current={pathname === page.to ? 'page' : undefined}
                          className={`block rounded-lg border px-3 py-2 text-[0.8rem] transition-colors ${pathname === page.to ? 'border-volt/30 bg-volt/10 font-semibold text-volt' : 'border-transparent text-ink-secondary hover:bg-white/5 hover:text-ink-primary'}`}
                        >
                          {page.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
        )}
        <main id="main" className={`mx-auto w-full min-w-0 max-w-6xl pb-16 pt-8 ${here ? '' : 'px-4'}`}>
          {here && (
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[0.8rem]">
              <Link to="/" className="text-ink-secondary hover:text-volt">Home</Link>
              <span aria-hidden="true" className="text-ink-muted">/</span>
              <span aria-current="page" className="text-ink-primary">{here.label}</span>
            </nav>
          )}
          {children}
          {here && (
            <nav aria-label="Continue through the guide" className="mt-16 grid gap-3 border-t border-hairline pt-6 sm:grid-cols-2">
              <Link to={previous?.to ?? '/'} className="rounded-xl border border-hairline bg-surface-1 p-5 transition-colors hover:border-volt/50">
                <span className="block text-xs text-ink-muted">← {previous ? 'Previous' : 'Back to'}</span>
                <span className="mt-2 block font-semibold text-ink-primary">{previous?.label ?? 'Home'}</span>
              </Link>
              <Link to={next?.to ?? '/'} className="rounded-xl border border-hairline bg-surface-1 p-5 text-right transition-colors hover:border-volt/50">
                <span className="block text-xs text-ink-muted">{next ? 'Next' : 'Back to'} →</span>
                <span className="mt-2 block font-semibold text-ink-primary">{next?.label ?? 'Home'}</span>
              </Link>
            </nav>
          )}
        </main>
      </div>

      <footer className="mt-24 border-t border-hairline">
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-10">
          <div className="space-y-3 text-[0.75rem] leading-relaxed text-ink-muted">
            {/* The lab's name and tagline are the presenting strip's job, at the
                foot of this footer. This paragraph is the disclaimer, and a
                disclaimer that opens with a joke reads as neither. */}
            <p>
              An independent guide to the{' '}
              <FooterLink href={SITE_ROOT}>UN System Data Commons</FooterLink>. Not an
              official United Nations publication, and not endorsed by the United Nations or
              by Google.
            </p>
            <p>
              Figures on the pages that show them are retrieved from data.un.org as you load
              them, or from the snapshot committed in this repository when the platform
              cannot be reached — every chart says which. Each statistic carries its own
              source attribution and terms of use, which travel with the data, not with this
              site.
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <FooterLink href="https://github.com/MafiAtUN/un-data-commons-field-guide">
                Source on GitHub
              </FooterLink>
              <FooterLink href="https://github.com/nerd-factory">
                More from the lab on GitHub
              </FooterLink>
              <FooterLink href="https://data.un.org/undatacommons/docs/getting-started">
                Official getting-started guide
              </FooterLink>
              <FooterLink href="https://data.un.org/undatacommons/terms-of-use">
                Platform terms of use
              </FooterLink>
            </p>
          </div>

          <SiteCredit />

          <NerdLabStrip />
        </div>
      </footer>
    </div>
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
