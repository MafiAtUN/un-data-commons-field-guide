import { PageHeader, Section, Takeaway } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';
import { SeriesPanel } from '../components/panels/SeriesPanel';
import { RankingPanel } from '../components/panels/RankingPanel';
import { SNAPSHOT_KEYS } from '../lib/undc/snapshots';
import { searchUrl } from '../lib/undc/config';

const PEERS = ['country/BGD', 'country/ETH', 'country/SSD', 'country/IND'];

/**
 * Development worked case.
 *
 * The analytical trap here is different from the peace case: the data is
 * plentiful and well-populated, so the risk is not absence but false precision —
 * choosing an axis, a baseline or a "total" that flatters the conclusion.
 */
export function Development() {
  return (
    <>
      <PageHeader
        eyebrow="Pillar · Development"
        title="Is Bangladesh's development gain keeping pace with its region?"
        lead={
          <>
            Where the peace pillar fights data scarcity, the development pillar has the
            opposite problem: so many well-populated series that it is easy to build a
            chart that is technically accurate and rhetorically dishonest. This case is
            about the choices — baseline, axis, and which “total” you trust.
          </>
        }
      />

      <Section
        title="Step 1 — Rank the region, in one request"
        lead={
          <>
            The same containment expression from the peace case, re-targeted at a UN
            geographic region instead of a continent. Note what is different about the
            result: every value is from the same year.
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RankingPanel
              snapshotKey={SNAPSHOT_KEYS.hdiSouthernAsia}
              title="Human Development Index, Southern Asia"
              subtitle="UNDP Human Development Report Office — every country the graph holds inside the Southern Asia region."
              variable="undata/undphdro/HDI_hdi"
              parentPlace="SouthernAsia"
              highlight={['country/BGD']}
            />
          </div>
          <div className="lg:col-span-2 space-y-3">
            <CodeBlock
              label="a UN region, not a continent"
              code={`curl -s -G \\
  'https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2/observation' \\
  --data-urlencode 'date=LATEST' \\
  --data-urlencode 'variable.dcids=undata/undphdro/HDI_hdi' \\
  --data-urlencode \\
    'entity.expression=SouthernAsia<-containedInPlace+{typeOf:Country}' \\
  --data-urlencode 'select=date'  \\
  --data-urlencode 'select=value' \\
  --data-urlencode 'select=entity'`}
            />
            <div className="rounded-lg border border-hairline bg-surface-1 p-4 text-[0.82rem] leading-relaxed text-ink-secondary">
              <p className="font-semibold text-ink-primary">Why this one is clean</p>
              <p className="mt-2">
                HDI is a modelled composite published for all countries on one annual
                cycle, so a <code>LATEST</code> query returns a single uniform year. Compare
                that with the{' '}
                <a
                  href="/peace-and-security"
                  className="text-volt underline decoration-volt/30 underline-offset-2"
                >
                  homicide ranking
                </a>
                , built from national administrative reporting, which spanned fifteen
                different years. The query is identical; the data generation process is not.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Step 2 — The axis decision, made in the open"
        lead={
          <>
            HDI runs from 0 to 1 and real national values cluster between about 0.4 and 0.8.
            Plot it from zero and every country looks identical; plot it on a padded window
            and the differences become visible. Both are defensible — but only if you say
            which you did.
          </>
        }
      >
        <div className="space-y-6">
          <SeriesPanel
            snapshotKey={SNAPSHOT_KEYS.maternalMortality}
            title="Maternal mortality ratio"
            subtitle="SDG 3.1.1, deaths per 100,000 live births. A magnitude, so this one gets a zero baseline."
            variables={['undata/sdg/SH_STA_MORT.SEX--F']}
            entities={['country/BGD', 'country/IND', 'country/SSD']}
            zeroBaseline
            caveat={
              <>
                This indicator is only published as a female-disaggregated series — its
                identifier carries <code className="mx-1 text-ink-primary">.SEX--F</code>{' '}
                and the bare <code className="mx-1 text-ink-primary">undata/sdg/SH_STA_MORT</code>{' '}
                returns nothing at all. A reasonable guess at the “total” series would have
                produced an empty chart and no explanation; this is why the Prompt Lab lists
                the resolved identifiers rather than just the names.
              </>
            }
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <SeriesPanel
              snapshotKey={SNAPSHOT_KEYS.electricityAccess}
              title="Access to electricity (% of population)"
              subtitle="SDG 7.1.1. A bounded share approaching a ceiling — shown from zero."
              variables={['undata/sdg/EG_ACS_ELEC']}
              entities={PEERS}
              zeroBaseline
              height={230}
            />
            <SeriesPanel
              snapshotKey={SNAPSHOT_KEYS.internetUse}
              title="Individuals using the internet (% of population)"
              subtitle="SDG 17.8.1 / ITU. The same units as the panel beside it, so the two are directly comparable."
              variables={['undata/sdg/IT_USE_ii99']}
              entities={['country/BGD', 'country/IND', 'country/KEN']}
              zeroBaseline
              height={230}
            />
          </div>

          <div className="rounded-lg border border-hairline bg-surface-1 p-5">
            <h3 className="text-[0.92rem] font-semibold text-ink-primary">
              Why these are two charts and not one
            </h3>
            <p className="mt-2 max-w-3xl text-[0.86rem] leading-relaxed text-ink-secondary">
              Electricity access and internet use are both percentages, so it is tempting to
              overlay them. Resist plotting two measures of <em>different</em> scale on one
              plot with two y-axes: the alignment between the two scales is arbitrary, and
              the chart will invent a relationship that is not in the data. Two panels
              sharing an axis definition — as here — let the reader make the comparison
              without being led into one.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Step 3 — The indicator with almost no data"
        lead="Not every development series is dense. Poverty headcounts depend on household surveys, and surveys are expensive."
      >
        <SeriesPanel
          snapshotKey={SNAPSHOT_KEYS.poverty}
          title="Population below the international poverty line (%)"
          subtitle="SDG 1.1.1. Four countries, and between two and ten observations each across four decades."
          variables={['undata/sdg/SI_POV_DAY1']}
          entities={PEERS}
          zeroBaseline
          caveat={
            <>
              These lines connect survey years that are up to a decade apart, and the
              straight segments between them are drawn by the chart, not measured by anyone.
              South Sudan has two observations in total — 2009 and 2016. A trend line
              through two points is an illustration, not evidence. Where survey coverage is
              this thin, the table view is the more honest presentation, and it is one click
              away on every panel here.
            </>
          }
        />
      </Section>

      <Section
        title="Step 4 — From one indicator to a goal"
        lead={
          <>
            The platform also exposes the SDG framework itself as a branch of the graph, so
            you can walk from a goal to its targets to its indicators rather than guessing
            identifiers.
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            label="walk the SDG tree"
            code={`# the targets under Goal 1
curl -s -G \\
  'https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2/node' \\
  --data-urlencode 'nodes=undata/g/sdgf/goal-1' \\
  --data-urlencode 'property=<-specializationOf'

# then the indicators under a target
curl -s -G \\
  'https://unsd-datacommons.gcp.un-icc.cloud/core/api/v2/node' \\
  --data-urlencode 'nodes=undata/g/sdgf/target-1-1' \\
  --data-urlencode 'property=<-specializationOf'`}
          />
          <div className="space-y-3 text-[0.88rem] leading-relaxed text-ink-secondary">
            <p>
              The hierarchy is four levels deep: goal → target → indicator → the
              dimension-sliced variants that end in a leaf you can actually fetch. Walking
              it is the reliable way to answer “what does the UN actually measure for this
              goal?” — as opposed to what you assumed it measures.
            </p>
            <p>
              The same traversal works from the agency side:{' '}
              <code className="text-volt">undata/g/who</code>,{' '}
              <code className="text-volt">undata/g/ilo</code>,{' '}
              <code className="text-volt">undata/g/unicef</code> and the rest each open
              into their own indicator trees. The{' '}
              <a href="/catalogue" className="text-volt underline decoration-volt/30 underline-offset-2">
                catalogue
              </a>{' '}
              lists all sixteen with their live counts.
            </p>
            <a
              href={searchUrl('human development index in Southern Asia')}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-block text-[0.8rem] text-volt underline decoration-volt/30 underline-offset-2 hover:decoration-volt"
            >
              Compare with the platform's own search ↗
            </a>
          </div>
        </div>
      </Section>

      <Section title="What this case leaves you with">
        <div className="grid gap-4 md:grid-cols-2">
          <Takeaway>
            <strong className="text-ink-primary">The bare code is not always the total.</strong>{' '}
            Maternal mortality only exists as <code>.SEX--F</code>. Always confirm the
            identifier from a resolver result or a graph walk rather than constructing it
            from the pattern.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Same query, different data quality.</strong>{' '}
            A modelled composite like HDI gives you a uniform year; survey- and
            administration-based indicators do not. The API cannot tell you which you have —
            the provenance line under each chart can.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Never two y-axes.</strong> If two measures
            do not share a scale, use two panels or index both to a common base. A dual axis
            manufactures a correlation.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Sparse series deserve tables.</strong> Two
            observations twelve years apart are not a trend. Offer the table, and let the
            reader see how much of the line was drawn rather than measured.
          </Takeaway>
        </div>
      </Section>
    </>
  );
}
