import { useEffect, useState } from 'react';
import { HOME_SECTIONS, type PageSection } from '../../content/sections';

function scrollTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

/**
 * Which section is currently in view.
 *
 * Deliberately not an IntersectionObserver on each section: sections here are
 * taller than the viewport, so several are "intersecting" at once and the
 * answer flickers. Measuring against a line a third of the way down the
 * viewport gives one unambiguous answer per scroll position.
 */
function useActiveSection(sections: readonly PageSection[]): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame = 0;

    function measure() {
      frame = 0;
      const line = window.innerHeight / 3;

      let current = 0;
      sections.forEach((section, index) => {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= line) current = index;
      });

      // A short final section may never cross the line, so it would be
      // unreachable in the rail. At the bottom of the page it is unambiguously
      // the one being read.
      const atEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;

      setActive(atEnd ? sections.length - 1 : current);
    }

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sections]);

  return active;
}

/**
 * A floating index of the page, so its length is visible from the first screen.
 *
 * The front page is between four and eight screens long depending on the
 * device, and nothing from the second section reached above the fold on any of
 * them — so the hero read as the entire page. This is the fix: six dots, fixed
 * to the side, showing at a glance that there is more and roughly how much.
 *
 * On narrow screens there is no room beside the content, so the same
 * information becomes a progress bar under the header instead.
 */
export function SectionRail({ sections = HOME_SECTIONS }: { sections?: readonly PageSection[] }) {
  const active = useActiveSection(sections);
  const [ready, setReady] = useState(false);

  // Fade in after first paint, so it does not compete with the headline.
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {/* ---------- Desktop: a rail of dots ---------- */}
      <nav
        aria-label="Sections of this page"
        className={`fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 transition-opacity duration-500 xl:block ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ol className="flex flex-col gap-1">
          {sections.map((section, index) => {
            const isActive = index === active;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(section.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className="group flex items-center justify-end gap-2.5 py-1.5"
                >
                  <span
                    className={`whitespace-nowrap rounded border border-hairline bg-surface-1 px-2 py-1 text-[0.7rem] transition-opacity duration-200 ${
                      isActive
                        ? 'text-ink-primary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                        : 'text-ink-secondary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                    }`}
                  >
                    {section.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`block rounded-full transition-all duration-300 ${
                      isActive
                        ? 'h-5 w-[3px] bg-volt'
                        : 'h-[3px] w-[3px] bg-ink-muted/50 group-hover:bg-ink-secondary'
                    }`}
                  />
                  <span className="sr-only">{section.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ---------- Narrow: a progress bar ---------- */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-[3.55rem] z-20 h-px bg-transparent xl:hidden"
      >
        <div
          className="h-px bg-volt transition-[width] duration-300"
          style={{ width: `${((active + 1) / sections.length) * 100}%` }}
        />
      </div>
    </>
  );
}

/**
 * The invitation at the bottom of the hero.
 *
 * An arrow on its own says "there is more" but not "more of what", which is a
 * weaker reason to scroll than naming the thing. This names the next section
 * and moves you there.
 */
export function ScrollCue({ to, label }: { to: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => scrollTo(to)}
      className="group mt-10 flex items-center gap-3 text-left"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-hairline transition-colors group-hover:border-volt/60">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-4 fill-none stroke-volt stroke-2 [animation:cue-nudge_2.4s_ease-in-out_infinite] motion-reduce:animate-none"
        >
          <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>
        <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Keep going
        </span>
        <span className="block text-[0.88rem] font-medium text-ink-secondary transition-colors group-hover:text-ink-primary">
          {label}
        </span>
      </span>
    </button>
  );
}
