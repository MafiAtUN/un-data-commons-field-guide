import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DESTINATIONS } from '../content/navigation';
import { paletteHint, usePaletteHotkey } from '../lib/palette';
import { SITE_ROOT } from '../lib/undc/config';
import { IndexOverlay } from './nav/IndexOverlay';
import { SiteCredit } from './SiteCredit';

/**
 * Chrome: a wordmark, the way out, and the way in.
 *
 * Only two controls sit in the header, and both are sized to be seen. The first
 * is a link off this site entirely — the guide's whole purpose is to get people
 * onto data.un.org, so the platform should never be more than one deliberate
 * click away from any page. The second opens the index.
 *
 * There is no separate mobile menu. The index is full-screen at every width, so
 * the small-screen navigation and the large-screen navigation are the same
 * object, which is one fewer thing to keep in step.
 */
export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [indexOpen, setIndexOpen] = useState(false);

  usePaletteHotkey(useCallback(() => setIndexOpen(true), []));

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setIndexOpen(false);
  }, [pathname]);

  const here = DESTINATIONS.find((destination) => destination.to === pathname);

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
          <Link to="/" className="flex min-w-0 shrink items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded bg-volt text-[0.8rem] font-bold text-surface-0"
            >
              N
            </span>
            <span className="wordmark min-w-0 text-[0.88rem] font-semibold leading-tight text-ink-primary">
              <span className="block truncate">UN Data Commons</span>
              <span className="block truncate font-sans text-[0.7rem] font-normal text-ink-muted">
                {/* On an inner page the header doubles as a breadcrumb. */}
                {here ? here.label : 'Field Guide · a Nerd Lab product'}
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
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
              onClick={() => setIndexOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={indexOpen}
              className="flex items-center gap-2.5 rounded-lg border border-volt/55 bg-volt/10 px-3.5 py-2 text-[0.8rem] font-semibold text-ink-primary transition-colors hover:bg-volt/20"
            >
              <span aria-hidden="true" className="flex flex-col gap-[3px]">
                <span className="block h-px w-4 bg-volt" />
                <span className="block h-px w-4 bg-volt" />
                <span className="block h-px w-4 bg-volt" />
              </span>
              Index
              <kbd className="hidden text-[0.66rem] font-normal text-ink-muted sm:block">
                {paletteHint()}
              </kbd>
            </button>
          </div>
        </div>
      </header>

      <IndexOverlay open={indexOpen} onClose={() => setIndexOpen(false)} />

      <main id="main" className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        {children}
      </main>

      <footer className="mt-24 border-t border-hairline">
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-10">
          <div className="space-y-3 text-[0.75rem] leading-relaxed text-ink-muted">
            <p>
              A{' '}
              <FooterLink href="https://nerd-factory.github.io/nerd-lab/">Nerd Lab</FooterLink>{' '}
              product — unnecessarily clever, occasionally useful. An independent guide to the{' '}
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
