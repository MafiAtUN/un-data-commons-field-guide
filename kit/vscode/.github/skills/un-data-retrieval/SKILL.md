---
name: un-data-retrieval
description: Fetch official statistics from the UN System Data Commons (data.un.org) through its MCP tools, the careful way. Find the indicator, check its coverage, then fetch, giving the year, unit and source for every value and naming the places with no data. Use whenever the user asks for a statistic, an SDG indicator, or data on countries, regions or UN groups, or asks what data exists on a topic.
---

# Fetching UN data

You have the UN Data Commons MCP tools. The user needs numbers they can put in a UN document and
defend. A plausible number with no year or source is worse than no number at all.

## The order of work

1. **Pin down the request.** You need five things:
   - **WHAT** is measured;
   - **WHERE**: the places;
   - **WHEN**: the latest value, a range of years, or two years to compare;
   - **PROOF**: year, source and gaps;
   - **FORMAT**: the table the user wants.

   If WHERE is an ambiguous group (see Places below), ask before fetching. Otherwise use sensible
   defaults and say what you chose.
2. **Find.** Call `search_indicators` with one concept per search, in plain words ("women married
   before age 18", not "child marriage and education"). Never guess or build an id yourself.
3. **Qualify.** Call `get_variable_metadata` on the two or three best candidates, for the places
   you need. Read off what each one measures, who publishes it, its unit, and its date range and
   coverage.
4. **Choose, and say why.** See "Choosing between series".
5. **Fetch.**
   - `get_observations` for each place: `date: "latest"` for the latest value, `"all"` for the
     history.
   - `get_child_observations` with a parent (`"africa"`, `"Earth"`, `"WesternAfrica"`) and
     `child_place_type: "Country"` for every country in a region in one call.
6. **Answer.** Give the table, then a short reading of it. Every value carries its year. Name the
   source once per series. List the places with no data.

## Choosing between series

The same measure is often published by several agencies, and by the SDG database as well.

- **For SDG reporting**, prefer the Global SDG Indicators Database series (`undata/sdg/...`). It
  is the official SDG figure, compiled by UNSD from the custodian agency.
- **For history**, the agency's own series often has more years than the SDG database copy, which
  may hold only the latest value. UNICEF's "trend" series is one example. Say so when you switch.
- **Where two series share a year, compare them.** If they agree, say so. If they differ, report
  both and explain the likely reason from the metadata (a different survey, a modelled estimate,
  a different definition).
- Check the unit and the definition: age group, sex, education level, per 100 or per 1,000.
  Never combine series with different definitions in one column.

## Places

- **In search tools, name places in plain words**: "Niger", "Côte d'Ivoire", "Africa". A code
  such as `country/NER` in a search tool's `places` returns an error.
- **The observation tools take ids**: `country/NER` (ISO3), and region ids such as `africa`,
  `Earth`, `SubSaharanAfrica`, `WesternAfrica` and `SouthernAsia`.
- **Groups.** "The Sahel", "West Africa", "fragile states", "the Horn of Africa" and similar names
  have several definitions. For example, the UN Integrated Strategy for the Sahel (UNISS) covers
  10 countries, and the G5 Sahel had 5. Ask which list the user means, or state the list you used
  in the answer. Never pick one silently.
- **Regional values** (Sub-Saharan Africa, World) are usually modelled aggregates. They can carry
  a more recent year than any country in the region. Label them as regional estimates.

## Time

- "Latest" is not a year. Countries' latest values come from different years. Always show the
  year beside the value, and when comparing countries, state the range of years ("2012 to
  2024").
- If the user asks for "current" or "this year", give the latest available year and say what it
  is.
- To compare two points in time, use the same years for every place where possible. Say where
  you could not.

## Breakdowns

- Many indicators exist by sex, age, location (urban/rural) or wealth quintile. Search for the
  breakdown explicitly and confirm it exists before promising it.
- Compare groups (girls and boys, rural and urban) **in the same year**, for each country.

## When something looks empty

- `"data": {}` with no error means the id was wrong. Search again; do not report "no data".
- A place with an empty series really has no data in that series. Check another series before
  saying it has no data anywhere.
- `get_multi_entity_observations` (bilateral flows) does not work on this server. Say so; do not
  retry it.

## Nothing from memory

Do not add facts the tools did not give you, even background ones: which surveys a country has
run, what a newer figure "probably" is, why a value changed. If newer data may exist outside the
UN Data Commons, say exactly that, and offer to search for it if the user wants.

## The table contract

When the user asks for a table, a CSV, or data for later analysis, return one row per value with
these columns:

| country | iso3 | indicator | sdg | series_id | year | value | unit | source | note |
|---|---|---|---|---|---|---|---|---|---|

- Keep every requested place. A place with no data gets a row with an empty value and "no data"
  in `note`.
- `source` is the agency and database (for example "UNSD Global SDG Indicators Database" or
  "UNICEF"), followed by the provenance URL.
- Offer the table as a CSV file when the user will reuse it.

## Citing

End answers that use data with one line per series:

> Source: [agency], [database], via the UN System Data Commons (data.un.org), series
> [series_id], retrieved [date].

## If the undata connector is also available

undata's tools (`undata_*`) add UN M49 regions and groups by name (LDCs, LLDCs, SIDS), the UNSD
progress method (`undata_assess_progress`), availability checks (`undata_check_availability`)
and charts. Use them for those jobs, and keep the same rules.
