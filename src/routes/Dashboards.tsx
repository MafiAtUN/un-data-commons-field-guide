import { Link } from 'react-router-dom';
import { PageHeader, Section, Takeaway } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';
import { Expander } from '../components/Expander';

const API = 'https://unsd-datacommons.gcp.un-icc.cloud';

/**
 * Power BI and Tableau.
 *
 * Both tools assume a rectangle, and this API returns a record keyed by
 * identifier, two dynamic levels deep, with the meaning kept in a separate
 * object. Nearly every difficulty a dashboard author has here is that mismatch,
 * so the page leads with the shape and only then shows the code.
 *
 * Every response fragment quoted below is a real one, trimmed. The M is written
 * against the POST variant of `/api/observations/series` — the GET variant works
 * too, but repeated query keys are the one thing Power Query's `Query` record
 * cannot express, and a hand-built URL forfeits scheduled refresh.
 */
export function Dashboards() {
  return (
    <>
      <PageHeader
        eyebrow="Power BI & Tableau · 12 minutes"
        title="From a keyed JSON record to a dashboard that cites its source"
        lead={
          <>
            Both tools want a rectangle: one row per observation, one column per
            attribute. The platform returns something else — a record keyed by
            identifier, two levels deep, with the units and the provenance held apart
            from the numbers. Getting from one to the other is nearly all of the work,
            and it is the same work in both tools.
          </>
        }
      />

      <Section
        title="The shape you get, and the shape you need"
        lead="Read these two side by side once and the rest of the page is mechanical."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <CodeBlock
              label="what the API returns (trimmed, real)"
              language="json"
              code={`{
  "data": {
    "undata/sdg/VC_DTH_TOTN": {        ← keyed by variable
      "country/COD": {                 ← keyed by entity
        "facet": "12883393359649061195",
        "obsCount": 10,
        "series": [
          { "date": "2015", "value": 945 },
          { "date": "2016", "value": 836 }
        ]
      },
      "country/SSD": { "...": "..." }
    }
  },
  "facets": {                          ← the meaning lives here
    "12883393359649061195": {
      "provenanceUrl": "https://unstats.un.org/sdgs/dataportal",
      "provenanceId": "undata/p/SDG",
      "observationPeriod": "P1Y",
      "unitDisplayName": "Number"
    }
  }
}`}
            />
            <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-muted">
              Two of those levels are keyed by data, not by schema — the column names
              are the identifiers you asked for. No BI tool infers that. You have to
              turn keys into rows explicitly, which in Power Query is{' '}
              <code className="text-volt">Record.ToTable</code> and in every scripting
              language is a loop over the items.
            </p>
          </div>

          <div>
            <p className="mb-3 text-[0.85rem] leading-relaxed text-ink-secondary">
              <span className="font-semibold text-ink-primary">The target. </span>
              One row per observation, with the facet joined on so the unit and the
              source travel with the number rather than being looked up later by a human.
            </p>
            <div className="overflow-x-auto rounded-lg border border-hairline">
              <table className="w-full border-collapse text-[0.72rem]">
                <caption className="sr-only">The tidy target shape, with real values</caption>
                <thead className="bg-surface-2">
                  <tr>
                    {['variable', 'entity', 'date', 'value', 'unit', 'source'].map((column) => (
                      <th
                        key={column}
                        scope="col"
                        className="border-b border-hairline p-2 text-left font-mono font-semibold text-ink-primary"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono text-ink-secondary">
                  {[
                    ['…/VC_DTH_TOTN', 'country/COD', '2015', '945', 'Number', 'unstats.un.org'],
                    ['…/VC_DTH_TOTN', 'country/COD', '2016', '836', 'Number', 'unstats.un.org'],
                    ['…/VC_DTH_TOTN', 'country/SSD', '2015', '2418', 'Number', 'unstats.un.org'],
                    ['…/VC_DTH_TOTN', 'country/SSD', '2016', '2807', 'Number', 'unstats.un.org'],
                  ].map((row) => (
                    <tr key={row.join()} className="even:bg-surface-1">
                      {row.map((cell) => (
                        <td key={cell} className="whitespace-nowrap p-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-muted">
              Long, not wide. Do not pivot years into columns in the extract: both tools
              pivot for display far better than they unpivot for analysis, and a wide
              table has to be rebuilt every time a new year is published.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Which endpoint your dashboard should call"
        lead="Three, and the choice is made by the question rather than by preference. Each accepts GET and POST; POST is easier from a BI tool, because the lists go in the body instead of becoming repeated query keys."
      >
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full border-collapse text-[0.8rem]">
            <caption className="sr-only">Endpoint selection for dashboard use</caption>
            <thead className="bg-surface-2">
              <tr>
                <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">
                  Endpoint
                </th>
                <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">
                  Use it when
                </th>
                <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">
                  Returns
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  '/api/observations/series',
                  'You know the countries and want the full history — the usual case for a trend page.',
                  'data → variable → entity → series[]',
                ],
                [
                  '/core/api/v2/observation',
                  'You want one value per country across a whole region, for a ranking or a map, without listing country codes.',
                  'byVariable → byEntity → orderedFacets[] → observations[]',
                ],
                [
                  '/api/place/name',
                  'Always, at the end. It turns country/SSD into South Sudan so an axis label is readable.',
                  'a flat record of dcid → name',
                ],
              ].map(([endpoint, when, returns]) => (
                <tr key={endpoint} className="align-top even:bg-surface-1">
                  <th scope="row" className="p-3 text-left align-top">
                    <code className="font-mono text-[0.72rem] text-volt">{endpoint}</code>
                  </th>
                  <td className="p-3 text-ink-secondary">{when}</td>
                  <td className="p-3 font-mono text-[0.7rem] text-ink-muted">{returns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
          The{' '}
          <Link to="/cookbook" className="text-volt underline decoration-volt/30 underline-offset-2">
            query cookbook
          </Link>{' '}
          has these as curl, with the containment-expression grammar explained. This page
          assumes you have picked one and now need it inside a tool.
        </p>
      </Section>

      <Section
        title="Power BI — step 1, the request"
        lead="Get Data → Blank Query → Advanced Editor, and paste this. Three lines at the top are the only thing a colleague should ever edit."
      >
        <CodeBlock
          label="Power Query M — the call"
          code={`let
    // ── edit these three, nothing else ───────────────────────────────
    Base      = "${API}",
    Variables = {"undata/sdg/EG_ACS_ELEC", "undata/sdg/IT_USE_ii99"},
    Entities  = {"country/BGD", "country/ETH", "country/IND", "country/KEN"},
    // ─────────────────────────────────────────────────────────────────

    // POST, because the payload is two JSON arrays. Web.Contents turns the
    // request into a POST as soon as Content is present.
    //
    // Keep Base a literal string and put the path in RelativePath. That is
    // what lets the Power BI Service recognise a fixed data source and
    // refresh it on a schedule; a URL assembled with & becomes a "dynamic
    // data source" and scheduled refresh refuses it.
    Response = Json.Document(
        Web.Contents(Base, [
            RelativePath = "api/observations/series",
            Headers      = [#"Content-Type" = "application/json"],
            Content      = Json.FromValue([variables = Variables, entities = Entities])
        ])
    )
in
    Response`}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-hairline bg-surface-1 p-4 text-[0.83rem] leading-relaxed text-ink-secondary">
            <h3 className="text-[0.88rem] font-semibold text-ink-primary">
              When it asks how to sign in
            </h3>
            <p className="mt-1.5">
              Choose <strong className="text-ink-primary">Anonymous</strong>, at the level
              of the base URL. There is no API key and no account. If you also see a
              privacy-level prompt, set this source to{' '}
              <strong className="text-ink-primary">Public</strong> — it is published
              official statistics, and leaving it at Private is what later produces a
              Formula.Firewall error when you combine it with anything else.
            </p>
          </div>
          <div className="rounded-lg border border-hairline bg-surface-1 p-4 text-[0.83rem] leading-relaxed text-ink-secondary">
            <h3 className="text-[0.88rem] font-semibold text-ink-primary">
              The same M works in Excel
            </h3>
            <p className="mt-1.5">
              Data → Get Data → From Other Sources → Blank Query. Power Query is the same
              engine in both, so a colleague without a Power BI licence can run the whole
              of this page in Excel and hand you the workbook.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Power BI — step 2, the cleaning"
        lead={
          <>
            Continue the same query. Every step is named for what it does, because these
            names are what the Applied Steps pane shows the next person to open the file.
          </>
        }
      >
        <CodeBlock
          label="Power Query M — keys to rows, then the facet join"
          code={`    // ── keys into rows ───────────────────────────────────────────────
    // data is a record keyed by variable, holding records keyed by entity.
    // Record.ToTable is the move that makes dynamic keys into data.
    ByVariable = Table.RenameColumns(Record.ToTable(Response[data]), {{"Name", "variable"}}),
    AddEntity  = Table.AddColumn(ByVariable, "entities", each Record.ToTable([Value])),
    DropRecord = Table.RemoveColumns(AddEntity, {"Value"}),
    ByEntity   = Table.ExpandTableColumn(
                     DropRecord, "entities", {"Name", "Value"}, {"entity", "block"}),

    // Each block holds the observations plus the facet id that attributes them.
    AddFacetId = Table.AddColumn(ByEntity, "facet_id",
                     each Record.FieldOrDefault([block], "facet", null), type text),
    AddObs     = Table.AddColumn(AddFacetId, "obs",
                     each Table.FromRecords(Record.FieldOrDefault([block], "series", {}))),

    // An entity with no data comes back with an empty series. Dropping the row
    // is deliberate: a missing row draws as a gap, a zero draws as a
    // measurement nobody took. Never fill this with 0.
    HasData    = Table.SelectRows(AddObs, each Table.RowCount([obs]) > 0),
    DropBlock  = Table.RemoveColumns(HasData, {"block"}),
    Observations = Table.ExpandTableColumn(
                     DropBlock, "obs", {"date", "value"}, {"date", "value"}),

    // date stays text on purpose. It is "2024", and occasionally "2024-06".
    // A real date column would invent a day that nobody measured; year is the
    // only part that is safe to make a number.
    Typed      = Table.TransformColumnTypes(
                     Observations, {{"date", type text}, {"value", type number}}),
    AddYear    = Table.AddColumn(Typed, "year", each Int64.From(Text.Start([date], 4)), Int64.Type),

    // ── the facets, where the meaning lives ──────────────────────────
    // Record.FieldOrDefault rather than Table.ExpandRecordColumn, because not
    // every facet carries every field — HDI has no unitDisplayName at all, and
    // expanding a field that is absent puts errors in the cells.
    FacetRows  = Table.RenameColumns(Record.ToTable(Response[facets]), {{"Name", "facet_id"}}),
    FacetUrl   = Table.AddColumn(FacetRows, "source_url",
                     each Record.FieldOrDefault([Value], "provenanceUrl", null), type text),
    FacetProv  = Table.AddColumn(FacetUrl, "provenance",
                     each Record.FieldOrDefault([Value], "provenanceId", null), type text),
    FacetUnit  = Table.AddColumn(FacetProv, "unit",
                     each Record.FieldOrDefault([Value], "unitDisplayName", null), type text),
    FacetPer   = Table.AddColumn(FacetUnit, "period",
                     each Record.FieldOrDefault([Value], "observationPeriod", null), type text),
    Facets     = Table.SelectColumns(
                     FacetPer, {"facet_id", "source_url", "provenance", "unit", "period"}),

    Joined     = Table.NestedJoin(AddYear, {"facet_id"}, Facets, {"facet_id"}, "f", JoinKind.LeftOuter),
    WithSource = Table.ExpandTableColumn(
                     Joined, "f", {"source_url", "provenance", "unit", "period"}),`}
        />
      </Section>

      <Section
        title="Power BI — step 3, names and a retrieval stamp"
        lead="Still the same query. Doing the name lookup here, from the literal Entities list, is not a stylistic choice — see the note underneath."
      >
        <CodeBlock
          label="Power Query M — the finish"
          code={`    // ── readable place names ─────────────────────────────────────────
    NameResponse = Json.Document(
        Web.Contents(Base, [
            RelativePath = "api/place/name",
            Headers      = [#"Content-Type" = "application/json"],
            Content      = Json.FromValue([dcids = Entities])
        ])
    ),
    NameRows  = Table.RenameColumns(Record.ToTable(NameResponse), {{"Name", "entity"}, {"Value", "place"}}),
    NameTyped = Table.TransformColumnTypes(NameRows, {{"entity", type text}, {"place", type text}}),
    Named     = Table.ExpandTableColumn(
                    Table.NestedJoin(WithSource, {"entity"}, NameTyped, {"entity"}, "n", JoinKind.LeftOuter),
                    "n", {"place"}),

    // ── stamp the pull ───────────────────────────────────────────────
    // Computed once as a step, not inside the each lambda — in there it is
    // re-evaluated per row and you get a column of near-identical timestamps.
    Retrieved = DateTimeZone.UtcNow(),
    Stamped   = Table.AddColumn(Named, "retrieved_at", each Retrieved, type datetimezone),

    Final     = Table.SelectColumns(Stamped, {
                    "variable", "entity", "place", "date", "year", "value",
                    "unit", "period", "provenance", "source_url", "retrieved_at"})
in
    Final`}
        />
        <div className="mt-4 rounded-lg border-l-2 border-status-warning bg-surface-1 p-4">
          <h3 className="text-[0.9rem] font-semibold text-ink-primary">
            Why the name lookup is in this query and not its own
          </h3>
          <p className="mt-2 max-w-3xl text-[0.85rem] leading-relaxed text-ink-secondary">
            The obvious design is a second query that reads the distinct entities out of
            the first and posts them to <code className="text-volt">/api/place/name</code>.
            Power Query refuses it:{' '}
            <em>
              “Query references other queries or steps, so it may not directly access a
              data source.”
            </em>{' '}
            Feeding one query's output into another query's web request is exactly what
            the privacy firewall blocks. Because{' '}
            <code className="text-volt">Entities</code> is a literal list in this query,
            posting it here is not a cross-query reference and the firewall has nothing to
            object to. Splitting into dimension tables afterwards with{' '}
            <strong className="text-ink-primary">Reference</strong> is fine — it is only
            the web call that is constrained.
          </p>
        </div>
      </Section>

      <Section
        title="Power BI — step 4, the model"
        lead="One fact table and three small dimensions. Worth the ten minutes, because it is what lets a slicer filter a chart without also filtering the source caption underneath it."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-hairline bg-surface-1 p-5">
            <h3 className="text-[0.9rem] font-semibold text-ink-primary">The star</h3>
            <pre className="mt-3 overflow-x-auto font-mono text-[0.72rem] leading-relaxed text-ink-secondary">
{`  DimPlace          DimIndicator
  entity (key)      variable (key)
  place             short_name
  region            unit
       \\              /
        \\            /
      FactObservation
      variable, entity, year,
      value, facet_id
             |
        DimSource
        facet_id (key)
        provenance, source_url, period`}
            </pre>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-muted">
              Build the dimensions by right-clicking the finished query →{' '}
              <strong className="text-ink-primary">Reference</strong>, keeping the relevant
              columns, then <strong className="text-ink-primary">Remove Duplicates</strong>.
              Set each relationship to single-direction, one-to-many, from dimension to
              fact.
            </p>
          </div>

          <div className="space-y-3">
            <CodeBlock
              label="DAX — the value at each country's own latest year"
              language="dax"
              code={`Latest value =
VAR LatestYear = MAX ( FactObservation[year] )
RETURN
    CALCULATE (
        SELECTEDVALUE ( FactObservation[value] ),
        REMOVEFILTERS ( FactObservation[year] ),
        FactObservation[year] = LatestYear
    )`}
            />
            <CodeBlock
              label="DAX — the measure that stops a dishonest map"
              language="dax"
              code={`Vintage spread (years) =
VAR YearPerEntity =
    ADDCOLUMNS (
        VALUES ( FactObservation[entity] ),
        "@Year", CALCULATE ( MAX ( FactObservation[year] ) )
    )
RETURN
    MAXX ( YearPerEntity, [@Year] ) - MINX ( YearPerEntity, [@Year] )`}
            />
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-hairline bg-surface-1 p-5">
          <h3 className="text-[0.9rem] font-semibold text-ink-primary">
            Put the second measure on the page, not in a comment
          </h3>
          <p className="mt-2 max-w-3xl text-[0.85rem] leading-relaxed text-ink-secondary">
            A “latest available” map looks like a cross-section and usually is not. The
            homicide ranking in the{' '}
            <Link
              to="/peace-and-security"
              className="text-volt underline decoration-volt/30 underline-offset-2"
            >
              peace case
            </Link>{' '}
            spans fifteen reference years; the HDI ranking in the{' '}
            <Link to="/development" className="text-volt underline decoration-volt/30 underline-offset-2">
              development case
            </Link>{' '}
            spans none. Same query, different data. A card showing{' '}
            <code className="text-volt">Vintage spread</code> beside the map tells your
            reader which of the two they are looking at, and costs one visual.
          </p>
        </div>

        <div className="mt-4">
          <Expander question="Make it a reusable function instead" time="1 minute">
            <p className="mb-3">
              Once more than one report needs this, wrap the whole query as a function and
              keep it in a shared dataflow or a template. The body is unchanged — only the
              first and last lines differ.
            </p>
            <CodeBlock
              label="fnUndcSeries.pq"
              code={`(Variables as list, Entities as list) as table =>
let
    Base     = "${API}",
    Response = Json.Document(
        Web.Contents(Base, [
            RelativePath = "api/observations/series",
            Headers      = [#"Content-Type" = "application/json"],
            Content      = Json.FromValue([variables = Variables, entities = Entities])
        ])
    ),
    // …every step from above, unchanged…
    Final = Stamped
in
    Final`}
            />
            <p className="mt-3">
              Then drive it from a two-column table a colleague can edit in the report
              itself — indicator and country list — rather than asking them to open the
              Advanced Editor. Note that the firewall rule above applies again the moment
              the arguments come from another query; the usual answer is to set both
              sources to Public, or to build the list inside the same query with{' '}
              <code className="text-volt">Table.FromRows</code>.
            </p>
          </Expander>
        </div>
      </Section>

      <Section
        title="Tableau — pick a route before you write anything"
        lead="Tableau has no native connector for an arbitrary REST endpoint, so the real decision is where the rectangle gets made. Four options, honestly ranked."
      >
        <ol className="space-y-3">
          {[
            {
              title: 'A tidy CSV on a schedule — start here',
              body: 'Something writes one flat file; Tableau connects to it as a text file, a Google Sheet, or a published URL. Unglamorous, works everywhere, survives you leaving the office. This is the right answer for almost every UN team.',
              tone: 'good',
            },
            {
              title: 'A .hyper extract, published to Tableau Server or Cloud',
              body: 'Same idea with a faster file. A scheduled job writes the extract with the tableauhyperapi package and publishes it with tableauserverclient. Worth it when the extract is large or many workbooks share it.',
              tone: 'good',
            },
            {
              title: 'Tableau Prep with a Script step',
              body: 'Prep can call a Python function through TabPy. Reasonable if your organisation already runs a TabPy server; not worth standing one up for this alone, and Prep flows are harder to review than a twelve-line script.',
              tone: 'ok',
            },
            {
              title: 'A Web Data Connector 3.0',
              body: 'The only route that queries the API live from Tableau. You build it with the Tableau Connector SDK and host it yourself, then keep it working across Tableau versions. For one team that is more maintenance than a scheduled file, and the data changes annually.',
              tone: 'ok',
            },
          ].map((option, index) => (
            <li key={option.title} className="flex gap-4 rounded-lg border border-hairline bg-surface-1 p-4">
              <span
                className={`tnum shrink-0 font-mono text-[0.8rem] font-semibold ${
                  option.tone === 'good' ? 'text-volt' : 'text-ink-muted'
                }`}
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-[0.9rem] font-semibold text-ink-primary">{option.title}</h3>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-secondary">{option.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 rounded-lg border-l-2 border-status-warning bg-surface-1 p-4">
          <h3 className="text-[0.9rem] font-semibold text-ink-primary">
            What not to do: point Tableau's JSON connector at the raw response
          </h3>
          <p className="mt-2 max-w-3xl text-[0.85rem] leading-relaxed text-ink-secondary">
            It will open the file, and it will produce a column per identifier —{' '}
            <code className="text-volt">data.undata/sdg/EG_ACS_ELEC.country/BGD.series.0.value</code>{' '}
            and one more for every observation. The schema then changes the next time you
            ask for a different country, which breaks every calculated field built on it.
            Flatten first, always.
          </p>
        </div>
      </Section>

      <Section
        title="Tableau — making the rectangle"
        lead="Two ways to write the file. The first has no dependencies beyond curl and jq and runs in any scheduler; the second is the one to grow into."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <CodeBlock
              label="shell — tidy CSV, no Python required"
              code={`curl -s -X POST '${API}/api/observations/series' \\
  -H 'Content-Type: application/json' \\
  -d '{"variables":["undata/sdg/EG_ACS_ELEC"],
       "entities":["country/BGD","country/ETH","country/IND"]}' \\
| jq -r '
    .facets as $f
  | ["variable","entity","year","value","unit","source"],
    ( .data | to_entries[] as $v
      | $v.value | to_entries[] as $e
      | ($f[$e.value.facet] // {}) as $facet
      | ($e.value.series // [])[]
      | [ $v.key, $e.key, .date, .value,
          ($facet.unitDisplayName // ""),
          ($facet.provenanceUrl // "") ] )
  | @csv' > un-indicator.csv`}
            />
            <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-muted">
              Verified against the live platform: 75 rows for those three countries. The{' '}
              <code>// []</code> and <code>// ""</code> fallbacks are what stop a country
              with no data from aborting the whole file.
            </p>
          </div>

          <div className="space-y-3 text-[0.85rem] leading-relaxed text-ink-secondary">
            <p>
              For anything beyond one indicator, use the Python helper on the{' '}
              <Link to="/notebooks" className="text-volt underline decoration-volt/30 underline-offset-2">
                Python, R &amp; Julia page
              </Link>{' '}
              and finish with <code className="text-volt">frame.to_csv(…, index=False)</code>.
              It already handles the empty-series case, joins the facets and adds the place
              names.
            </p>
            <p>
              To write a <code className="text-volt">.hyper</code> extract instead, the
              same frame goes straight into it:
            </p>
            <CodeBlock
              label="Python — .hyper from the same frame"
              language="python"
              code={`import pantab   # pip install pantab

pantab.frame_to_hyper(
    frame, "un-indicator.hyper", table="observations"
)`}
            />
            <p className="text-[0.82rem] text-ink-muted">
              <code>pantab</code> is a thin wrapper over the official{' '}
              <code>tableauhyperapi</code>; use the latter directly if you need control
              over column types. Publish with{' '}
              <code className="text-volt">tableauserverclient</code> from the same script.
            </p>
            <p>
              Whichever route, schedule it the way the{' '}
              <Link to="/visualise" className="text-volt underline decoration-volt/30 underline-offset-2">
                self-refreshing chart recipe
              </Link>{' '}
              does — a weekly cron or GitHub Action is ample for data that is published
              annually.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Tableau — three things to set up in the workbook"
        lead="Once the extract is connected, these are the settings that decide whether the dashboard is defensible."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Year is a dimension, not a date',
              body: 'Tableau will happily cast "2015" to 1 January 2015 and then offer you month and quarter. Those do not exist. Convert year to a whole-number dimension and leave date as a string.',
            },
            {
              title: 'The source belongs on the sheet',
              body: 'Add a calculated field — "Source: " + ATTR([provenance]) + ", retrieved " + STR([retrieved_at]) — and put it on Tooltip and in a caption. A dashboard gets screenshotted within a week; the caption is all that travels with it.',
            },
            {
              title: 'Guard the mixed vintage',
              body: 'An LOD makes it a number you can display: MAX({FIXED [Entity] : MAX([Year])}) − MIN({FIXED [Entity] : MAX([Year])}). If it is not zero, the map is not a cross-section, and the title should say so.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <h3 className="text-[0.88rem] font-semibold text-ink-primary">{item.title}</h3>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-secondary">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
          One licensing note: Tableau Public is free and publishes your workbook and its
          data publicly. That is fine for published UN statistics and not fine for a
          workbook that also holds internal figures — the same caution the{' '}
          <Link to="/visualise" className="text-volt underline decoration-volt/30 underline-offset-2">
            charting tools page
          </Link>{' '}
          gives for Datawrapper and Flourish.
        </p>
      </Section>

      <Section
        title="Five things that will bite a dashboard specifically"
        lead="Distinct from the API traps in the cookbook. These are the ones that only show up once the data is inside a BI tool."
      >
        <ol className="space-y-3">
          {[
            {
              title: 'A gap filled to zero by the visual, not by you',
              body: 'Both tools offer to show missing values as zero on a line or in a matrix. On this data that turns "no survey was run" into "the value was nought". Turn it off in Format → Analytics, and in Tableau uncheck Show Missing Values.',
            },
            {
              title: 'A slicer that also filters the source caption',
              body: 'If the caption reads from the fact table, filtering to one country changes it. Put provenance in its own dimension table and let the caption measure read from there, so it keeps naming every agency in the report.',
            },
            {
              title: 'Scheduled refresh refusing a dynamic data source',
              body: 'It means the URL was built by string concatenation somewhere. Every web call must be Web.Contents(literal, [RelativePath = …]) for the Service to resolve it. This also rules out Power BI’s Python and R script sources, which need a personal gateway.',
            },
            {
              title: 'A total that is not a total',
              body: 'Summing a rate, or summing age bands that exclude the unknown category, produces a confident wrong number. Set the default aggregation on percentage and index columns to Average or Do Not Summarize the moment the table loads.',
            },
            {
              title: 'Two agencies, one chart, no label',
              body: 'The facet is what tells you a series changed source mid-way. Keep facet_id in the fact table even though nobody will look at it, and colour or annotate by provenance when a series has more than one.',
            },
          ].map((item, index) => (
            <li key={item.title} className="flex gap-4 rounded-lg border border-hairline bg-surface-1 p-4">
              <span className="tnum shrink-0 font-mono text-[0.8rem] font-semibold text-status-warning">
                {index + 1}
              </span>
              <div>
                <h3 className="text-[0.9rem] font-semibold text-ink-primary">{item.title}</h3>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-secondary">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="What this page leaves you with">
        <div className="grid gap-4 md:grid-cols-2">
          <Takeaway>
            <strong className="text-ink-primary">Two of the JSON levels are data.</strong>{' '}
            The variable and the entity are keys, not columns.{' '}
            <code>Record.ToTable</code> in M, a loop over items everywhere else. Once that
            lands, the rest is ordinary table work.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Join the facets or publish an orphan.</strong>{' '}
            The numbers are in <code>data</code>; the unit, the period and the agency are
            in <code>facets</code>. A dashboard that drops them has lost the part a reader
            needs to check the figure.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Keep the base URL literal.</strong>{' '}
            <code>RelativePath</code> and <code>Content</code> are not a style preference
            in Power BI — they are the difference between a report that refreshes on a
            schedule and one somebody has to open every Monday.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Tableau wants a file.</strong> Decide
            where the rectangle is made before you open Tableau at all. A scheduled tidy
            CSV beats a live connector you have to maintain, for data that moves once a
            year.
          </Takeaway>
        </div>
      </Section>
    </>
  );
}
