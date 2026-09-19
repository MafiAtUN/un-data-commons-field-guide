import { useEffect, useState } from 'react';
import { ACCENT_CLASSES, HOME_SECTIONS, type PageSection } from '../../content/sections';

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

/** A floating chapter dock keeps the page's destinations within reach. */
export function SectionRail({ sections = HOME_SECTIONS }: { sections?: readonly PageSection[] }) {
  const active = useActiveSection(sections);

  return (
    <nav
      aria-label="Sections of this page"
      className="fixed inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 mx-auto max-w-5xl rounded-2xl border border-white/15 bg-surface-0/90 p-2 shadow-[0_12px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:inset-x-6 sm:rounded-[1.4rem]"
    >
      <div className="flex items-center justify-between px-3 pb-2 pt-1">
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-ink-muted">
          Explore the page
        </span>
        <span className="font-mono text-[0.6rem] text-ink-muted">
          <span className="text-ink-primary">{String(active + 1).padStart(2, '0')}</span>
          {' / '}{String(sections.length).padStart(2, '0')}
        </span>
      </div>
      <ol className="grid grid-cols-2 gap-1 min-[480px]:grid-cols-4 lg:grid-cols-7">
        {sections.map((section, index) => {
          const isActive = index === active;
          const colour = ACCENT_CLASSES[section.accent];
          return (
            <li key={section.id} className={index === sections.length - 1 ? 'col-span-2 min-[480px]:col-span-1' : ''}>
              <a
                href={`#${section.id}`}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  scrollTo(section.id);
                }}
                aria-current={isActive ? 'location' : undefined}
                className={`group flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-[0.72rem] font-medium transition-all duration-200 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-volt ${
                  isActive
                    ? `${colour.border} ${colour.bg} ${colour.text}`
                    : 'border-transparent text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <span aria-hidden="true" className={`font-mono text-[0.6rem] ${isActive ? colour.text : 'text-ink-muted'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="whitespace-nowrap">{section.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
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
