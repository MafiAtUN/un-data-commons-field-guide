import { defineConfig } from 'vitest/config';

/**
 * Kept separate from vite.config.ts so the app build does not carry test
 * configuration, and so `tsc -b` type-checks both files against their own
 * config schema.
 *
 * `.tsx` is included for the one suite that renders components rather than
 * reasoning about their source. It needs no React plugin: that plugin exists
 * for Fast Refresh, which a test run has no use for, and Vite's own esbuild
 * transform already compiles JSX using the `jsx` setting from tsconfig. Adding
 * it here would also drag in a second copy of Vite's types — vitest 2 nests its
 * own — and fail `tsc -b` on a mismatched `Plugin`.
 *
 * There is no jsdom: `react-dom/server` renders to a string in plain Node,
 * which is enough to catch a component that throws on first paint and to assert
 * the markup contracts — roving tabindex, `aria-hidden` stages, the static text
 * behind an animation — that are otherwise only verifiable by eye.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
