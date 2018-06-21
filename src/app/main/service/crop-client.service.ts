import {Injectable} from '@angular/core';
import {WsCrop, WsCropCreationRequest, WsCropFilter, WsRef, WsSearchResult} from '@charlyghislain/plancul-ws-api';
import {Observable, of} from 'rxjs';
import {RequestService} from './request.service';
import {Pagination} from '../domain/pagination';
import {IdResourceCache} from './util/id-resource-cache';
import {RequestCache} from './util/request-cache';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CropClientService {

  private cache = new IdResourceCache<WsCrop>();
  private requestCache = new RequestCache<WsCrop>();

  constructor(private requestService: RequestService) {
  }


  searchCrops(filter: WsCropFilter, pagination: Pagination): Observable<WsSearchResult<WsCrop>> {
    return this.requestService.post<WsSearchResult<WsCrop>>('/crop/search', filter, pagination);
  }

  fetchCrop(id: number): Observable<WsCrop> {
    const fetchTask = this.requestService.get<WsCrop>(`/crop/${id}`)
      .pipe(tap(e => this.cache.putInCache(e)));
    const cachedTask = this.requestCache.shareInCache(id, fetchTask);
    return cachedTask;
  }

  getCrop(id: number): Observable<WsCrop> {
    const cachedCrop = this.cache.getFromCache(id);
    if (cachedCrop != null) {
      return of(cachedCrop);
    }
    const cachedRequest = this.requestCache.getFromCache(id);
    if (cachedRequest != null) {
      return cachedRequest;
    }
    return this.fetchCrop(id);
  }

  createCrop(crop: WsCropCreationRequest): Observable<WsRef<WsCrop>> {
    return this.requestService.post<WsRef<WsCrop>>(`/crop`, crop);
  }

  updateCrop(crop: WsCrop): Observable<WsRef<WsCrop>> {
    return this.requestService.put<WsRef<WsCrop>>(`/crop/${crop.id}`, crop)
      .pipe(tap(ref => this.clearCachedCrop(ref.id)));
  }

  clearCachedCrop(id: number) {
    this.cache.removeFromCache(id);
    this.requestCache.clear(id);
  }
}
