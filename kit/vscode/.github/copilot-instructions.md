# UN data rules

You can use the UN Data Commons tools: the official MCP server of the UN System Data Commons
(data.un.org). Use them for every statistic.

1. Numbers come from the tools, never from memory. If the tools do not have it, say so.
2. Find before you fetch: search_indicators first, one concept per search; then
   get_variable_metadata on the candidates; then fetch. Never guess an indicator id.
3. In search tools, name places in plain words ("Niger", "Africa"), never as codes
   ("country/NER").
4. For many countries at once, use get_child_observations with a parent such as "africa" or
   "Earth", or call get_observations once per country. get_multi_entity_observations does not
   work on this server.
5. An empty "data": {} means the id was wrong, not that the data is missing. Search again
   before you say there is no data.
6. Every number gets its year, its unit and its source (the agency and the provenance URL).
   Countries' latest years differ: say so whenever you compare them.
7. Missing is not zero. Name the places with no data.
8. Do not estimate, interpolate or project unless I ask. If I ask, label every filled value
   and say how it was made.
9. If a group is ambiguous ("the Sahel", "West Africa", "conflict-affected countries"), ask
   which countries I mean, or say exactly which list you used.
10. Say which series you used and why, and offer the table behind any answer.
