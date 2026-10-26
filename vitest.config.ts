import { defineConfig } from 'vitest/config';

/**
 * Unit tests: no network, no browser, no build. `react-dom/server` renders the
 * guide pages to a string in plain Node, which is enough to pin the claims they
 * make about the platform.
 *
 * The checks on the built site live in tests/site/ and run after `npm run
 * build` with vitest.site.config.ts.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['tests/site/**', 'node_modules/**'],
  },
});
