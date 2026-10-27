# Video 16 · From question to briefing

**P16.1 · Plan before you fetch.**

```text
I need a two-page briefing note for a UNISS coordination meeting on girls' futures in
the Sahel (the 10 UNISS countries), with three charts and a data annex. Before fetching
anything, propose an analysis plan: the questions, the indicators with SDG numbers, the
comparisons (Sub-Saharan Africa, World), the methods and the charts. List the risks in
this data. Wait for my approval.
```

**P16.2 · One prompt, all the data.**

```text
Fetch everything the plan needs, in the table contract format.
```

**P16.3 · Check and fill, with skills.**

```text
Run the QC and gaps checks on this table and show me the log before any analysis.
```

**P16.4 · Where things stand.**

```text
For each indicator, rank the 10 countries by their latest value, with the year beside
each, and put Sub-Saharan Africa and the World on the same scale.
```

**P16.5 · What changed.**

```text
Using UNICEF's trend series, how has child marriage changed in each country since 2010?
Say which countries have too few observations to tell.
```

**P16.6 · Two things together.**

```text
Plot child marriage against girls' lower-secondary completion, with each point labelled
with the country and both years. Give the correlation. In two sentences: why this cannot
show cause, and what 10 countries and mixed years do to it.
```

**P16.7 · On track for 2030?** In Claude, with undata's connector added.

```text
Using the UN Statistics Division's progress method, is each country on track to reduce
child marriage? Give the baseline and latest year per country, and explain what "on
track" means when no numeric target is given.
```

**P16.8 · A chart, by prompt.**

```text
Make chart 1:
- Form: dot plot, countries sorted by value, the year printed beside each dot.
- Title: the finding, in one sentence. Subtitle: indicator, unit, years.
- Under the chart: the source (agency, database, retrieved date) and any missing
  countries, which are not drawn as zero.
- Colour-blind safe, one highlight colour.
```

**P16.9 · Follow-ups that make a chart better.**

```text
Make the title a finding, not a topic.
Label the years.
Remove the gridlines and the legend; label the points directly.
Make it readable on a phone.
```

**P16.10 · The note.**

```text
Write the note: three key messages, then short sections. Every number carries its year
and a footnote to its source. Use only numbers from the tables in this conversation. End
with data notes. Then check every number in the note against those tables.
```

**P16.11 · Into Office.**

```text
Turn the three charts into three slides, each with the finding as its title and the
source line, and the data annex into an Excel file with one sheet per indicator and a
sources sheet.
```

**P16.12 · Next quarter, in one prompt.**

```text
Refresh every table with the most recent data available today. Tell me which values
changed, which countries gained new data, and which sentences in the note need updating.
```

**P16.13 · Make it reproducible.** In VS Code (GitHub Copilot) or Claude Code.

```text
Turn this analysis into a script that fetches the same data, runs the same checks and
saves the same charts, so anyone can re-run it.
```

## As run in the videos

The recordings sometimes used a more specific version of a prompt above. These are the exact words, so what you copy matches what you see.

**P16.2 (with the decisions)**

```text
Approved, with these decisions. 1: keep four indicators only: 5.3.1 (before 18 and before 15), 3.7.2 (ages 15 to 19), 4.1.2 lower-secondary completion for girls and boys, and 17.8.1 internet use for women. 2: median with n. 3: Option B. 4: 2016. 5: a shareable document. Now fetch everything the plan needs, in the table contract format: country | iso3 | indicator | sdg | series_id | year | value | unit | source | note, one row per value, never leaving out a country. Include Sub-Saharan Africa and the World.
```

**P16.3**

```text
Points 1 to 4 confirmed. Before any analysis, run the QC and gaps checks on this table and show me the log, including the Nigeria completion figure.
```

**P16.7 (Claude Code)**

```text
Using undata and the UN Statistics Division's progress method, is each of the 10 UNISS countries (Burkina Faso, Cameroon, Chad, Gambia, Guinea, Mali, Mauritania, Niger, Nigeria, Senegal) on track to reduce child marriage (women aged 20 to 24 married before 18)? Give the baseline and latest year per country, and explain what "on track" means when no numeric target is given.
```

**P16.8 (Claude, bars)**

```text
Agreed on all three. Make chart 1 now: married before 18, one bar per country sorted by value, the year printed beside each bar, Sub-Saharan Africa and the World as reference lines. Title: the finding, in one sentence. Under the chart: the source (agency, database, retrieved date). Colour-blind safe, one highlight colour.
```

**P16.9 (one follow-up)**

```text
Make it readable on a phone: a tall layout, larger text, and the plot filling the width. Keep everything else. Show it here as an image.
```

**P16.12**

```text
Refresh every table with the most recent data available today. Tell me which values changed, which countries gained new data, and which sentences in the note need updating.
```

**P16.13 (Claude Code, empty folder)**

```text
Write a Python script, reproduce.py, that anyone can re-run to rebuild a briefing analysis from official UN data. It must:
1. Fetch from the UN Data Commons MCP server (https://unsd-datacommons.gcp.un-icc.cloud/mcp, JSON-RPC over HTTP, no key) the latest value for the 10 UNISS countries (Burkina Faso, Cameroon, Chad, Gambia, Guinea, Mali, Mauritania, Niger, Nigeria, Senegal) plus Sub-Saharan Africa and the World, for these series: undata/sdg/SP_DYN_MRBF18.AGE--Y20T24__SEX--F, undata/sdg/SP_DYN_MRBF15.AGE--Y20T24__SEX--F, undata/sdg/SP_DYN_ADKL.AGE--Y15T19__SEX--F, undata/sdg/SE_TOT_CPLR.EDUCATION_LEVEL--ISCED11_2__SEX--F and __SEX--M.
2. Write data.csv in the layout country | iso3 | indicator | sdg | series_id | year | value | unit | source | note, one row per value, never leaving out a country.
3. Run the checks: percentages within 0 to 100, values older than 2016 flagged, girls and boys from the same year. Write qc_log.csv (check | status | detail).
4. Save chart1.png: married before 18, one bar per country sorted by value, the year beside each bar, Sub-Saharan Africa and the World as reference lines, the source and retrieval date underneath.
Use only the standard library plus matplotlib. Then run it and tell me what it produced, with the values for Niger and Gambia.
```
