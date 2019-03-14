import {Injectable} from '@angular/core';
import {WsCulture, WsRef, WsTenant} from '@charlyghislain/plancul-api';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable, throwError} from 'rxjs';
import {CultureClientService} from '../../main/service/culture-client.service';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {filter, map, mergeMap, take} from 'rxjs/operators';
import {LocalizationService} from '../../main/service/localization.service';
import {ErrorKeys} from '../../main/service/util/error-keys';
import {CultureService} from '../../main/service/culture.service';

@Injectable({
  providedIn: 'root',
})
export class CultureResolver implements Resolve<WsCulture> {

  constructor(private cultureClient: CultureClientService,
              private cultureService: CultureService,
              private localizationService: LocalizationService,
              private tenantSelectionService: SelectedTenantService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WsCulture> | Promise<WsCulture> | WsCulture {
    const idParam = route.paramMap.get('id');
    if (idParam == null) {
      return this.localizationService.getTranslation(ErrorKeys.INVALID_ID).pipe(
        mergeMap(msg => throwError(new Error(msg))),
      );
    }
    if (idParam === 'new') {
      return this.createNewCulture();
    }
    const idIntParam = parseInt(idParam, 10);
    if (isNaN(idIntParam)) {
      return this.localizationService.getTranslation(ErrorKeys.INVALID_ID).pipe(
        mergeMap(msg => throwError(new Error(msg))),
      );
    }
    return this.cultureClient.fetchCulture(idIntParam);
  }

  private createNewCulture(): Observable<WsCulture> {
    return this.tenantSelectionService.getSelectedTenantRef()
      .pipe(
        filter(ref => ref != null),
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
      daysUntilGermination: 1,
      daysUntilFirstHarvest: 2,
      harvestDaysDuration: 1,
      seedSurfaceQuantity: 0,
      harvestSurfaceQuantity: 0,
      htmlNotes: null,
      cultureNursing: null,
      bedPreparation: null,

      germinationDate: null,
      firstHarvestDate: null,
      lastHarvestDate: null,
      bedOccupancyStartDate: null,
      bedOccupancyEndDate: null,
    };
    return culture;
  }
}
