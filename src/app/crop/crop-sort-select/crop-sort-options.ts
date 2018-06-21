import {SelectItem} from 'primeng/api';
import {WsCropSortField, WsSortOrder} from '@charlyghislain/plancul-ws-api';
import {Sort} from '../../main/domain/sort';

export const CROP_SORT_OPTIONS: SelectItem[] = [
  {
    label: 'Taxon',
    value: <Sort>{
      field: WsCropSortField.PLANT_NAME,
      order: WsSortOrder.ASC,
    },
  },
  {
    label: 'Cultivar',
    value: <Sort>{
      field: WsCropSortField.CULTIVAR,
      order: WsSortOrder.ASC,
    },
  },
  {
    label: 'Product',
    value: <Sort>{
      field: WsCropSortField.PRODUCT_NAME,
      order: WsSortOrder.ASC,
    },
  },
];
