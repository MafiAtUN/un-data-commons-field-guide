import { useMemo, useState } from 'react';
import { PageHeader, Section } from '../components/Prose';
import { CopyButton } from '../components/CopyButton';
import { PageVideo } from '../components/PageVideo';
import { INDICATORS, indicatorsByTopic } from '../content/indicators';
import { CITATION_STYLE_LABELS, formatCitation, type CitationStyle } from '../lib/undc/citation';

/**
 * Citation guidance and a generator.
 *
 * The substantive point of this page is one distinction that people get wrong
 * constantly: the UN System Data Commons distributes the data, it does not
 * produce it. Cite the producer; mention the platform as the route.
 */
export function Cite() {
  const [dcid, setDcid] = useState(INDICATORS[0]!.dcid);
  const [places, setPlaces] = useState('Bangladesh, Ethiopia, India');
  const [period, setPeriod] = useState('2000–2024');
  const [style, setStyle] = useState<CitationStyle>('un');

  const indicator = useMemo(
    () => INDICATORS.find((item) => item.dcid === dcid) ?? INDICATORS[0]!,
    [dcid],
  );

  const citation = formatCitation(style, {
    indicator: indicator.name,
    source: indicator.source,
    dcid: indicator.dcid,
    places: places.trim() || undefined,
    period: period.trim() || undefined,
    retrievedAt: new Date().toISOString(),
  });

  return (
    <>
      <PageHeader
        eyebrow="Cite the data · 2 minutes"
        title="Credit the agency, not the website"
        lead={
          <>
            data.un.org <em>distributes</em> the statistics. It does not produce them. Name the
            agency that did.
          </>
        }
      />

      <PageVideo page="/cite" />

      <Section title="The rule, in one comparison">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-status-critical/30 bg-status-critical/5 p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-status-critical">
              Not this
            </p>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-secondary">
              “Source: UN Data (data.un.org)”
            </p>
            <ul className="mt-3 space-y-1 text-[0.8rem] leading-relaxed text-ink-muted">
              <li>No agency named, so nobody can check the method.</li>
              <li>Several similar series exist. Which one did you use?</li>
              <li>If challenged, you cannot answer either.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-status-good/30 bg-status-good/5 p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-status-good">
              This
            </p>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-secondary">
              “Source: Global SDG Indicators Database, SDG indicator 7.1.1, via the UN System
              Data Commons (data.un.org), accessed 18 September 2026.”
            </p>
            <ul className="mt-3 space-y-1 text-[0.8rem] leading-relaxed text-ink-muted">
              <li>Producer, indicator, route, date.</li>
              <li>Anyone can find exactly what you found.</li>
              <li>Including you, in a year's time.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section
        title="Build your citation"
        lead="Fill in what you used. Every style names the producing agency first."
      >
        <div className="rounded-lg border border-hairline bg-surface-1 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-ink-muted">
                Indicator
              </span>
              <select
                value={dcid}
                onChange={(event) => setDcid(event.target.value)}
                className="mt-1.5 w-full rounded border border-hairline bg-surface-0 px-3 py-2 text-[0.85rem] text-ink-primary"
              >
                {indicatorsByTopic().map((group) => (
                  <optgroup key={group.topic} label={group.label}>
                    {group.items.map((item) => (
                      <option key={item.dcid} value={item.dcid}>
                        {item.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-ink-muted">
                Style
              </span>
              <select
                value={style}
                onChange={(event) => setStyle(event.target.value as CitationStyle)}
                className="mt-1.5 w-full rounded border border-hairline bg-surface-0 px-3 py-2 text-[0.85rem] text-ink-primary"
              >
                {(Object.keys(CITATION_STYLE_LABELS) as CitationStyle[]).map((option) => (
                  <option key={option} value={option}>
                    {CITATION_STYLE_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-ink-muted">
                Countries or areas used
              </span>
              <input
                value={places}
                onChange={(event) => setPlaces(event.target.value)}
                className="mt-1.5 w-full rounded border border-hairline bg-surface-0 px-3 py-2 text-[0.85rem] text-ink-primary"
              />
            </label>

            <label className="block">
              <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-ink-muted">
                Period covered
              </span>
              <input
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="mt-1.5 w-full rounded border border-hairline bg-surface-0 px-3 py-2 text-[0.85rem] text-ink-primary"
              />
            </label>
          </div>

          <p className="mt-4 rounded border border-hairline bg-surface-0 p-3.5 text-[0.85rem] leading-relaxed text-ink-primary">
            {citation}
          </p>
          <div className="mt-3">
            <CopyButton label="Copy citation" value={citation} />
          </div>
        </div>
      </Section>

      <Section title="What to include" lead="Drop any one and a reader cannot verify you.">
        <dl className="space-y-2.5">
          {[
            ['The producing agency', 'The body accountable for the measurement and its method. This is the citation\'s subject.'],
            ['The indicator name, and its SDG number if it has one', 'Several similar series exist. "Maternal mortality" alone does not identify which one you used.'],
            ['The countries and the period', 'Scopes the claim. Without it, a figure for three countries reads as a global one.'],
            ['The platform and its address', 'How you obtained it. This is what makes the figure findable again, and it is the part that goes last, not first.'],
            ['The access date', 'Agencies revise history. The date is what explains a discrepancy between your report and a later one — without it, you look wrong rather than earlier.'],
            ['The series identifier, for anything technical', 'The dcid, e.g. undata/sdg/EG_ACS_ELEC. Exact and permanent. Put it in a method note or annex rather than in running text.'],
          ].map(([part, why]) => (
            <div key={part} className="rounded-lg border border-hairline bg-surface-1 p-4">
              <dt className="text-[0.88rem] font-semibold text-ink-primary">{part}</dt>
              <dd className="mt-1 text-[0.83rem] leading-relaxed text-ink-secondary">{why}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Terms of use" lead="Free to use is not the same as free to republish.">
        <div className="max-w-3xl space-y-3 rounded-lg border border-hairline bg-surface-1 p-5 text-[0.88rem] leading-relaxed text-ink-secondary">
          <ul className="space-y-2">
            <li>The platform is free to query and needs no account.</li>
            <li>But each dataset carries the terms of the agency that published it.</li>
            <li>Most UN data is reusable with attribution. Some has extra conditions.</li>
            <li>
              Publishing externally? Follow the source link under any chart and read that
              agency's terms first.
            </li>
          </ul>
          <p className="text-ink-muted">
            The platform's own terms are at{' '}
            <a
              href="https://data.un.org/undatacommons/terms-of-use"
              target="_blank"
              rel="noreferrer noopener"
              className="text-volt underline decoration-volt/30 underline-offset-2"
            >
              data.un.org/undatacommons/terms-of-use
            </a>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
