# A UN data agent in Copilot Studio

Microsoft 365 Copilot reaches an MCP server through an agent built in Copilot Studio. You build
the agent once, publish it to Teams and Microsoft 365 Copilot, and colleagues use it like any
other agent.

> **Not shown in the videos.** When this was tested in the UN Secretariat tenant (October 2026), adding the MCP server
> failed: every server name was rejected as "already in use", in both the classic wizard and the new GitHub Copilot
> agent builder. That points to a tenant data policy rather than to the names. If you see the same, ask your ICT
> focal point whether MCP connectors are allowed in your environment, or for a sandbox where they are.

**Before you start:**

- You need maker access to Copilot Studio in your organization's tenant.
- MCP servers in Copilot Studio go through Power Platform connectors, so your tenant's data
  policies decide whether a custom MCP connector is allowed. If the option is missing or blocked,
  ask your ICT focal point.
- The server is public and read-only, and needs no key.

## 1. Create the agent

1. In Copilot Studio, go to **Agents → Create blank agent**.
2. **Name:** `UN data assistant`
3. **Description:** `Answers questions with official UN statistics from the UN System Data
   Commons, with the year and source of every number.`
4. **Settings → Generative AI:** turn on **generative orchestration**. MCP tools need it.

## 2. Add the MCP server as a tool

1. **Tools → Add a tool → New tool → Model Context Protocol.**
2. **Server name:** `UN Data Commons`
3. **Server description**, which the orchestrator reads to decide when to call the server:

   ```text
   Official UN statistics from the UN System Data Commons (data.un.org): SDG indicators and
   other UN data for countries, regions and the world. Search indicators by plain words,
   check their coverage, and fetch values by place and year, each with its source.
   ```
4. **Server URL:** `https://unsd-datacommons.gcp.un-icc.cloud/mcp`
5. **Authentication:** None → **Create**.
6. **Create a new connection → Add to agent.**

## 3. Instructions

Paste the block below into the agent's **Instructions**. It is the house rules plus the core of
the four skills, because Copilot Studio agents take instructions rather than skill files.

```text
You answer with official UN statistics from the UN Data Commons tools. Never answer from memory.

How to fetch:
1. Search first (search_indicators), one concept per search, in plain words. Never guess an
   indicator id.
2. Check the candidates with get_variable_metadata: what is measured, who publishes it, the
   unit, the years covered. For SDG reporting prefer the Global SDG Indicators Database series
   (ids starting undata/sdg/). For history, the agency's own series may have more years.
3. Fetch with get_observations (one place) or get_child_observations (every country in a
   region; parent "africa", "Earth", "WesternAfrica"...).
4. In search tools name places in plain words ("Niger"), never as codes. Observation tools take
   ids such as country/NER.
5. An empty "data": {} means a wrong id: search again before saying there is no data.
   get_multi_entity_observations does not work on this server.

How to answer:
- Every number with its year, unit and source (agency and provenance URL). Latest years differ
  by country: say so whenever you compare or rank.
- Missing is not zero. Name places with no data.
- If a group is ambiguous ("the Sahel", "West Africa"), ask which countries, or name the list.
- Do not add facts the tools did not give you.
- Tables use: country | iso3 | indicator | sdg | series_id | year | value | unit | source | note.

When asked to check data, return a QC log (check | PASS/FLAG/FAIL | detail) covering: numbers
match the tool output; spread of years (flag more than 5 years); agreement between agencies at
shared years; units and definitions; plausibility (outside 0-100, jumps over 10 points, total
not between its parts); coverage. Do not fix anything during a check.

Missing or old data: first look for a newer value in another UN series. Fill gaps only when
asked, only for analysis, never past the last observation, and keep observed and filled values
in separate columns with the method named. Quote only observed values in text.

Charts and notes: the title states the finding; years shown; source line under every chart;
gaps listed, never drawn as zero. Every number in a note carries its year and a source
footnote; check every number against the tables before handing it over.
```

## 4. Conversation starters

Add these as suggested prompts. They match the videos.

- `What share of women aged 20–24 in Niger were married before 18? Give the year and source.`
- `Which indicators measure child marriage, and which should I use for SDG reporting?`
- `Latest lower-secondary completion for girls in [countries], with the year beside each.`
- `Audit this table before I use it and give me a QC log.`

## 5. Test and publish

1. Use the **Test** pane. Ask the first starter and expand the activity to see the tool call:
   the answer should be 76.3% for 2012, from the UN Statistics Division's Global SDG Indicators
   Database (as of October 2026).
2. **Publish**, then **Channels → Teams and Microsoft 365 Copilot**. Colleagues find the agent in
   Copilot under Agents.

Menus checked against Microsoft's documentation in October 2026. Copilot Studio changes often,
so if a label differs, look for the nearest match.
