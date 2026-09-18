/**
 * Build a citation for a figure taken from the UN System Data Commons.
 *
 * Getting this right matters more than it looks. The Data Commons is a
 * *distribution* platform: the authority behind a number is the agency that
 * produced it, not data.un.org. A citation that credits only the platform
 * loses the accountable body, and a reader cannot then check the methodology.
 *
 * So every style here names the producing agency first and the platform as the
 * route by which the data was obtained.
 */

export type CitationStyle = 'un' | 'apa' | 'chicago' | 'inline';

export interface CitationInput {
  /** The indicator as a reader would name it. */
  indicator: string;
  /** The producing agency or database. */
  source: string;
  /** Machine identifier, so someone can reproduce the exact series. */
  dcid: string;
  /** Countries covered, for the note. */
  places?: string;
  /** The period the figures cover. */
  period?: string;
  /** ISO timestamp of retrieval. */
  retrievedAt: string;
}

export const CITATION_STYLE_LABELS: Record<CitationStyle, string> = {
  un: 'UN documents',
  apa: 'APA 7th',
  chicago: 'Chicago',
  inline: 'Footnote / chart note',
};

export function formatCitation(style: CitationStyle, input: CitationInput): string {
  const accessed = formatDate(input.retrievedAt);
  const year = new Date(input.retrievedAt).getFullYear();
  const scope = [input.places, input.period].filter(Boolean).join(', ');
  const scopeSuffix = scope ? ` (${scope})` : '';

  switch (style) {
    case 'un':
      return `${input.source}, "${input.indicator}"${scopeSuffix}. Available from the UN System Data Commons, https://data.un.org (accessed ${accessed}). Series identifier: ${input.dcid}.`;

    case 'apa':
      return `${input.source}. (${year}). ${input.indicator}${scopeSuffix} [Data set]. UN System Data Commons. Retrieved ${accessed}, from https://data.un.org`;

    case 'chicago':
      return `${input.source}. "${input.indicator}."${scopeSuffix ? ` ${scopeSuffix.trim()}.` : ''} UN System Data Commons. Accessed ${accessed}. https://data.un.org.`;

    case 'inline':
      return `Source: ${input.source}, via the UN System Data Commons (data.un.org), accessed ${accessed}.`;
  }
}

/**
 * The line that belongs under a chart.
 *
 * Deliberately short: a chart note has to survive being screenshotted into a
 * slide, so it carries the producer, the route and the date and nothing else.
 */
export function chartNote(input: CitationInput): string {
  return formatCitation('inline', input);
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
