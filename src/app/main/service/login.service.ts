import {Injectable} from '@angular/core';
import {RequestService} from './request.service';
import {BasicCredential} from '../domain/basic-credential';
import {Observable} from 'rxjs';
import {mapTo, tap} from 'rxjs/operators';
import {CredentialProviderService} from './credential-provider.service';
import {JwtCrential} from '../domain/jwt-crential';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  constructor(private requestService: RequestService,
              private credentialProvider: CredentialProviderService) {
  }

  login(credential: BasicCredential): Observable<any> {
    return this.requestService.getPlainText('/user/me/token', credential)
      .pipe(
        tap(token => this.credentialProvider.setCredential(new JwtCrential(token))),
        mapTo(true),
      );
  }

  isInvalidCredentialError(error: any) {
    return this.requestService.isHttpErrorWithStatusCodeStartingWith(error, 401);
  }

}
