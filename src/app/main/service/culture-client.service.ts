import {Injectable} from '@angular/core';
import {
  WsCulture,
  WsCultureFilter,
  WsCulturePhase,
  WsCulturePhaseType,
  WsDateRange,
  WsRef,
  WsSearchResult,
} from '@charlyghislain/plancul-api';
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
    const url = this.requestService.buildPlanCulApiUrl('/culture/search');
    return this.requestService.post<WsSearchResult<WsCulture>>(url, filter, pagination);
  }

  fetchCulture(id: number): Observable<WsCulture> {
    const url = this.requestService.buildPlanCulApiUrl(`/culture/${id}`);
    const fetchTask = this.requestService.get<WsCulture>(url)
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
    const url = this.requestService.buildPlanCulApiUrl(`/culture/${id}/${phase}`);
    return this.requestService.put<WsRef<WsCulture>>(url, dateRange)
      .pipe(tap(() => this.clearCachedCulture(id)));
  }

  getCulturePhases(id: number): Observable<WsCulturePhase[]> {
    const url = this.requestService.buildPlanCulApiUrl(`/culture/${id}/phases`);
    return this.requestService.get<WsCulturePhase[]>(url);
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
    const url = this.requestService.buildPlanCulApiUrl(`/culture/validate`);
    return this.requestService.put<WsCulture>(url, culture);
  }

  createCulture(culture: WsCulture): Observable<WsRef<WsCulture>> {
    const url = this.requestService.buildPlanCulApiUrl('/culture');
    return this.requestService.post<WsRef<WsCulture>>(url, culture);
  }

  updateCulture(culture: WsCulture): Observable<WsRef<WsCulture>> {
    const url = this.requestService.buildPlanCulApiUrl(`/culture/${culture.id}`);
    return this.requestService.put<WsRef<WsCulture>>(url, culture)
      .pipe(tap(ref => this.clearCachedCulture(ref.id)));
  }

  deleteCulture(culture: WsCulture): Observable<any> {
    const url = this.requestService.buildPlanCulApiUrl(`/culture/${culture.id}`);
    return this.requestService.delete(url)
      .pipe(tap(() => this.clearCachedCulture(culture.id)));
  }

  clearCachedCulture(id: number) {
    this.cache.removeFromCache(id);
    this.requestCache.clear(id);
  }

}
