import {SelectItem} from 'primeng/api';
import {WsCropSortField} from '@charlyghislain/plancul-ws-api';

export const CROP_FIELD_OPTIONS: SelectItem[] = [
  {
    label: 'Taxon',
    value: WsCropSortField.PLANT_NAME,
  },
  {
    label: 'Cultivar',
    value: WsCropSortField.CULTIVAR,
  },
  {
    label: 'Product',
    value: WsCropSortField.PRODUCT_NAME,
  },
];
