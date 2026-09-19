import { useMemo, useState } from 'react';
import { CodeBlock } from './CodeBlock';
import {
  TOOL_LABELS,
  TOOL_LANGUAGES,
  buildRecipe,
  chooseEndpoint,
  type RecipeSpec,
  type Tool,
} from '../lib/undc/recipes';

const TOOLS: readonly Tool[] = ['curl', 'python', 'powerquery', 'r', 'julia', 'jq'];

/**
 * The same request, in whichever tool the reader actually uses.
 *
 * Six code samples stacked vertically would be five pages of scrolling past
 * languages nobody in the room writes. Tabbed, it is one sample and a row of
 * names — and the row itself does useful work, because it tells a Power BI user
 * that the Python person next to them is making the identical call.
 *
 * The endpoint line above the tabs is not decoration. "Which endpoint do I
 * call" is the question this whole component exists to stop people asking, so
 * the answer is stated once, in plain words, above every variant of it.
 */
export function RecipeTabs({
  spec,
  initialTool = 'curl',
  label,
}: {
  spec: RecipeSpec;
  initialTool?: Tool;
  /** Overrides the generated caption above the tabs. */
  label?: string;
}) {
  const [tool, setTool] = useState<Tool>(initialTool);
  const endpoint = useMemo(() => chooseEndpoint(spec), [spec]);
  const code = useMemo(() => buildRecipe(spec, tool), [spec, tool]);

  return (
    <div>
      <div className="rounded-t-lg border border-b-0 border-hairline bg-surface-1 p-4">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-volt">
          {label ?? 'The call'}
        </p>
        <p className="mt-1.5 font-mono text-[0.78rem] text-ink-primary">
          {endpoint.method} <span className="text-volt">{endpoint.path}</span>
        </p>
        <p className="mt-2 max-w-3xl text-[0.82rem] leading-relaxed text-ink-secondary">
          {endpoint.why}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Choose a tool"
        className="flex flex-wrap gap-1 border-x border-hairline bg-surface-1 px-2 pb-2"
      >
        {TOOLS.map((option) => {
          const selected = option === tool;
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTool(option)}
              className={`min-h-9 rounded px-3 text-[0.76rem] font-medium transition-colors ${
                selected
                  ? 'bg-volt text-surface-0'
                  : 'text-ink-secondary hover:bg-surface-2 hover:text-ink-primary'
              }`}
            >
              {TOOL_LABELS[option]}
            </button>
          );
        })}
      </div>

      <div className="[&>div]:rounded-t-none">
        <CodeBlock code={code} label={TOOL_LABELS[tool]} language={TOOL_LANGUAGES[tool]} />
      </div>
    </div>
  );
}
