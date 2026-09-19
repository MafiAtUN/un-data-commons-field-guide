import { Link } from 'react-router-dom';
import { PageHeader, Section, Takeaway } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';
import { Expander } from '../components/Expander';
import { ScenarioBrief } from '../components/ScenarioBrief';
import { findScenario } from '../content/scenarios';

const API = 'https://unsd-datacommons.gcp.un-icc.cloud';

/**
 * The same two calls in three languages.
 *
 * The Python here is the version that was run against the live platform while
 * this page was written, not a paraphrase of it — including the empty-series
 * branch, which fires for `country/ATA` and is the whole reason the function
 * reports rather than silently returns fewer rows.
 *
 * R and Julia are written to the same contract: one tidy frame, provenance
 * carried on every row, absence made visible.
 */
const SCATTER = findScenario('conflict-and-income')!;

export function Notebooks() {
  return (
    <>
      <PageHeader
        eyebrow="Python, R & Julia · 10 minutes"
        title="The same two calls, in the language you already work in"
        lead={
          <>
            There are only two requests worth learning: the full history for places you
            can name, and one latest value for every country inside a region. Everything
            below is those two, written to the same contract — a tidy frame, the
            provenance carried on every row, and absence reported rather than quietly
            dropped.
          </>
        }
      />

      <Section
        id="scenario"
        title="A scenario first, because the contract exists for a reason"
        lead="A real request, and the three lines of it that matter more than the fetching."
      >
        <ScenarioBrief scenario={SCATTER} tool="python">
          <div className="grid gap-4 lg:grid-cols-2">
            <CodeBlock
              label="python — the whole finding, in six lines"
              language="python"
              code={`x = latest_in("Earth", "undata/unicef/SPP_GDPPC")   # GDP per capita
y = latest_in("Earth", "undata/sdg/VC_DTH_TOTR")    # conflict deaths /100k

points = x.merge(y, on="entity", suffixes=("_gdp", "_conflict"))

print(len(x), len(y), len(points))      # 210 14 14
print(sorted(names(points["entity"].tolist())))
# ['Afghanistan', 'Central African Republic', 'Congo [DRC]', 'Ethiopia',
#  'Iraq', 'Lebanon', 'Libya', 'Mali', 'Myanmar', 'Palestinian Territories',
#  'Philippines', 'South Sudan', 'Syria', 'Ukraine']`}
            />
            <div className="space-y-3 text-[0.85rem] leading-relaxed text-ink-secondary">
              <p>
                That last list is the whole analysis. Printing the names of the surviving
                entities — not just the count — is what turns “the join dropped some countries”
                into “the join kept only countries at war”. The first is a data-quality note.
                The second stops the chart.
              </p>
              <p>
                <span className="font-semibold text-ink-primary">
                  Make it an assertion when the script runs unattended.
                </span>{' '}
                A monthly refresh that quietly loses a country produces a chart nobody re-reads.
              </p>
              <CodeBlock
                label="python — fail loudly rather than plot quietly"
                language="python"
                code={`retained = len(points) / min(len(x), len(y))
assert retained > 0.8, (
    f"join kept {len(points)} of {min(len(x), len(y))} places — "
    "check what the missing ones have in common before plotting"
)`}
              />
              <p>
                In R the same check is{' '}
                <code className="text-volt">stopifnot(nrow(points) / min(nrow(x), nrow(y)) &gt; 0.8)</code>
                ; in Julia, <code className="text-volt">@assert</code> over the same ratio. The
                discipline is identical and the grammar is the only thing that changes.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-1 p-5">
            <h3 className="text-[0.92rem] font-semibold text-ink-primary">
              If you do plot it, plot it honestly
            </h3>
            <div className="mt-3">
              <CodeBlock
                label="python — matplotlib, with the sample stated in the title"
                language="python"
                code={`import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(7, 5))
ax.scatter(points["value_gdp"], points["value_conflict"])

# Income spans 353 to 7,330 dollars: linear puts eleven of fourteen
# points in the left quarter of the plot.
ax.set_xscale("log")
ax.set_xlabel("GDP per capita, current US$ (2024)")
ax.set_ylabel("Conflict deaths per 100,000 (2022–2024)")

# The sample belongs in the title, not in a footnote nobody screenshots.
ax.set_title(f"Among the {len(points)} countries reporting conflict deaths\n"
             f"({len(x)} countries have GDP per capita)")

for _, row in points.iterrows():
    ax.annotate(row["name"], (row["value_gdp"], row["value_conflict"]),
                fontsize=7, alpha=0.7)

fig.text(0.01, 0.01, "Source: UNICEF and SDG collections via data.un.org",
         fontsize=7, alpha=0.6)`}
              />
            </div>
            <p className="mt-3 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
              No regression line, deliberately. <code>scipy.stats.linregress</code> will return a
              slope and a p-value for these fourteen points and both are statements about which
              countries file conflict-death returns, not about conflict and income.
            </p>
          </div>
        </ScenarioBrief>
      </Section>

      <Section
        title="The contract, before the code"
        lead="Three rules. They are what make these snippets longer than a one-liner, and they are the reason the output is publishable."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'One row per observation',
              body: 'variable, entity, date, value — long, never wide. Pivot at the point of display, so a new year of data does not change the schema.',
            },
            {
              title: 'The facet rides along',
              body: 'The numbers arrive in `data`; the unit, observation period and agency arrive separately in `facets`, keyed by an id on each block. Join them at fetch time or you will lose them.',
            },
            {
              title: 'Empty is reported, not dropped',
              body: 'An entity with no data is silently absent from the response. A function that returns a shorter frame without saying so is how a missing country becomes an invisible one.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <h3 className="text-[0.88rem] font-semibold text-ink-primary">{item.title}</h3>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-secondary">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Python"
        lead={
          <>
            Requests and pandas, no client library. This is the module that was run
            against the live platform while the page was written; the{' '}
            <code className="text-volt">no data for:</code> line below the code is its
            real output.
          </>
        }
      >
        <CodeBlock
          label="undc.py"
          language="python"
          code={`"""Tidy frames from the UN System Data Commons. No API key required."""

import pandas as pd
import requests

BASE = "${API}"
SESSION = requests.Session()
# Identify yourself. This is unmetered public infrastructure with no quota
# protecting it from you, so a contactable user agent is basic courtesy.
SESSION.headers["User-Agent"] = "my-office-analysis (you@example.org)"


def series(variables: list[str], entities: list[str]) -> pd.DataFrame:
    """Full time series for every (variable, entity) pair, one row per observation."""
    payload = {"variables": variables, "entities": entities}
    r = SESSION.post(f"{BASE}/api/observations/series", json=payload, timeout=30)
    r.raise_for_status()
    body = r.json()
    facets = body.get("facets", {})

    rows, empty = [], []
    for variable, by_entity in body["data"].items():
        for entity, block in by_entity.items():
            observations = block.get("series") or []
            if not observations:
                empty.append((variable, entity))   # absent is not zero
                continue
            facet = facets.get(block.get("facet"), {})
            for obs in observations:
                rows.append({
                    "variable": variable,
                    "entity": entity,
                    "date": obs["date"],
                    "value": obs["value"],
                    "unit": facet.get("unitDisplayName"),
                    "period": facet.get("observationPeriod"),
                    "source": facet.get("provenanceUrl"),
                })

    if empty:
        print(f"no data for: {empty}")

    frame = pd.DataFrame(rows)
    if frame.empty:
        return frame
    # date is "2024", sometimes "2024-06". Only the year is safe to make a number;
    # parsing it as a date would invent a day nobody measured.
    frame["year"] = frame["date"].str.slice(0, 4).astype(int)
    return frame.sort_values(["variable", "entity", "date"], ignore_index=True)`}
        />

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <CodeBlock
            label="using it"
            language="python"
            code={`>>> df = series(
...     ["undata/sdg/VC_DTH_TOTN"],
...     ["country/SSD", "country/COD", "country/ATA"],
... )
no data for: [('undata/sdg/VC_DTH_TOTN', 'country/ATA')]

>>> df.head(2)
                 variable       entity  date  value    unit period                                  source  year
0  undata/sdg/VC_DTH_TOTN  country/COD  2015    945  Number    P1Y  https://unstats.un.org/sdgs/dataportal  2015
1  undata/sdg/VC_DTH_TOTN  country/COD  2016    836  Number    P1Y  https://unstats.un.org/sdgs/dataportal  2016`}
          />
          <div className="space-y-3 text-[0.85rem] leading-relaxed text-ink-secondary">
            <p>
              Antarctica is in the request on purpose. It resolves to a real place, the
              platform answers 200, and the response simply has no block for it. A loop
              that indexes straight into{' '}
              <code className="text-volt">body["data"][variable][entity]</code> raises{' '}
              <code>KeyError</code> here; one that uses <code>.get</code> without
              reporting returns a frame two countries wide and says nothing. Neither is
              what you want in a script somebody else will run.
            </p>
            <p>
              In a notebook, replace the <code>print</code> with a{' '}
              <code className="text-volt">warnings.warn</code> or an assertion. In a
              pipeline, raise: a country that has silently vanished from a monthly report
              is worth failing a job over.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <CodeBlock
            label="the regional call — one latest value per country"
            language="python"
            code={`def latest_in(region: str, variable: str, place_type: str = "Country") -> pd.DataFrame:
    """One latest value per child place of \`region\` — a ranking, in one request."""
    # Repeated keys, so a list of tuples rather than a dict. requests encodes
    # the arrows and braces in the expression for you; hand-built URLs do not,
    # and an unencoded -> comes back as HTTP 400 with no explanation.
    params = [
        ("date", "LATEST"),
        ("variable.dcids", variable),
        ("entity.expression", f"{region}<-containedInPlace+{{typeOf:{place_type}}}"),
        ("select", "date"), ("select", "value"),
        ("select", "entity"), ("select", "variable"),
    ]
    r = SESSION.get(f"{BASE}/core/api/v2/observation", params=params, timeout=30)
    r.raise_for_status()
    body = r.json()
    facets = body.get("facets", {})

    rows = []
    for var, by_entity in body["byVariable"].items():
        for entity, block in by_entity["byEntity"].items():
            for facet_block in block.get("orderedFacets", []):
                facet = facets.get(facet_block["facetId"], {})
                for obs in facet_block["observations"]:
                    rows.append({
                        "variable": var, "entity": entity,
                        "date": obs["date"], "value": obs["value"],
                        "unit": facet.get("unitDisplayName"),
                        "source": facet.get("provenanceUrl"),
                    })
                break   # orderedFacets is ranked — the first is the preferred source

    frame = pd.DataFrame(rows)
    if frame.empty:
        return frame
    return frame.assign(name=names(frame["entity"].tolist()))


def names(dcids: list[str]) -> list[str]:
    """Human-readable place names, so a chart does not read \`country/SSD\`."""
    r = SESSION.post(f"{BASE}/api/place/name", json={"dcids": list(set(dcids))}, timeout=30)
    r.raise_for_status()
    lookup = r.json()
    return [lookup.get(d, d) for d in dcids]`}
          />
          <div className="space-y-3 text-[0.85rem] leading-relaxed text-ink-secondary">
            <p>
              <span className="font-semibold text-ink-primary">
                The shape is different, and deliberately so.
              </span>{' '}
              This endpoint nests one more level:{' '}
              <code className="text-volt">byVariable → byEntity → orderedFacets[] → observations[]</code>.
              The extra level exists because more than one agency may publish the same
              variable for the same place, and the list is ranked. Taking the first is
              the right default; iterating all of them and keeping{' '}
              <code>facetId</code> is what you do when the point of the analysis is that
              two sources disagree.
            </p>
            <CodeBlock
              label="the check to run before you call it a cross-section"
              language="python"
              code={`hdi = latest_in("SouthernAsia", "undata/undphdro/HDI_hdi")
hdi["date"].unique()          # array(['2023'], dtype=object) — one year, clean

hom = latest_in("africa", "undata/unodc/VIC_HOM_RT")
hom["date"].unique()          # 11 distinct years, 2009–2025 — a ranking, not a snapshot`}
            />
            <p className="text-[0.82rem] text-ink-muted">
              Both were run live. The first genuinely is a cross-section because HDI is a
              modelled composite on one annual cycle; the second is national
              administrative reporting and spans more than a decade. The query is
              identical. Only the data generating process differs, and only this check
              tells you which you have.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Expander question="Is there an official Python client?" time="30 seconds">
            <p>
              Yes — <code className="text-volt">datacommons-client</code> on PyPI,
              maintained by Data Commons, requiring Python 3.10 or newer. It understands
              custom deployments like this one, and gives you a DataFrame directly.
            </p>
            <div className="mt-3">
              <CodeBlock
                label="python"
                language="python"
                code={`# pip install "datacommons-client[Pandas]"
from datacommons_client.client import DataCommonsClient

client = DataCommonsClient(dc_instance="unsd-datacommons.gcp.un-icc.cloud")

frame = client.observations_dataframe(
    variable_dcids="undata/undphdro/HDI_hdi",
    date="latest",
    entity_dcids="all",
    parent_entity="SouthernAsia",
    entity_type="Country",
)`}
              />
            </div>
            <p className="mt-3">
              The client resolves a custom instance to{' '}
              <code className="text-volt">https://&lt;host&gt;/core/api/v2</code> and
              validates it on construction with a node lookup, which this deployment
              answers — so no API key and no further configuration. The trade is that you
              inherit its choices about which facet to keep and how to name columns. The
              plain-requests version above is longer precisely because those decisions are
              visible in it.
            </p>
          </Expander>
        </div>
      </Section>

      <Section
        title="R"
        lead="httr2 and purrr. Same contract, same output columns — so a colleague can hand you either frame and the rest of the analysis is unchanged."
      >
        <CodeBlock
          label="undc.R"
          language="r"
          code={`library(httr2)
library(purrr)
library(dplyr)
library(tibble)

BASE <- "${API}"

undc_series <- function(variables, entities) {
  resp <- request(BASE) |>
    req_url_path("/api/observations/series") |>
    req_body_json(list(variables = variables, entities = entities)) |>
    req_user_agent("my-office-analysis (you@example.org)") |>
    req_retry(max_tries = 3) |>
    req_perform()

  # simplifyVector = FALSE keeps the nested lists as lists. Let jsonlite
  # simplify and a single-country response collapses into a different shape
  # from a multi-country one, which is a very unpleasant bug to find later.
  body <- resp_body_json(resp, simplifyVector = FALSE)
  facets <- body$facets

  rows <- imap(body$data, function(by_entity, variable) {
    imap(by_entity, function(block, entity) {
      obs <- block$series
      if (is.null(obs) || length(obs) == 0) {
        warning("no data for ", variable, " / ", entity, call. = FALSE)
        return(NULL)
      }
      facet <- facets[[block$facet]]
      tibble(
        variable = variable,
        entity   = entity,
        date     = map_chr(obs, "date"),
        value    = map_dbl(obs, "value"),
        unit     = facet$unitDisplayName  %||% NA_character_,
        period   = facet$observationPeriod %||% NA_character_,
        source   = facet$provenanceUrl     %||% NA_character_
      )
    }) |> list_rbind()
  }) |> list_rbind()

  if (nrow(rows) == 0) return(rows)

  rows |>
    mutate(year = as.integer(substr(date, 1, 4))) |>
    arrange(variable, entity, date)
}`}
        />

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <CodeBlock
            label="the regional call in R"
            language="r"
            code={`undc_latest_in <- function(region, variable, place_type = "Country") {
  expression <- sprintf("%s<-containedInPlace+{typeOf:%s}", region, place_type)

  resp <- request(BASE) |>
    req_url_path("/core/api/v2/observation") |>
    # .multi = "explode" is the bit that matters: four select= keys, not one
    # comma-joined value. Without it the server returns 400.
    req_url_query(
      date              = "LATEST",
      variable.dcids    = variable,
      entity.expression = expression,
      select            = c("date", "value", "entity", "variable"),
      .multi            = "explode"
    ) |>
    req_perform()

  body   <- resp_body_json(resp, simplifyVector = FALSE)
  facets <- body$facets

  imap(body$byVariable, function(v, variable) {
    imap(v$byEntity, function(e, entity) {
      first <- e$orderedFacets[[1]]          # ranked; first is preferred
      facet <- facets[[first$facetId]]
      tibble(
        variable = variable,
        entity   = entity,
        date     = map_chr(first$observations, "date"),
        value    = map_dbl(first$observations, "value"),
        source   = facet$provenanceUrl %||% NA_character_
      )
    }) |> list_rbind()
  }) |> list_rbind()
}`}
          />
          <div className="space-y-3 text-[0.85rem] leading-relaxed text-ink-secondary">
            <p>
              <span className="font-semibold text-ink-primary">
                The one R-specific trap is query encoding.
              </span>{' '}
              The containment expression contains{' '}
              <code className="text-volt">&lt;-</code> and braces, and four{' '}
              <code>select</code> parameters must arrive as four separate keys.{' '}
              <code className="text-volt">req_url_query(..., .multi = &quot;explode&quot;)</code>{' '}
              does both; pasting the URL together by hand does neither, and the error you
              get back is a bare 400.
            </p>
            <p>
              <code className="text-volt">%||%</code> comes from purrr (and from base R
              4.4 onwards). It is doing real work here: HDI facets carry no{' '}
              <code>unitDisplayName</code> at all, so the field is absent rather than
              empty, and an unguarded <code>facet$unitDisplayName</code> would return{' '}
              <code>NULL</code> and collapse the tibble column.
            </p>
            <p>
              <code className="text-volt">list_rbind()</code> rather than the older{' '}
              <code>map_dfr()</code>, which purrr 1.0 superseded. Returning{' '}
              <code>NULL</code> from the inner function is how a country with no data
              drops out of the bind — after a warning, not silently.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Julia"
        lead="HTTP.jl, JSON3 and DataFrames. Building the frame column-first keeps the schema concrete, which matters more here than it does in Python."
      >
        <CodeBlock
          label="undc.jl"
          language="julia"
          code={`using HTTP, JSON3, DataFrames

const BASE = "${API}"
const AGENT = ["User-Agent" => "my-office-analysis (you@example.org)"]

function undc_series(variables::Vector{String}, entities::Vector{String})
    body = JSON3.write((; variables, entities))
    resp = HTTP.post("$BASE/api/observations/series",
                     ["Content-Type" => "application/json"; AGENT], body)
    payload = JSON3.read(resp.body)

    # Declared up front so every column has a concrete type. Pushing
    # NamedTuples into an untyped vector works until one facet is missing a
    # unit and the eltype quietly becomes Any.
    df = DataFrame(
        variable = String[], entity = String[], date = String[],
        value    = Float64[], year   = Int[],
        unit     = Union{String,Missing}[],
        source   = Union{String,Missing}[],
    )

    for (variable, by_entity) in pairs(payload.data),
        (entity, block)       in pairs(by_entity)

        obs = get(block, :series, nothing)
        if obs === nothing || isempty(obs)
            @warn "no data" variable entity      # absent is not zero
            continue
        end
        facet = payload.facets[Symbol(block.facet)]

        for o in obs
            date = String(o.date)
            push!(df, (String(variable), String(entity), date,
                       Float64(o.value), parse(Int, first(date, 4)),
                       get(facet, :unitDisplayName, missing),
                       get(facet, :provenanceUrl, missing)))
        end
    end

    sort!(df, [:variable, :entity, :date])
end`}
        />

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <CodeBlock
            label="the regional call in Julia"
            language="julia"
            code={`function undc_latest_in(region::String, variable::String;
                        place_type::String = "Country")
    # A vector of pairs, not a Dict — repeated keys are the whole point, and a
    # Dict would keep only the last select=.
    query = ["date"              => "LATEST",
             "variable.dcids"    => variable,
             "entity.expression" => "$region<-containedInPlace+{typeOf:$place_type}",
             "select" => "date", "select" => "value",
             "select" => "entity", "select" => "variable"]

    resp    = HTTP.get("$BASE/core/api/v2/observation", AGENT; query)
    payload = JSON3.read(resp.body)

    df = DataFrame(variable = String[], entity = String[], date = String[],
                   value = Float64[], source = Union{String,Missing}[])

    for (variable, v) in pairs(payload.byVariable),
        (entity, e)   in pairs(v.byEntity)

        facets = get(e, :orderedFacets, nothing)
        facets === nothing && continue
        first_facet = facets[1]                  # ranked; first is preferred
        facet = payload.facets[Symbol(first_facet.facetId)]

        for o in first_facet.observations
            push!(df, (String(variable), String(entity), String(o.date),
                       Float64(o.value), get(facet, :provenanceUrl, missing)))
        end
    end

    sort!(df, :value, rev = true)
end`}
          />
          <div className="space-y-3 text-[0.85rem] leading-relaxed text-ink-secondary">
            <p>
              <span className="font-semibold text-ink-primary">
                JSON3 gives you symbols, and the keys contain slashes.
              </span>{' '}
              <code className="text-volt">pairs(payload.data)</code> yields{' '}
              <code>Symbol(&quot;undata/sdg/VC_DTH_TOTN&quot;)</code>, so{' '}
              <code>String(variable)</code> is needed before it goes into a{' '}
              <code>String</code> column. The same applies to the facet id, which is a
              numeric string in the JSON and therefore{' '}
              <code className="text-volt">payload.facets[Symbol(block.facet)]</code> on
              the way back.
            </p>
            <p>
              <code className="text-volt">get(facet, :unitDisplayName, missing)</code>{' '}
              rather than <code>facet.unitDisplayName</code> for the same reason as in R:
              the field is genuinely absent on some facets, and property access on a
              JSON3.Object throws rather than returning nothing.
            </p>
            <p>
              If you prefer working with vectors of NamedTuples, that is fine —{' '}
              <code>DataFrame(rows)</code> accepts them. Declare the element type
              explicitly if you do, or the first missing unit turns the whole column into{' '}
              <code>Any</code> and every downstream operation gets slower and less type-safe.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="The one cross-language trap: repeated query parameters"
        lead="The regional call sends select= four times and entity.expression with arrows and braces. Every HTTP library expresses that differently, and getting it wrong returns a bare HTTP 400."
      >
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full border-collapse text-[0.8rem]">
            <caption className="sr-only">How to send repeated query keys in each language</caption>
            <thead className="bg-surface-2">
              <tr>
                <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">
                  Language
                </th>
                <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">
                  The form that works
                </th>
                <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">
                  The form that fails
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Python (requests)', 'params=[("select", "date"), ("select", "value")]', 'params={"select": "date,value"} — one comma-joined key'],
                ['R (httr2)', 'req_url_query(select = c("date", "value"), .multi = "explode")', 'the default .multi = "error", or paste0() into the URL'],
                ['Julia (HTTP.jl)', 'query = ["select" => "date", "select" => "value"]', 'query = Dict(...) — the last select wins, the rest are lost'],
                ['curl', '--data-urlencode \'select=date\' --data-urlencode \'select=value\'', 'putting <- and {} in the URL unencoded'],
                ['Power Query (M)', 'POST the lists in the body with Json.FromValue', 'Query = [select = {"date","value"}] — a list is not a valid Query value'],
              ].map(([language, works, fails]) => (
                <tr key={language} className="align-top even:bg-surface-1">
                  <th scope="row" className="whitespace-nowrap p-3 text-left font-semibold text-ink-primary">
                    {language}
                  </th>
                  <td className="p-3 font-mono text-[0.7rem] text-ink-secondary">{works}</td>
                  <td className="p-3 font-mono text-[0.7rem] text-ink-muted">{fails}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
          The last row is why the{' '}
          <Link to="/dashboards" className="text-volt underline decoration-volt/30 underline-offset-2">
            Power BI page
          </Link>{' '}
          uses the POST form throughout: Power Query&apos;s <code>Query</code> record
          cannot express a repeated key, and building the URL by hand forfeits scheduled
          refresh.
        </p>
      </Section>

      <Section
        title="Cache it — this is unmetered public infrastructure"
        lead="There is no API key, which means there is no quota standing between an enthusiastic loop and a service the whole system shares."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            label="python — two lines, and a notebook re-run costs nothing"
            language="python"
            code={`import requests_cache   # pip install requests-cache

# Annual statistics. A day is a conservative TTL; a week is defensible.
SESSION = requests_cache.CachedSession(
    "undc-cache", expire_after=86_400,
    allowable_methods=("GET", "POST"),   # the series endpoint is a POST
)`}
          />
          <div className="space-y-3 text-[0.85rem] leading-relaxed text-ink-secondary">
            <p>
              <code className="text-volt">allowable_methods</code> is the part people
              miss: requests-cache caches GET only by default, and the series endpoint is
              a POST, so without it nothing is cached and you will not notice.
            </p>
            <p>
              The other half of courtesy is batching. Several variables and several
              entities go in one request and return the cross product; a loop over fifty
              countries is fifty round trips for a result one containment expression
              would have fetched. The{' '}
              <Link to="/cookbook" className="text-volt underline decoration-volt/30 underline-offset-2">
                cookbook
              </Link>{' '}
              makes the same point at more length, and this site obeys it — one request
              per panel, with a committed snapshot so a reader reloading ten times does
              not cost the UN ten round trips per chart.
            </p>
            <p>
              For R, <code className="text-volt">httr2::req_cache()</code> in the pipeline
              above. For Julia, write the frame to Parquet or Arrow and read it back if
              the file is newer than your TTL — there is no equivalent drop-in.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="A notebook that runs all of this"
        lead="Standard library only — no pandas, no install, no key. It works in Colab, in Jupyter and as a plain script."
      >
        <div className="rounded-lg border border-volt/30 bg-volt/5 p-5">
          <p className="max-w-3xl text-[0.88rem] leading-relaxed text-ink-secondary">
            The companion notebook walks the same ground against the live platform: one
            series, the facet join that gives it meaning, a regional ranking, a graph walk
            and an MCP call. Nineteen cells, nothing to configure.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <a
              href={`${import.meta.env.BASE_URL}un-data-commons.ipynb`}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-volt/50 px-4 py-2 text-[0.82rem] font-semibold text-volt transition-colors hover:bg-volt/10"
            >
              Download the notebook ↓
            </a>
            <Link
              to="/watch"
              className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2 text-[0.82rem] font-medium text-ink-secondary transition-colors hover:border-volt/60 hover:text-ink-primary"
            >
              Watch the two videos it follows
            </Link>
          </div>
        </div>
      </Section>

      <Section title="What this page leaves you with">
        <div className="grid gap-4 md:grid-cols-2">
          <Takeaway>
            <strong className="text-ink-primary">Two calls cover almost everything.</strong>{' '}
            Named places with full history, or one latest value across a region. Learn
            their two response shapes and the rest of the API is discovery, not fetching.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Write the empty branch first.</strong>{' '}
            Every snippet here reports the entity that came back with nothing, because
            that is the single most common way an analysis goes quietly wrong — not a
            crash, a frame that is one country short.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Guard the optional facet fields.</strong>{' '}
            <code>unitDisplayName</code> is genuinely absent on some facets. Python{' '}
            <code>.get</code>, R <code>%||%</code>, Julia <code>get(…, missing)</code> —
            the same defect in three grammars.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">
              Check the reference years before calling it a comparison.
            </strong>{' '}
            One line — <code>df[&quot;date&quot;].unique()</code> — separates a cross-section
            from a ranking that spans a decade. Run it every time.
          </Takeaway>
        </div>
      </Section>
    </>
  );
}
