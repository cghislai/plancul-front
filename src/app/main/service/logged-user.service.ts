import {Injectable} from '@angular/core';
import {Observable, of, Subscription, timer} from 'rxjs';
import {CredentialProviderService} from './credential-provider.service';
import {RequestService} from './request.service';
import {catchError, filter, map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {WsApplicationGroups, WsTenantUserRole, WsUser} from '@charlyghislain/plancul-api';
import {WsUser as WsAuthenticatorUser} from '@charlyghislain/authenticator-api';
import {JosePayload} from '../domain/jose-payload';
import {JwtCrential} from '../domain/jwt-crential';
import {LocalStorageService} from './local-storage.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoggedUserService {

  private readonly groups: Observable<string[]>;
  private readonly user: Observable<WsUser | null>;
  private readonly authenticatorUser: Observable<WsAuthenticatorUser | null>;
  private readonly tenantsRoles: Observable<WsTenantUserRole[] | null>;

  private subscription: Subscription;
  private nextRenewalSubscription: Subscription;
  private lasUerLogin: string;

  constructor(private credentialService: CredentialProviderService,
              private credentialProvider: CredentialProviderService,
              private localStorageService: LocalStorageService,
              private router: Router,
              private requestService: RequestService) {
    const credentialSource = this.credentialService.getCredentialObservable()
      .pipe(
        publishReplay(1), refCount(),
      );
    this.groups = this.credentialService.getJosePayloadObservable().pipe(
      map(p => (p == null || p.groups == null) ? [] : p.groups),
      publishReplay(1), refCount(),
    );

    this.user = credentialSource.pipe(
      switchMap(credential => credential == null ? of(undefined) : this.fetchLoggedUser()),
      publishReplay(1), refCount(),
    );

    this.authenticatorUser = credentialSource.pipe(
      switchMap(credential => credential == null ? of(undefined) : this.fetchAuthenticatorUser()),
      publishReplay(1), refCount(),
    );

    this.tenantsRoles = credentialSource.pipe(
      switchMap(credential => credential == null ? of(undefined) : this.fetchTenantRoles()),
      publishReplay(1), refCount(),
    );

    this.subscription = new Subscription();
    const newPayloadSubscription = this.credentialService.getJosePayloadObservable()
      .subscribe(p => this.onNewPayloadReceived(p));
    const newTokenSubscription = credentialSource
      .pipe(filter(cred => cred != null))
      .subscribe(credential => this.saveToken(credential));

    this.subscription.add(newPayloadSubscription);
    this.subscription.add(newTokenSubscription);

    this.restoreToken();
  }


  getLastUserLogin(): string | null {
    return this.lasUerLogin;
  }

  getIsInGroupsObservable(group: WsApplicationGroups | string): Observable<boolean> {
    return this.groups.pipe(
      map(groups => this.hasGroup(groups, group)),
      publishReplay(1), refCount(),
    );
  }

  getHasEitherGroupObservable(...groupsToCheck: WsApplicationGroups[]): Observable<boolean> {
    return this.groups.pipe(
      map(groups => this.hasEitherGroups(groups, groupsToCheck)),
      publishReplay(1), refCount(),
    );
  }

  getUserObservable(): Observable<WsUser | null> {
    return this.user;
  }

  getAuthenticatorUserObservable(): Observable<WsAuthenticatorUser | null> {
    return this.authenticatorUser;
  }

  getTenantRolesObservable(): Observable<WsTenantUserRole[]> {
    return this.tenantsRoles;
  }

  logout() {
    this.localStorageService.clearAuthToken();
    this.credentialProvider.setCredential(null);
    this.router.navigate(['/login']);
  }

  refreshToken() {
    return this.requestService.sendLoginRequest();
  }

  private fetchLoggedUser() {
    const loggedPlanculUserUrl = this.requestService.buildPlanCulApiUrl(`/user/me`);
    return this.requestService.get<WsUser>(loggedPlanculUserUrl)
      .pipe(catchError(e => of(null)));
  }

  private fetchAuthenticatorUser() {
    const loggedAuthenticatorUserUrl = this.requestService.builAuthenticatordApiUrl(`/me`);
    return this.requestService.get<WsAuthenticatorUser>(loggedAuthenticatorUserUrl)
      .pipe(catchError(e => of(null)));
  }

  private fetchTenantRoles() {
    const loggedPlanculUserTenantsUrl = this.requestService.buildPlanCulApiUrl(`/user/me/tenants`);
    return this.requestService.get<WsTenantUserRole[]>(loggedPlanculUserTenantsUrl)
      .pipe(catchError(e => of(null)));
  }


  private onNewPayloadReceived(payload: JosePayload | null) {
    this.watchTokenExpiration(payload);
  }

  private watchTokenExpiration(payload: JosePayload | null) {
    if (this.nextRenewalSubscription != null) {
      this.nextRenewalSubscription.unsubscribe();
    }
    if (payload == null) {
      return;
    }
    const expiryTimeUnix = payload.exp * 1000;
    const thirtySeconds = 30000;
    const expiryDate = new Date(expiryTimeUnix - thirtySeconds);
    this.nextRenewalSubscription = timer(expiryDate)
      .subscribe(timout => this.requestService.renewToken());
  }

  private saveToken(credential: JwtCrential) {
    const token = credential.getToken();
    this.localStorageService.putAuthToken(token);
  }

  private restoreToken() {
    const token = this.localStorageService.getAuthToken();
    if (token == null) {
      return;
    }
    const payload = this.credentialProvider.decodeJwtPayload(token);
    this.lasUerLogin = payload.sub;

    if (!this.credentialProvider.isJosePayloadValid(payload)) {
      return;
    }
    const jwtCredential = new JwtCrential(token);
    const url = this.requestService.getAuthenticatorTokenUrl();
    this.requestService.getPlainText(url, jwtCredential)
      .subscribe(newToken => this.credentialProvider.setCredential(new JwtCrential(newToken)));
  }

  private hasEitherGroups(groups: string[], groupsToCheck: WsApplicationGroups[]) {
    for (const group of groupsToCheck) {
      if (this.hasGroup(groups, group)) {
        return true;
      }
    }
    return false;
  }


  private hasGroup(groups, group: WsApplicationGroups | string) {
    return groups.find(grp => grp === group) != null;
  }

}
