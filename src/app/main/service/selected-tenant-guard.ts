import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SelectedTenantService} from './selected-tenant.service';
import {WsRef, WsTenant} from '@charlyghislain/plancul-api';

@Injectable({
  providedIn: 'root',
})
export class SelectedTenantGuard implements CanActivate {

  constructor(private selectedTenantService: SelectedTenantService,
              private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.selectedTenantService.getSelectedTenantRef()
      .pipe(
        map(tenantRef => this.handleAuthorization(tenantRef)),
      );
  }

  private handleAuthorization(tenanRef: WsRef<WsTenant>): boolean {
    if (tenanRef == null) {
      this.router.navigate(['/welcome']);
      return false;
    }
    return true;
  }
}
