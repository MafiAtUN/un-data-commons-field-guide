---
name: un-data-gaps
description: Handle missing and out-of-date UN statistics honestly. Find the most recent value in any UN series, keep anything from outside the UN Data Commons separate and marked for checking, fill gaps only for analysis using labelled methods, test whether filling changes the conclusion, and write the data notes. Use when values are missing or old, or when the user asks for the latest data or asks to fill, interpolate, impute, extrapolate, estimate or project.
---

# Missing and out-of-date data

A gap in official statistics is information. It can tell you no survey was done, or that the data
was never published. A UN product may describe a gap, and it may work around a gap for a chart. It
may never hide one.

## 1. Classify every gap

For each place and indicator, decide which of these it is:

- **Not measured.** There is no value in any UN series.
- **Elsewhere.** There is a value, but in another series (another agency, or the agency's own
  trend series rather than the SDG database copy).
- **Old.** The latest value is older than the user's threshold. Default: more than 5 years before
  the newest value in the set.

Report these as a table: place | indicator | gap type | latest year (if any) | where.

## 2. Find the most recent value

- **Inside the UN Data Commons first.** Search for every series of the same measure, using
  `search_indicators` with the measure in plain words, and compare their latest years for each
  place. The SDG database copy sometimes holds only the latest survey, and sometimes it is newer
  than the agency's own series. Check both.
- **Report one row per place:** newest year | value | series | agency | the year in the series
  you started with.
- **Use the newest only if it measures the same thing:** same definition, unit and age group. If
  not, report it separately.

## 3. Outside the UN Data Commons, only if asked

If the user asks you to search the web for something newer, such as a DHS or MICS survey, a
national statistics office release, or an agency report:

- Keep the results in a separate list: source | year | value | link | why it may not be in the UN
  data yet.
- Mark each one "not in the UN Data Commons; verify before use".
- Never merge it into the main table, and never use it in a chart or sentence without that label.
- Prefer the original publisher's page over news or secondary sites. If you can't open the source
  itself, say so.

## 4. Filling gaps, for analysis only

Explain the options in plain words, then do only what the user picks:

| Method | What it does | Acceptable for | Label |
|---|---|---|---|
| Leave it | Show the gap | Always the default | "no data" |
| Carry forward | Repeat the last observed value | A latest-value table, with the year shown beside it | "latest value from [year]" |
| Interpolate | Straight line between two observed values | Drawing a continuous line in a chart; annual averages | "interpolated between [year] and [year]" |
| Regional value | Use the region's figure for a missing country | Rarely; only for an aggregate, and only when stated | "regional estimate used" |

Rules:

- **Never extrapolate** past the last observation unless the user asks for a projection.
  - Label it "projection", give the method (for example the average annual rate of change since
    [year]), and show it in a different style.
  - The UNSD progress method (in undata's connector, `undata_assess_progress`) is the standard
    way to project towards 2030. Name it when you use it.
- **Keep observed and filled values in separate columns:** observed | filled | method. A filled
  value never overwrites an observed one.
- **In charts,** draw observed values as solid dots and filled ones as a dashed line or hollow
  markers, and add the method to the note under the chart.
- **In text,** quote only observed values. A filled value may describe a shape ("broadly flat
  since 2014"). It is never quoted as a number.
- **Never produce a value from your own memory** or general knowledge to fill a gap.

## 5. Does it change the answer?

When values have been filled or carried forward, rerun the key result three ways: observed only,
with carry-forward, and with interpolation. Report whether the ranking, the direction or the
headline changes. If it does, say the result depends on the method and lead with the observed-only
version.

## 6. Data notes

End every table, chart or note that has gaps with data notes, in this order:

1. The sources: series, agency, provenance URL, retrieved date.
2. The years: the range for each indicator, and any comparison across different years.
3. What was filled, how, and where it is marked.
4. What is missing, by name.
5. What a reader should not conclude from this data.

Keep them short and in plain words. They are the paragraph a reviewer will read first.
