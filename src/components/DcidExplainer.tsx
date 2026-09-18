import { useMemo, useState } from 'react';
import { AGENCY_LABELS, buildDcid, parseDcid } from '../lib/undc/dcid';

const EXAMPLES = [
  'undata/sdg/VC_DTH_TOTN.AGE--Y0T17__SEX--F',
  'undata/unodc/VIC_HOM_RT',
  'undata/undphdro/HDI_hdi.SEX--F',
  'undata/unicef/ED_CR.EDUCATION_LEVEL--ISCED11_1__SCHOOL_AGE--L1',
  'undata/sdg/SH_STA_MORT.SEX--F',
] as const;

/**
 * Interactive breakdown of a variable identifier.
 *
 * Runs the same `parseDcid` the rest of the site uses, so what a reader sees here
 * is not an illustration of the grammar — it is the parser's actual output.
 */
export function DcidExplainer() {
  const [input, setInput] = useState<string>(EXAMPLES[0]);
  const parsed = useMemo(() => parseDcid(input), [input]);

  // Round-tripping proves the grammar is understood, not just described: if the
  // rebuilt identifier differs, the difference is the dimension ordering the
  // graph normalises — worth showing rather than hiding.
  const rebuilt = useMemo(
    () => (parsed ? buildDcid(parsed.base, parsed.dimensions) : undefined),
    [parsed],
  );

  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-5">
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setInput(example)}
            aria-pressed={input === example}
            className={`rounded border px-2.5 py-1 font-mono text-[0.7rem] transition-colors ${
              input === example
                ? 'border-volt/60 bg-volt/10 text-ink-primary'
                : 'border-hairline text-ink-muted hover:text-ink-secondary'
            }`}
          >
            {example.split('/').pop()}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="text-[0.72rem] font-semibold uppercase tracking-wide text-ink-muted">
          Paste any variable identifier
        </span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          className="mt-1.5 w-full rounded border border-hairline bg-surface-0 px-3 py-2 font-mono text-[0.8rem] text-ink-primary"
        />
      </label>

      {parsed ? (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[0.85rem]">
            <Part label="namespace" value={parsed.namespace} color="var(--color-series-3)" />
            <span className="text-ink-muted">/</span>
            <Part
              label={AGENCY_LABELS[parsed.agency] ?? 'collection'}
              value={parsed.agency}
              color="var(--color-series-1)"
            />
            <span className="text-ink-muted">/</span>
            <Part label="series code" value={parsed.code} color="var(--color-series-4)" />
            {parsed.dimensions.map((dimension, index) => (
              <span key={dimension.dimension} className="flex items-center gap-1.5">
                <span className="text-ink-muted">{index === 0 ? '.' : '__'}</span>
                <Part
                  label={`filter · ${dimension.dimension}`}
                  value={`${dimension.dimension}--${dimension.value}`}
                  color="var(--color-series-5)"
                />
              </span>
            ))}
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact term="Undisaggregated parent" detail={parsed.base} mono />
            <Fact
              term="Dimension filters"
              detail={
                parsed.isTotal
                  ? 'none — this is the total series'
                  : parsed.dimensions.map((d) => `${d.dimension} = ${d.value}`).join(', ')
              }
            />
            <Fact
              term="Contributing collection"
              detail={AGENCY_LABELS[parsed.agency] ?? parsed.agency}
            />
            <Fact
              term="Rebuilt from its parts"
              detail={rebuilt === input ? 'identical ✓' : (rebuilt ?? '—')}
              mono
            />
          </dl>

          {parsed.isTotal && (
            <p className="rounded border border-hairline bg-surface-0 p-3 text-[0.8rem] leading-relaxed text-ink-secondary">
              No dimension filters, so this is the total series — <em>usually</em>. A handful of
              indicators are published only as a slice, and their bare code returns nothing:
              maternal mortality exists solely as{' '}
              <code className="text-volt">undata/sdg/SH_STA_MORT.SEX--F</code>. Confirm before
              you rely on it.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-5 text-[0.82rem] text-ink-muted">
          Not a recognisable identifier. These have at least three slash-separated
          segments, e.g. <code>undata/sdg/VC_DTH_TOTN</code>.
        </p>
      )}
    </div>
  );
}

function Part({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span className="group relative inline-flex flex-col items-center">
      <span
        className="rounded px-1.5 py-0.5 text-ink-primary"
        style={{ background: `color-mix(in oklab, ${color} 22%, transparent)` }}
      >
        {value}
      </span>
      <span
        className="mt-1 font-sans text-[0.62rem] uppercase tracking-wide"
        style={{ color }}
      >
        {label}
      </span>
    </span>
  );
}

function Fact({ term, detail, mono = false }: { term: string; detail: string; mono?: boolean }) {
  return (
    <div className="rounded border border-hairline bg-surface-0 p-3">
      <dt className="text-[0.68rem] font-semibold uppercase tracking-wide text-ink-muted">{term}</dt>
      <dd
        className={`mt-1 break-all text-[0.78rem] text-ink-secondary ${mono ? 'font-mono' : ''}`}
      >
        {detail}
      </dd>
    </div>
  );
}
