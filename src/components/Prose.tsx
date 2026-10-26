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
      {eyebrow && <p className="text-meta font-semibold text-ink-muted">{eyebrow}</p>}
      <h1 className="mt-2 text-balance font-display text-h2 font-semibold text-ink-primary sm:text-h1">
        {title}
      </h1>
      {lead && <div className="mt-4 max-w-measure text-lead text-ink-secondary">{lead}</div>}
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
      <h2 className="font-display text-title font-semibold text-ink-primary">{title}</h2>
      {lead && <div className="mt-2 max-w-measure text-body text-ink-secondary">{lead}</div>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** A short highlighted takeaway, used to close a worked example. */
export function Takeaway({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-r-xl border-l-2 border-volt-line bg-surface-1 p-4">
      <p className="text-meta font-semibold text-ink-primary">Takeaway</p>
      <div className="mt-1.5 text-body text-ink-secondary">{children}</div>
    </div>
  );
}

/**
 * A note written as a plain string, with `code` and *emphasis* marked the
 * Markdown way, so the backticks never reach the reader.
 */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`|\*[^*\s][^*]*\*)/).map((part, index) =>
        part.length > 2 && part.startsWith('`') && part.endsWith('`') ? (
          <code key={index} className="font-mono text-[0.92em] text-ink-primary">
            {part.slice(1, -1)}
          </code>
        ) : part.length > 2 && part.startsWith('*') && part.endsWith('*') ? (
          <em key={index}>{part.slice(1, -1)}</em>
        ) : (
          part
        ),
      )}
    </>
  );
}
