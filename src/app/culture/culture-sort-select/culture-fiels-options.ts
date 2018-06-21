import {SelectItem} from 'primeng/api';
import {WsCultureSortField} from '@charlyghislain/plancul-ws-api';

// FIXME: i18n
export const CULTURE_SORT_OPTIONS: SelectItem[] = [
  {
    label: 'Plant',
    value: WsCultureSortField.CROP_PLANT_NAME,
  },
  {
    label: 'Crop product',
    value: WsCultureSortField.CROP_PRODUCT_NAME,
  },
  {
    label: 'Cultivar',
    value: WsCultureSortField.CROP_CULTIVAR,
  },
  {
    label: 'Bed',
    value: WsCultureSortField.BED_NAME,
  },
  {
    label: 'Sowing date',
    value: WsCultureSortField.SOWING_DATE,
  },
  {
    label: 'Germination date',
    value: WsCultureSortField.GERMINATION_DATE,
  },
  {
    label: 'First harvest',
    value: WsCultureSortField.FIRST_HARVEST_DATE,
  },
  {
    label: 'Last harvest',
    value: WsCultureSortField.LAST_HARVEST_DATE,
  },
  {
    label: 'Bed occupancy (start)',
    value: WsCultureSortField.BED_OCCUPANCY_START_DATE,
  },
  {
    label: 'Notes',
    value: WsCultureSortField.HTML_NOTES,
  },
  {
    label: 'Nursing duration',
    value: WsCultureSortField.NURSERING_DURATION,
  },
  {
    label: 'Nursing start date',
    value: WsCultureSortField.NURSERING_START_DATE,
  },
  {
    label: 'Bed preparation duration',
    value: WsCultureSortField.CULTURE_PREPARATION_DURATION,
  },
  {
    label: 'Bed preparation start date',
    value: WsCultureSortField.CULTURE_PREPARATION_START_DATE,
  },
];
