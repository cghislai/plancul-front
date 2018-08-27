import {SelectItem} from 'primeng/api';
import {WsBedSortField, WsSortOrder} from '@charlyghislain/plancul-api';
import {Sort} from '../../main/domain/sort';

// FIXME: i18n
export const BED_SORT_OPTIONS: SelectItem[] = [
  {
    label: 'Name',
    value: <Sort>{
      field: WsBedSortField.NAME,
      order: WsSortOrder.ASC,
    },
  },
];
