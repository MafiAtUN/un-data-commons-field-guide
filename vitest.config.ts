import { defineConfig } from 'vitest/config';

/**
 * Kept separate from vite.config.ts so the app build does not carry test
 * configuration, and so `tsc -b` type-checks both files against their own
 * config schema.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
