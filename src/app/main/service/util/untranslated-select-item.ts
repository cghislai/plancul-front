import {SelectItem} from 'primeng/api';

export interface UntranslatedSelectItem extends SelectItem {
  label_key: string;
  value: any;
}
