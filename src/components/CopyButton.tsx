import { useState } from 'react';

interface CopyButtonProps {
  label: string;
  value: string;
  hint?: string;
}

/** Copy to clipboard with confirmation, degrading quietly where it is blocked. */
export function CopyButton({ label, value, hint }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 1800);
  }

  return (
    <div>
      <button
        type="button"
        onClick={copy}
        className="rounded border border-hairline px-3 py-1.5 text-[0.78rem] font-medium text-ink-secondary transition-colors hover:border-volt/50 hover:text-ink-primary"
      >
        {state === 'copied' ? 'Copied ✓' : state === 'failed' ? 'Press Ctrl/Cmd+C' : label}
      </button>
      {hint && <p className="mt-1.5 text-[0.72rem] leading-relaxed text-ink-muted">{hint}</p>}
      {state === 'failed' && (
        <textarea
          readOnly
          value={value}
          rows={4}
          onFocus={(event) => event.currentTarget.select()}
          className="mt-2 w-full rounded border border-hairline bg-surface-0 p-2 font-mono text-[0.7rem] text-ink-secondary"
        />
      )}
    </div>
  );
}
