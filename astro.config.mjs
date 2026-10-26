// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { MOVED } from './src/lib/moved.mjs';

const base = process.env.BASE_PATH ?? '/un-data-commons-field-guide';
const site = 'https://mafiatun.github.io';
/** The old addresses only forward (and say noindex), so they stay out of the sitemap. */
const forwarding = new Set(Object.keys(MOVED).map((path) => `${site}${base.replace(/\/$/, '')}${path}/`));

/**
 * The site is served from https://mafiatun.github.io/un-data-commons-field-guide/.
 * `BASE_PATH` lets CI override it (for example "/" on a custom domain) without
 * touching this file.
 *
 * Every page is static HTML. React runs only inside the islands that need it:
 * the Data Finder, the charts, the Prompt Lab and the other interactive tools.
 */
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Astro 7 defaults to JSX-style whitespace, which joins inline elements that
  // sit on separate lines. Prose here relies on HTML's usual collapsing.
  compressHTML: true,
  integrations: [react(), sitemap({ filter: (page) => !forwarding.has(page) })],
  vite: { plugins: [tailwindcss()] },
});
