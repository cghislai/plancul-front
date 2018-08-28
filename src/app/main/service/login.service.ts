import {Injectable} from '@angular/core';
import {RequestService} from './request.service';
import {forkJoin, Observable} from 'rxjs';
import {filter, map, mergeMap, take, tap} from 'rxjs/operators';
import {CredentialProviderService} from './credential-provider.service';
import {JwtCrential} from '../domain/jwt-crential';
import {LoggedUserService} from './logged-user.service';
import {AuthenticatorGroups} from './util/authenticator-groups';
import {Credential} from '../domain/credential';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  constructor(private requestService: RequestService,
              private loggedUserService: LoggedUserService,
              private credentialProvider: CredentialProviderService) {
  }

  login(credential: Credential): Observable<any> {
    this.credentialProvider.setCredential(null);
    return this.requestService.sendLoginRequest(credential)
      .pipe(
        mergeMap(token => this.waitForLoginCompletion(token)),
        map(() => true),
      );
  }

  relogin() {
    const credential = this.credentialProvider.getCredential();
    return this.login(credential);
  }

  isInvalidCredentialError(error: any) {
    return this.requestService.isHttpErrorWithStatusCodeStartingWith(error, 401);
  }

  private waitForLoginCompletion(token) {
    this.credentialProvider.setCredential(new JwtCrential(token));
    const planculUser = this.loggedUserService.getUserObservable().pipe(
      filter(v => v !== undefined), take(1),
    );
    const authenticatorUser = this.loggedUserService.getAuthenticatorUserObservable().pipe(
      filter(v => v !== undefined), take(1),
    );
    const tenants = this.loggedUserService.getTenantRolesObservable().pipe(
      filter(v => v !== undefined), take(1),
    );
    const userGroup = this.loggedUserService.getIsInGroupsObservable(AuthenticatorGroups.USER).pipe(
      filter(v => v !== undefined), take(1),
    );
    return forkJoin(planculUser, authenticatorUser, tenants, userGroup)
      .pipe(tap(r => console.log(r)));
  }

}
