import {Injectable} from '@angular/core';
import {
  WsCulture,
  WsCultureFilter,
  WsCulturePhase,
  WsCulturePhaseType,
  WsDateRange,
  WsRef,
  WsSearchResult,
} from '@charlyghislain/plancul-ws-api';
import {Observable, of} from 'rxjs';
import {RequestService} from './request.service';
import {Pagination} from '../domain/pagination';
import {IdResourceCache} from './util/id-resource-cache';
import {RequestCache} from './util/request-cache';
import {map, switchMap, tap} from 'rxjs/operators';
import {CropClientService} from './crop-client.service';

@Injectable({
  providedIn: 'root',
})
export class CultureClientService {

  private cache = new IdResourceCache<WsCulture>();
  private requestCache = new RequestCache<WsCulture>();

  constructor(private requestService: RequestService,
              private cropService: CropClientService) {
  }


  searchCultures(filter: WsCultureFilter, pagination: Pagination): Observable<WsSearchResult<WsCulture>> {
    return this.requestService.post<WsSearchResult<WsCulture>>('/culture/search', filter, pagination);
  }

  fetchCulture(id: number): Observable<WsCulture> {
    const fetchTask = this.requestService.get<WsCulture>(`/culture/${id}`)
      .pipe(tap(e => this.cache.putInCache(e)));
    const cachedTask = this.requestCache.shareInCache(id, fetchTask);
    return cachedTask;
  }

  getCulture(id: number): Observable<WsCulture> {
    const cachedCulture = this.cache.getFromCache(id);
    if (cachedCulture != null) {
      return of(cachedCulture);
    }
    const cachedRequest = this.requestCache.getFromCache(id);
    if (cachedRequest != null) {
      return cachedRequest;
    }
    return this.fetchCulture(id);
  }

  updateCulturePhase(id: number, phase: WsCulturePhaseType, dateRange: WsDateRange): Observable<WsRef<WsCulture>> {
    return this.requestService.put<WsRef<WsCulture>>(`/culture/${id}/${phase}`, dateRange)
      .pipe(tap(() => this.clearCachedCulture(id)));
  }

  getCulturePhases(id: number): Observable<WsCulturePhase[]> {
    return this.requestService.get<WsCulturePhase[]>(`/culture/${id}/phases`);
  }

  saveCulture(culture: WsCulture): Observable<WsRef<WsCulture>> {
    if (culture.id == null) {
      return this.createCulture(culture);
    } else {
      return this.updateCulture(culture);
    }
  }

  getCultureLabel(id: number): Observable<string> {
    return this.getCulture(id).pipe(
      map(culture => culture.cropWsRef.id),
      switchMap(cropId => this.cropService.getCropLabel(cropId)),
    );
  }

  validateCulture(culture: WsCulture): Observable<WsCulture> {
    return this.requestService.put<WsCulture>(`/culture/validate`, culture);
  }

  createCulture(culture: WsCulture): Observable<WsRef<WsCulture>> {
    return this.requestService.post<WsRef<WsCulture>>(`/culture`, culture);
  }

  updateCulture(culture: WsCulture): Observable<WsRef<WsCulture>> {
    return this.requestService.put<WsRef<WsCulture>>(`/culture/${culture.id}`, culture)
      .pipe(tap(ref => this.clearCachedCulture(ref.id)));
  }

  deleteCulture(culture: WsCulture): Observable<any> {
    return this.requestService.delete(`/culture/${culture.id}`)
      .pipe(tap(() => this.clearCachedCulture(culture.id)));
  }

  clearCachedCulture(id: number) {
    this.cache.removeFromCache(id);
    this.requestCache.clear(id);
  }

}
