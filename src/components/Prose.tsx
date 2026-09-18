import type { ReactNode } from 'react';

/** Page heading with a standing subtitle. */
export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
}) {
  return (
    <header className="max-w-3xl">
      {eyebrow && (
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-volt">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 text-balance text-3xl font-semibold leading-tight tracking-tight text-ink-primary sm:text-4xl">
        {title}
      </h1>
      {lead && (
        <div className="mt-4 text-[0.95rem] leading-relaxed text-ink-secondary">{lead}</div>
      )}
    </header>
  );
}

/** A titled section with consistent rhythm. */
export function Section({
  title,
  lead,
  children,
  id,
}: {
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mt-14 scroll-mt-20">
      <h2 className="text-xl font-semibold tracking-tight text-ink-primary">{title}</h2>
      {lead && (
        <div className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-ink-secondary">{lead}</div>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** A short highlighted takeaway, used to close a worked example. */
export function Takeaway({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border-l-2 border-volt bg-surface-1 p-4">
      <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-volt">Takeaway</p>
      <div className="mt-2 text-[0.88rem] leading-relaxed text-ink-secondary">{children}</div>
    </div>
  );
}
