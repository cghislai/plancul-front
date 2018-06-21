import {Injectable} from '@angular/core';
import {WsCulture, WsRef, WsTenant} from '@charlyghislain/plancul-ws-api';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable, throwError} from 'rxjs';
import {CultureClientService} from '../../main/service/culture-client.service';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {map, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CultureResolver implements Resolve<WsCulture> {

  constructor(private cultureClient: CultureClientService,
              private tenantSelectionService: SelectedTenantService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WsCulture> | Promise<WsCulture> | WsCulture {
    const idParam = route.paramMap.get('id');
    if (idParam == null) {
      return throwError('invalid id');
    }
    if (idParam === 'new') {
      return this.createNewCulture();
    }
    const idIntParam = parseInt(idParam, 10);
    if (isNaN(idIntParam)) {
      return throwError('invalid id');
    }
    return this.cultureClient.fetchCulture(idIntParam);
  }

  private createNewCulture(): Observable<WsCulture> {
    return this.tenantSelectionService.getSelectedTenantRef()
      .pipe(
        take(1),
        map(tenantRef => this.createNewCultureWithData(tenantRef)),
      );
  }

  private createNewCultureWithData(tenantRef: WsRef<WsTenant>): WsCulture {
    const culture: WsCulture = {
      id: null,
      tenantWsRef: tenantRef,
      cropWsRef: null,
      bedWsRef: null,
      sowingDate: null,
      germinationDate: null,
      firstHarvestDate: null,
      lastHarvestDate: null,
      bedOccupancyStartDate: null,
      bedOccupancyEndDate: null,
      htmlNotes: '',
      cultureNursing: null,
      bedPreparation: null,
    };
    return culture;
  }
}
