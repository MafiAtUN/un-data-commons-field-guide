/**
 * Turn a question into runnable code, in whichever tool the reader lives in.
 *
 * The premise of this module is that almost nobody's difficulty with this API
 * is the HTTP. It is knowing *which* of three endpoints answers the question
 * they actually have, and then writing the twenty lines of shape-wrangling that
 * every one of them needs and none of them enjoys. Both are mechanical, so both
 * are generated here.
 *
 * Everything below is a pure function of a {@link RecipeSpec}: no fetch, no
 * React, no clock. `tests/recipes.test.ts` asserts the properties that make the
 * output safe to paste — the right endpoint for the shape, encoded relation
 * expressions, every requested variable present, and no interpolation escaping
 * a string literal.
 */

import { API_ROOT } from './config';
import { childCountriesOf } from './dcid';

/** What the reader is trying to draw. This, not preference, picks the endpoint. */
export type Shape = 'trend' | 'ranking' | 'scatter';

export type Tool = 'curl' | 'powerquery' | 'python' | 'r' | 'julia' | 'jq';

export interface RecipeSpec {
  /** Variable dcids, in the order the reader chose them. */
  variables: readonly string[];
  /** Explicit place dcids. Used for `trend`, and for the other shapes when no parent is given. */
  entities: readonly string[];
  /** A containment parent such as `africa` or `SouthernAsia`. Preferred for `ranking`/`scatter`. */
  parentPlace?: string;
  shape: Shape;
  /** `LATEST`, or a four-digit year to pin a comparable cross-section. */
  date?: string;
}

export const TOOL_LABELS: Record<Tool, string> = {
  curl: 'curl',
  powerquery: 'Power Query (M)',
  python: 'Python',
  r: 'R',
  julia: 'Julia',
  jq: 'curl + jq → CSV',
};

/** The syntax highlighting hint each tool's block should carry. */
export const TOOL_LANGUAGES: Record<Tool, string> = {
  curl: 'bash',
  powerquery: 'powerquery',
  python: 'python',
  r: 'r',
  julia: 'julia',
  jq: 'bash',
};

export interface EndpointChoice {
  method: 'GET' | 'POST';
  path: string;
  /** Why this endpoint and not another — shown to the reader, not just used. */
  why: string;
}

/**
 * Pick the endpoint from the shape.
 *
 * A trend needs every year for places you can name, which is the series
 * endpoint. A ranking or a scatter needs one value per place across a set you
 * would rather not enumerate, which is the REST v2 observation endpoint with a
 * containment expression. There is no third decision to make.
 */
export function chooseEndpoint(spec: RecipeSpec): EndpointChoice {
  if (spec.shape === 'trend') {
    return {
      method: 'POST',
      path: '/api/observations/series',
      why: 'A trend needs every observation for places you can name, which is what the series endpoint returns. It takes no date argument: you get the whole history and slice it yourself.',
    };
  }
  return {
    method: 'GET',
    path: '/core/api/v2/observation',
    why: spec.parentPlace
      ? 'One value per place across a whole region. The containment expression is evaluated inside the graph, so this is one request rather than a loop over country codes.'
      : 'One value per place for a named list. The same endpoint takes entity.dcids instead of an expression when you already know the places.',
  };
}

/** `LATEST` unless the reader pinned a year. */
export function resolvedDate(spec: RecipeSpec): string {
  return spec.date?.trim() || 'LATEST';
}

/** The containment expression, or undefined when explicit places are used. */
export function entityExpression(spec: RecipeSpec): string | undefined {
  return spec.parentPlace ? childCountriesOf(spec.parentPlace) : undefined;
}

/**
 * The warning that belongs above a scatter, always.
 *
 * Two variables from two agencies almost never cover the same countries, and an
 * inner join is silent about what it discarded. Every scatter recipe carries
 * the count check for that reason.
 */
export const SCATTER_CAVEAT =
  'An inner join across two agencies keeps only the places that have both. ' +
  'Print the three counts before you plot: the join is where countries ' +
  'disappear, and it never says so.';

/** The same caveat as a wrapped comment block, for pasting into generated code. */
export function caveatComment(prefix: string): string {
  return [
    'An inner join across two agencies keeps only the places that have',
    'both. Print the three counts before you plot: the join is where',
    'countries disappear, and it never says so.',
  ]
    .map((line) => `${prefix} ${line}`)
    .join('\n');
}

/* ---------------------------------------------------------------------- *
 * Literal helpers
 *
 * Everything the reader typed reaches a generated string literal, so each
 * target language gets its own escaper. These are deliberately strict rather
 * than clever: dcids are `[A-Za-z0-9/._-]`, and anything else is dropped rather
 * than escaped, because a quote inside a dcid means the input was wrong, not
 * that it needs quoting.
 * ---------------------------------------------------------------------- */

/** Strip anything that cannot appear in a dcid or a containment parent. */
export function sanitizeDcid(value: string): string {
  return value.replace(/[^A-Za-z0-9/._+<>{}:-]/g, '');
}

function quoted(values: readonly string[], quote = '"'): string {
  return values.map((value) => `${quote}${sanitizeDcid(value)}${quote}`).join(', ');
}

function indentedList(values: readonly string[], indent: string): string {
  return values.map((value) => `${indent}"${sanitizeDcid(value)}"`).join(',\n');
}

/* ---------------------------------------------------------------------- *
 * Generators
 * ---------------------------------------------------------------------- */

function curlRecipe(spec: RecipeSpec): string {
  const endpoint = chooseEndpoint(spec);
  const url = `${API_ROOT}${endpoint.path}`;

  if (spec.shape === 'trend') {
    return `curl -s -X POST '${url}' \\
  -H 'Content-Type: application/json' \\
  -d '{"variables":[${quoted(spec.variables)}],"entities":[${quoted(spec.entities)}]}'

# The body must stay on one line: a line break anywhere inside it makes this
# deployment answer 403 Forbidden, which reads like an auth problem and is not.`;
  }

  const place = spec.parentPlace
    ? `  --data-urlencode 'entity.expression=${entityExpression(spec)}' \\`
    : spec.entities
        .map((entity) => `  --data-urlencode 'entity.dcids=${sanitizeDcid(entity)}' \\`)
        .join('\n');

  const variables = spec.variables
    .map((variable) => `  --data-urlencode 'variable.dcids=${sanitizeDcid(variable)}' \\`)
    .join('\n');

  const request = `curl -s -G '${url}' \\
  --data-urlencode 'date=${resolvedDate(spec)}' \\
${variables}
${place}
  --data-urlencode 'select=date'     \\
  --data-urlencode 'select=value'    \\
  --data-urlencode 'select=variable' \\
  --data-urlencode 'select=entity'`;

  if (spec.shape !== 'scatter') {
    return `${request}

# The arrows and braces must reach the server percent-encoded.
# --data-urlencode is what does that; a hand-built URL returns 400.`;
  }

  // Both variables come back from one request, so the coverage check is a jq
  // filter rather than a second call. It is appended rather than offered,
  // because an inner join is where countries disappear without telling anyone.
  return `${request} \\
| jq '[.byVariable | to_entries[]
       | {variable: .key,
          places: (.value.byEntity | with_entries(select(.value.orderedFacets)) | length)}]
      as $each
    | [.byVariable[] | .byEntity | with_entries(select(.value.orderedFacets)) | keys] as $sets
    | {each: $each, both: ($sets[0] - ($sets[0] - $sets[1]) | length)}'

${caveatComment('#')}
# Drop the jq filter to get the observations themselves. The arrows and braces
# must reach the server percent-encoded, which is what --data-urlencode does;
# a hand-built URL returns 400.`;
}

function pythonRecipe(spec: RecipeSpec): string {
  const header = `import pandas as pd
import requests

BASE = "${API_ROOT}"`;

  if (spec.shape === 'trend') {
    return `${header}

payload = {
    "variables": [
${indentedList(spec.variables, '        ')},
    ],
    "entities": [
${indentedList(spec.entities, '        ')},
    ],
}

r = requests.post(f"{BASE}/api/observations/series", json=payload, timeout=30)
r.raise_for_status()
body = r.json()

rows = []
for variable, by_entity in body["data"].items():
    for entity, block in by_entity.items():
        facet = body["facets"].get(block.get("facet"), {})
        if not block.get("series"):
            print(f"no data: {variable} / {entity}")   # absent is not zero
        for obs in block.get("series") or []:
            rows.append({"variable": variable, "entity": entity,
                         "date": obs["date"], "value": obs["value"],
                         "unit": facet.get("unitDisplayName"),
                         "source": facet.get("provenanceUrl")})

frame = pd.DataFrame(rows)
print(frame.head())`;
  }

  const parent = sanitizeDcid(spec.parentPlace ?? 'Earth');
  const place = spec.entities
    .map((entity) => `        ("entity.dcids", "${sanitizeDcid(entity)}"),`)
    .join('\n');

  const fetcher = `${header}
${spec.parentPlace ? `\nPARENT = "${parent}"\n` : ''}

def latest(variable: str) -> pd.DataFrame:
    """One value per country, with the reference year kept alongside it."""
    # Repeated keys, so a list of tuples rather than a dict.
    params = [
        ("date", "${resolvedDate(spec)}"),
        ("variable.dcids", variable),
${spec.parentPlace ? '        ("entity.expression", f"{PARENT}<-containedInPlace+{{typeOf:Country}}"),' : place}
        ("select", "date"), ("select", "value"),
        ("select", "entity"), ("select", "variable"),
    ]
    r = requests.get(f"{BASE}/core/api/v2/observation", params=params, timeout=30)
    r.raise_for_status()

    by_entity = r.json()["byVariable"][variable]["byEntity"]
    return pd.DataFrame([
        {"entity": entity,
         "year": block["orderedFacets"][0]["observations"][0]["date"],
         "value": block["orderedFacets"][0]["observations"][0]["value"]}
        for entity, block in by_entity.items()
        if block.get("orderedFacets")
    ])`;

  if (spec.shape === 'ranking') {
    return `${fetcher}


frame = latest("${sanitizeDcid(spec.variables[0] ?? '')}")
print(f"{len(frame)} countries")

# date=LATEST resolves per country, so check before calling this a snapshot.
print("reference years:", sorted(frame["year"].unique()))
print(frame.sort_values("value", ascending=False).head(10))`;
  }

  const [x, y] = [spec.variables[0] ?? '', spec.variables[1] ?? ''];
  return `${fetcher}


X = "${sanitizeDcid(x)}"
Y = "${sanitizeDcid(y)}"

x, y = latest(X), latest(Y)

${caveatComment('#')}
points = x.merge(y, on="entity", suffixes=("_x", "_y"))
print(f"x: {len(x):>4} countries")
print(f"y: {len(y):>4} countries")
print(f"both: {len(points):>4} countries   <- every point you will plot")

# Two agencies, two reporting cycles: the years are unlikely to match.
print("x years:", sorted(x["year"].unique()))
print("y years:", sorted(y["year"].unique()))`;
}

function rRecipe(spec: RecipeSpec): string {
  const header = `library(httr2)
library(purrr)
library(dplyr)
library(tibble)

BASE <- "${API_ROOT}"`;

  if (spec.shape === 'trend') {
    return `${header}

resp <- request(BASE) |>
  req_url_path("/api/observations/series") |>
  req_body_json(list(
    variables = list(${quoted(spec.variables)}),
    entities  = list(${quoted(spec.entities)})
  )) |>
  req_perform()

body <- resp_body_json(resp, simplifyVector = FALSE)

frame <- imap(body$data, function(by_entity, variable) {
  imap(by_entity, function(block, entity) {
    if (length(block$series) == 0) {
      warning("no data for ", variable, " / ", entity, call. = FALSE)
      return(NULL)
    }
    facet <- body$facets[[block$facet]]
    tibble(
      variable = variable, entity = entity,
      date  = map_chr(block$series, "date"),
      value = map_dbl(block$series, "value"),
      unit  = facet$unitDisplayName %||% NA_character_
    )
  }) |> list_rbind()
}) |> list_rbind()

print(frame)`;
  }

  const placeArg = spec.parentPlace
    ? `    entity.expression = "${entityExpression(spec)}",`
    : `    entity.dcids      = c(${quoted(spec.entities)}),`;

  const fetcher = `${header}

undc_latest <- function(variable) {
  resp <- request(BASE) |>
    req_url_path("/core/api/v2/observation") |>
    # .multi = "explode" sends four select= keys rather than one joined value.
    # Without it the server returns 400.
    req_url_query(
      date              = "${resolvedDate(spec)}",
      variable.dcids    = variable,
${placeArg}
      select            = c("date", "value", "entity", "variable"),
      .multi            = "explode"
    ) |>
    req_perform()

  body <- resp_body_json(resp, simplifyVector = FALSE)

  imap(body$byVariable[[variable]]$byEntity, function(block, entity) {
    if (length(block$orderedFacets) == 0) return(NULL)
    first <- block$orderedFacets[[1]]$observations[[1]]
    tibble(entity = entity, year = first$date, value = first$value)
  }) |> list_rbind()
}`;

  if (spec.shape === 'ranking') {
    return `${fetcher}

frame <- undc_latest("${sanitizeDcid(spec.variables[0] ?? '')}")
cat(nrow(frame), "countries\\n")
cat("reference years:", sort(unique(frame$year)), "\\n")
arrange(frame, desc(value))`;
  }

  return `${fetcher}

x <- undc_latest("${sanitizeDcid(spec.variables[0] ?? '')}")
y <- undc_latest("${sanitizeDcid(spec.variables[1] ?? '')}")

${caveatComment('#')}
points <- inner_join(x, y, by = "entity", suffix = c("_x", "_y"))

cat("x:   ", nrow(x),      "countries\\n")
cat("y:   ", nrow(y),      "countries\\n")
cat("both:", nrow(points), "countries  <- every point you will plot\\n")

points`;
}

function juliaRecipe(spec: RecipeSpec): string {
  const header = `using HTTP, JSON3, DataFrames

const BASE = "${API_ROOT}"`;

  if (spec.shape === 'trend') {
    return `${header}

payload = (variables = [${quoted(spec.variables)}],
           entities  = [${quoted(spec.entities)}])

resp = HTTP.post("$BASE/api/observations/series",
                 ["Content-Type" => "application/json"], JSON3.write(payload))
body = JSON3.read(resp.body)

df = DataFrame(variable = String[], entity = String[],
               date = String[], value = Float64[])

for (variable, by_entity) in pairs(body.data),
    (entity, block)       in pairs(by_entity)

    obs = get(block, :series, nothing)
    if obs === nothing || isempty(obs)
        @warn "no data" variable entity      # absent is not zero
        continue
    end
    for o in obs
        push!(df, (String(variable), String(entity), String(o.date), Float64(o.value)))
    end
end

df`;
  }

  const placePairs = spec.parentPlace
    ? `             "entity.expression" => "${entityExpression(spec)}",`
    : spec.entities
        .map((entity) => `             "entity.dcids" => "${sanitizeDcid(entity)}",`)
        .join('\n');

  const fetcher = `${header}

function undc_latest(variable::String)
    # A vector of pairs, not a Dict — a Dict would keep only the last select=.
    query = ["date"           => "${resolvedDate(spec)}",
             "variable.dcids" => variable,
${placePairs}
             "select" => "date", "select" => "value",
             "select" => "entity", "select" => "variable"]

    resp = HTTP.get("$BASE/core/api/v2/observation"; query)
    body = JSON3.read(resp.body)

    df = DataFrame(entity = String[], year = String[], value = Float64[])
    for (entity, block) in pairs(body.byVariable[Symbol(variable)].byEntity)
        facets = get(block, :orderedFacets, nothing)
        (facets === nothing || isempty(facets)) && continue
        o = facets[1].observations[1]
        push!(df, (String(entity), String(o.date), Float64(o.value)))
    end
    df
end`;

  if (spec.shape === 'ranking') {
    return `${fetcher}

df = undc_latest("${sanitizeDcid(spec.variables[0] ?? '')}")
println(nrow(df), " countries")
println("reference years: ", sort(unique(df.year)))
sort(df, :value, rev = true)`;
  }

  return `${fetcher}

x = undc_latest("${sanitizeDcid(spec.variables[0] ?? '')}")
y = undc_latest("${sanitizeDcid(spec.variables[1] ?? '')}")

${caveatComment('#')}
points = innerjoin(x, y, on = :entity, makeunique = true)

println("x:    ", nrow(x),      " countries")
println("y:    ", nrow(y),      " countries")
println("both: ", nrow(points), " countries  <- every point you will plot")

points`;
}

function powerQueryRecipe(spec: RecipeSpec): string {
  if (spec.shape === 'trend') {
    return `let
    Base      = "${API_ROOT}",
    Variables = {${quoted(spec.variables)}},
    Entities  = {${quoted(spec.entities)}},

    // Base stays a literal and the path goes in RelativePath, so the Power BI
    // Service can resolve this as a fixed source and refresh it on a schedule.
    Response = Json.Document(
        Web.Contents(Base, [
            RelativePath = "api/observations/series",
            Headers      = [#"Content-Type" = "application/json"],
            Content      = Json.FromValue([variables = Variables, entities = Entities])
        ])
    ),

    // Two levels of the response are keyed by data, not by schema.
    ByVariable = Table.RenameColumns(Record.ToTable(Response[data]), {{"Name", "variable"}}),
    AddEntity  = Table.AddColumn(ByVariable, "entities", each Record.ToTable([Value])),
    DropRecord = Table.RemoveColumns(AddEntity, {"Value"}),
    ByEntity   = Table.ExpandTableColumn(
                     DropRecord, "entities", {"Name", "Value"}, {"entity", "block"}),

    AddObs     = Table.AddColumn(ByEntity, "obs",
                     each Table.FromRecords(Record.FieldOrDefault([block], "series", {}))),
    // A place with no observations is absent, not zero. Dropping the row draws
    // a gap; filling it with 0 draws a measurement nobody took.
    HasData    = Table.SelectRows(AddObs, each Table.RowCount([obs]) > 0),
    DropBlock  = Table.RemoveColumns(HasData, {"block"}),
    Expanded   = Table.ExpandTableColumn(DropBlock, "obs", {"date", "value"}, {"date", "value"}),
    Typed      = Table.TransformColumnTypes(
                     Expanded, {{"date", type text}, {"value", type number}}),
    AddYear    = Table.AddColumn(Typed, "year", each Int64.From(Text.Start([date], 4)), Int64.Type)
in
    AddYear`;
  }

  // The v2 endpoint requires four repeated `select` keys. Power Query's Query
  // record takes text values only, so it cannot express a repeated key — and a
  // comma-joined `select=date,value,entity,variable` is accepted by the server
  // but comes back with every entity present and no observations inside it,
  // which is the worst possible failure mode: a successful-looking empty table.
  // So the query string is assembled here and passed through RelativePath. Base
  // stays a literal, which is what scheduled refresh in the Service needs.
  const placePart = spec.parentPlace
    ? `             & "&entity.expression=" & Uri.EscapeDataString(Parent & "<-containedInPlace+{typeOf:Country}")`
    : spec.entities
        .map(
          (entity) =>
            `             & "&entity.dcids=" & Uri.EscapeDataString("${sanitizeDcid(entity)}")`,
        )
        .join('\n');

  const fetcher = `let
    Base = "${API_ROOT}",${spec.parentPlace ? `\n    Parent = "${sanitizeDcid(spec.parentPlace)}",` : ''}

    fnLatest = (Variable as text) as table =>
        let
            Path = "core/api/v2/observation?date=" & Uri.EscapeDataString("${resolvedDate(spec)}")
             & "&variable.dcids=" & Uri.EscapeDataString(Variable)
${placePart}
             & "&select=date&select=value&select=entity&select=variable",

            Response   = Json.Document(Web.Contents(Base, [RelativePath = Path])),

            // byVariable -> byEntity -> orderedFacets[] -> observations[].
            // Both of the first two levels are keyed by data, so both need
            // Record.ToTable rather than an expand.
            ByVariable = Record.ToTable(Response[byVariable]),
            WithRows   = Table.AddColumn(ByVariable, "rows", each Record.ToTable([Value][byEntity])),
            Flat       = Table.ExpandTableColumn(
                             Table.RemoveColumns(WithRows, {"Name", "Value"}),
                             "rows", {"Name", "Value"}, {"entity", "block"}),

            // A place the graph knows but has no value for comes back as an
            // empty record. Absent is not zero: drop the row, never fill it.
            WithObs    = Table.AddColumn(Flat, "obs", each
                             let Ranked = Record.FieldOrDefault([block], "orderedFacets", {})
                             in  if List.Count(Ranked) = 0 then null else Ranked{0}[observations]{0}),
            HasData    = Table.SelectRows(WithObs, each [obs] <> null),
            Shaped     = Table.AddColumn(
                             Table.AddColumn(HasData, "year", each [obs][date], type text),
                             "value", each [obs][value], type number)
        in
            Table.SelectColumns(Shaped, {"entity", "year", "value"}),`;

  if (spec.shape === 'ranking') {
    return `${fetcher}

    Ranking = fnLatest("${sanitizeDcid(spec.variables[0] ?? '')}")
in
    Table.Sort(Ranking, {{"value", Order.Descending}})`;
  }

  return `${fetcher}

    X = Table.RenameColumns(fnLatest("${sanitizeDcid(spec.variables[0] ?? '')}"),
            {{"year", "year_x"}, {"value", "value_x"}}),
    Y = Table.RenameColumns(fnLatest("${sanitizeDcid(spec.variables[1] ?? '')}"),
            {{"year", "year_y"}, {"value", "value_y"}}),

    ${caveatComment('//')}
    Joined = Table.NestedJoin(X, {"entity"}, Y, {"entity"}, "y", JoinKind.Inner),
    Points = Table.ExpandTableColumn(Joined, "y", {"year_y", "value_y"}),

    // Carry the three counts into the model so a card can show them. A scatter
    // that quietly lost 196 of its 210 countries must say so on the page.
    Counted = Table.AddColumn(Points, "countries_x", each Table.RowCount(X), Int64.Type),
    Both    = Table.AddColumn(Counted, "countries_both", each Table.RowCount(Points), Int64.Type)
in
    Both`;
}

function jqRecipe(spec: RecipeSpec): string {
  if (spec.shape === 'trend') {
    return `curl -s -X POST '${API_ROOT}/api/observations/series' \\
  -H 'Content-Type: application/json' \\
  -d '{"variables":[${quoted(spec.variables)}],"entities":[${quoted(spec.entities)}]}' \\
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
  | @csv' > un-data.csv`;
  }

  const place = spec.parentPlace
    ? `  --data-urlencode 'entity.expression=${entityExpression(spec)}' \\`
    : spec.entities
        .map((entity) => `  --data-urlencode 'entity.dcids=${sanitizeDcid(entity)}' \\`)
        .join('\n');

  const variables = spec.variables
    .map((variable) => `  --data-urlencode 'variable.dcids=${sanitizeDcid(variable)}' \\`)
    .join('\n');

  return `curl -s -G '${API_ROOT}/core/api/v2/observation' \\
  --data-urlencode 'date=${resolvedDate(spec)}' \\
${variables}
${place}
  --data-urlencode 'select=date'     \\
  --data-urlencode 'select=value'    \\
  --data-urlencode 'select=variable' \\
  --data-urlencode 'select=entity'   \\
| jq -r '
    .facets as $f
  | ["variable","entity","year","value","source"],
    ( .byVariable | to_entries[] as $v
      | $v.value.byEntity | to_entries[] as $e
      | ($e.value.orderedFacets // [])[0] as $block
      | select($block != null)
      | ($f[$block.facetId] // {}) as $facet
      | $block.observations[0]
      | [ $v.key, $e.key, .date, .value, ($facet.provenanceUrl // "") ] )
  | @csv' > un-data.csv

# One row per (variable, country). For a scatter, load it and pivot on
# variable — and count the rows per variable first, because an inner join
# across two agencies is where countries silently disappear.`;
}

const GENERATORS: Record<Tool, (spec: RecipeSpec) => string> = {
  curl: curlRecipe,
  powerquery: powerQueryRecipe,
  python: pythonRecipe,
  r: rRecipe,
  julia: juliaRecipe,
  jq: jqRecipe,
};

/** Runnable code for one spec in one tool. */
export function buildRecipe(spec: RecipeSpec, tool: Tool): string {
  return GENERATORS[tool](spec);
}

/** Every tool at once, for a tabbed view. */
export function buildAllRecipes(spec: RecipeSpec): Record<Tool, string> {
  return Object.fromEntries(
    (Object.keys(GENERATORS) as Tool[]).map((tool) => [tool, buildRecipe(spec, tool)]),
  ) as Record<Tool, string>;
}

/**
 * What is wrong with this spec, in the reader's terms.
 *
 * Returned rather than thrown: the builder shows these as guidance while the
 * reader is still choosing, and a half-built recipe is not an error.
 */
export function specProblems(spec: RecipeSpec): string[] {
  const problems: string[] = [];

  if (spec.variables.length === 0) problems.push('Choose at least one indicator.');
  if (spec.shape === 'scatter' && spec.variables.length < 2) {
    problems.push('A scatter needs two indicators — one for each axis.');
  }
  if (spec.shape === 'trend' && spec.entities.length === 0) {
    problems.push('A trend needs named places. Pick some countries, or switch to a ranking.');
  }
  if (spec.shape !== 'trend' && !spec.parentPlace && spec.entities.length === 0) {
    problems.push('Pick a region to compare across, or name the places yourself.');
  }
  if (spec.date && spec.date !== 'LATEST' && !/^\d{4}$/.test(spec.date)) {
    problems.push('A pinned date must be a four-digit year, or LATEST.');
  }
  return problems;
}
