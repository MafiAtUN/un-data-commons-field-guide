import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * The site is served from https://<user>.github.io/un-data-commons-field-guide/.
 * `BASE_PATH` lets CI override it (e.g. "/" for a user/organisation root site)
 * without touching this file.
 */
const base = process.env.BASE_PATH ?? '/un-data-commons-field-guide/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
