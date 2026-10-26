# UN Data Commons Field Guide

> A [**Nerd Lab**](https://nerd-factory.github.io/nerd-lab/) product.
> *Unnecessarily clever. Occasionally useful.*

Short video lessons for the **[UN System Data Commons](https://data.un.org)**, the platform
launched on 17 September 2026 that joins the public statistics of 26 UN System entities into one
knowledge graph, and for **[undata](https://pypi.org/project/undata/)**, the Python package for it.

Every lesson is a video of one to two and a half minutes with its text twin beside it: chapters, a
transcript that follows playback, and the exact query or code to try. Twenty-three lessons, about
35 minutes, in four courses.

**→ [mafiatun.github.io/un-data-commons-field-guide](https://mafiatun.github.io/un-data-commons-field-guide/)**

---

## What's in it

| Course | For | Lessons |
|---|---|---|
| **Find it on data.un.org** | Anyone who needs a figure for a report. No code. | 10 |
| **Analyse it in Python** | Anyone who can open a notebook, including Colab with nothing to install. | 6 |
| **Present it in the tools you use** | Whoever makes the chart, the slide or the first draft: Excel, Flourish, PowerPoint, Copilot, R. | 5 |
| **Automate it** | Developers, and anyone connecting an AI assistant: the REST API and MCP. | 3 |

The header has four sections: **Courses**, **Videos** (every video, filtered by course or tool and
searchable by what is said in them), **undata** (install, Colab, a cheat sheet, the Claude
connector and twelve use cases) and **Guides** (the reference behind the videos, the worked cases
and four live tools). One search, on ⌘K or `/`, covers every page and every transcript; a match
inside a video opens the lesson at the moment the words are said.

A lesson page has six parts, in this order: the video, its chapters, *Try it yourself*, the
transcript, the course list, and the way on. Progress (where you stopped, what you finished) is
kept in the browser and nowhere else, and shows on the home page, the course pages and the cards.

Every address from the previous version of the site still works: each one is a small page that
forwards to where the content lives now, keeping any `#section`.

## The finding that started it

The resolver always commits to a place. If your question does not contain one it
recognises, it supplies one silently — and it does not distinguish between "you gave me no
place" and "you gave me a place I do not know".

The second case is the dangerous one. Verified against the live deployment on
18 September 2026:

```
POST /api/explore/detect-and-fulfill?q=child mortality in Bengal
→ place: country/USA          ← you named a place; it was discarded

POST /api/explore/detect-and-fulfill?q=child mortality in Bangladesh
→ place: country/BGD          ← ask exactly and it is exact
```

Both return charts titled "Total Child Mortality, by Age". Nothing on the first one says
it is about the United States. Screenshot it into a brief and the error is yours, and
invisible.

The home page gives this as its one warning, lesson 2 of *Find* shows it on screen, and the
Prompt Lab makes both hidden decisions visible on any query you like. [`tests/resolution.test.ts`](tests/resolution.test.ts) pins the
behaviour against a recorded response — the bare word `violence`, which resolves to
`country/USA` the same way.

## The finding that cost the most debugging

Any line break inside a POST body makes this deployment answer **403 Forbidden** — on every
POST route, including `/mcp`. Spaces and tabs are fine; a single trailing newline is not.

```
-d '{"variables":["undata/sdg/VC_DTH_TOTN"],"entities":["country/SSD"]}'   → 200
-d '{
      "variables": ["undata/sdg/VC_DTH_TOTN"],
      "entities":  ["country/SSD"]
    }'                                                                     → 403
```

The API has no credentials anywhere in it, so a 403 sends people looking for an API key that
does not exist. Five samples on this site shipped with pretty-printed bodies before anyone ran
them end to end; `tests/curl-samples.test.ts` now fails the build if a newline reappears in one.

Second-order consequences worth knowing: `curl -d @body.json` is safe because curl strips the
newlines, `curl --data-binary @body.json` is not; `requests.post(url, json=payload)` is safe,
`json.dumps(payload, indent=2)` is not.

## The finding that is easiest to miss

Every graph walk is capped at **500 results**. No error, no warning, no total — just a
`nextToken` at the top of the response that nothing obliges you to read.

```
GET /core/api/v2/node?nodes=africa&property=<-containedInPlace
→ 500 nodes + a nextToken        ← looks complete, and is not
→ follow the token: 2,739 nodes across 6 pages
```

Stop at page one and you have 500 of 2,739 — not a sample of anything, just whatever the
index returned first. Recipe 7 in the cookbook walks the loop; the token's absence is the
only end-of-results signal there is. Observation queries are *not* capped this way, so a
containment expression still returns every country in one response.

Two more behave the same way — succeeding while returning something other than what they
appear to:

- **A place argument on the MCP search tools must be a plain name.** `"Kenya"` resolves;
  `country/KEN` and `wikidataId/Q114` answer **500**, and one dcid anywhere in a list fails
  the whole call. The tools check a name index first, and a miss falls through to a
  geocoder that is disabled on this deployment — so a 500 stands in for "no match". This
  inverts the rule the REST surface teaches, where the dcid is always the safe form. The
  same fallback sits behind `/core/api/v2/resolve`, where the single typo `Kenyaa` also
  answers 500 instead of returning no candidates.
- **The same indicator under two agencies is one source, not two.** Maternal mortality is
  published as `undata/sdg/SH_STA_MORT.SEX--F` and as `undata/unicef/MNCH_MMR.SEX--F`, with
  different provenance URLs. Across all 195 countries the coverage, the years and the
  values are identical — 378.79578 against 378.8 for Kenya in 2023, one estimate rounded
  twice. Finding an indicator twice is not corroboration, and joining the pair introduces
  variance that is pure rounding.

`tests/cookbook.test.tsx` and `tests/mcp.test.tsx` pin all three, the latter with a
regression test so the earlier — and wrong — wording cannot come back without someone
re-running the calls.

## The three ways in

Verified against the live deployment on 21 September 2026. None requires credentials.

```
Ask       https://data.un.org/search?q=…                          deep-linkable
Query     https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2   CORS: *
Delegate  https://unsd-datacommons.gcp.un-icc.cloud/mcp           6 tools (5 usable), 3 playbooks
```

The REST surface answers with `Access-Control-Allow-Origin: *`, which is the architectural
fact this whole project rests on: **a static site can query the UN knowledge graph directly
from the browser.** There is no server in this repository, and no proxy.

The single highest-leverage thing to learn is the containment expression — one request in
place of fifty:

```bash
curl -s -G 'https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2/observation' \
  --data-urlencode 'date=LATEST' \
  --data-urlencode 'variable.dcids=undata/unodc/VIC_HOM_RT' \
  --data-urlencode 'entity.expression=africa<-containedInPlace+{typeOf:Country}' \
  --data-urlencode 'select=date'  --data-urlencode 'select=value' \
  --data-urlencode 'select=variable' --data-urlencode 'select=entity'
```

## Running it

```bash
npm install
npm run dev          # http://localhost:4321/un-data-commons-field-guide/
npm run build        # static site in dist/, then the Pagefind search index
npm run preview      # serve dist/ as GitHub Pages will
npm run verify       # lint + typecheck + unit tests + build + checks on the built site
npm run snapshots    # re-record the offline fallback from data.un.org
npm run countries    # re-bake the country picker list from the platform
npm run posters      # re-render the data.un.org title cards (needs Playwright)
```

Node 22.23 or newer (CI uses 24). No environment variables are needed; `.env.example` documents the
two optional overrides.

## How it's built

Astro 7 · React 19 for the interactive tools · TypeScript (strict) · Tailwind CSS 4 · Pagefind ·
hand-built SVG charts · no server, no database, no cookies.

Every address is its own static HTML page with its own title, description, preview image and
canonical link, so a lesson pasted into LinkedIn, Teams or Slack shows what it points to. Pages
ship JavaScript only where something on them is interactive: a lesson page loads a few kilobytes
for its player, and React loads only on the guide pages and tools that use it.

### Lessons are files

Each lesson is one JSON file, `src/content/lessons/<course>/<slug>.json`: title, the one idea,
course and position, the YouTube id and whether the video is public, length, chapters, the timed
transcript, what to try, where to go deeper. A schema in `src/content.config.ts` checks every file
at build time: a lesson with no transcript, a chapter that does not start at 0:00, or a public video
with no id fails the build rather than reaching a reader.

The chapters and transcripts come from the video pipelines, which know every spoken word and its
time; nothing in them is typed by hand. When a private video goes public, its file changes in one
place: `"status": "private"` becomes `"public"`, with the upload date. Until then the lesson shows
its still, a *Coming soon* label and its full transcript, never a broken player.

The data.un.org series has designed title cards like the undata series, rendered from HTML by
`npm run posters` into `src/assets/posters/`. Astro serves them as AVIF and WebP at the size each
place needs. The same files are the YouTube thumbnails.

### Video, without handing the reader to Google

At rest a lesson shows a still served by this site, its length and a play button. Nothing is
requested from YouTube until somebody presses play; then the privacy-enhanced player
(`youtube-nocookie.com`) is mounted, already playing. There is no `preconnect` warm-up on hover,
because hovering is not consent. The built-site tests fail if an `<iframe>`, or any script, image or
stylesheet from YouTube or Google, appears in any page as served.

The player is a small custom element, `src/scripts/player.ts`, not a YouTube script. It reads the
current time from the embed over `postMessage`, the message format YouTube's own IFrame API uses,
which drives the follow-along transcript, the current chapter, saved progress and *Copy link at
0:42*. That format is not a documented public contract, so it lives in that one file; if it ever
stops answering, the video still plays and only the follow-along goes quiet. Every video already
has its captions burned in, so the player switches YouTube's own caption track off rather than
print the same words twice; the CC button brings it back.

### Live data, with a disclosed fallback

Every figure is fetched from data.un.org when you open the page. If the request fails or
exceeds its deadline, the app falls back to a snapshot committed in this repository — and
**says so**, on the chart, with the timestamp of the recording and the error that caused
the fallback.

```
fetch(UN_API) ──ok──▶ render + "Live from data.un.org · fetched 11:02"
      │
      └──fail/timeout──▶ snapshot chunk + "Cached snapshot · recorded 18 Sep 2026"
```

A chart that might be stale and does not say so is worse than no chart. The snapshot is a
lazily imported chunk, so a reader whose requests all succeed never downloads it —
a contingency should not sit in the critical path.

**A fallback must also match the question.** The Data Finder lets you choose any indicator
and any countries, but only one combination has a recording. Falling back to it for a
different selection would render electricity figures under a homicide heading — precisely
the silent mislabelling this guide warns against — so the fallback is offered only when the
selection still matches the recording, and otherwise the tool says it has nothing rather
than showing you the wrong thing.

Committing the data has a second benefit: every number on the site is reviewable, and the
weekly [refresh workflow](.github/workflows/refresh-snapshots.yml) opens a **pull request**
rather than pushing to `main`, so a movement in the UN's published figures gets read by a
human.

### The dcid grammar, as code

Every indicator has a structured address. [`src/lib/undc/dcid.ts`](src/lib/undc/dcid.ts)
parses and rebuilds it, and the interactive explainer in the cookbook runs that same
parser — so what a reader sees is the parser's real output, not an illustration of it.

```
undata / sdg / VC_DTH_TOTN . AGE--Y0T17 __ SEX--F
──┬───   ─┬─   ─────┬─────   ────┬────      ──┬──
  │        │         │            │            └── second dimension filter
  │        │         │            └─────────────── first dimension filter
  │        │         └──────────────────────────── the indicator's series code
  │        └────────────────────────────────────── contributing UN entity
  └───────────────────────────────────────────────  namespace
```

`buildDcid` sorts dimensions, so one data slice has exactly one address — otherwise cache
and snapshot keys diverge silently.

### Charts built to a specification, not to taste

The series palette was checked with a validator against the dark chart surface and clears
every gate: the lightness band, the chroma floor, adjacent-pair separation under
protanopia, deuteranopia and tritanopia (worst ΔE 8.4), the normal-vision floor (worst
ΔE 19.3) and 3:1 contrast. UN Blue `#009EDB` sits outside the dark band, so slot 1 is
`#1b9bd8` — the nearest passing step that keeps the brand read.

Enforced throughout:

- **Colour follows the entity, not its rank.** Filtering a chart never repaints the
  survivors — [`tests/scales.test.ts`](tests/scales.test.ts) asserts it.
- **Never two y-axes.** Two measures of different scale get two panels.
- **Every chart has a table view.** No value is reachable only by hovering a coloured mark.
- **Endpoint labels are placed only where they fit**, by a greedy collision pass; the rest
  stay in the crosshair tooltip and the table.
- **Caveats are computed, not written.** The ranking panel inspects the vintage spread of
  its own result and raises the mixed-year warning itself.

### Brand

Surfaces, ink and the accent are the [Nerd Lab](https://github.com/nerd-factory) identity: ink
`#141419`, off-white `#F4F1EA`, and one accent, volt `#C8F531`. The site follows the visitor's
device into a light or a dark theme, and remembers a choice. Volt is chrome only, and only ever a
fill with dark text on it (13.4:1); as text on a light page it becomes a dark olive. Headings are set
in Jost, an open Futura-style face, so Windows shows the same headings as a Mac; reading text in
Inter; code, times and lengths in JetBrains Mono. All three are served by this site.

### Layout

```
src/
├── pages/             one file per address: home, courses, lessons, videos, undata,
│                      guides, tools, about, and the forwarding pages for old addresses
├── content/
│   ├── lessons/       one JSON file per lesson, checked by content.config.ts
│   ├── courses.ts     the four courses
│   └── guides.ts      the reference pages and tools, for the index pages
├── layouts/           the page shell (head, header, footer, search) and the guide shell
├── components/
│   ├── site/          header, footer, search dialog
│   ├── lesson/        player, chapters, transcript, try-it, course list, cards
│   ├── charts/        scales, line chart, ranking, stat tile, table twins, frame
│   └── panels/        a chart wired to one request
├── routes/            the guide pages, rendered by Astro and hydrated where interactive
├── scripts/           the player and the progress store (plain TypeScript)
├── lib/undc/          the platform: config, typed client, dcid grammar, selectors
└── data/              snapshot-data.json, the committed fallback
scripts/               snapshot recorder, country list, title cards
tests/                 unit tests (no network); tests/site/ checks the built site
```

## Tests

188 unit tests across 17 files, with no network access, run against the committed payloads, and 8
checks on the built site.

```
tests/dcid.test.ts            the identifier grammar, including round-tripping
tests/select.test.ts          response → chart shapes; empty ≠ zero; vintage spread
tests/scales.test.ts          axis domains, tick rounding, entity-stable colour binding
tests/resolution.test.ts      the resolver's inferred-place behaviour
tests/snapshots.test.ts       the script ↔ app key contract, checked across runtimes
tests/content.test.ts         every curated indicator and preset country actually exists
tests/export.test.ts          CSV quoting and provenance; citations name the agency first
tests/curl-samples.test.ts    no line break in any POST body on the site; that is a 403
tests/cookbook.test.tsx       the REST claims: the 500-result cap, resolve, the two lying queries
tests/mcp.test.tsx            which MCP tools work, and that the old wrong wording cannot return
tests/recipes.test.ts         every generator × shape emits runnable code with nothing undefined
tests/scenarios.test.tsx      the worked scenarios and their discovery trails
tests/integrations.test.tsx   the Power BI / Tableau / notebook contract
tests/undata.test.tsx         the Python client claim, and where undata is offered
tests/timeline.test.ts        the platform history entries
tests/lessons.test.ts         the lesson files: 23, numbered without gaps, posters on disk
tests/paths.test.ts           addresses, and every old address forwarding to a real page
tests/site/built.test.ts      on dist/: unique titles and previews, nothing from YouTube or
                              Google before play, video data on every public lesson,
                              old addresses, and no broken internal link
```

## A note on courtesy

There is no API key, which means there is no quota protecting the service from you. Batch
your variables and entities into single requests, prefer one containment expression over
fifty country calls, cache what you fetch, and don't poll data that updates annually.

This repository practises it: one request per panel, and a committed snapshot so that
reloading the page ten times does not cost the UN ten round trips per chart.

## Licence and attribution

Code is [MIT](LICENSE).

The **data is not covered by that licence.** Every statistic belongs to the UN entity that
published it and carries its own terms of use, which travel with the data and not with this
site — each chart links to its provenance. See the platform's
[terms of use](https://data.un.org/undatacommons/terms-of-use).

This is an independent guide. It is **not** an official United Nations publication and is
not endorsed by the United Nations or by Google.

Created by **Mafizul Islam** — [LinkedIn](https://www.linkedin.com/in/mafizul/) ·
[GitHub](https://github.com/MafiAtUN).
