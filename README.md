# UN Data Commons Field Guide

> A [**Nerd Lab**](https://nerd-factory.github.io/nerd-lab/) product.
> *Unnecessarily clever. Occasionally useful.*

A practical field guide and live query lab for the **[UN System Data Commons](https://data.un.org)** —
the platform launched on 17 September 2026 that unifies public statistics from 26 UN
System entities into a single knowledge graph.

**The front page is a door, not a tool.** It fetches nothing. Its job is to get a
reporting officer onto data.un.org already knowing how to ask — what the platform is, the
one way its search box will mislead them, and the three public surfaces they can walk
through. The Data Finder still exists, on its own page, for when a figure is wanted
without leaving.

Everything else is depth: a **practical track** for reporting officers who want to get good
at this, and a **developer track** covering the search resolver, the REST API and MCP.

**→ [mafiatun.github.io/un-data-commons-field-guide](https://mafiatun.github.io/un-data-commons-field-guide/)**

The platform is genuinely open: no API key, no licence negotiation, no scraping. What it
lacks is a guide to *asking well*. The difference between a vague query and a precise one
is the difference between a chart about a country you never chose and the number you
actually needed. This site is that guide.

---

## What's in it

### The front page

A door. Four moves, in the order of a decision: what this platform is, the one way it will
mislead you, the three ways in, and then everything else. It makes no network requests —
`tests/landing.test.tsx` fails the build if an import ever reintroduces one — and its
primary action goes out to data.un.org rather than inward.

The one piece of motion is a re-enactment of the trap below, cut from the live resolver's
actual responses. It waits to be scrolled to rather than playing to an empty room, sits in
a fixed-height stage so nothing reflows, and cuts to its last frame on the first key,
click or touch — and never starts under `prefers-reduced-motion`.

### Find data — the Data Finder

On [`/toolkit`](src/routes/Toolkit.tsx). Three choices and you leave with a chart, a CSV
carrying its own provenance, a citation in four styles, and a prompt that hands the real
table to an AI assistant. No identifiers required, no reading required.

### The navigation

One full-screen table of contents, set in display type: twelve numbered chapters grouped
by track, each carrying what it is for and how long it takes, with the page you are on
marked. It opens from a labelled **Contents** button in the header and from ⌘K, typing
filters it, and the last row always offers the query to data.un.org itself — this guide
has twelve pages and the platform has about 85,000 indicators, so the honest answer is
often "not here, out there".

It is full-screen at every width, so the small-screen and large-screen navigation are the
same object. Every row is a real link, so ⌘-click, middle-click and "copy link address"
all work; an earlier version used buttons and a keyboard cursor, which broke all three for
no gain over a link plus arrow keys.

Three earlier attempts are worth recording as failures. Two dropdowns, which say what
exists but not where you are. A rail of three-pixel ticks — information-dense, elegant,
invisible. And the same full-screen list labelled "Index", which on a statistics site is
the worst available word, because an index here is the Human Development Index.

The manifest lives in [`src/content/navigation.ts`](src/content/navigation.ts) and feeds
the overlay, the front page's chapter index and the header breadcrumb at once, so a new
page is added in one place — and `tests/routes.test.ts` fails if a built route is missing
from it.

No animation library anywhere: CSS transitions and `IntersectionObserver`, nothing else.

### Learn — no technical background assumed

| Section | What it does |
|---|---|
| **Start here** | Five platform behaviours that cause corrections — the resolver substituting a place it did not recognise, "latest available" hiding a decade of vintage spread, a blank that is not a zero, two official figures that legitimately disagree, and revised history. Plus the dcid grammar, because the identifier is what makes a figure reproducible. Every claim checked against the live deployment. |
| **Tutorials** | Six walkthroughs of about five minutes each. Find a defensible figure. Compare countries honestly. Make a chart. Draft a report section with AI. Every step states both the action and the expected result. |
| **Make a chart** | Datawrapper, Flourish and the rest — which to use, how to get UN data in, five rules that keep a chart honest, and a GitHub Action recipe for a chart that refreshes itself. |
| **Cite the data** | Credit the agency, not the website. A generator, and what each part of a citation is actually for. |
| **Use AI on it** | Never ask a chatbot what a statistic is — give it the statistic and ask what it means. Four constrained prompts, free-tool comparison, and the schema in plain language. |

### Developer track

| Section | What it does |
|---|---|
| **Prompt Lab** | Sends your question to the platform's own natural-language resolver and shows its two hidden decisions — the place it locked onto and the variables it picked — *before* any chart is drawn over them. |
| **Peace & security** | A worked case: how much of South Sudan's conflict mortality falls on children, using SDG 16, UNODC, UNHCR and IOM DTM. The wrong turns are left in. |
| **Development** | A worked case on human development in Southern Asia, about the choices — baseline, axis, which "total" to trust — that make a chart honest or not. |
| **Query cookbook** | Five copy-paste REST recipes, the dcid grammar explained interactively, and five documented ways the API will trip you up. |
| **Scenarios** | Three requests as they actually arrive, worked end to end — including the discovery trail with the dead ends left in. Plus a live builder: search the platform's own resolver for an indicator, measure what it really covers, and take the call in curl, Python, Power Query M, R, Julia or jq. |
| **Power BI & Tableau** | The keyed JSON record turned into a rectangle: Power Query M for the call and the cleaning, the firewall rule that decides whether the name lookup gets its own query, a star schema, two DAX measures, and four honestly ranked routes into Tableau. |
| **Python, R & Julia** | The two calls worth learning, written to one contract in three languages — a tidy frame, the facet joined onto every row, the empty-series branch written first, and the repeated-query-parameter trap that returns a bare 400 in all of them. |
| **Catalogue** | All 16 contributing collections with indicator counts read live from the graph, so the page cannot go stale. |
| **Connect** | The MCP endpoint: setup for Claude Code, Claude Desktop, VS Code and Cursor; one question traced through the server as JSON-RPC; a real call and response for each of the six tools; and the four failures found by calling it — including that only four of the six tools work on this deployment, and a paste-ready instruction block that steers an assistant around the other two. |

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

The front page re-enacts this, and the Prompt Lab makes both hidden decisions visible on
any query you like. [`tests/resolution.test.ts`](tests/resolution.test.ts) pins the
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

## The three ways in

Verified against the live deployment on 18 September 2026. None requires credentials.

```
Ask       https://data.un.org/search?q=…                          deep-linkable
Query     https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2   CORS: *
Delegate  https://unsd-datacommons.gcp.un-icc.cloud/mcp           6 tools, 3 playbooks
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
npm run dev        # http://localhost:5173/un-data-commons-field-guide/
npm run verify     # lint + typecheck + test + build
npm run snapshots  # re-record the offline fallback from data.un.org
npm run countries  # re-bake the country picker list from the platform
```

Node 20 or newer. No environment variables are needed; `.env.example` documents the two
optional overrides.

## How it's built

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · hand-built SVG charts · zero
runtime dependencies beyond React and the router.

### Designed for someone in a hurry

The first version of this track was measured and found wanting: **6,246 words across seven
pages — 28 minutes of reading before you could produce anything.** One page ran to 5.6
screens with a single interactive element above the fold, and the navigation offered
thirteen destinations to a reader who did not yet know which was theirs.

It was rebuilt around the person it is for — a reporting officer who needs a defensible
figure before a meeting, not a reader who would admire the prose:

| | Before | After |
|---|---|---|
| Words across the track | 6,246 (~28 min) | **3,639 (~17 min)** |
| Top-level navigation choices | 13 | **3** |
| Time to a number on screen | 2 clicks + 4 min reading | **0.5s, zero clicks** |
| Actions above the fold, homepage | 8 (below 2.9 screens of prose) | **19** |
| Is the chart above the fold? | no, 1.19 screens down | **yes, 0.88** |
| Longest page | 5.6 screens, 1 action | **2.7 screens** |
| `/ai` | 1,573 words | **534** |

Reference material — prompt bodies, workflow files, the reasoning behind each rule — is
kept but placed behind the question a reader would ask, so the page is short for someone in
a hurry and complete for someone who is not. Copy buttons stay outside the expanders:
most people need to *use* a prompt, not read it.

### Brand

Surfaces, ink and the accent are the [Nerd Lab](https://github.com/nerd-factory) identity:
ink `#141419`, off-white `#F4F1EA`, and one accent — volt `#C8F531`. Volt is **chrome only**.
At OKLCH L 0.907 it sits far outside the band a categorical palette needs, which the
validator confirms, so it never becomes a series colour. Nerd Lab sets Futura throughout;
here the geometric face carries headings and the wordmark while a humanist sans carries
body copy, because this is a reading-heavy product rather than a landing page.

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

### Video, without handing the reader to Google

Walkthroughs can carry a recording. The player is not an embed until somebody
asks for one: at rest a tutorial shows a still, a title, a runtime and a play
button, and the `<iframe>` is mounted on the click. A stock YouTube embed ships
well over a megabyte of third-party script and sets cookies before anyone has
decided to watch, which would quietly undo what the front page is careful
about. When it does load it points at `youtube-nocookie.com`, and there is no
`preconnect` warm-up on hover, because hovering is not consent.
`tests/video.test.tsx` fails the build if a player, or that domain, ever appears
in the resting markup.

Recordings are uploaded by hand and the eleven-character id pasted into
`src/content/tutorials.ts`. That is not laziness about automation: videos
uploaded through an unaudited YouTube Data API project are
[forced to private on arrival](https://developers.google.com/youtube/v3/revision_history),
so the API would buy a locked video and a quota ceiling of about six uploads a
day in exchange for an OAuth client to maintain.

### Layout

```
src/
├── lib/undc/          the platform: config, typed client, dcid grammar,
│                      response selectors, resolver summary, live/snapshot hook
├── components/
│   ├── charts/        scales, line chart, ranking, stat tile, table twins, frame
│   └── panels/        a chart wired to one request
├── content/           the editorial layer the API does not carry —
│                      curated indicators in plain language, tutorials, country presets
├── routes/            one file per page
└── data/              snapshot-data.json — the committed fallback
scripts/               snapshot recorder, Pages postbuild
tests/                 138 tests, no network
```

## Tests

138 tests, no network access, run against the committed payloads.

```
tests/dcid.test.ts        the identifier grammar, including round-tripping
tests/select.test.ts      response → chart shapes; empty ≠ zero; vintage spread
tests/scales.test.ts      axis domains, tick rounding, entity-stable colour binding
tests/resolution.test.ts  the resolver's inferred-place behaviour
tests/snapshots.test.ts   the script ↔ app key contract, checked across runtimes
tests/routes.test.ts      router ↔ navigation ↔ build manifest agree
tests/navigation.test.ts  the depth axis: contiguous tracks, findable by the obvious word
tests/landing.test.tsx    the front page rendered, and that it fetches nothing
tests/content.test.ts     every curated indicator and preset country actually exists
tests/export.test.ts      CSV quoting and provenance; citations name the agency first
```

`snapshots.test.ts` matters because the recorder is plain Node and the app is TypeScript,
so nothing at compile time stops a key being renamed in one and not the other. The test is
that check.

`landing.test.tsx` is the only suite that mounts components rather than reading their
source. It renders with `react-dom/server`, in plain Node, with no jsdom — and because
effects do not run in a server render, what it sees is exactly the front page's *first*
frame: before the film has played a beat, before anything has scrolled into view, before
any data has arrived. That frame has to already contain the Data Finder, the resolver
finding in plain text, and a working link to the Prompt Lab, because it is also what a
crawler and a reader on a slow connection get. It additionally pins the markup contracts
that are otherwise only checkable by eye: one tab stop on the rail, `aria-current` on the
page you are on, and the animated stage hidden from assistive technology.

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
