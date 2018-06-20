import {Injectable} from '@angular/core';
import {Observable, of, Subscription, timer} from 'rxjs';
import {CredentialProviderService} from './credential-provider.service';
import {RequestService} from './request.service';
import {exhaustMap, filter, map, mergeMap, publishReplay, refCount} from 'rxjs/operators';
import {WsUser} from '@charlyghislain/plancul-ws-api';
import {JosePayload} from '../domain/jose-payload';
import {JwtCrential} from '../domain/jwt-crential';
import {LocalStorageService} from './local-storage.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoggedUserService {

  private readonly josePayload: Observable<JosePayload | null>;
  private readonly groups: Observable<string[]>;
  private readonly isAdmin: Observable<boolean>;
  private readonly isUser: Observable<boolean>;
  private readonly user: Observable<WsUser | null>;

  private subscription: Subscription;
  private nextRenewalSubscription: Subscription;
  private lasUerLogin: string;

  constructor(private credentialService: CredentialProviderService,
              private credentialProvider: CredentialProviderService,
              private localStorageService: LocalStorageService,
              private router: Router,
              private requestService: RequestService) {
    const credentialSource = this.credentialService.getCredentialObservable();
    this.josePayload = credentialSource
      .pipe(
        map(cred => cred == null ? null : cred.getToken()),
        map(token => this.decodeJwtPayload(token)),
        publishReplay(1), refCount(),
      );

    this.groups = this.josePayload.pipe(
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
      exhaustMap(credential => credential == null ? of(null) : this.requestService.get<WsUser>('/user/me')),
      publishReplay(1), refCount(),
    );

    this.subscription = new Subscription();
    const newPayloadSubscription = this.josePayload
      .pipe(filter(p => p != null))
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

  getJosePayloadObservable(): Observable<JosePayload | null> {
    return this.josePayload;
  }

  checkPasswordExpired(): Observable<boolean> {
    return this.requestService.get('/user/me/password/expired');
  }

  logout() {
    this.localStorageService.clearAuthToken();
    this.credentialProvider.setCredential(null);
    this.router.navigate(['/login']);
  }

  private decodeJwtPayload(token: string | null): JosePayload | null {
    if (token == null) {
      return null;
    }
    const joseParts = token.split('.');
    const encodedPayload = joseParts[1];
    const payloadJson = atob(encodedPayload);
    const payload: JosePayload = JSON.parse(payloadJson);

    return payload;
  }

  private onNewPayloadReceived(payload: JosePayload) {
    this.watchTokenExpiration(payload);
  }

  private watchTokenExpiration(payload: JosePayload) {
    if (this.nextRenewalSubscription != null) {
      this.nextRenewalSubscription.unsubscribe();
    }
    const expiryTimeUnix = payload.exp;
    const thirtySeconds = 30000;
    const expiryDate = new Date(expiryTimeUnix - thirtySeconds);
    this.nextRenewalSubscription = timer(expiryDate)
      .pipe(
        mergeMap(() => this.requestService.get('/user/me/token')),
      )
      .subscribe(newToken => this.credentialProvider.setCredential(new JwtCrential(newToken)),
        error => this.router.navigate(['/login']));
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
    const payload = this.decodeJwtPayload(token);
    this.lasUerLogin = payload.sub;

    const jwtCredential = new JwtCrential(token);
    this.requestService.getPlainText('/user/me/token', jwtCredential)
      .subscribe(newToken => this.credentialProvider.setCredential(new JwtCrential(newToken)));
  }
}
