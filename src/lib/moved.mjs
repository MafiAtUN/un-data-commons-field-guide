/**
 * Addresses from before the redesign, and where each page lives now.
 *
 * Plain JavaScript so that both the site (src/lib/paths.ts) and the build
 * configuration (astro.config.mjs, which keeps these out of the sitemap) read
 * the same list.
 */
export const MOVED = Object.freeze({
  '/start': '/guides/five-behaviours/',
  '/tutorials': '/guides/walkthroughs/',
  '/watch': '/videos/',
  '/toolkit': '/tools/finder/',
  '/cite': '/tools/cite/',
  '/lab': '/tools/prompt-lab/',
  '/visualise': '/guides/charts/',
  '/ai': '/guides/ai-prompts/',
  '/catalogue': '/guides/catalogue/',
  '/cookbook': '/guides/api/',
  '/notebooks': '/guides/python-r-julia/',
  '/dashboards': '/guides/power-bi/',
  '/connect': '/guides/mcp/',
  '/peace-and-security': '/guides/cases/peace-and-security/',
  '/development': '/guides/cases/development/',
  '/scenarios': '/guides/cases/scenarios/',
});
