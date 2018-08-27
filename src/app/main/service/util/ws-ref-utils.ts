import {WsRef} from '@charlyghislain/plancul-api';

export class WsRefUtils {
  static isSameRef(refA: WsRef<any> | null, refB: WsRef<any> | null): boolean {
    if (refA == null) {
      return refB == null;
    }
    if (refB == null) {
      return false;
    }
    return refA.id === refB.id;
  }
}
