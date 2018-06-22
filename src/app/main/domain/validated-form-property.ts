import {WsContraintViolation} from '@charlyghislain/plancul-ws-api';


export interface ValidatedFormProperty<E, K extends keyof E> {
  property: K;
  propertyValue: E[K];
  validationErrors: string[];
  childrenViolations: WsContraintViolation[];
}
