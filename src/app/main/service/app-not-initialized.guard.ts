import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {ApplicationStatusClientService} from './application-status-client.service';

@Injectable({
  providedIn: 'root',
})
export class AppNotInitializedGuard implements CanActivate {

  constructor(private applicationStatusClientService: ApplicationStatusClientService,
              private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.applicationStatusClientService.isAdminAccountInitialized()
      .pipe(
        map(initialized => !initialized),
        tap(authorized => this.handleAdminAccountInitialized(authorized, state)),
      );
  }

  private handleAdminAccountInitialized(authorized: boolean, state: RouterStateSnapshot) {
    if (!authorized) {
      this.router.navigate(['/login']);
    }
  }
}
