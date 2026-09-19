/**
 * THE PRESENTING CREDIT
 *
 * This guide is published under Nerd Lab — the independent maker project on
 * github.com/nerd-factory that this kind of thing goes out under. So the site
 * carries a title card, the way a film does: the mark, then the word. UNAIVERSE,
 * the other thing out of the same lab, says it the same way, and two sibling
 * sites that credit their maker in two different phrasings read as two makers.
 *
 * Two placements, one component:
 *
 *   • `nav`   — the left end of the header, ahead of UN Data Commons, so the
 *     label is at the top of every page rather than only on the front door.
 *   • `strip` — a thin band at the bottom of the footer, so the credit is on
 *     the page someone forwards too.
 *
 * The wordmark is inlined rather than requested. It is a kilobyte of paths, it
 * has to paint with the text beside it rather than a frame later, and inlining
 * lets it take `currentColor` — so one copy is the volt one in the header and
 * the dimmed one in the footer, with no second asset to keep in sync. It is the
 * Nerd Lab brand file (public/brand/nerd-lab-logo-volt.svg) with the fills
 * swapped for currentColor and nothing else touched.
 *
 * Unlike UNAIVERSE, which shipped before the lab had an address, this one links:
 * nerd-factory.github.io/nerd-lab exists now, and a credit a reader can follow
 * is the point of a credit.
 */

/** The lab, in one place, so a rename is one edit. */
export const NERD_LAB = {
  name: 'Nerd Lab',
  tagline: 'Unnecessarily clever. Occasionally useful.',
  href: 'https://nerd-factory.github.io/nerd-lab/',
} as const;

/**
 * The wordmark. Decorative in both placements — the wrapper carries the credit
 * as one phrase, so a screen reader gets "Nerd Lab presents" rather than a
 * wordmark and then a stray word.
 *
 * The viewBox carries the brand's own padding, so height is set against the
 * text beside it rather than against the box.
 */
function NerdLabMark({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 700 176"
      aria-hidden="true"
      focusable="false"
      className={`block w-auto shrink-0 ${className}`}
    >
      <g
        transform="translate(38,38)"
        fill="none"
        stroke="currentColor"
        strokeWidth="24"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      >
        <path d="M12 100 L12 0 L64 100 L64 0" />
        <g transform="translate(90,0)" stroke="none">
          <rect x="6" y="0" width="56" height="24" fill="currentColor" />
          <rect x="20" y="38" width="56" height="24" fill="currentColor" />
          <rect x="6" y="76" width="56" height="24" fill="currentColor" />
        </g>
        <path transform="translate(172,0)" d="M12 100 L12 0 M12 12 H40 Q64 12 64 33 Q64 54 40 54 H12 M40 54 L66 100" />
        <path transform="translate(264,0)" d="M12 100 L12 0 M12 12 H38 Q66 12 66 50 Q66 88 38 88 H12" />
        <path transform="translate(384,0)" d="M12 0 L12 88 L56 88" />
        <path transform="translate(458,0)" d="M6 100 L38 0 L70 100 M22 64 H54" />
        <path transform="translate(548,0)" d="M12 100 L12 0 M12 12 H36 Q58 12 58 30 Q58 48 36 48 H12 M12 48 H38 Q64 48 64 68 Q64 88 38 88 H12" />
      </g>
    </svg>
  );
}

/**
 * The header label. Volt, because volt is the Nerd Lab signature and the header
 * is chrome, which is the only place the accent is allowed to be.
 *
 * The header is already carrying a title, a link off-site and the contents
 * button. Below `lg` the word goes and the mark stays: a reader who has seen it
 * once reads the mark alone, and it is the part that cannot be re-typed.
 */
export function NerdLabNavCredit() {
  return (
    <a
      href={NERD_LAB.href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${NERD_LAB.name} presents`}
      className="group flex shrink-0 items-center gap-2 text-volt transition-opacity hover:opacity-80"
    >
      <NerdLabMark className="h-[0.95rem]" />
      <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-muted transition-colors group-hover:text-ink-secondary lg:block">
        presents
      </span>
    </a>
  );
}

/**
 * The standing credit at the foot of the page. Dimmed rather than volt: down
 * here it is a signature, not a call to action, and the accent would pull the
 * eye past the legal note above it.
 */
export function NerdLabStrip() {
  return (
    <div className="border-t border-hairline pt-6">
      <a
        href={NERD_LAB.href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`${NERD_LAB.name} presents. ${NERD_LAB.tagline}`}
        className="group flex flex-wrap items-center gap-x-5 gap-y-2"
      >
        <span className="flex items-center gap-2.5 text-ink-secondary transition-colors group-hover:text-volt">
          <NerdLabMark className="h-[1.15rem]" />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-ink-muted">
            presents
          </span>
        </span>
        <span className="text-[0.75rem] italic text-ink-muted">{NERD_LAB.tagline}</span>
      </a>
    </div>
  );
}
