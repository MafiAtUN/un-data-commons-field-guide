# UN Data Commons Field Guide

A practical field guide and live query lab for the **[UN System Data Commons](https://data.un.org)** —
the platform launched on 17 September 2026 that unifies public statistics from 26 UN
System entities into a single knowledge graph.

**→ [mafiatun.github.io/un-data-commons-field-guide](https://mafiatun.github.io/un-data-commons-field-guide/)**

The platform is genuinely open: no API key, no licence negotiation, no scraping. What it
lacks is a guide to *asking well*. The difference between a vague query and a precise one
is the difference between a chart about a country you never chose and the number you
actually needed. This site is that guide.

---

## What's in it

| Section | What it does |
|---|---|
| **Prompt Lab** | Sends your question to the platform's own natural-language resolver and shows its two hidden decisions — the place it locked onto and the variables it picked — *before* any chart is drawn over them. |
| **Peace & security** | A worked case: how much of South Sudan's conflict mortality falls on children, using SDG 16, UNODC, UNHCR and IOM DTM. The wrong turns are left in. |
| **Development** | A worked case on human development in Southern Asia, about the choices — baseline, axis, which "total" to trust — that make a chart honest or not. |
| **Query cookbook** | Five copy-paste REST recipes, the dcid grammar explained interactively, and five documented ways the API will trip you up. |
| **Catalogue** | All 16 contributing collections with indicator counts read live from the graph, so the page cannot go stale. |
| **Connect** | The MCP endpoint, its six tools, and how to point an AI assistant at authoritative UN statistics instead of its own recall. |

## The finding that started it

Ask the platform's resolver the single word `violence` and it answers with charts titled
"Number of Victims of Intentional Homicide". They look like global figures. They are
United States figures — the resolver needs a place, found none in the question, and
supplied one.

```
POST /api/explore/detect-and-fulfill?q=violence
→ place: country/USA          ← nothing in the query said so
```

Screenshot that into a brief and the error is yours, and invisible. The Prompt Lab exists
to make that decision visible; [`tests/resolution.test.ts`](tests/resolution.test.ts)
pins the behaviour against a recorded response.

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
```

Node 20 or newer. No environment variables are needed; `.env.example` documents the two
optional overrides.

## How it's built

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · hand-built SVG charts · zero
runtime dependencies beyond React and the router.

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

### Layout

```
src/
├── lib/undc/          the platform: config, typed client, dcid grammar,
│                      response selectors, resolver summary, live/snapshot hook
├── components/
│   ├── charts/        scales, line chart, ranking, stat tile, table twins, frame
│   └── panels/        a chart wired to one request
├── content/           the editorial layer the API does not carry
├── routes/            one file per page
└── data/              snapshot-data.json — the committed fallback
scripts/               snapshot recorder, Pages postbuild
tests/                 63 unit tests, no network
```

## Tests

63 tests, no network access, run against the committed payloads.

```
tests/dcid.test.ts        the identifier grammar, including round-tripping
tests/select.test.ts      response → chart shapes; empty ≠ zero; vintage spread
tests/scales.test.ts      axis domains, tick rounding, entity-stable colour binding
tests/resolution.test.ts  the resolver's inferred-place behaviour
tests/snapshots.test.ts   the script ↔ app key contract, checked across runtimes
```

That last one matters: the recorder is plain Node and the app is TypeScript, so nothing at
compile time stops a key being renamed in one and not the other. The test is that check.

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
not endorsed by the United Nations or by Google. Built by
[Mafizul Islam](https://github.com/MafiAtUN).
