import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {LoggedUserService} from './logged-user.service';
import {first} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoggedAdminGuard implements CanActivate {

  constructor(private loggedUserService: LoggedUserService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.loggedUserService.getIsAdminObservable()
      .pipe(first());
  }
}
