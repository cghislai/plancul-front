import {Injectable} from '@angular/core';
import {
  WsBedPreparation,
  WsCrop,
  WsCulture,
  WsCultureFilter, WsCultureNursing,
  WsCultureSortField,
  WsRef,
  WsSortOrder,
  WsTenant,
} from '@charlyghislain/plancul-api';
import {CultureClientService} from './culture-client.service';
import {Observable} from 'rxjs';
import {Pagination} from '../domain/pagination';
import {defaultIfEmpty, filter, map, switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CultureService {

  constructor(private clientService: CultureClientService) {
  }

  newCulture(tenantRef: WsRef<WsTenant>): WsCulture {
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

      seedTotalQuantity: null,
      harvestTotalQuantity: null,
    };
    return culture;
  }

  findLastCultureOverwritesForCrop(tenantRef: WsRef<WsTenant>, cropRef: WsRef<WsCrop>): Observable<Partial<WsCulture>> {
    return this.findLastCultureRefForCrop$(tenantRef, cropRef).pipe(
      filter(ref => ref != null),
      switchMap(ref => this.clientService.getCulture(ref.id)),
      map(c => this.createCultureOverwrites(c)),
    );
  }

  private createCultureOverwrites(c: WsCulture): Partial<WsCulture> {
    const overwrites = <Partial<WsCulture>>{
      seedSurfaceQuantity: c.seedSurfaceQuantity,
      harvestSurfaceQuantity: c.harvestSurfaceQuantity,
      daysUntilFirstHarvest: c.daysUntilFirstHarvest,
      daysUntilGermination: c.daysUntilGermination,
      harvestDaysDuration: c.harvestDaysDuration,
    };
    if (c.bedPreparation != null) {
      overwrites.bedPreparation = <WsBedPreparation>{
        dayDuration: c.bedPreparation.dayDuration,
        type: c.bedPreparation.type,
      };
    }
    if (c.cultureNursing != null) {
      overwrites.cultureNursing = <WsCultureNursing>{
        dayDuration: c.cultureNursing.dayDuration,
      };
    }
    return overwrites;
  }

  private findLastCultureRefForCrop$(tenantRef: WsRef<WsTenant>, cropRef: WsRef<WsCrop>): Observable<WsRef<WsCulture> | null> {
    const searchFilter: WsCultureFilter = {
      cropFilter: {
        exactCropWsRef: cropRef,
      },
      tenantWsRef: tenantRef,
    };
    const pagination: Pagination = {
      offset: 0,
      length: 1,
      sorts: [{
        field: WsCultureSortField.UPDATED,
        order: WsSortOrder.DESC,
      }],
    };
    return this.clientService.searchCultures(searchFilter, pagination).pipe(
      filter(r => r.count > 0),
      map(results => results.list),
      map(list => list[0]),
      defaultIfEmpty(null),
    );
  }

}
