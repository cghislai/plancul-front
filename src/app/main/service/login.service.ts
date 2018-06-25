import {Injectable} from '@angular/core';
import {RequestService} from './request.service';
import {BasicCredential} from '../domain/basic-credential';
import {Observable} from 'rxjs';
import {mapTo, tap} from 'rxjs/operators';
import {CredentialProviderService} from './credential-provider.service';
import {JwtCrential} from '../domain/jwt-crential';
import {WsUserAccountInitRequest} from '@charlyghislain/plancul-ws-api';
import {cr} from '@angular/core/src/render3';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  constructor(private requestService: RequestService,
              private credentialProvider: CredentialProviderService) {
  }

  login(credential: BasicCredential): Observable<any> {
    return this.requestService.sendLoginRequest(credential)
      .pipe(
        tap(token => this.credentialProvider.setCredential(new JwtCrential(token))),
        mapTo(true),
      );
  }

  activateAccount(request: WsUserAccountInitRequest): Observable<any> {
    return this.requestService.postPlainText('/unrestricted/user/init', request)
      .pipe(
        tap(token => this.credentialProvider.setCredential(new JwtCrential(token))),
        mapTo(true),
      );
  }


  isInvalidCredentialError(error: any) {
    return this.requestService.isHttpErrorWithStatusCodeStartingWith(error, 401);
  }

}
