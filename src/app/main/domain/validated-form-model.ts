import {WsDomainEntity} from '@charlyghislain/plancul-api';
import {ValidatedFormProperty} from './validated-form-property';

export interface ValidatedFormModel<E = WsDomainEntity> {
  value: E;
  properties: { [K in keyof E]: ValidatedFormProperty<E, K> };
  unboundErrors: string[];
  valid: boolean;

  validationInProgress: boolean;
}
