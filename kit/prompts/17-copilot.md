# Video 17 · UN data in Microsoft 365 Copilot

Use these with the **UN Data Commons** agent from [`copilot-agent/`](../copilot-agent/README.md).
Copilot shows a Confirm card before each call to the server: read it, then click **Confirm**.

**P17.1 · One number, with its source.**

```text
Using the UN Data Commons tools: what share of women aged 20–24 in Niger were married
or in a union before age 18? Give the year and the source, and tell me if the figure
is more than five years old.
```

**P17.2 · Five countries, one table.**

```text
Latest lower-secondary completion rate for girls in Burkina Faso, Chad, Mali, Niger and
Senegal, from the UN Data Commons, with the year and source beside each.
```

**P17.3 · Ten countries in one call.** One Confirm card for the data, instead of one per country.

```text
Use get_child_observations with the parent "africa" for child marriage (SDG 5.3.1,
women 20–24 married before 18), latest values. Keep only the 10 UNISS countries:
Burkina Faso, Cameroon, Chad, Gambia, Guinea, Mali, Mauritania, Niger, Nigeria,
Senegal. One table with the year beside each value.
```

**P17.4 · Show me the call.**

```text
Which series did you use for Niger, and what did the tool return? Show the call and
the response.
```

**P17.5 · Check before you trust.**

```text
Check the table above before I use it: every number against the tool output, the year
of each, units and sources. Give me a QC log with PASS, FLAG or FAIL.
```

**P17.6 · A question with no answer in the data.**

```text
What will child marriage in Niger be in 2025?
```

**P17.7 · A chart.** Then, in the chart's menu, choose **Display as static image** to see the
chart Python drew, with its source line.

```text
Run Python to draw a horizontal bar chart of the table, sorted, with the year in each
label and the source under the chart. Use the values above.
```

**P17.8 · A file.** Copilot saves it in your OneDrive.

```text
Put the table in an Excel file: one sheet for the data, one for sources, with the
retrieved date.
```

## As run in the video (27 October 2026)

- **P17.1:** three Confirm cards (search, metadata, fetch), then 76.3% (2012), UN Statistics
  Division, flagged as 14 years old. Plain Copilot chat, without the agent, gave the same number
  from UNICEF's website, then suggested the agent.
- **P17.2:** seven cards, the last five as "Review 1 of 5" to "5 of 5". Senegal 31.25% (2023),
  Burkina Faso 30.19% (2021), Mali 23.99% (2024), Niger 10.37% (2022), Chad 8.89% (2019), with a
  note that the years differ.
- **P17.3:** three cards for all ten countries.
- **P17.4:** it showed the call and the response, which match the server. But it added that it
  had "fetched this known series directly" without searching first. That was wrong: the search
  and metadata cards had been confirmed. The cards are the record, not the assistant's memory.
- **P17.5:** it fetched all five again: five PASS, plus a comparability FLAG for the different
  years.
- **P17.6:** no projection. It labelled 76.3% as 2012 and said a 2025 figure would need a labelled
  projection.
- **P17.7:** the interactive chart left out the source line; the static image had it.
- **P17.8:** a two-sheet workbook (Data, Sources) with the retrieved date, opened in Excel for the
  web.
