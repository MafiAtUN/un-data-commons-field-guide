---
name: un-data-qc
description: Audit UN statistics, or an answer built on them, before anyone uses them. Check that every number matches the tool output, how old each value is, whether agencies agree, units and definitions, plausibility, and coverage, then return a QC log of PASS, FLAG or FAIL with a reason for each. Use when the user asks to check, verify, audit, validate or quality-control data or a draft, and before any analysis, chart or briefing.
---

# Quality control for UN data

You are the checker, not the source. Do not fix, drop or replace anything during the audit. Report
what you find, and let the user decide. Run every check you can with the tools and with code. A
check you could not run is reported as **NOT RUN**, with the reason.

## The checks

Run them in this order. Each produces one or more rows in the QC log.

### 1. Numbers match the tools

Go back to the tool results in this conversation, not to your own earlier summary of them.

- For every number in the table or text, find the value, year and place in a tool result.
- Rounding is fine if you say so.
- A number with no tool result behind it is **FAIL**. A wrong year is **FAIL**.
- For a written draft, list every number it contains, including percentages, years, counts and
  ranks, in a table: number | where it appears | tool value | match.

### 2. Age of the data

For each indicator:

- list the year of each place's latest value;
- give the range, oldest to newest.

Status:

- **FLAG** when the oldest is more than 5 years older than the newest. The user can change the
  threshold.
- **FAIL** when the text compares two places, or ranks them, using values more than 5 years
  apart without saying so.

Produce a heat table if asked: rows are places, columns are indicators, each cell is the year.

### 3. Agreement between sources

If the same measure is published by more than one series (the SDG database, the agency itself,
another agency):

- fetch them;
- where they share a year and place, compare the values.

Status:

- Equal, or within rounding: **PASS**.
- Different: **FLAG**, with both values and the likely reason from the metadata (survey against
  modelled estimate, a different definition or age group, a revision).
- A series with very thin coverage, such as one country or one old year, is worth a note. It is
  not an alternative.

Recommend which one to cite and why. For SDG reporting that is usually the Global SDG Indicators
Database.

### 4. Units and definitions

For every indicator in the table, state its exact definition, unit, age group, sex, education
level or other dimension, and source.

- **FLAG** any column that mixes definitions.
- **FLAG** any comparison between indicators whose units differ (per 100 against per 1,000) that
  is presented as if they were alike.

### 5. Plausibility

Write and run code if you can. Otherwise check by hand and say so. Defaults, which the user can
change:

- **Range:** a percentage outside 0 to 100, a negative rate, or a count that is not a whole number
  is **FAIL**.
- **Jumps:** a change of more than 10 percentage points between consecutive observations of a
  percentage, or more than 25% for a rate or count, is **FLAG**. Give the years and the size of
  the gap: a big change over 11 years is less surprising than over 2.
- **Breakdowns:** the total should lie between its parts (girls and boys, rural and urban) in the
  same year. If it doesn't, **FLAG** it.
- **Outliers against the region:** a country more than about twice, or less than half, its
  regional value is **FLAG**, as a prompt to look, not as an error.

### 6. Coverage

List the requested places with no value at all, and those whose only value is older than the
threshold. Then say what that could do to any summary.

- **FLAG** when the missing places are not like the rest: for example, a regional average that
  quietly leaves out the countries most affected.
- Missing is not zero. **FAIL** any table, chart or sentence that treats it as zero.

### 7. Empty answers

If a tool returned `"data": {}`, check whether the id came from a search or was guessed. A guessed
id that comes back empty means the id was wrong, so the data may exist. Report it as **FAIL**
until it has been re-searched.

## The QC log

Return this table first, then a two-line summary.

| # | check | status | detail | suggested action |
|---|---|---|---|---|
| 1 | numbers match tools | PASS | 24 of 24 numbers found | none |
| 2 | age of data | FLAG | child marriage: 2012 (Niger) to 2024 (Mali, Nigeria) | show years; don't rank across them |

- **Status** is PASS, FLAG, FAIL or NOT RUN.
- In the summary, say what can safely be said with this data, and what can't yet be said.

## Argue against yourself

If the user asks for it, or if the analysis reaches a strong conclusion, list the ways the
conclusion could be wrong because of this data: the years, the sources, the missing places, the
definitions, small numbers. Rank them by how much they could change the answer.
