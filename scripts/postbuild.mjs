/**
 * Give GitHub Pages an SPA fallback.
 *
 * Pages serves `404.html` for any path it has no file for. Because the app is a
 * single-page bundle that reads the current URL itself, copying `index.html` to
 * `404.html` is enough to make a deep link such as
 * /un-data-commons-field-guide/cookbook load correctly on a cold visit —
 * no redirect hack, no hash routing, and the URL the reader shared is the URL
 * that stays in the address bar.
 *
 * Also writes `.nojekyll`, without which Pages would refuse to serve the
 * `_`-prefixed files a bundler can emit.
 */

import { copyFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');

await copyFile(resolve(dist, 'index.html'), resolve(dist, '404.html'));
await writeFile(resolve(dist, '.nojekyll'), '');

console.log('postbuild: wrote dist/404.html and dist/.nojekyll');
