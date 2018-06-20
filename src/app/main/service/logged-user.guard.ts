import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {LoggedUserService} from './logged-user.service';
import {take, tap} from 'rxjs/operators';

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
    return this.loggedUserService.getIsUserObservable()
      .pipe(
        take(1),
        tap(authorized => this.handleAuthorization(authorized, next)),
      );
  }

  private handleAuthorization(authorized: boolean, next: ActivatedRouteSnapshot) {
    if (!authorized) {
      const nextUrl = next.url;
      this.router.navigate(['/login', {
        redirect: nextUrl,
      }]);
    }
  }
}
