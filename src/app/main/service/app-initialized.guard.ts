import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ApplicationStatusClientService} from './application-status-client.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializedGuard implements CanActivate {

  constructor(private applicationStatusClientService: ApplicationStatusClientService,
              private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.applicationStatusClientService.isAdminAccountInitialized()
      .pipe(
        tap(authorized => this.handleAdminAccountInitialized(authorized, state)),
      );
  }

  private handleAdminAccountInitialized(authorized: boolean, state: RouterStateSnapshot) {
    if (!authorized) {
      this.router.navigate(['/init']);
    }
  }
}
