import {WsBedSortField, WsSortOrder} from '@charlyghislain/plancul-api';
import {Sort} from '../../main/domain/sort';
import {UntranslatedSelectItem} from '../../main/service/util/untranslated-select-item';
import {MessageKeys} from '../../main/service/util/message-keys';

export const BED_SORT_OPTIONS: UntranslatedSelectItem[] = [
  {
    label_key: MessageKeys.NAME_LABEL,
    value: <Sort>{
      field: WsBedSortField.NAME,
      order: WsSortOrder.ASC,
    },
  },
];
