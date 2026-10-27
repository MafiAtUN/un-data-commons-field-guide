# Video 12 · Connect your assistant

**P12.1 · The question without the connector.** Ask it in a chat with no connector, to see what
an assistant does from memory.

```text
What share of women aged 20–24 in Niger were married or in a union before age 18?
```

**P12.2 · The test that proves it worked.** Ask it with the connector turned on. You should see a
tool call, then 76.3% for 2012, from the UN Statistics Division's Global SDG Indicators
Database, flagged as more than five years old (as of October 2026).

```text
Using the UN Data Commons tools: what share of women aged 20–24 in Niger were married
or in a union before age 18? Give the year and the source, and tell me if the figure
is more than five years old.
```

**P12.3 · House rules.** See [`instructions/un-data-rules.md`](../instructions/un-data-rules.md).

**P12.4 · The skill test.** Ask it with and without the `un-data-retrieval` skill. With the skill,
the assistant should ask which countries you mean by "the Sahel", or name the list it used.

```text
What is the latest data on child marriage in the Sahel?
```
