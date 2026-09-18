/**
 * What is actually inside the UN System Data Commons.
 *
 * The indicator counts are not written here — they are read at runtime from
 * `/api/variable-group/info`, so this page cannot quietly go stale as entities
 * onboard. What is written here is the editorial layer the API does not carry:
 * which pillar a collection serves, and what it is good for.
 */

export type Pillar = 'peace' | 'development' | 'both';

export interface Collection {
  /** Variable-group dcid in the graph. */
  id: string;
  /** The `agency` segment of this collection's variable dcids. */
  agencySegment: string;
  name: string;
  fullName: string;
  /** One line on what you would come here for. */
  useFor: string;
  pillar: Pillar;
}

/**
 * The 16 contributing collections, as the graph exposed them on 18 September 2026.
 *
 * Ordered by indicator count at the time of writing; the live counts are fetched
 * and displayed alongside, so a change in the ordering is visible rather than
 * hidden.
 */
export const COLLECTIONS: readonly Collection[] = [
  {
    id: 'undata/g/who', agencySegment: 'who', name: 'WHO',
    fullName: 'World Health Organization',
    useFor: 'Mortality, disease burden, health systems and risk factors — the deepest collection in the graph.',
    pillar: 'development',
  },
  {
    id: 'undata/g/unfpa', agencySegment: 'unfpa', name: 'UNFPA',
    fullName: 'UN Population Fund',
    useFor: 'Sexual and reproductive health, population dynamics, gender-based violence.',
    pillar: 'development',
  },
  {
    id: 'undata/g/unido', agencySegment: 'unido', name: 'UNIDO',
    fullName: 'UN Industrial Development Organization',
    useFor: 'Manufacturing value added, industrial employment and competitiveness by sector.',
    pillar: 'development',
  },
  {
    id: 'undata/g/unhcr', agencySegment: 'unhcr', name: 'UNHCR',
    fullName: 'UN Refugee Agency',
    useFor: 'End-year populations of concern by type, origin and asylum country; statelessness.',
    pillar: 'peace',
  },
  {
    id: 'undata/g/ilo', agencySegment: 'ilo', name: 'ILO',
    fullName: 'International Labour Organization',
    useFor: 'Employment, informality, wages, working poverty and labour rights.',
    pillar: 'development',
  },
  {
    id: 'undata/g/sdg', agencySegment: 'sdg', name: 'SDG database',
    fullName: 'Global SDG Indicators Database (UNSD)',
    useFor: 'The official SDG indicator series — the reference for any goal-aligned reporting.',
    pillar: 'both',
  },
  {
    id: 'undata/g/unicef', agencySegment: 'unicef', name: 'UNICEF',
    fullName: "UN Children's Fund",
    useFor: 'Child survival, education, protection and equity breakdowns by wealth quintile.',
    pillar: 'both',
  },
  {
    id: 'undata/g/itu', agencySegment: 'itu', name: 'ITU',
    fullName: 'International Telecommunication Union',
    useFor: 'Connectivity, internet use, mobile coverage and the digital divide.',
    pillar: 'development',
  },
  {
    id: 'undata/g/eclac', agencySegment: 'eclac', name: 'ECLAC',
    fullName: 'Economic Commission for Latin America and the Caribbean',
    useFor: 'Regional economic and social statistics for Latin America and the Caribbean.',
    pillar: 'development',
  },
  {
    id: 'undata/g/unodc', agencySegment: 'unodc', name: 'UNODC',
    fullName: 'UN Office on Drugs and Crime',
    useFor: 'Homicide, violent crime, bribery, prisons and criminal justice capacity.',
    pillar: 'peace',
  },
  {
    id: 'undata/g/unaids', agencySegment: 'unaids', name: 'UNAIDS',
    fullName: 'Joint UN Programme on HIV/AIDS',
    useFor: 'HIV incidence, prevalence, treatment coverage and key-population estimates.',
    pillar: 'development',
  },
  {
    id: 'undata/g/unesco', agencySegment: 'unesco', name: 'UNESCO',
    fullName: 'UN Educational, Scientific and Cultural Organization',
    useFor: 'Learning outcomes, education finance, research and cultural statistics.',
    pillar: 'development',
  },
  {
    id: 'undata/g/undphdro', agencySegment: 'undphdro', name: 'UNDP HDRO',
    fullName: 'UNDP Human Development Report Office',
    useFor: 'HDI, inequality-adjusted HDI, gender and planetary-pressures indices.',
    pillar: 'development',
  },
  {
    id: 'undata/g/ohchr', agencySegment: 'ohchr', name: 'OHCHR',
    fullName: 'UN Human Rights Office',
    useFor: 'Ratification status across the core human rights treaties and their protocols.',
    pillar: 'peace',
  },
  {
    id: 'undata/g/undrr', agencySegment: 'undrr', name: 'UNDRR',
    fullName: 'UN Office for Disaster Risk Reduction',
    useFor: 'Disaster mortality, affected populations and direct economic loss.',
    pillar: 'peace',
  },
  {
    id: 'undata/g/iomdtm', agencySegment: 'iomdtm', name: 'IOM DTM',
    fullName: 'IOM Displacement Tracking Matrix',
    useFor: 'Internally displaced persons present, from baseline assessments.',
    pillar: 'peace',
  },
];

/** The 12 thematic areas the platform's own Explore page is organised around. */
export const THEME_IDS: Record<string, string> = {
  'dc/g/UN_THEME_1': 'Poverty and food security',
  'dc/g/UN_THEME_2': 'Health',
  'dc/g/UN_THEME_3': 'Children and youth',
  'dc/g/UN_THEME_4': 'Education and culture',
  'dc/g/UN_THEME_5': 'Equality and human rights',
  'dc/g/UN_THEME_6': 'Economic development',
  'dc/g/UN_THEME_7': 'Urbanization and human settlements',
  'dc/g/UN_THEME_8': 'Drinking water, sanitation and hygiene',
  'dc/g/UN_THEME_9': 'Climate and the environment',
  'dc/g/UN_THEME_10': 'Population and demography',
  'dc/g/UN_THEME_11': 'Disasters and humanitarian action',
  'dc/g/UN_THEME_12': 'Governance and peace',
};
