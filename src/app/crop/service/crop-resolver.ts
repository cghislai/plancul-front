import {Injectable} from '@angular/core';
import {WsCrop} from '@charlyghislain/plancul-api';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable, of, throwError} from 'rxjs';
import {CropClientService} from '../../main/service/crop-client.service';

@Injectable({
  providedIn: 'root',
})
export class CropResolver implements Resolve<WsCrop> {

  constructor(private cropClient: CropClientService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WsCrop> | Promise<WsCrop> | WsCrop {
    const idParam = route.paramMap.get('id');
    if (idParam == null) {
      return throwError('invalid id');
    }
    if (idParam === 'new') {
      return this.createNewCrop();
    }
    const idIntParam = parseInt(idParam, 10);
    if (isNaN(idIntParam)) {
      return throwError('invalid id');
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
