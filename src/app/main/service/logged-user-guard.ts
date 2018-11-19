import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {combineLatest, Observable} from 'rxjs';
import {LoggedUserService} from './logged-user.service';
import {filter, map, take} from 'rxjs/operators';
import {WsApplicationGroups} from '@charlyghislain/plancul-api';
import {WsUser} from '@charlyghislain/authenticator-api';

@Injectable({
  providedIn: 'root',
})
export class LoggedUserGuard implements CanActivate {

  constructor(private loggedUserService: LoggedUserService,
              private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const isUserWithTenant = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.TENANT_USER);
    const isRegisteredUser = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.REGISTERED_USER);
    const isUnRegisteredUser = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.UNREGISTERED_USER);
    const authenticatorUser = this.loggedUserService.getAuthenticatorUserObservable();
    return combineLatest(authenticatorUser, isUserWithTenant, isRegisteredUser, isUnRegisteredUser)
      .pipe(
        take(1),
        map(results => this.handleAuthorization(results[0], results[1], results[2], results[3], state)),
      );
  }

  private handleAuthorization(authenticatorUser: WsUser, userWithTenant: boolean, registeredUser: boolean, unregisteredUser: boolean, state: RouterStateSnapshot): boolean {
    if (authenticatorUser == null) {
      this.router.navigate(['/login']);
      return false;
    }
    if (!authenticatorUser.active) {
      this.router.navigate(['/activate-account']);
      return false;
    }
    if (userWithTenant) {
      return true;
    }
    if (registeredUser) {
      this.router.navigate(['/tenant/new']);
      return false;
    }
    if (unregisteredUser) {
      this.router.navigate(['/register']);
      return false;
    }
    this.router.navigate(['/login']);
    return false;

  }
}
