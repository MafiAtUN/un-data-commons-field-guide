/**
 * Make every route a real URL on GitHub Pages.
 *
 * Pages serves static files only, so a single-page bundle has two options for
 * deep links. The common one is to copy `index.html` to `404.html` and let the
 * not-found handler serve the app: it renders, but the response carries HTTP
 * 404. Browsers do not mind. Search engines and social-preview crawlers do —
 * a link shared to LinkedIn or Slack may get no preview card at all.
 *
 * So instead each known route is emitted as its own `index.html`. Pages then
 * answers /cookbook with a 200, the bundle reads the URL and renders the right
 * page, and the address the reader shared stays in the address bar.
 *
 * `404.html` is still written, as the fallback for paths that genuinely do not
 * exist — the app renders its NotFound page for those.
 *
 * `.nojekyll` stops Pages from discarding the `_`-prefixed files a bundler can
 * emit.
 */

import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Routes to materialise. Must stay in step with the router in `src/App.tsx`;
 * `tests/routes.test.ts` asserts that it does, because this file is plain Node
 * and cannot import the app's TypeScript.
 */
const ROUTES = [
  'start',
  'tutorials',
  'watch',
  'toolkit',
  'visualise',
  'cite',
  'ai',
  'lab',
  'peace-and-security',
  'development',
  'cookbook',
  'dashboards',
  'notebooks',
  'connect',
  'catalogue',
];

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const index = resolve(dist, 'index.html');

for (const route of ROUTES) {
  const directory = resolve(dist, route);
  await mkdir(directory, { recursive: true });
  await copyFile(index, resolve(directory, 'index.html'));
}

await copyFile(index, resolve(dist, '404.html'));
await writeFile(resolve(dist, '.nojekyll'), '');

console.log(
  `postbuild: ${ROUTES.length} routes materialised, plus 404.html and .nojekyll`,
);
