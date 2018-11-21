import {WsCropSortField} from '@charlyghislain/plancul-api';
import {UntranslatedSelectItem} from '../../main/service/util/untranslated-select-item';
import {MessageKeys} from '../../main/service/util/message-keys';

export const CROP_FIELD_OPTIONS: UntranslatedSelectItem[] = [
  {
    label_key: MessageKeys.NAME_LABEL,
    value: WsCropSortField.DISPLAY_NAME,
  },
  {
    label_key: MessageKeys.SPECIES_LABEL,
    value: WsCropSortField.PLANT_NAME,
  },
  {
    label_key: MessageKeys.CULTIVAR_LABEL,
    value: WsCropSortField.CULTIVAR,
  },
  {
    label_key: MessageKeys.PRODUCT_LABEL,
    value: WsCropSortField.PRODUCT_NAME,
  },
];
