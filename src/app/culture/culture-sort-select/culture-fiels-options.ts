import {WsCultureSortField} from '@charlyghislain/plancul-api';
import {UntranslatedSelectItem} from '../../main/service/util/untranslated-select-item';
import {MessageKeys} from '../../main/service/util/message-keys';

export const CULTURE_SORT_OPTIONS: UntranslatedSelectItem[] = [
  {
    label_key: MessageKeys.CROP_PLANT_LABEL,
    value: WsCultureSortField.CROP_PLANT_NAME,
  },
  {
    label_key: MessageKeys.CROP_PRODUCT_LABEL,
    value: WsCultureSortField.CROP_PRODUCT_NAME,
  },
  {
    label_key: MessageKeys.CULTIVAR_LABEL,
    value: WsCultureSortField.CROP_CULTIVAR,
  },
  {
    label_key: MessageKeys.BED_LABEL,
    value: WsCultureSortField.BED_NAME,
  },
  {
    label_key: MessageKeys.SOWING_DATE_LABEL,
    value: WsCultureSortField.SOWING_DATE,
  },
  {
    label_key: MessageKeys.GERMINATION_DATE_LABEL,
    value: WsCultureSortField.GERMINATION_DATE,
  },
  {
    label_key: MessageKeys.FIRST_HARVEST_LABEL,
    value: WsCultureSortField.FIRST_HARVEST_DATE,
  },
  {
    label_key: MessageKeys.LAST_HARVEST_LABEL,
    value: WsCultureSortField.LAST_HARVEST_DATE,
  },
  {
    label_key: MessageKeys.BED_OCCUPANCY_START_DATE_LABEL,
    value: WsCultureSortField.BED_OCCUPANCY_START_DATE,
  },
  {
    label_key: MessageKeys.HTML_NOTES_LABEL,
    value: WsCultureSortField.HTML_NOTES,
  },
  {
    label_key: MessageKeys.NURSERING_DURATION_LABEL,
    value: WsCultureSortField.NURSERING_DURATION,
  },
  {
    label_key: MessageKeys.NURSERING_START_DATE_LABEL,
    value: WsCultureSortField.NURSERING_START_DATE,
  },
  {
    label_key: MessageKeys.CULTURE_PREPARATION_DURATION_LABEL,
    value: WsCultureSortField.CULTURE_PREPARATION_DURATION,
  },
  {
    label_key: MessageKeys.CULTURE_PREPARATION_START_DATE_LABEL,
    value: WsCultureSortField.CULTURE_PREPARATION_START_DATE,
  },
];
