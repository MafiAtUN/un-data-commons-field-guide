/**
 * The country picker list, baked from the platform by `npm run countries`.
 *
 * It is the union of the entities two very high-coverage indicators actually
 * return, so it lists the countries and areas the graph can really answer for.
 */

import file from '../data/countries.json';

const data = file as { generatedAt: string; countries: Record<string, string> };

/** dcid → display name, e.g. `country/BGD` → `Bangladesh`. */
export const COUNTRIES: Record<string, string> = data.countries;

export const COUNTRIES_GENERATED_AT: string = data.generatedAt;

export interface CountryPreset {
  label: string;
  countries: string[];
}

/**
 * Starting points that match how colleagues actually group countries.
 *
 * Deliberately small and concrete rather than an attempt at official groupings:
 * a preset is a shortcut to a readable chart, not a statement about membership
 * of any UN category.
 */
export const COUNTRY_PRESETS: readonly CountryPreset[] = [
  {
    label: 'Horn of Africa',
    countries: ['country/ETH', 'country/SOM', 'country/SSD', 'country/SDN', 'country/ERI', 'country/DJI'],
  },
  {
    label: 'South Asia',
    countries: ['country/BGD', 'country/IND', 'country/PAK', 'country/NPL', 'country/LKA', 'country/AFG'],
  },
  {
    label: 'Sahel',
    countries: ['country/MLI', 'country/NER', 'country/BFA', 'country/TCD', 'country/MRT', 'country/SEN'],
  },
  {
    label: 'Conflict-affected',
    countries: ['country/SSD', 'country/COD', 'country/SYR', 'country/AFG', 'country/YEM', 'country/UKR'],
  },
  {
    label: 'Small island states',
    countries: ['country/FJI', 'country/MDV', 'country/VUT', 'country/WSM', 'country/BRB', 'country/TON'],
  },
  {
    label: 'G7',
    countries: ['country/USA', 'country/GBR', 'country/FRA', 'country/DEU', 'country/ITA', 'country/CAN', 'country/JPN'],
  },
];
