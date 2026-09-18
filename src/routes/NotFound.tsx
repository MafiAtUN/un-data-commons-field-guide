import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="font-mono text-[0.8rem] text-ink-muted">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-ink-primary">That page isn't here</h1>
      <p className="mx-auto mt-3 max-w-md text-[0.9rem] leading-relaxed text-ink-secondary">
        The guide has six sections. The Prompt Lab is the one to start with if you are not
        sure which you wanted.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded bg-volt px-4 py-2 text-[0.82rem] font-semibold text-surface-0"
        >
          Back to the start
        </Link>
        <Link
          to="/lab"
          className="rounded border border-hairline px-4 py-2 text-[0.82rem] font-medium text-ink-secondary hover:text-ink-primary"
        >
          Open the Prompt Lab
        </Link>
      </div>
    </div>
  );
}
