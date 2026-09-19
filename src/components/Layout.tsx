import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DESTINATIONS } from '../content/navigation';
import { paletteHint, usePaletteHotkey } from '../lib/palette';
import { SITE_ROOT } from '../lib/undc/config';
import { GuideContents } from './nav/GuideContents';
import { NerdLabNavCredit, NerdLabStrip } from './NerdLab';
import { SiteCredit } from './SiteCredit';

/**
 * Chrome: a credit, a wordmark, the way out, and the way in.
 *
 * The header opens with the Nerd Lab label rather than the site's own initial,
 * because this guide is one of several things out of that lab and the reader
 * should be able to get from any page to the rest of them.
 *
 * Only two controls sit on the right, and both are sized to be seen. The first
 * is a link off this site entirely — the guide's whole purpose is to get people
 * onto data.un.org, so the platform should never be more than one deliberate
 * click away from any page. The second opens the contents.
 *
 * It said "Index" until a reader pointed out that on a statistics site an index
 * is the Human Development Index, not a list of pages.
 *
 * There is no separate mobile menu. The contents are full-screen at every width, so
 * the small-screen navigation and the large-screen navigation are the same
 * object, which is one fewer thing to keep in step.
 */
export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [contentsOpen, setContentsOpen] = useState(false);

  usePaletteHotkey(useCallback(() => setContentsOpen(true), []));

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setContentsOpen(false);
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
              className="flex items-center gap-2.5 rounded-lg border border-volt/55 bg-volt/10 px-3.5 py-2 text-[0.8rem] font-semibold text-ink-primary transition-colors hover:bg-volt/20"
            >
              <span aria-hidden="true" className="flex flex-col gap-[3px]">
                <span className="block h-px w-4 bg-volt" />
                <span className="block h-px w-4 bg-volt" />
                <span className="block h-px w-4 bg-volt" />
              </span>
              Contents
              <kbd className="hidden text-[0.66rem] font-normal text-ink-muted sm:block">
                {paletteHint()}
              </kbd>
            </button>
          </div>
        </div>
      </header>

      <GuideContents open={contentsOpen} onClose={() => setContentsOpen(false)} />

      <main id="main" className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        {children}
      </main>

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
