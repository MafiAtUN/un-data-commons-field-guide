---
name: un-briefing
description: Turn checked UN statistics into charts and a short briefing note that can stand up to review. Plan first, give each chart a finding as its title, show years and sources, never draw gaps as zero, use accessible colours, and write a note in which every number carries its year and a footnote and is checked against the tables before it goes out. Use when the user asks for a chart, visual, slide, dashboard, briefing, note, talking points, summary or report from UN data.
---

# From UN data to a briefing

## Plan before you fetch

When the user asks for a briefing or a set of charts, propose a plan first and wait for approval.
The plan covers:

- the questions, at most four;
- the indicators, with their SDG numbers;
- the places, and the comparisons (region, world);
- the methods;
- the charts, one line each;
- the risks in this data: old years, missing countries, differing sources.

Then fetch, check and fill, if those skills are available, before any chart is drawn.

## Charts

Choose the form from the question:

| Question | Form |
|---|---|
| Where do places stand? | Dot plot or bar chart, sorted by value, **year printed beside each value** |
| How has it changed? | Line chart for each place, or small multiples; slope chart for two years |
| How do two groups differ (girls and boys)? | Dumbbell or paired dots, same year for both |
| Do two measures move together? | Scatter, each point labelled; say n and the years |
| How old is the data? | Heat table of years: places × indicators |

Every chart has:

- **A title that states the finding** in one sentence, not the topic. The pattern is "[What]
  [did what] in [how many] of [how many] [places] since [year]; [the exception]", and every part
  of it must be true of the data.
- **A subtitle** giving the indicator, unit, places and years.
- **A source line** under the chart: agency, database, "via the UN System Data Commons
  (data.un.org)", retrieved date.
- **Gaps as gaps.** Missing places are listed under the chart and never drawn as zero. Filled
  values are styled differently, with the method noted.
- **Bars start at zero.** Lines may not, if the axis is labelled.
- **Colour that works without colour:** colour-blind-safe, one highlight colour with grey for the
  rest, direct labels instead of a legend where possible, and no 3D or gradients.
- **Text readable on a phone and when projected:** no text smaller than 11 pt in the output size.
- **A data table** beside or under any interactive chart, for accessibility.

When the user asks for changes, keep every rule above unless they explicitly override it.

## The note

Default structure for a two-page briefing note:

1. **Key messages**: three bullets, each one sentence with one number and its year.
2. **Sections**: one per question, each opening with its finding, then the evidence, then the
   chart reference.
3. **Data notes**: sources, years, what was filled and how, what is missing, what not to
   conclude.
4. **Data annex**: the table, in the table contract layout if the retrieval skill is present.

Rules:

- Use only numbers that appear in the tables in this conversation. If a number you need isn't
  there, fetch it or leave it out.
- Every number carries its year, and every sentence with a number carries a footnote to its
  source.
- A ranking or comparison across different years says so in the same sentence.
- Neutral language: describe what the data shows, not causes, unless a cited source establishes
  the cause. Correlation in a scatter is described as association.
- Name places with the UN's official short names ("Türkiye", "Côte d'Ivoire", "Viet Nam").

## The number check

Before handing over the note:

1. List every number in it.
2. Find each one in the tables.
3. Show the check as a table: number | sentence | table value | year | match.

Fix or remove anything that does not match, and say what you changed.

## Office outputs

- **Slides:** one chart per slide, the finding as the slide title, the source line on the slide,
  and the talking points in the speaker notes.
- **Spreadsheet annex:** one sheet per indicator in the table contract layout, a "sources" sheet,
  and a "notes" sheet with the data notes. No merged cells, no colour-only meaning.
- **Word:** footnotes for sources, charts as images with alt text that states the finding.

## Refreshing next time

When asked to refresh:

1. Re-fetch every table.
2. Report which values changed, which places gained or lost data, and which years moved.
3. List the sentences in the note that need updating, with the old and new figures.

Change nothing until the user agrees.
