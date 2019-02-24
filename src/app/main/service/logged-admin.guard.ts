import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {LoggedUserService} from './logged-user.service';
import {filter, map, take} from 'rxjs/operators';
import {WsApplicationGroups} from '@charlyghislain/plancul-api';

@Injectable({
  providedIn: 'root',
})
export class LoggedAdminGuard implements CanActivate {

  constructor(private loggedUserService: LoggedUserService,
              private router: Router) {
 }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const isAdmin = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.ADMIN);
    const isRegisteredUser = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.REGISTERED_USER);

    return combineLatest(isAdmin, isRegisteredUser)
      .pipe(
        take(1),
        map(results => this.checkAuthorization(results[0], results[1], next)),
      );
  }

  private checkAuthorization(admin: boolean, user: boolean, next: ActivatedRouteSnapshot): boolean {
    if (admin) {
      return true;
    }
    if (user) {
      this.router.navigate(['/welcome']);
      return false;
    }
    const nextUrl = next.url;
    console.log('a');
    this.router.navigate(['/login', {
      redirect: nextUrl,
    }]);
  }
}
