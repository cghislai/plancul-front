import {Injectable} from '@angular/core';
import {WsCrop, WsCropCreationRequest, WsCropFilter, WsRef, WsSearchResult} from '@charlyghislain/plancul-api';
import {Observable, of} from 'rxjs';
import {RequestService} from './request.service';
import {Pagination} from '../domain/pagination';
import {IdResourceCache} from './util/id-resource-cache';
import {RequestCache} from './util/request-cache';
import {map, switchMap, tap} from 'rxjs/operators';
import {AgrovocProductClientService} from './agrovoc-product-client.service';

@Injectable({
  providedIn: 'root',
})
export class CropClientService {

  private cache = new IdResourceCache<WsCrop>();
  private requestCache = new RequestCache<WsCrop>();

  constructor(private requestService: RequestService,
              private productClient: AgrovocProductClientService) {
  }


  searchCrops(filter: WsCropFilter, pagination: Pagination): Observable<WsSearchResult<WsCrop>> {
    const url = this.requestService.buildPlanCulApiUrl('/crop/search');
    return this.requestService.post<WsSearchResult<WsCrop>>(url, filter, pagination);
  }

  fetchCrop(id: number): Observable<WsCrop> {
    const url = this.requestService.buildPlanCulApiUrl(`/crop/${id}`);

    const fetchTask = this.requestService.get<WsCrop>(url)
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
    const url = this.requestService.buildPlanCulApiUrl('/crop');
    return this.requestService.post<WsRef<WsCrop>>(url, crop);
  }

  updateCrop(crop: WsCrop): Observable<WsRef<WsCrop>> {
    const url = this.requestService.buildPlanCulApiUrl(`/crop/${crop.id}`);
    return this.requestService.put<WsRef<WsCrop>>(url, crop)
      .pipe(tap(ref => this.clearCachedCrop(ref.id)));
  }

  clearCachedCrop(id: number) {
    this.cache.removeFromCache(id);
    this.requestCache.clear(id);
  }

  getCropLabel(id: number): Observable<string> {
    return this.getCrop(id).pipe(
      map(crop => this.getCropLabelFromCrop(crop)),
    );
  }

  private getCropLabelFromCrop(crop: WsCrop): string {
    return crop.displayName;
  }
}
