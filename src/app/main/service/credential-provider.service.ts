import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {JwtCrential} from '../domain/jwt-crential';

@Injectable({
  providedIn: 'root',
})
export class CredentialProviderService {

  private readonly credentialSource = new BehaviorSubject<JwtCrential>(null);

  constructor() {
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
}
