import {Injectable} from '@angular/core';
import {RequestService} from './request.service';
import {BasicCredential} from '../domain/basic-credential';
import {forkJoin, Observable} from 'rxjs';
import {filter, map, mergeMap, take} from 'rxjs/operators';
import {CredentialProviderService} from './credential-provider.service';
import {JwtCrential} from '../domain/jwt-crential';
import {WsUser, WsUserRegistration} from '@charlyghislain/plancul-api';
import {LoggedUserService} from './logged-user.service';
import {AuthenticatorGroups} from './util/authenticator-groups';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  constructor(private requestService: RequestService,
              private loggedUserService: LoggedUserService,
              private credentialProvider: CredentialProviderService) {
  }

  login(credential: BasicCredential): Observable<any> {
    this.credentialProvider.setCredential(null);
    return this.requestService.sendLoginRequest(credential)
      .pipe(
        mergeMap(token => this.waitForLoginCompletion(token)),
        map(() => true),
      );
  }

  createNewUser(registration: WsUserRegistration): Observable<WsUser> {
    const url = this.requestService.buildPlanCulApiUrl('/user/new');
    return this.requestService.post(url, registration);
  }

  registerUser(registration: WsUserRegistration): Observable<WsUser> {
    const url = this.requestService.buildPlanCulApiUrl('/user/register');
    return this.requestService.post(url, registration);
  }

  isInvalidCredentialError(error: any) {
    return this.requestService.isHttpErrorWithStatusCodeStartingWith(error, 401);
  }

  private waitForLoginCompletion(token) {
    this.credentialProvider.setCredential(new JwtCrential(token));
    const planculUser = this.loggedUserService.getUserObservable().pipe(
      filter(user => user != null), take(1),
    );
    const authenticatorUser = this.loggedUserService.getAuthenticatorUserObservable().pipe(
      filter(user => user != null), take(1),
    );
    const tenants = this.loggedUserService.getTenantRolesObservable().pipe(
      filter(roles => roles != null), take(1),
    );
    const userGroup = this.loggedUserService.getIsInGroupsObservable(AuthenticatorGroups.USER).pipe(
      filter(roles => roles != null), take(1),
    );
    return forkJoin(planculUser, authenticatorUser, tenants, userGroup);
  }

}
