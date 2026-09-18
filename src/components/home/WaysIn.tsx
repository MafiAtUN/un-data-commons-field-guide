import { Link } from 'react-router-dom';
import { API_ROOT, SITE_ROOT, searchUrl } from '../../lib/undc/config';
import { Reveal } from '../Reveal';

/**
 * The three public surfaces, and the door to each.
 *
 * This guide's job is to get people onto the platform, not to stand in for it,
 * so every card here leaves: the primary action on each one opens data.un.org.
 * The secondary link is the chapter of this guide that explains what you are
 * about to be looking at.
 *
 * All three are verified against the live deployment and none requires
 * credentials, which is the single most surprising fact about the platform and
 * the reason it is worth a guide at all.
 */
const WAYS = [
  {
    name: 'Ask',
    line: 'Type a question in plain English. The URL is shareable, so a colleague opens exactly what you saw.',
    endpoint: `${SITE_ROOT}/search?q=…`,
    note: 'Deep-linkable',
    external: searchUrl('child mortality in Bangladesh'),
    externalLabel: 'Try a real question',
    to: '/start',
    toLabel: 'How to ask well',
  },
  {
    name: 'Query',
    line: 'A REST v2 graph and observation API, served cross-origin. No key, no quota, no registration.',
    endpoint: `${API_ROOT}/core/api/v2`,
    note: 'CORS: *',
    external: 'https://data.un.org/undatacommons/docs/getting-started',
    externalLabel: 'Official docs',
    to: '/cookbook',
    toLabel: 'Copy-paste recipes',
  },
  {
    name: 'Delegate',
    line: 'A streamable MCP endpoint, so an AI assistant reads authoritative UN statistics instead of its own recall.',
    endpoint: `${API_ROOT}/mcp`,
    note: '6 tools, 3 playbooks',
    external: 'https://data.un.org/undatacommons/docs',
    externalLabel: 'Platform docs',
    to: '/connect',
    toLabel: 'Point an agent at it',
  },
] as const;

export function WaysIn() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {WAYS.map((way, index) => (
        <Reveal key={way.name} delay={index * 90}>
          <article className="group flex h-full flex-col rounded-xl border border-hairline bg-surface-1 p-6 transition-colors hover:border-volt/40">
            {/* Deliberately unnumbered. The chapter index further down this
                same page numbers 01 to 12, and two numbering systems on one
                page make the reader work out that they are unrelated. */}
            <h3 className="text-[1.45rem] font-semibold leading-none text-ink-primary">
              {way.name}
            </h3>

            <p className="mt-3 flex-1 text-[0.86rem] leading-relaxed text-ink-secondary">
              {way.line}
            </p>

            <p className="mt-5 overflow-x-auto rounded-lg border border-hairline bg-surface-0 px-3 py-2.5 font-mono text-[0.68rem] text-ink-muted">
              {way.endpoint}
            </p>
            <p className="mt-1.5 text-[0.66rem] uppercase tracking-[0.12em] text-volt/70">
              {way.note}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline pt-4">
              <a
                href={way.external}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[0.8rem] font-medium text-volt underline decoration-volt/30 underline-offset-4 hover:decoration-volt"
              >
                {way.externalLabel} ↗
              </a>
              <Link
                to={way.to}
                className="text-[0.8rem] text-ink-muted underline decoration-hairline underline-offset-4 hover:text-ink-secondary hover:decoration-volt"
              >
                {way.toLabel}
              </Link>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
