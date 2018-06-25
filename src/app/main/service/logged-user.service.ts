import {Injectable} from '@angular/core';
import {Observable, of, Subscription, timer} from 'rxjs';
import {CredentialProviderService} from './credential-provider.service';
import {RequestService} from './request.service';
import {filter, map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {WsTenantUserRole, WsUser} from '@charlyghislain/plancul-ws-api';
import {JosePayload} from '../domain/jose-payload';
import {JwtCrential} from '../domain/jwt-crential';
import {LocalStorageService} from './local-storage.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoggedUserService {

  private readonly groups: Observable<string[]>;
  private readonly isAdmin: Observable<boolean>;
  private readonly isUser: Observable<boolean>;
  private readonly user: Observable<WsUser | null>;
  private readonly tenantsRoles: Observable<WsTenantUserRole[]>;

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
      map(p => (p == null || p.grps == null) ? [] : p.grps),
      publishReplay(1), refCount(),
    );
    this.isAdmin = this.groups.pipe(
      map(grps => grps.find(grp => grp === 'ADMIN') != null),
      publishReplay(1), refCount(),
    );
    this.isUser = this.groups.pipe(
      map(grps => grps.find(grp => grp === 'USER') != null),
      publishReplay(1), refCount(),
    );
    this.user = credentialSource.pipe(
      switchMap(credential => credential == null ? of(null) : this.requestService.get<WsUser>('/user/me')),
      publishReplay(1), refCount(),
    );
    this.tenantsRoles = credentialSource.pipe(
      switchMap(credential => credential == null ? of([]) : this.requestService.get<WsTenantUserRole[]>('/user/me/tenants')),
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

  getIsAdminObservable(): Observable<boolean> {
    return this.isAdmin;
  }

  getIsUserObservable(): Observable<boolean> {
    return this.isUser;
  }

  getUserObservable(): Observable<WsUser | null> {
    return this.user;
  }

  getTenantRolesObservable(): Observable<WsTenantUserRole[]> {
    return this.tenantsRoles;
  }


  checkPasswordExpired(): Observable<boolean> {
    return this.requestService.get('/user/me/password/expired');
  }

  logout() {
    this.localStorageService.clearAuthToken();
    this.credentialProvider.setCredential(null);
    this.router.navigate(['/login']);
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
    this.requestService.getPlainText('/user/me/token', jwtCredential)
      .subscribe(newToken => this.credentialProvider.setCredential(new JwtCrential(newToken)));
  }

}
