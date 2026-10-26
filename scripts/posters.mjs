/**
 * Title cards for the data.un.org series, 1280×720, one per lesson.
 *
 *   npm run posters
 *
 * The undata series already has designed thumbnails, made by its video
 * pipeline. These follow the same grammar, so the two series sit together in
 * one library: big type, one idea, and one real figure from the video on a card
 * to the right. Every figure here is one the narration states.
 *
 * Needs Playwright. A global install is enough; Chromium renders the cards.
 * The output goes to src/assets/posters/, where Astro turns each card into the
 * AVIF, WebP and JPEG sizes the pages ask for. Upload the same files to YouTube
 * as the videos' thumbnails, so the site and the channel match.
 */

import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/assets/posters');
const LESSONS = join(ROOT, 'src/content/lessons');

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const require = createRequire(import.meta.url);
    for (const prefix of ['/opt/homebrew/lib/node_modules', '/usr/local/lib/node_modules']) {
      try {
        return require(join(prefix, 'playwright'));
      } catch {
        // try the next prefix
      }
    }
    throw new Error('Playwright is not installed. Run `npm i -g playwright && npx playwright install chromium`.');
  }
}

const font = (pkg, file) =>
  `url(data:font/woff2;base64,${readFileSync(join(ROOT, 'node_modules', pkg, 'files', file)).toString('base64')})`;

const CSS = `
@font-face { font-family: Inter; src: ${font('@fontsource-variable/inter', 'inter-latin-wght-normal.woff2')}; font-weight: 100 900; }
@font-face { font-family: JB; src: ${font('@fontsource-variable/jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2')}; font-weight: 100 800; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1280px; height: 720px; overflow: hidden; font-family: Inter; color: #EEF3FA; -webkit-font-smoothing: antialiased;
  background: radial-gradient(90% 90% at 82% 8%, rgba(0,158,219,.30), transparent 60%), radial-gradient(70% 80% at 0% 100%, rgba(45,212,191,.16), transparent 60%), #04070E; }
.grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(170,200,240,.16) 1.2px, transparent 1.4px); background-size: 28px 28px; -webkit-mask-image: linear-gradient(90deg, transparent, #000 60%); }
.top { position: absolute; left: 56px; top: 48px; display: flex; gap: 14px; align-items: center; }
.mark { width: 46px; height: 46px; border-radius: 12px; background: linear-gradient(135deg, #009EDB, #2DD4BF); display: grid; place-items: center; }
.mark i { width: 18px; height: 18px; border: 4px solid #04111C; border-radius: 50%; position: relative; left: -2px; top: -2px; }
.mark i::after { content: ""; position: absolute; width: 4px; height: 10px; background: #04111C; border-radius: 2px; right: -7px; bottom: -9px; transform: rotate(-45deg); }
.nm { font-size: 34px; font-weight: 800; letter-spacing: -.02em; }
.ep { font-family: JB; font-size: 22px; font-weight: 800; color: #06111D; background: #FFB547; padding: 6px 12px; border-radius: 8px; margin-left: 6px; }
h1 { position: absolute; left: 56px; top: 186px; width: 640px; font-size: 100px; line-height: .98; font-weight: 900; letter-spacing: -.05em; }
h1 .a { color: #FFB547; }
.sub { position: absolute; left: 58px; bottom: 58px; width: 660px; font-size: 29px; font-weight: 600; color: #A9B8CF; line-height: 1.25; }
.card { position: absolute; right: 50px; top: 50%; transform: translateY(-50%); width: 480px; border-radius: 22px; background: rgba(13,21,38,.92); border: 1px solid rgba(148,178,220,.2); box-shadow: 0 40px 90px rgba(0,0,0,.6); padding: 30px 32px; }
.big { font-size: 118px; font-weight: 900; letter-spacing: -.05em; line-height: 1; }
.lbl { font-size: 24px; color: #A9B8CF; font-weight: 600; margin-top: 10px; line-height: 1.3; }
.lbl b { color: #EEF3FA; }
.mono { font-family: JB; }
.search { display: flex; align-items: center; gap: 12px; height: 64px; padding: 0 10px 0 22px; border-radius: 32px; background: #0B1424; border: 1px solid rgba(148,178,220,.28); font-family: JB; font-size: 23px; }
.chip { margin-left: auto; height: 46px; padding: 0 18px; border-radius: 23px; display: grid; place-items: center; font-family: Inter; font-weight: 800; font-size: 21px; }
.chip.bad { border: 3px solid #F87171; background: rgba(248,113,113,.14); color: #FECACA; }
.chip.ok { border: 3px solid #4ADE80; background: rgba(74,222,128,.12); color: #BBF7D0; }
.tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.tile { border-radius: 14px; background: #0B1424; border: 1px solid rgba(148,178,220,.2); padding: 16px 18px; height: 120px; display: flex; flex-direction: column; justify-content: space-between; }
.tile b { font-size: 24px; } .tile span { font-family: JB; font-size: 15px; color: #8FA3BD; }
.rank { display: grid; gap: 12px; }
.rank div { display: grid; grid-template-columns: 1fr 86px; gap: 14px; align-items: center; }
.rank i { display: block; height: 30px; border-radius: 6px; background: #38BDF8; }
.rank span { font-family: JB; font-size: 22px; font-weight: 700; text-align: right; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.two .big { font-size: 70px; }
.cols { font-family: JB; font-size: 19px; line-height: 2.1; }
.cols b { color: #FFB547; font-weight: 700; }
.strike { text-decoration: line-through; text-decoration-color: #F87171; text-decoration-thickness: 4px; color: #8FA3BD; }
.code { font-family: JB; font-size: 22px; line-height: 1.6; color: #DCE6F5; white-space: pre-wrap; word-break: break-all; }
.code .op { color: #FFB547; }
`;

/** One right-hand card per lesson, keyed by the series number. */
const CARDS = {
  1: `<div class="big">115</div><div class="lbl">per 100,000 live births · <b>2023</b></div><div class="lbl">Source: <b>Global SDG Database</b></div>`,
  2: `<div class="search">homicide rate<span class="chip bad">World</span></div><div class="lbl" style="margin-top:22px">You named no place, so it chose one</div><div class="search" style="margin-top:22px">homicide rate in Kenya<span class="chip ok">Kenya</span></div>`,
  3: `<div class="tiles"><div class="tile"><b>Headline</b><span>the figure to quote</span></div><div class="tile"><b>Trend</b><span>good news or bad</span></div><div class="tile"><b>Map</b><span>where it sits</span></div><div class="tile"><b>Ranking</b><span>the numbers</span></div></div>`,
  4: `<div class="rank"><div><i style="width:92%"></i><span>2024</span></div><div><i style="width:78%"></i><span>2016</span></div><div><i style="width:66%"></i><span>2021</span></div><div><i style="width:51%"></i><span>2009</span></div><div><i style="width:39%"></i><span>2019</span></div></div><div class="lbl">One ranking, years apart</div>`,
  5: `<div class="lbl" style="margin:0 0 14px">Afghanistan, same page, same indicator</div><div class="two"><div><div class="big">520.5</div><div class="lbl">Global SDG Database</div></div><div><div class="big">620.4</div><div class="lbl">UNDP Human Development Report Office</div></div></div>`,
  6: `<div class="cols">Entity DCID<br><b>Variable DCID</b><br>Value · Unit · Date<br><b>provenanceUrl</b></div><div class="lbl">The two columns to keep</div>`,
  7: `<div class="lbl" style="margin:0 0 6px">Source</div><div class="big" style="font-size:52px;line-height:1.1">Global SDG Database</div><div class="lbl" style="margin-top:22px"><span class="strike">data.un.org</span> is how you found it</div>`,
  8: `<div class="search" style="font-size:20px">data.un.org/search?q=…<span class="chip ok">Link</span></div><div class="lbl" style="margin-top:22px">Re-runs the query: shows what is true today</div><div class="search" style="margin-top:22px;font-size:20px">screenshot.png<span class="chip bad">Stale</span></div>`,
  9: `<div class="big">752</div><div class="lbl">indicators under <b>Health</b> alone</div><div class="lbl">Adolescent birth rate: <b>4 agencies</b></div>`,
  10: `<div class="big">17</div><div class="lbl">goals, each re-scoped to <b>your country</b> with one chip</div>`,
  11: `<div class="code">africa<span class="op">&lt;-</span>containedInPlace<span class="op">+</span><br>{typeOf:Country}</div><div class="big" style="font-size:96px;margin-top:18px">37</div><div class="lbl">countries, one request, no key</div>`,
  12: `<div class="big">115.11</div><div class="lbl">fetched by the assistant, with its <b>unit</b> and <b>publisher</b></div>`,
};

const TITLES = {
  1: ['Your first <span class="a">number</span>', 'Figure, year, producer: a sentence you can defend'],
  2: ['The chip that <span class="a">decides</span>', 'Name the place, every time'],
  3: ['Read a <span class="a">result</span>', 'Headline, trend, map, ranking'],
  4: ['<span class="a">Latest</span> is not a year', 'A ranking can span a decade'],
  5: ['Two agencies, <span class="a">two numbers</span>', 'Both are official. Pick one and name it'],
  6: ['Download the <span class="a">metadata</span>', 'Keep the identifier and the provenance URL'],
  7: ['Cite the <span class="a">agency</span>', 'data.un.org is the route, not the source'],
  8: ['Share the <span class="a">query</span>', 'A link stays current. A screenshot does not'],
  9: ['Browse by <span class="a">theme</span>', 'When you only know the topic'],
  10: ['Your country’s <span class="a">SDG page</span>', 'Two clicks, one shareable profile'],
  11: ['The REST API, <span class="a">no key</span>', 'One request, a whole region'],
  12: ['Point an <span class="a">AI</span><br>at it', 'It fetches the figure instead of recalling one'],
};

function lessons() {
  const found = [];
  for (const course of readdirSync(LESSONS)) {
    for (const file of readdirSync(join(LESSONS, course))) {
      const lesson = JSON.parse(readFileSync(join(LESSONS, course, file), 'utf8'));
      if (lesson.series.name === 'data.un.org') found.push(lesson);
    }
  }
  return found.sort((a, b) => a.series.number - b.series.number);
}

function page(lesson) {
  const n = lesson.series.number;
  const [h1, sub] = TITLES[n];
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="grid"></div>
<div class="top"><div class="mark"><i></i></div><div class="nm">data.un.org</div><div class="ep">${String(n).padStart(2, '0')}</div></div>
<h1>${h1}</h1>
<div class="sub">${sub}</div>
<div class="card">${CARDS[n]}</div>
</body></html>`;
}

/** The card a link to the site itself shows: the home page and any page without a poster. */
function siteCard(all) {
  const count = (course) => all.filter((l) => l.course === course || (l.also ?? []).some((a) => a.course === course)).length;
  const row = (name, n) => `<div style="display:flex;justify-content:space-between;gap:20px;padding:14px 0;border-top:1px solid rgba(148,178,220,.18)"><span style="font-size:25px;font-weight:700">${name}</span><span class="mono" style="font-size:22px;color:#A9B8CF">${n} lessons</span></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
.brand { position: absolute; left: 56px; top: 48px; display: flex; gap: 14px; align-items: center; }
.brand b { width: 46px; height: 46px; border-radius: 13px; background: #C8F531; display: grid; place-items: center; }
.brand b::after { content: ""; margin-left: 4px; border-left: 16px solid #141419; border-top: 10px solid transparent; border-bottom: 10px solid transparent; }
</style></head><body>
<div class="grid"></div>
<div class="brand"><b></b><div class="nm">UN Data Commons <span style="color:#A9B8CF;font-weight:600">Field Guide</span></div></div>
<h1 style="top:200px;width:600px;font-size:92px">Learn UN data in <span class="a">two-minute videos</span></h1>
<div class="sub">data.un.org and the undata Python package</div>
<div class="card" style="padding:18px 32px 12px">${row('Find it on data.un.org', count('find'))}${row('Analyse it in Python', count('analyse'))}${row('Present it in your tools', count('present'))}${row('Automate it', count('automate'))}</div>
</body></html>`;
}

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
mkdirSync(OUT, { recursive: true });
for (const lesson of lessons()) {
  await tab.setContent(page(lesson), { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  const file = join(OUT, lesson.poster);
  await tab.screenshot({ path: file, type: 'jpeg', quality: 88 });
  console.log(file);
}
const everything = [];
for (const course of readdirSync(LESSONS)) {
  for (const file of readdirSync(join(LESSONS, course))) everything.push(JSON.parse(readFileSync(join(LESSONS, course, file), 'utf8')));
}
await tab.setContent(siteCard(everything), { waitUntil: 'load' });
await tab.evaluate(() => document.fonts.ready);
await tab.screenshot({ path: join(ROOT, 'src/assets/site-card.jpg'), type: 'jpeg', quality: 88 });
console.log(join(ROOT, 'src/assets/site-card.jpg'));
await browser.close();
