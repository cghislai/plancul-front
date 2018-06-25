import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {JwtCrential} from '../domain/jwt-crential';
import {JosePayload} from '../domain/jose-payload';
import {map, publishReplay, refCount} from 'rxjs/operators';
import moment from 'moment-es6';

@Injectable({
  providedIn: 'root',
})
export class CredentialProviderService {

  private readonly credentialSource = new BehaviorSubject<JwtCrential>(null);

  private josePayload: Observable<JosePayload | null>;

  constructor() {
    this.josePayload = this.credentialSource
      .pipe(
        map(cred => cred == null ? null : cred.getToken()),
        map(token => this.decodeJwtPayload(token)),
        publishReplay(1), refCount(),
      );


  }

  getCredential(): JwtCrential | null {
    return this.credentialSource.getValue();
  }

  getCredentialObservable(): Observable<JwtCrential | null> {
    return this.credentialSource.asObservable();
  }

  setCredential(credential: JwtCrential | null) {
    this.credentialSource.next(credential);
  }

  getJosePayloadObservable(): Observable<JosePayload | null> {
    return this.josePayload;
  }

  decodeJwtPayload(token: string | null): JosePayload | null {
    if (token == null) {
      return null;
    }
    const joseParts = token.split('.');
    const encodedPayload = joseParts[1];
    const payloadJson = atob(encodedPayload);
    const payload: JosePayload = JSON.parse(payloadJson);

    return payload;
  }

  isJosePayloadValid(payload: JosePayload | null): boolean {
    if (payload == null) {
      return true;
    }
    const expiryTimeUnix = payload.exp * 1000;
    const expiryMoment = moment(expiryTimeUnix);
    return expiryMoment.isAfter(moment());
  }
}
