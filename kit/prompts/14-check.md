# Video 14 · Check before you trust

**P14.1 · Did the numbers survive?**

```text
Check every number in your last answer against the tool results in this conversation.
Table: number | where it appears | tool value | match. Mark any number that did not come
from a tool.
```

**P14.2 · A second opinion.** Paste into a different assistant.

```text
Here is an answer from another assistant, and the raw data it was based on. Find every
number, year or claim that the data does not support.
[answer]
[CSV]
```

**P14.3 · How old is each number?**

```text
Make a table: rows are the 10 countries, columns are the four indicators, and each cell
is the year of the latest value. Shade cells older than 2018. Then tell me which
comparisons between countries are safe and which are not.
```

**P14.4 · Three agencies, one measure.**

```text
Child marriage for these countries is published by the SDG database, UNICEF and UNFPA.
Fetch all three. Where they share a year, do the values agree? Where they differ, explain
the likely reason from the metadata. Which should I cite in an SDG report?
```

**P14.5 · Units and definitions.**

```text
Describe each indicator in my table: exact definition, unit, age group, education level
and source. Flag anything that makes two of them not comparable.
```

**P14.6 · Plausibility, with code.**

```text
Write and run code that checks the table for: values outside 0–100; changes of more than
10 points between consecutive observations; girls' and boys' values that do not bracket
the total; countries far from the Sub-Saharan Africa value. Show each flagged row and
explain it.
```

**P14.7 · When it says "no data".**

```text
You said there is no data for [X]. Show me the exact tool call and the response. Was the
identifier found by search, or guessed?
```

**P14.8 · The QC log.** This is what the `un-data-qc` skill runs.

```text
Audit this table before I use it. Return a QC log (check | PASS / FLAG / FAIL | detail)
covering: numbers match the tools; spread of years; agreement between sources; units and
definitions; plausibility; coverage and what it could bias. Do not fix anything yet.
```

**P14.9 · Argue against yourself.**

```text
Argue against the conclusion you just gave me. What in this data (years, sources,
missing countries, definitions) could make it wrong? Rank the risks.
```

## As run in the videos

The recordings sometimes used a more specific version of a prompt above. These are the exact words, so what you copy matches what you see.

**P14.3**

```text
Make a table: rows are the 10 countries, columns are four indicators: child marriage before 18 (SDG 5.3.1), lower-secondary completion for girls (SDG 4.1.2), adolescent birth rate for girls aged 15–19 (SDG 3.7.2) and internet use (SDG 17.8.1). Each cell is the year of the latest value. Shade cells older than 2018. Then tell me which comparisons between countries are safe and which are not.
```

**P14.6**

```text
For lower-secondary completion in the 10 countries (girls, boys and total, every year available), write and run code that checks for: values outside 0–100; changes of more than 10 points between consecutive observations; girls' and boys' values that do not bracket the total; countries far from the Sub-Saharan Africa value. Show each flagged row and explain it.
```

**P14.7 (a claim)**

```text
You said UNICEF's completion series (ED_CR) covers primary only and ends in 2019. Show me the exact tool call and the response that support that. Was the identifier found by search, or guessed?
```

**P14.7 (no data)**

```text
You said there is no data for Botswana. Show me the exact tool call and the response. Was the identifier found by search, or guessed?
```

**P14.8**

```text
Audit the child marriage table from earlier (uniss_sahel_sdg_5_3_1_before18.csv) before I use it. Return a QC log (check | PASS / FLAG / FAIL | detail) covering: numbers match the tools; spread of years; agreement between sources; units and definitions; plausibility; coverage and what it could bias. Do not fix anything yet.
```
