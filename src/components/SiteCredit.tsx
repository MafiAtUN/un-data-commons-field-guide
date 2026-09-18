/**
 * Who made this.
 *
 * Kept separate from the legal paragraph above it on purpose. "Not an official
 * United Nations publication" is a disclaimer and should read like one; a byline
 * is not a disclaimer, and burying it in the same grey block makes the site look
 * like it was issued by nobody.
 */

/** Author links, in one place so they are easy to check before a deploy. */
export const AUTHOR = {
  name: 'Mafizul Islam',
  linkedin: 'https://www.linkedin.com/in/mafizul/',
  github: 'https://github.com/MafiAtUN',
} as const;

export function SiteCredit() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
      <div>
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Created by
        </p>
        <p className="wordmark mt-1 text-[1.15rem] font-semibold text-ink-primary">
          {AUTHOR.name}
        </p>
        <p className="mt-0.5 text-[0.76rem] text-ink-muted">
          Designed, written and built end to end.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <CreditLink href={AUTHOR.linkedin} label="LinkedIn">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
            <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.71h.05A4.17 4.17 0 0 1 17.6 8.7c4 0 4.74 2.5 4.74 5.76V21h-4v-5.66c0-1.35-.02-3.09-1.9-3.09-1.9 0-2.19 1.47-2.19 3v5.75h-4V9Z" />
          </svg>
        </CreditLink>

        <CreditLink href={AUTHOR.github} label="GitHub">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
            <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.38-3.88-1.38-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
          </svg>
        </CreditLink>
      </div>
    </div>
  );
}

/** A link whose underline sweeps in from the left rather than simply appearing. */
function CreditLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="group relative flex items-center gap-2 overflow-hidden rounded border border-hairline px-3.5 py-2 text-[0.82rem] font-medium text-ink-secondary transition-colors hover:border-volt/50 hover:text-ink-primary"
    >
      {children}
      {label}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
    </a>
  );
}
