import {SelectItem} from 'primeng/api';
import {WsCrop, WsRef} from '@charlyghislain/plancul-api';

export class CropSelectItem implements SelectItem {
  label?: string;
  value: WsRef<WsCrop>;
  styleClass?: string;
  icon?: string;
  title?: string;
  disabled?: boolean;

  createNewCropItem?: boolean;
  createNewCropQuery?: string;
}
