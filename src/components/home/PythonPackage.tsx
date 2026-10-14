import { Link } from 'react-router-dom';
import { Reveal } from '../Reveal';

/**
 * The fourth way in, which is not the platform's own.
 *
 * The three cards above are surfaces the UN publishes. undata is an unofficial
 * Python package that wraps them, so it sits beside them rather than among them:
 * same chapter, its own panel, and it says plainly that it is unofficial.
 */
export function PythonPackage() {
  return (
    <Reveal delay={270}>
      <aside className="mt-4 flex flex-col gap-5 rounded-xl border border-volt/30 bg-volt/[0.05] p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-volt">
            Work in Python? There is a package
          </p>
          <h3 className="mt-2 text-[1.2rem] font-semibold leading-snug text-ink-primary">
            undata: type a country's name, get a table
          </h3>
          <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-secondary">
            An unofficial Python package built on this guide's findings. UN names, regions
            and groups, the source and year on every value, the SDG progress assessment,
            publication-ready charts and Excel export, plus a connector so an AI assistant
            can use it.
          </p>
          <p className="mt-4 overflow-x-auto rounded-lg border border-hairline bg-surface-0 px-3 py-2.5 font-mono text-[0.72rem] text-ink-secondary">
            pip install undata
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2.5 text-[0.82rem]">
          <a
            href="https://nerd-factory.github.io/undata/"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-volt underline decoration-volt/30 underline-offset-4 hover:decoration-volt"
          >
            Twelve use cases, with real output ↗
          </a>
          <a
            href="https://pypi.org/project/undata/"
            target="_blank"
            rel="noreferrer noopener"
            className="text-volt underline decoration-volt/30 underline-offset-4 hover:decoration-volt"
          >
            On PyPI ↗
          </a>
          <Link
            to="/notebooks#undata"
            className="text-ink-muted underline decoration-hairline underline-offset-4 hover:text-ink-secondary hover:decoration-volt"
          >
            How it compares to writing the calls yourself
          </Link>
        </div>
      </aside>
    </Reveal>
  );
}
