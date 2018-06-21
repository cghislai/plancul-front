import {Injectable} from '@angular/core';
import {WsCulture, WsCultureFilter, WsRef, WsSearchResult} from '@charlyghislain/plancul-ws-api';
import {Observable, of} from 'rxjs';
import {RequestService} from '../../main/service/request.service';
import {Pagination} from '../../main/domain/pagination';
import {IdResourceCache} from './util/id-resource-cache';
import {RequestCache} from './util/request-cache';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CultureClientService {

  private cache = new IdResourceCache<WsCulture>();
  private requestCache = new RequestCache<WsCulture>();

  constructor(private requestService: RequestService) {
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

  saveCulture(culture: WsCulture): Observable<WsRef<WsCulture>> {
    if (culture.id == null) {
      return this.createCulture(culture);
    } else {
      return this.updateCulture(culture);
    }
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