import { Link } from 'react-router-dom';
import { PageHeader, Section, Takeaway } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';
import { Expander } from '../components/Expander';

const MCP_ENDPOINT = 'https://unsd-datacommons.gcp.un-icc.cloud/mcp';

/**
 * The MCP surface, exercised rather than described.
 *
 * Re-verified against the live server on 19 September 2026 by calling every
 * tool: `initialize` reports "DC MCP Server" v1.3.0, `tools/list` returns six
 * tools, `resources/list` returns six entries (three SKILL.md playbooks and
 * three manifests). Every request and response quoted below is a real one,
 * trimmed only for width.
 *
 * Three things that only turn up by calling it, and that all cost real time:
 * the `Accept` header is mandatory and a missing one is a 406; the `places`
 * argument on `search_indicators` currently 500s on this deployment; and a
 * guessed variable dcid returns success with an empty `data` object rather than
 * an error, which is the single most dangerous response an LLM can be handed.
 */
export function Connect() {
  return (
    <>
      <PageHeader
        eyebrow="Connect an agent · 9 minutes"
        title="Let an AI assistant look the statistics up itself"
        lead={
          <>
            The platform ships a Model Context Protocol endpoint. Point a compatible
            assistant at it and, instead of recalling a plausible-sounding figure, it will
            search the UN corpus, fetch the observation, and tell you the provenance. This
            is the difference between an assistant that sounds authoritative and one that
            is.
          </>
        }
      />

      <Section
        title="The endpoint"
        lead="Streamable HTTP, no API key, no account. This is the address to give your client."
      >
        <div className="rounded-lg border border-volt/30 bg-volt/5 p-5">
          <code className="block break-all font-mono text-[0.9rem] text-ink-primary">
            {MCP_ENDPOINT}
          </code>
          <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-secondary">
            Other UN Data Commons addresses you may come across are older deployments and
            are not intended for external use. This is the one the platform's own
            documentation points at.
          </p>
        </div>
      </Section>

      <Section
        title="Set it up in the client you already use"
        lead="All four are the same two facts — a name and a URL. Pick your client and paste."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            label="Claude Code — one command"
            code={`claude mcp add --transport http un-data ${MCP_ENDPOINT}

# confirm it connected
claude mcp list`}
          />
          <CodeBlock
            label="Claude Desktop — claude_desktop_config.json"
            language="json"
            code={`{
  "mcpServers": {
    "un-data": {
      "type": "http",
      "url": "${MCP_ENDPOINT}"
    }
  }
}`}
          />
          <CodeBlock
            label="VS Code — .vscode/mcp.json"
            language="json"
            code={`{
  "servers": {
    "un-data": {
      "type": "http",
      "url": "${MCP_ENDPOINT}"
    }
  }
}`}
          />
          <CodeBlock
            label="Cursor — .cursor/mcp.json"
            language="json"
            code={`{
  "mcpServers": {
    "un-data": {
      "url": "${MCP_ENDPOINT}"
    }
  }
}`}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-hairline bg-surface-1 p-4">
            <h3 className="text-[0.88rem] font-semibold text-ink-primary">
              How to tell it worked
            </h3>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-secondary">
              Ask it something only the platform knows, and watch for a tool call in the
              transcript: <em>“Using un-data, what is South Sudan's conflict-related death
              rate per 100,000 in 2024, and where does that figure come from?”</em> The
              right answer is 13.07, sourced to the UN Statistics Division SDG data portal.
              If you get a number with no tool call, the server is not connected and the
              model is recalling.
            </p>
          </div>
          <div className="rounded-lg border border-hairline bg-surface-1 p-4">
            <h3 className="text-[0.88rem] font-semibold text-ink-primary">
              If your assistant has no MCP support
            </h3>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-secondary">
              Most web chatbots do not. You are not stuck: fetch the numbers first and
              paste them in, which is what the{' '}
              <Link to="/ai" className="text-volt underline decoration-volt/30 underline-offset-2">
                Use AI on it
              </Link>{' '}
              page is about. Giving a model the statistic and asking what it means is safe;
              asking it what the statistic is, is not.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="What actually happens when you ask"
        lead="One question, traced through the server. This is the sequence the playbooks tell the model to follow, and it is the same discipline the rest of this guide argues for by hand."
      >
        <div className="rounded-lg border-l-2 border-volt bg-surface-1 p-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-volt">You type</p>
          <p className="mt-2 font-mono text-[0.86rem] leading-relaxed text-ink-primary">
            “Using un-data, how has South Sudan's conflict-related death rate moved since
            2015? Give me the source and tell me if any year is missing.”
          </p>
        </div>

        <ol className="mt-4 space-y-3">
          {[
            {
              step: 'It reads the playbook first',
              detail:
                'The tool descriptions instruct the client to read skill://data-commons-researcher/SKILL.md before the first call. That resource is 11,000 words of method — concept splitting, place qualification, how to read each response — and it is why a well-behaved client searches before it fetches.',
              call: `{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"skill://data-commons-researcher/SKILL.md"}}`,
            },
            {
              step: 'Discovery — it finds candidate variables',
              detail:
                'It does not guess an identifier. It searches, and gets back topics and the variables inside them, including the dimension-sliced variants. Note what surfaces here: a rate per 100,000 as well as a raw count.',
              call: `{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_indicators","arguments":{"query":"conflict related deaths","per_search_limit":5}}}`,
            },
            {
              step: 'Assessment — it qualifies before it fetches',
              detail:
                'get_variable_metadata returns the facets: which provenance, what date range, which entities are covered. This is the step that catches a variable that looks right and has no data for your country.',
              call: `{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_variable_metadata","arguments":{"variable_dcids":["undata/sdg/VC_DTH_TOTR"],"entity_dcids":["country/SSD"]}}}`,
            },
            {
              step: 'Retrieval — and only now the numbers',
              detail:
                'The observation response carries sourceMetadata alongside the values, so the model has the provenance in the same payload as the figure. It has no excuse for an unattributed number.',
              call: `{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"get_observations","arguments":{"variable_dcid":"undata/sdg/VC_DTH_TOTR","place_dcid":"country/SSD","date":"all"}}}`,
            },
          ].map((item, index) => (
            <li key={item.step} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <div className="flex items-baseline gap-3">
                <span className="tnum font-mono text-[0.76rem] font-semibold text-volt">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-[0.9rem] font-semibold text-ink-primary">{item.step}</h3>
              </div>
              <p className="mt-2 max-w-3xl text-[0.85rem] leading-relaxed text-ink-secondary">
                {item.detail}
              </p>
              <div className="mt-3">
                <Expander question="Show the JSON-RPC call" time="the raw message">
                  <CodeBlock language="json" code={item.call} />
                </Expander>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4">
          <CodeBlock
            label="what step 4 returns, trimmed — this is real"
            language="json"
            code={`{
  "variable": {
    "dcid": "undata/sdg/VC_DTH_TOTR",
    "name": "Number of total conflict-related deaths per 100,000 population"
  },
  "sourceMetadata": {
    "provenanceUrl": "https://unstats.un.org/sdgs/dataportal",
    "observationPeriod": "P1Y",
    "unit": "undata/UNIT_MEASURE-RATIO_COUNT_PER_100000_COUNT_POP"
  },
  "entityMetadata": {
    "columns": ["dcid", "name", "typeOf"],
    "rows": [["country/SSD", "South Sudan", ["Country"]]]
  },
  "data": {
    "columns": ["observationAbout", "date", "value"],
    "rows": [
      ["country/SSD", "2015", 21.76896], ["country/SSD", "2016", 25.9185],
      ["country/SSD", "2017",  7.59322], ["country/SSD", "2018", 14.95607],
      ["country/SSD", "2019", 10.8506 ], ["country/SSD", "2020", 22.62941],
      ["country/SSD", "2021", 17.55051], ["country/SSD", "2022", 14.51751],
      ["country/SSD", "2023", 13.27136], ["country/SSD", "2024", 13.06997]
    ]
  }
}`}
          />
          <p className="mt-3 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
            Worth comparing with the{' '}
            <Link to="/cookbook" className="text-volt underline decoration-volt/30 underline-offset-2">
              REST shape
            </Link>
            : this is columns-and-rows with the provenance beside it, rather than a record
            keyed two levels deep with the facets held in a separate object. The MCP surface
            is the friendlier one to read — for a model and for you.
          </p>
        </div>
      </Section>

      <Section
        title="The six tools, with a real call for each"
        lead="Four work against this deployment today. Two do not, for two different reasons, and both failures are silent until you hit them — so they are marked here."
      >
        <div className="space-y-3">
          {[
            {
              tool: 'search_indicators',
              what: 'Find statistical variables matching a natural-language query. The discovery step, and the one the server insists you do first.',
              args: `{"query":"maternal mortality","per_search_limit":10,"include_topics":false}`,
              note: 'Search one concept at a time — the playbook is explicit that "health and unemployment" confuses the index. Do not pass the optional places argument: it 500s on this deployment (trap 3).',
            },
            {
              tool: 'search_child_indicators',
              what: 'The same, for variables available at the child-place level inside a parent — the sub-national equivalent.',
              args: `{"query":"population","parent_place":"africa","sample_child_places":["country/KEN","country/ETH"]}`,
              note: 'Returns HTTP 500 on this deployment, always. Its parent_place and sample_child_places arguments are required and both go through the broken place-name resolution, so there is no way to call it successfully. Use search_indicators without places, then get_child_observations.',
              broken: true,
            },
            {
              tool: 'get_variable_metadata',
              what: 'Definitions, date ranges, provenances and entity coverage for a list of variables. Use it to qualify a series before pulling data.',
              args: `{"variable_dcids":["undata/sdg/VC_DTH_TOTR"],"entity_dcids":["country/SSD"]}`,
              note: 'Returns facets with dateRange and entityCoverage. This is where you learn a variable has ten observations, not forty.',
            },
            {
              tool: 'get_observations',
              what: 'Time series for one variable at one place, with source metadata in the same payload.',
              args: `{"variable_dcid":"undata/sdg/VC_DTH_TOTR","place_dcid":"country/SSD","date":"all"}`,
              note: 'date defaults to "latest". Pass "all" for the history, or date_range_start and date_range_end for a window.',
            },
            {
              tool: 'get_child_observations',
              what: 'The same across every child place of a type inside a parent — the one-request regional ranking.',
              args: `{"variable_dcid":"undata/sdg/VC_DTH_TOTR","parent_place_dcid":"Earth","child_place_type":"Country","date":"latest"}`,
              note: 'Returns 14 countries for this variable, and names them. The same 14 the REST containment query returns, which is a useful consistency check.',
            },
            {
              tool: 'get_multi_entity_observations',
              what: 'Relationship variables with more than one entity — aid flows, bilateral trade, migration corridors.',
              args: `{"variable_dcid":"Amount_EconomicActivity_GrossODA","entities":{"donor":["country/ARE"],"recipient":["country/AFG"]}}`,
              note: 'Returns HTTP 500 on this deployment: the SDMX backend rejects donor and recipient as filter components. Treat this tool as unavailable here.',
              broken: true,
            },
          ].map((item) => (
            <div
              key={item.tool}
              className={`rounded-lg border bg-surface-1 p-4 ${
                item.broken ? 'border-status-warning/40' : 'border-hairline'
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <code className="font-mono text-[0.82rem] font-semibold text-volt">
                  {item.tool}
                </code>
                {item.broken && (
                  <span className="rounded-full border border-status-warning/50 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-status-warning">
                    No data here
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-3xl text-[0.85rem] leading-relaxed text-ink-secondary">
                {item.what}
              </p>
              <div className="mt-3">
                <CodeBlock label="arguments" language="json" code={item.args} />
              </div>
              <p className="mt-2 flex gap-2 text-[0.8rem] leading-relaxed text-ink-muted">
                <span
                  aria-hidden="true"
                  className={`shrink-0 font-semibold ${
                    item.broken ? 'text-status-warning' : 'text-volt'
                  }`}
                >
                  !
                </span>
                <span>{item.note}</span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="The playbooks, which matter more than they sound"
        lead="The server publishes its own instructions to the model. Reading them is the fastest way to understand what good use of this data looks like."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 text-[0.86rem] leading-relaxed text-ink-secondary">
            <p>
              Three resources —{' '}
              <code className="text-volt">skill://data-commons-researcher/SKILL.md</code>{' '}
              for single-place work,{' '}
              <code className="text-volt">…child-places-researcher…</code> for
              sub-national breakdowns, and{' '}
              <code className="text-volt">…multi-entity-researcher…</code> for bilateral
              flows. Each has a JSON manifest beside it, so{' '}
              <code>resources/list</code> returns six entries rather than three.
            </p>
            <p>
              The researcher playbook is about 11,000 words and its spine is a three-step
              pipeline: <strong className="text-ink-primary">discovery</strong> with{' '}
              <code>search_indicators</code>,{' '}
              <strong className="text-ink-primary">assessment</strong> with{' '}
              <code>get_variable_metadata</code>, then{' '}
              <strong className="text-ink-primary">retrieval</strong>. It is the same
              sequence this guide recommends for a human, written for a machine.
            </p>
            <p>
              It is also where the hard rules live: never guess a dcid, search one concept
              at a time, keep <code>per_search_limit</code> at ten, and check country-level
              coverage before assuming a sub-national series exists.
            </p>
          </div>
          <CodeBlock
            label="read one yourself"
            code={`curl -s -X POST '${MCP_ENDPOINT}' \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json, text/event-stream' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"skill://data-commons-researcher/SKILL.md"}}' \\
  | sed -n 's/^data: //p' | tail -1 \\
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["contents"][0]["text"])'

# swap resources/read for resources/list to see all six,
# or initialize to read the server's own instructions to the model.`}
          />
        </div>

        <div className="mt-4">
          <Expander question="What the server tells the model about itself" time="30 seconds">
            <p className="mb-3">
              The <code className="text-volt">initialize</code> response carries an{' '}
              <code>instructions</code> field. Two of its rules are worth knowing, because
              they are the ones that make the difference between a cited answer and a
              confident one:
            </p>
            <blockquote className="border-l-2 border-volt pl-4 text-[0.85rem] leading-relaxed text-ink-secondary">
              <p>
                “every data point retrieved must be attributed to its original source
                provided in the tool output; never present statistics as ‘known facts’
                without citing the specific organization or dataset they originated from.”
              </p>
              <p className="mt-2">
                “CRITICAL RULE ON DCIDs: Before calling any observation or metadata tool,
                you MUST resolve variable and place DCIDs using search tools … DO NOT guess
                or hardcode DCIDs under ANY circumstances.”
              </p>
            </blockquote>
            <p className="mt-3">
              The second rule exists because of the failure in the traps below: a guessed
              identifier does not error. It succeeds, emptily.
            </p>
          </Expander>
        </div>
      </Section>

      <Section
        title="Four things that will bite you"
        lead="Each was found by calling the server, and none of them is in any documentation."
      >
        <ol className="space-y-3">
          {[
            {
              title: 'A guessed dcid returns success with no data',
              body: 'Ask get_observations for undata/sdg/SH_STA_MORT — the bare maternal mortality code, which does not exist as a fetchable variable — and you get isError: false and "data": {}. No error, no explanation. A model handed that can reasonably narrate "no data is available", which is a different and much stronger claim than "that identifier is wrong". This is precisely why the server forbids guessing.',
            },
            {
              title: 'The Accept header is mandatory',
              body: 'Send Accept: application/json, or no Accept header at all, and every request returns 406 Not Acceptable. The transport is streamable HTTP, so the header must be Accept: application/json, text/event-stream. Real clients set it for you; anything hand-rolled, including curl, does not.',
            },
            {
              title: 'Anything that passes a place to a search tool returns 500',
              body: 'The server resolves place names through a Google Maps legacy API that is not enabled on this project, so every search call carrying places fails with HTTP 500 — whether you pass country dcids, wikidataId dcids or plain names. search_indicators works perfectly once you drop the optional places argument. search_child_indicators cannot: both of its place arguments are required, so the whole tool is unreachable here. The practical workaround is to search without places and then use get_child_observations, which resolves containment inside the graph and does not touch the geocoder.',
            },
            {
              title: 'A line break in the body returns 403',
              body: 'Like every other POST route on this deployment, /mcp rejects any body containing a newline with 403 Forbidden. Pretty-print a JSON-RPC message to read it and it stops working. Real MCP clients send compact JSON, so this only affects you when testing by hand.',
            },
          ].map((item, index) => (
            <li key={item.title} className="flex gap-4 rounded-lg border border-hairline bg-surface-1 p-4">
              <span className="tnum shrink-0 font-mono text-[0.8rem] font-semibold text-status-warning">
                {index + 1}
              </span>
              <div>
                <h3 className="text-[0.9rem] font-semibold text-ink-primary">{item.title}</h3>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-secondary">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="Steer it around the broken paths"
        lead="The server's own instructions push a model towards the two tools that do not work here. One paragraph in your project instructions fixes it permanently."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 text-[0.86rem] leading-relaxed text-ink-secondary">
            <p>
              This is worth doing rather than repeating yourself. The playbook tells the
              model that a question about “countries in Africa” <em>must</em> route to{' '}
              <code className="text-volt">search_child_indicators</code>, and that searches
              should be scoped to places to verify coverage. Both instructions lead straight
              into the 500.
            </p>
            <p>
              Left alone, a model that hits it will usually retry, fail again, and then
              either give up or — much worse — answer from its own recall without saying it
              stopped using the tools. The paragraph opposite removes the ambiguity.
            </p>
            <p>
              Put it wherever your client keeps standing instructions:{' '}
              <code className="text-volt">CLAUDE.md</code> for Claude Code, project
              instructions in Claude Desktop, a rules file in Cursor or VS Code. It costs
              nothing per turn and it converts two dead ends into two working routes.
            </p>
          </div>
          <CodeBlock
            label="paste into your project instructions"
            code={`When using the un-data MCP server:

- Call search_indicators WITHOUT the "places" argument.
  Passing places returns HTTP 500 on this deployment.
- Never call search_child_indicators. It is unreachable
  here — both of its place arguments are required and both
  fail. For anything across a region, use search_indicators
  (no places) to get the variable, then get_child_observations
  with parent_place_dcid and child_place_type.
- get_multi_entity_observations has no data on this
  deployment. Do not attempt bilateral flows, trade or
  aid-corridor questions with it.
- An empty "data": {} is a wrong identifier, not an absence
  of data. Re-run search_indicators rather than reporting
  "no data available".
- Cite the provenanceUrl from sourceMetadata with every
  figure, and state the reference year.`}
          />
        </div>
      </Section>

      <Section
        title="Four prompts worth keeping"
        lead="Written to exploit what the tools are actually good at, rather than asking the model to be clever."
      >
        <ul className="space-y-3">
          {[
            {
              use: 'Sourced retrieval',
              prompt:
                'Using un-data, get total conflict-related deaths for South Sudan and DR Congo, under-18 and 18-plus, for every year available. Give me the provenance and observation period for each series, and tell me explicitly if a requested slice has no data.',
              why: 'Asking for the provenance and for explicit gaps is what stops the model filling silence with plausible numbers.',
            },
            {
              use: 'Indicator triage',
              prompt:
                'Using un-data, I need maternal mortality for Bangladesh. Before fetching anything, run search_indicators, then get_variable_metadata on the candidates, and show me the definitions and coverage. Recommend one for an SDG-aligned report and say why you rejected the others.',
              why: 'Names the two tools in the order the playbook wants them. This is the case where the bare identifier returns an empty success, and the metadata step catches it.',
            },
            {
              use: 'Regional scan',
              prompt:
                'Using un-data, use get_child_observations for the intentional homicide rate across all countries in Africa. Report the reference year per country, and tell me the range of years — I need to know whether this is a cross-section or a ranking.',
              why: 'The years are the story. Asking for the range makes the mixed-vintage problem the model’s job rather than something you discover after publishing.',
            },
            {
              use: 'Coverage check before committing',
              prompt:
                'Using un-data, I want to plot conflict-related deaths per 100,000 against GDP per capita for as many countries as possible. Before doing anything else, tell me how many countries have each indicator and how many have both. Then tell me whether that sample can support the comparison.',
              why: 'The answer is 14, and they are all countries at war — which is the finding that stops the chart. Asking for the counts first is the single highest-value habit on this platform, and it is the same discipline the scenarios page works through by hand.',
            },
          ].map((item) => (
            <li key={item.use} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-volt">
                {item.use}
              </p>
              <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-ink-primary">
                “{item.prompt}”
              </p>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-muted">{item.why}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
          The last one is worked end to end, without an agent, on the{' '}
          <Link to="/scenarios" className="text-volt underline decoration-volt/30 underline-offset-2">
            scenarios page
          </Link>
          .
        </p>
      </Section>

      <Section
        title="Verify any of this yourself"
        lead="The live server is the source of truth for what it offers — not this page, and not any documentation. Ask it."
      >
        <CodeBlock
          label="list the tools, then call one"
          code={`MCP='${MCP_ENDPOINT}'
mcp () {
  curl -s -X POST "$MCP" \\
    -H 'Content-Type: application/json' \\
    -H 'Accept: application/json, text/event-stream' \\
    -d "$1" | sed -n 's/^data: //p' | tail -1 | python3 -m json.tool
}

mcp '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
mcp '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_observations","arguments":{"variable_dcid":"undata/sdg/VC_DTH_TOTR","place_dcid":"country/SSD","date":"all"}}}'`}
        />
        <p className="mt-3 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
          The response is a server-sent event stream, which is why the{' '}
          <code>data:</code> prefix is stripped before parsing. Keep each body on one line —
          see trap 4.
        </p>
      </Section>

      <Section title="What this page leaves you with">
        <div className="grid gap-4 md:grid-cols-2">
          <Takeaway>
            <strong className="text-ink-primary">MCP changes what the model can be held to.</strong>{' '}
            Every observation arrives with its provenance in the same payload, so an
            unattributed number is now a choice the assistant made rather than a limitation
            it had.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Search, qualify, then fetch.</strong>{' '}
            The server's own playbook enforces the three-step pipeline. Naming the tools in
            your prompt is the easiest way to make a model follow it.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">An empty success is the dangerous case.</strong>{' '}
            A wrong identifier does not error here. Ask for coverage and for explicit gaps,
            every time, and you convert a silent emptiness into a stated one.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Four tools, not six.</strong>{' '}
            <code>search_child_indicators</code> cannot be called at all here, and{' '}
            <code>get_multi_entity_observations</code> has no data behind it. Knowing that
            now is cheaper than discovering it mid-conversation with a colleague watching.
          </Takeaway>
        </div>
      </Section>

      <Section title="Embedding a chart without writing any chart code">
        <p className="max-w-3xl text-[0.88rem] leading-relaxed text-ink-secondary">
          If you only need the platform's own visualisation on a page, the deployment ships
          Data Commons web components. Two lines and you have an attributed, interactive
          chart — no build step, no framework.
        </p>
        <div className="mt-4">
          <CodeBlock
            label="HTML"
            language="html"
            code={`<script src="https://unsd-datacommons.gcp.un-icc.cloud/datacommons.js"></script>

<datacommons-line
  header="Total conflict-related deaths"
  variables="undata/sdg/VC_DTH_TOTN"
  places="country/SSD country/COD"
></datacommons-line>`}
          />
        </div>
        <p className="mt-3 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
          The charts on this site are hand-built instead, because the guide needed control
          over the accessibility and colour behaviour. For most internal pages, the web
          component is the right trade and a tenth of the work.
        </p>
      </Section>
    </>
  );
}
