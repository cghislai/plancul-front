import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {LoggedUserService} from './logged-user.service';
import {map, take} from 'rxjs/operators';

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
    const isAdmin = this.loggedUserService.getIsAdminObservable()
      .pipe(take(1));
    const isUser = this.loggedUserService.getIsUserObservable()
      .pipe(take(1));

    return forkJoin(isAdmin, isUser)
      .pipe(
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
    this.router.navigate(['/login', {
      redirect: nextUrl,
    }]);
  }
}
