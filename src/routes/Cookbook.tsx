import { Link } from 'react-router-dom';
import { PageHeader, Section } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';
import { DcidExplainer } from '../components/DcidExplainer';
import { PageVideo } from '../components/PageVideo';

/** Copy-paste reference for the REST surface. Ordered by how often you need it. */
export function Cookbook() {
  return (
    <>
      <PageHeader
        eyebrow="Query cookbook"
        title="The REST surface, in the order you will need it"
        lead={
          <>
            Two base URLs, three endpoints, no API key. Everything below runs as written —
            paste it into a terminal, or into the browser console on any page, because the
            deployment answers cross-origin.
          </>
        }
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-surface-1 p-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-muted">
            Graph and observations (REST v2)
          </p>
          <code className="mt-2 block break-all font-mono text-[0.76rem] text-volt">
            https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2
          </code>
          <p className="mt-2 text-[0.75rem] text-ink-muted">
            <code>/node</code> · <code>/observation</code> · <code>/resolve</code>
          </p>
        </div>
        <div className="rounded-lg border border-hairline bg-surface-1 p-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-muted">
            Convenience endpoints (website API)
          </p>
          <code className="mt-2 block break-all font-mono text-[0.76rem] text-volt">
            https://unsd-datacommons.gcp.un-icc.cloud/api
          </code>
          <p className="mt-2 text-[0.75rem] text-ink-muted">
            <code>/observations/series</code> · <code>/place/name</code> ·{' '}
            <code>/variable-group/info</code>
          </p>
        </div>
      </div>

      <Section
        title="First, learn the identifier grammar"
        lead="Almost every difficulty with this API dissolves once you can read a dcid. Pick an example, or paste one of your own — the breakdown below is produced by the same parser the rest of the site uses."
      >
        <DcidExplainer />
      </Section>

      <PageVideo page="/cookbook" />

      <Section title="Recipe 1 — A time series for known places">
        <Recipe
          when="You know the indicator and the countries, and you want every year."
          code={`curl -s -X POST \\
  'https://unsd-datacommons.gcp.un-icc.cloud/api/observations/series' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "variables": ["undata/sdg/VC_DTH_TOTN"],
    "entities":  ["country/SSD", "country/COD", "country/SYR"]
  }'`}
          notes={[
            'Several variables and several entities in one call: you get the cross product.',
            'Each block carries a facet id; look it up in the top-level `facets` object for the source URL, unit and observation period.',
            'An entity that returns an empty `series` has no data — which is not the same as zero.',
          ]}
        />
      </Section>

      <Section title="Recipe 2 — One value per country across a whole region">
        <Recipe
          when="You want a ranking or a map, and you do not want to enumerate country codes."
          code={`curl -s -G \\
  'https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2/observation' \\
  --data-urlencode 'date=LATEST' \\
  --data-urlencode 'variable.dcids=undata/unodc/VIC_HOM_RT' \\
  --data-urlencode \\
    'entity.expression=africa<-containedInPlace+{typeOf:Country}' \\
  --data-urlencode 'select=date'     \\
  --data-urlencode 'select=value'    \\
  --data-urlencode 'select=variable' \\
  --data-urlencode 'select=entity'`}
          notes={[
            'The arrows and braces must reach the server percent-encoded — which is exactly what --data-urlencode and URLSearchParams do for you.',
            'Swap `africa` for any of the 30 UN geographic regions: SouthernAsia, EasternAfrica, LatinAmericaAndCaribbean, Melanesia, and so on.',
            'date=LATEST resolves per entity, so the result can mix reference years. Always check the spread before calling it a cross-section.',
          ]}
        />
      </Section>

      <Section title="Recipe 3 — Pin an exact year, or a range">
        <Recipe
          when="You need a comparable cross-section rather than “whatever is newest”."
          code={`# a single year, identical for every country
curl -s -G \\
  'https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2/observation' \\
  --data-urlencode 'date=2023' \\
  --data-urlencode 'variable.dcids=undata/undphdro/HDI_hdi' \\
  --data-urlencode \\
    'entity.expression=SouthernAsia<-containedInPlace+{typeOf:Country}' \\
  --data-urlencode 'select=date'  \\
  --data-urlencode 'select=value' \\
  --data-urlencode 'select=entity'`}
          notes={[
            'Pinning the year is how you get a defensible like-for-like comparison.',
            'The trade-off is coverage: countries that have not reported that year drop out entirely rather than falling back to an older reading.',
            'Omitting `date` returns the full series instead of a point.',
          ]}
        />
      </Section>

      <Section title="Recipe 4 — Discover what exists, instead of guessing">
        <Recipe
          when="You have a topic but no identifier, and you would rather walk the tree than trust a search ranking."
          code={`# the 16 contributing collections and their sizes
curl -s -X POST \\
  'https://unsd-datacommons.gcp.un-icc.cloud/api/variable-group/info' \\
  -H 'Content-Type: application/json' \\
  -d '{"dcid": "undata/g/Root", "entities": []}'

# drill into one collection
curl -s -G \\
  'https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2/node' \\
  --data-urlencode 'nodes=undata/g/unodc' \\
  --data-urlencode 'property=<-specializationOf'

# and finally the fetchable leaf variables of a group
curl -s -G \\
  'https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2/node' \\
  --data-urlencode 'nodes=undata/g/unodc/VIC_HOM_RT.000' \\
  --data-urlencode 'property=<-memberOf'`}
          notes={[
            '`<-specializationOf` descends the hierarchy; `<-memberOf` returns the leaf variables you can actually request observations for.',
            'The tree is deeper than it looks: collection → indicator → dimension-sliced group → leaf. Do not stop at the first level and assume you have found a variable.',
            'Useful roots: `undata/g/Root` (collections), `dc/g/UN` (the 12 thematic areas), `undata/g/sdgf/goal-16` (an SDG goal).',
          ]}
        />
      </Section>

      <Section title="Recipe 5 — Inspect a variable's metadata before you trust it">
        <Recipe
          when="Before publishing anything: confirm what the series actually measures."
          code={`curl -s -G \\
  'https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2/node' \\
  --data-urlencode 'nodes=undata/sdg/VC_DTH_TOTN' \\
  --data-urlencode 'property=->*'`}
          notes={[
            '`->*` returns every outgoing property of the node: name, population type, measured property, units and the statistical classifications it belongs to.',
            'This is where you find out that two similarly named indicators differ in denominator, or that a "rate" is per 1,000 rather than per 100,000.',
            'The `facets` object on any observation response carries the provenance URL — follow it for the methodology and terms of use.',
          ]}
        />
      </Section>

      <Section
        title="Five things that will trip you up"
        lead="Collected from working against this deployment; each one cost real debugging time."
      >
        <ol className="space-y-3">
          {[
            {
              title: 'Relation expressions must be encoded',
              body: 'An unencoded `->` or `<-` in a query string returns HTTP 400 with no useful message. Always build the query with URLSearchParams or --data-urlencode.',
            },
            {
              title: '`/api/observations/point` does not exist',
              body: 'The website API offers `series`, not `point` — asking for point returns 405. Use the REST v2 `/observation` endpoint with `date=LATEST` for single values.',
            },
            {
              title: 'The bare indicator code may not be the total',
              body: 'Maternal mortality is only published as `undata/sdg/SH_STA_MORT.SEX--F`; the unsuffixed dcid returns nothing. Confirm identifiers, never construct them by analogy.',
            },
            {
              title: 'Empty is not zero',
              body: 'A requested entity with no observations is silently absent from the response body. Handle the missing key explicitly, or you will chart a data gap as a value.',
            },
            {
              title: 'Disaggregations exclude "unknown"',
              body: 'Age and sex slices omit the unknown category, which is carried separately (`.AGE--_U`). Summing the named bands will not reproduce the total.',
            },
          ].map((item, index) => (
            <li key={item.title} className="flex gap-4 rounded-lg border border-hairline bg-surface-1 p-4">
              <span className="tnum shrink-0 font-mono text-[0.8rem] font-semibold text-status-warning">
                {index + 1}
              </span>
              <div>
                <h3 className="text-[0.9rem] font-semibold text-ink-primary">{item.title}</h3>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-secondary">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="Where this goes next"
        lead="The recipes above are the API. Getting them inside the thing you actually build in is a separate problem, and it has its own page."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            to="/dashboards"
            className="group rounded-lg border border-hairline bg-surface-1 p-5 transition-colors hover:border-volt/60"
          >
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-volt">
              Power BI &amp; Tableau
            </p>
            <h3 className="mt-2 text-[0.95rem] font-semibold text-ink-primary">
              The keyed record, turned into a rectangle
            </h3>
            <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-secondary">
              Power Query M for the call and the cleaning, the star schema worth building
              on top of it, two DAX measures, and why Tableau wants a file rather than a
              connector.
            </p>
          </Link>
          <Link
            to="/notebooks"
            className="group rounded-lg border border-hairline bg-surface-1 p-5 transition-colors hover:border-volt/60"
          >
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-volt">
              Python, R &amp; Julia
            </p>
            <h3 className="mt-2 text-[0.95rem] font-semibold text-ink-primary">
              The same two calls, three ways
            </h3>
            <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-secondary">
              A tidy frame with the provenance carried on every row, the empty-series
              branch written first, and the repeated-query-parameter trap that returns a
              bare 400 in every language.
            </p>
          </Link>
        </div>
      </Section>

      <Section
        title="A note on courtesy"
        lead="This is public infrastructure run for everyone, and it is unmetered."
      >
        <div className="rounded-lg border border-hairline bg-surface-1 p-5 text-[0.88rem] leading-relaxed text-ink-secondary">
          <p>
            There is no API key, which means there is no quota protecting the service from
            you. Cache what you fetch, batch your variables and entities into single
            requests rather than looping, prefer one containment expression over fifty
            country calls, and do not poll for data that updates annually.
          </p>
          <p className="mt-3">
            This site practises what it recommends: one request per panel, and a committed
            snapshot so that a reader who reloads the page ten times does not cost the UN
            ten round trips per chart.
          </p>
        </div>
      </Section>
    </>
  );
}

function Recipe({
  when,
  code,
  notes,
}: {
  when: string;
  code: string;
  notes: readonly string[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-3 text-[0.85rem] leading-relaxed text-ink-secondary">
          <span className="font-semibold text-ink-primary">When: </span>
          {when}
        </p>
        <CodeBlock code={code} />
      </div>
      <ul className="space-y-2.5 text-[0.84rem] leading-relaxed text-ink-secondary">
        {notes.map((note) => (
          <li key={note} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-volt" />
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
