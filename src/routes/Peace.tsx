import { PageHeader, Section, Takeaway } from '../components/Prose';
import { CodeBlock } from '../components/CodeBlock';
import { SeriesPanel } from '../components/panels/SeriesPanel';
import { RankingPanel } from '../components/panels/RankingPanel';
import { SNAPSHOT_KEYS } from '../lib/undc/snapshots';
import { searchUrl } from '../lib/undc/config';

const CONFLICT_COUNTRIES = ['country/SSD', 'country/COD', 'country/SYR', 'country/AFG', 'country/SOM'];

/**
 * Peace and security worked case.
 *
 * Follows one analytical question from a first search to attributed charts,
 * keeping the wrong turns in: the silence of a country with no data, the mixed
 * vintages of a "latest" regional comparison, and the difference between a
 * count and a rate.
 */
export function Peace() {
  return (
    <>
      <PageHeader
        eyebrow="Pillar · Peace and security"
        title="How much of South Sudan's conflict mortality falls on children?"
        lead={
          <>
            A question a colleague might actually be handed on a Tuesday. Answering it
            properly means finding the right indicator, getting the disaggregation, putting
            it in regional context — and noticing three places where the data will mislead
            you if you take it at face value.
          </>
        }
      />

      <Section
        title="Step 1 — Find the indicator, don't invent it"
        lead={
          <>
            “War deaths” returns nothing useful because it is not how the system names the
            concept. The SDG framework calls it <strong>conflict-related deaths</strong>,
            indicator 16.1.2, and that phrase is the key to the whole exercise.
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 text-[0.9rem] leading-relaxed text-ink-secondary">
            <p>
              Searching the official phrasing surfaces a family of series: a total, a
              civilian split, and slices by age, sex and lethal instrument. The identifiers
              tell you how they relate before you fetch anything:
            </p>
            <ul className="space-y-1.5 break-all font-mono text-[0.74rem] text-ink-muted">
              <li><span className="text-volt">undata/sdg/VC_DTH_TOTN</span> — total</li>
              <li><span className="text-volt">undata/sdg/VC_DTH_TOCVN</span> — civilians</li>
              <li><span className="text-volt">undata/sdg/VC_DTH_TONCVN</span> — non-civilians</li>
              <li><span className="text-volt">undata/sdg/VC_DTH_TOTN.AGE--Y0T17</span> — under 18</li>
              <li><span className="text-volt">undata/sdg/VC_DTH_TOTN.AGE--Y_GE18</span> — 18 and over</li>
            </ul>
            <p>
              The last two are the same series as the first, sliced. That is the grammar
              doing the work: <code className="text-ink-secondary">.AGE--Y0T17</code> is not a
              different indicator, it is a filter on the one above it.
            </p>
          </div>
          <div className="space-y-3">
            <CodeBlock
              label="one request, both age slices"
              code={`curl -s -X POST \\
  'https://unsd-datacommons.gcp.un-icc.cloud/api/observations/series' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "variables": [
      "undata/sdg/VC_DTH_TOTN.AGE--Y0T17",
      "undata/sdg/VC_DTH_TOTN.AGE--Y_GE18"
    ],
    "entities": ["country/SSD", "country/COD"]
  }'`}
            />
            <a
              href={searchUrl('number of total conflict-related deaths in South Sudan')}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-block text-[0.8rem] text-volt underline decoration-volt/30 underline-offset-2 hover:decoration-volt"
            >
              Run the equivalent search on data.un.org ↗
            </a>
          </div>
        </div>
      </Section>

      <Section
        title="Step 2 — Get the answer, and notice the silence"
        lead="The disaggregation is available for both South Sudan and DR Congo. Read the chart, then read what is missing from the next one."
      >
        <div className="space-y-6">
          <SeriesPanel
            snapshotKey={SNAPSHOT_KEYS.conflictDeathsByAge}
            title="Conflict-related deaths by age group"
            subtitle="SDG indicator 16.1.2, split into under-18 and 18-and-over. Two countries, two age bands — four series."
            variables={[
              'undata/sdg/VC_DTH_TOTN.AGE--Y0T17',
              'undata/sdg/VC_DTH_TOTN.AGE--Y_GE18',
            ]}
            entities={['country/SSD', 'country/COD']}
            seriesLabels={{
              'undata/sdg/VC_DTH_TOTN.AGE--Y0T17|country/SSD': 'South Sudan · under 18',
              'undata/sdg/VC_DTH_TOTN.AGE--Y_GE18|country/SSD': 'South Sudan · 18 and over',
              'undata/sdg/VC_DTH_TOTN.AGE--Y0T17|country/COD': 'DR Congo · under 18',
              'undata/sdg/VC_DTH_TOTN.AGE--Y_GE18|country/COD': 'DR Congo · 18 and over',
            }}
            caveat={
              <>
                An age-disaggregated conflict death toll depends on the age being recorded
                at the time of documentation. Where it was not, the death appears under
                <code className="mx-1 text-ink-primary">.AGE--_U</code> (unknown) rather
                than in either band — so these two bands do not sum to the total.
              </>
            }
          />

          <SeriesPanel
            snapshotKey={SNAPSHOT_KEYS.conflictDeaths}
            title="Total conflict-related deaths, five conflict-affected countries"
            subtitle="The same indicator, undisaggregated, across a peer group."
            variables={['undata/sdg/VC_DTH_TOTN']}
            entities={CONFLICT_COUNTRIES}
            caveat={
              <>
                <strong>Somalia was requested and returned nothing.</strong> It is absent
                from the chart, not at zero. A missing series in this graph means “not
                reported into this database for these years”, which is a statement about
                reporting capacity, not about peace. Charting only the countries that
                answered, without saying so, would quietly turn a data gap into a finding.
              </>
            }
          />
        </div>
      </Section>

      <Section
        title="Step 3 — Put it in regional context with one request"
        lead={
          <>
            This is the move that makes the REST API worth learning. Instead of looping over
            fifty country codes, you hand the graph a containment expression and it resolves
            the membership for you.
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-3">
            <CodeBlock
              label="every country in Africa, one call"
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
            />
            <div className="rounded-lg border border-hairline bg-surface-1 p-4 text-[0.82rem] leading-relaxed text-ink-secondary">
              <p className="font-semibold text-ink-primary">Reading the expression</p>
              <ul className="mt-2 space-y-1.5">
                <li><code className="text-volt">&lt;-containedInPlace</code> walks containment edges <em>inward</em>: things inside Africa.</li>
                <li><code className="text-volt">+</code> makes it recursive, so sub-regions are traversed too.</li>
                <li><code className="text-volt">{'{typeOf:Country}'}</code> keeps provinces and cities out of the result.</li>
              </ul>
              <p className="mt-3 text-ink-muted">
                Swap <code>africa</code> for <code>SouthernAsia</code>, <code>EasternAfrica</code>
                {' '}or any of the 30 UN geographic regions and the same call re-targets.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <RankingPanel
              snapshotKey={SNAPSHOT_KEYS.homicideAfrica}
              title="Intentional homicide rate, African countries"
              subtitle="UNODC, victims per 100,000 population — each country's most recent available year."
              variable="undata/unodc/VIC_HOM_RT"
              parentPlace="africa"
              highlight={['country/SSD', 'country/ZAF']}
              extraCaveat={
                <>
                  South Sudan's only reading here is over a decade old, so its position in
                  this ranking says more about statistical capacity than about current
                  violence — which is itself a finding worth reporting.
                </>
              }
            />
          </div>
        </div>
      </Section>

      <Section
        title="Step 4 — Displacement, where the count and the rate disagree"
        lead={
          <>
            Conflict mortality is only one face of insecurity. Forced displacement is the
            other, and it is where choosing a count over a rate changes the story.
          </>
        }
      >
        <SeriesPanel
          snapshotKey={SNAPSHOT_KEYS.refugeesByOrigin}
          title="Refugees per 100,000 population, by country of origin"
          subtitle="SDG 10.7.4 / UNHCR. A rate, not a headcount — which is what lets a small country's displacement register at all."
          variables={['undata/sdg/SM_POP_REFG_OR']}
          entities={['country/SSD', 'country/SYR', 'country/AFG', 'country/UKR']}
          caveat={
            <>
              Normalised per 100,000 of the origin country's own population, Syria and South
              Sudan sit far above Ukraine and Afghanistan even in years when the absolute
              Ukrainian caseload was the largest in the world. Neither framing is wrong —
              but a chart of headcounts and a chart of rates support different sentences,
              and the axis label is the only thing telling your reader which one they are
              looking at.
            </>
          }
        />
      </Section>

      <Section title="What this case leaves you with">
        <div className="grid gap-4 md:grid-cols-2">
          <Takeaway>
            <strong className="text-ink-primary">Absence is data.</strong> Somalia returning
            nothing, and South Sudan's homicide figure stopping in 2012, are findings about
            reporting capacity. Drop them silently and you have published a cleaner chart
            and a worse analysis.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">“Latest” is not a year.</strong> A regional
            <code className="mx-1">LATEST</code> query returns each country's own most recent
            reading. Check the spread before you call it a cross-section — the panels above
            do it automatically and say so.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">Slices don't sum.</strong> Age and sex bands
            exclude the unknown category, so disaggregations rarely add up to their total.
            Chart the total <em>or</em> the composition, never both as if they reconcile.
          </Takeaway>
          <Takeaway>
            <strong className="text-ink-primary">One expression beats fifty requests.</strong>{' '}
            <code>{'<-containedInPlace+{typeOf:Country}'}</code> is the single highest-leverage
            thing to memorise in this API.
          </Takeaway>
        </div>
      </Section>
    </>
  );
}
