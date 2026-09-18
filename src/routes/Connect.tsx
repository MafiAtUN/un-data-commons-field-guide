import { PageHeader, Section } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';

const MCP_ENDPOINT = 'https://unsd-datacommons.gcp.un-icc.cloud/mcp';

/**
 * The MCP surface.
 *
 * Verified against the live server on 18 September 2026: `initialize` reports
 * "DC MCP Server" v1.3.0, `tools/list` returns the six tools below, and
 * `resources/list` returns three SKILL.md research playbooks. No credentials.
 */
export function Connect() {
  return (
    <>
      <PageHeader
        eyebrow="Connect"
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
        <div className="rounded-lg border border-un-blue/30 bg-un-blue/5 p-5">
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
        title="Add it to a client"
        lead="Any MCP-capable assistant works. Two of the most common are shown; the pattern is the same everywhere — a name and a URL."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            label="Claude Code — one command"
            code={`claude mcp add --transport http un-data \\
  ${MCP_ENDPOINT}

# then just ask, in plain language:
#   "Using un-data, what were total conflict-related
#    deaths in South Sudan for under-18s, by year?
#    Cite the provenance."`}
          />
          <CodeBlock
            label="Generic MCP client config (JSON)"
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
        </div>
      </Section>

      <Section
        title="What the server gives an agent"
        lead="Six tools and three research playbooks. The playbooks matter more than they sound: they are instructions the server hands the model about how to use its own data properly."
      >
        <div className="overflow-hidden rounded-lg border border-hairline">
          <table className="w-full border-collapse text-[0.82rem]">
            <caption className="sr-only">MCP tools exposed by the UN System Data Commons server</caption>
            <thead className="bg-surface-2">
              <tr>
                <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">
                  Tool
                </th>
                <th scope="col" className="border-b border-hairline p-3 text-left font-semibold text-ink-primary">
                  What it does
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['search_indicators', 'Find statistical variables matching a natural-language query, optionally scoped to places. The discovery step.'],
                ['search_child_indicators', 'Find variables available at the child-place level inside a parent — the sub-national equivalent.'],
                ['get_variable_metadata', 'Definitions, temporal coverage and provenances for a list of variables. Use it to qualify a series before pulling data.'],
                ['get_observations', 'Time-series values for one variable at one place, with source metadata.'],
                ['get_child_observations', 'The same, across every child place of a given type inside a parent. Requires a bounded date range.'],
                ['get_multi_entity_observations', 'Relationship variables with more than one entity — aid flows, bilateral trade, migration corridors.'],
              ].map(([tool, description]) => (
                <tr key={tool} className="even:bg-surface-1">
                  <th scope="row" className="p-3 text-left align-top">
                    <code className="font-mono text-[0.76rem] text-un-blue">{tool}</code>
                  </th>
                  <td className="p-3 align-top text-ink-secondary">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-lg border border-hairline bg-surface-1 p-5">
          <h3 className="text-[0.92rem] font-semibold text-ink-primary">The playbooks</h3>
          <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-secondary">
            The server also publishes three resources —{' '}
            <code className="text-un-blue">skill://data-commons-researcher/SKILL.md</code>,{' '}
            <code className="text-un-blue">skill://data-commons-child-places-researcher/SKILL.md</code>{' '}
            and{' '}
            <code className="text-un-blue">skill://data-commons-multi-entity-researcher/SKILL.md</code>{' '}
            — and the tool descriptions instruct a client to read the relevant one before
            first use. They encode the same discipline this guide argues for: search before
            you fetch, qualify before you quote, and carry the provenance through.
          </p>
        </div>
      </Section>

      <Section
        title="Verify it yourself"
        lead="The live server is the source of truth for what it offers — not this page, and not any documentation. Ask it."
      >
        <CodeBlock
          label="list the tools, straight from the server"
          code={`curl -s -X POST '${MCP_ENDPOINT}' \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json, text/event-stream' \\
  -d '{
    "jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}
  }' | sed -n 's/^data: //p' | tail -1 | python3 -m json.tool`}
        />
        <p className="mt-3 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
          The response is a server-sent event stream, which is why the{' '}
          <code>data:</code> prefix is stripped before parsing. Swap{' '}
          <code>tools/list</code> for <code>resources/list</code> to see the playbooks, or{' '}
          <code>initialize</code> to read the server's own instructions to the model.
        </p>
      </Section>

      <Section
        title="Three prompts worth keeping"
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
              use: 'Regional scan',
              prompt:
                'Using un-data, find every indicator UNODC publishes on homicide, then get the latest value for all countries in Eastern Africa. Report the reference year per country and flag any that are more than five years old.',
              why: 'Mirrors the containment query from the cookbook, and makes the mixed-vintage problem the model\'s job rather than yours.',
            },
            {
              use: 'Indicator triage',
              prompt:
                'Using un-data, I need maternal mortality for Bangladesh. Before fetching anything, list the candidate variables with their definitions and coverage, and recommend which one to use for an SDG-aligned report.',
              why: 'This is the case where the bare identifier returns nothing — the metadata tool catches it before you build on sand.',
            },
          ].map((item) => (
            <li key={item.use} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-un-blue">
                {item.use}
              </p>
              <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-ink-primary">
                “{item.prompt}”
              </p>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-muted">{item.why}</p>
            </li>
          ))}
        </ul>
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
