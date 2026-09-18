import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  /** Shown above the block, e.g. "curl" or "Claude Desktop config". */
  label?: string;
  language?: string;
}

/** A copyable code sample. Copy-to-clipboard degrades to a selectable block. */
export function CodeBlock({ code, label, language = 'bash' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be blocked; the text remains selectable.
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-hairline bg-surface-0">
      <div className="flex items-center justify-between gap-3 border-b border-hairline bg-surface-1 px-3 py-1.5">
        <span className="font-mono text-[0.68rem] uppercase tracking-wide text-ink-muted">
          {label ?? language}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded px-2 py-0.5 text-[0.7rem] font-medium text-ink-secondary transition-colors hover:text-ink-primary"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-[0.74rem] leading-relaxed text-ink-secondary">
        <code>{code}</code>
      </pre>
    </div>
  );
}
