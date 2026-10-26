import { defineConfig } from 'vitest/config';

/** Checks on the built site in dist/. Run after `npm run build`. */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/site/**/*.test.ts'],
  },
});
