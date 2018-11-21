import {Injectable} from '@angular/core';
import {WsCrop} from '@charlyghislain/plancul-api';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable, of, throwError} from 'rxjs';
import {CropClientService} from '../../main/service/crop-client.service';
import {LocalizationService} from '../../main/service/localization.service';
import {ErrorKeys} from '../../main/service/util/error-keys';
import {mergeMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CropResolver implements Resolve<WsCrop> {

  constructor(private cropClient: CropClientService,
              private localizationService: LocalizationService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WsCrop> | Promise<WsCrop> | WsCrop {
    const idParam = route.paramMap.get('id');
    if (idParam == null) {
      return this.localizationService.getTranslation(ErrorKeys.INVALID_ID).pipe(
        mergeMap(msg => throwError(new Error(msg))),
      );
    }
    if (idParam === 'new') {
      return this.createNewCrop();
    }
    const idIntParam = parseInt(idParam, 10);
    if (isNaN(idIntParam)) {
      return this.localizationService.getTranslation(ErrorKeys.INVALID_ID).pipe(
        mergeMap(msg => throwError(new Error(msg))),
      );
    }
    return this.cropClient.fetchCrop(idIntParam);
  }

  private createNewCrop(): Observable<WsCrop> {
    const crop: WsCrop = {
      id: null,
      displayName: null,
      family: null,
      species: null,
      subSpecies: null,
      cultivar: null,
      agrovocPlantWsRef: null,
      agrovocProductWsRef: null,
      tenantRestriction: null,
    };
    return of(crop);
  }
}
