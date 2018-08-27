import {Injectable} from '@angular/core';
import {WsBed, WsPlot, WsRef} from '@charlyghislain/plancul-api';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable, throwError} from 'rxjs';
import {BedClientService} from '../../main/service/bed-client.service';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {map, publishReplay, refCount, take, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BedResolver implements Resolve<WsBed> {

  constructor(private bedClient: BedClientService,
              private tenantSelectionService: SelectedTenantService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WsBed> | Promise<WsBed> | WsBed {
    const idParam = route.paramMap.get('id');
    if (idParam == null) {
      return throwError('invalid id');
    }
    if (idParam === 'new') {
      return this.createNewBed();
    }
    const idIntParam = parseInt(idParam, 10);
    if (isNaN(idIntParam)) {
      return throwError('invalid id');
    }
    return this.bedClient.fetchBed(idIntParam);
  }

  private createNewBed(): Observable<WsBed> {
    return this.tenantSelectionService.getDefaultPlotRef()
      .pipe(
        take(1),
        map(plotRef => this.createNewBedWithData(plotRef)),
      );
  }

  private createNewBedWithData(plotRef: WsRef<WsPlot>): WsBed {
    const bed: WsBed = {
      id: null,
      name: null,
      patch: null,
      plotWsRef: plotRef,
    };
    return bed;
  }
}
