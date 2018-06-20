import {Injectable} from '@angular/core';
import {Credential} from '../domain/credential';
import {BehaviorSubject, Observable} from 'rxjs';
import {JwtCrential} from '../domain/jwt-crential';

@Injectable({
  providedIn: 'root',
})
export class CredentialProviderService {

  private readonly credentialSource = new BehaviorSubject<JwtCrential>(null);

  constructor() {
  }

  getCredential(): Credential | null {
    return this.credentialSource.getValue();
  }

  getCredentialObservable(): Observable<JwtCrential> {
    return this.credentialSource.asObservable();
  }

  setCredential(credential: JwtCrential) {
    this.credentialSource.next(credential);
  }
}
