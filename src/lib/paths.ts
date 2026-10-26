import { MOVED as MOVED_PAGES } from './moved.mjs';

/**
 * Every internal address goes through here, so the base path the site is
 * served under (/un-data-commons-field-guide/ on GitHub Pages) is added in one
 * place and nowhere else.
 */
export const BASE: string = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

/**
 * Addresses from before the redesign, and where each page lives now. The
 * guide pages still link to each other by their old paths, and every old
 * address is published as a page that forwards to the new one.
 */
export const MOVED: Readonly<Record<string, string>> = MOVED_PAGES;

/** True for anything that leaves the site or stays on the page. */
function isExternal(to: string): boolean {
  return /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(to);
}

/**
 * A site path, with the base added and any old address translated.
 *
 *   url('/courses/find/')     → /un-data-commons-field-guide/courses/find/
 *   url('/notebooks#undata')  → /un-data-commons-field-guide/guides/python-r-julia/#undata
 */
export function url(to: string): string {
  if (isExternal(to)) return to;
  const [pathAndQuery = '', hash = ''] = to.split(/(?=#)/);
  const [path = '', query = ''] = pathAndQuery.split(/(?=\?)/);
  const trimmed = path.replace(/\/+$/, '') || '/';
  let target = MOVED[trimmed] ?? path;
  if (target === '' || target === '/') target = '/';
  else if (!/\.[a-z0-9]+$/i.test(target) && !target.endsWith('/')) target = `${target}/`;
  return `${BASE}${target.replace(/^\//, '')}${query}${hash}`;
}
