import {Injectable} from '@angular/core';
import {WsBed, WsBedFilter, WsRef, WsSearchResult} from '@charlyghislain/plancul-api';
import {Observable, of} from 'rxjs';
import {RequestService} from '../../main/service/request.service';
import {Pagination} from '../../main/domain/pagination';
import {IdResourceCache} from './util/id-resource-cache';
import {RequestCache} from './util/request-cache';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BedClientService {

  private cache = new IdResourceCache<WsBed>();
  private requestCache = new RequestCache<WsBed>();

  constructor(private requestService: RequestService) {
  }


  searchBeds(filter: WsBedFilter, pagination: Pagination): Observable<WsSearchResult<WsBed>> {
    const url = this.requestService.buildPlanCulApiUrl('/bed/search');
    return this.requestService.post<WsSearchResult<WsBed>>(url, filter, pagination);
  }

  searchBedPatches(filter: WsBedFilter): Observable<string[]> {
    const url = this.requestService.buildPlanCulApiUrl('/bed/patch/search');
    return this.requestService.post<string[]>(url, filter);
  }

  fetchBed(id: number): Observable<WsBed> {
    const url = this.requestService.buildPlanCulApiUrl(`/bed/${id}`);

    const fetchTask = this.requestService.get<WsBed>(url)
      .pipe(tap(e => this.cache.putInCache(e)));
    const cachedTask = this.requestCache.shareInCache(id, fetchTask);
    return cachedTask;
  }

  getBed(id: number): Observable<WsBed> {
    const cachedBed = this.cache.getFromCache(id);
    if (cachedBed != null) {
      return of(cachedBed);
    }
    const cachedRequest = this.requestCache.getFromCache(id);
    if (cachedRequest != null) {
      return cachedRequest;
    }
    return this.fetchBed(id);
  }

  saveBed(bed: WsBed): Observable<WsRef<WsBed>> {
    if (bed.id == null) {
      return this.createBed(bed);
    } else {
      return this.updateBed(bed);
    }
  }

  createBed(bed: WsBed): Observable<WsRef<WsBed>> {
    const url = this.requestService.buildPlanCulApiUrl('/bed/');
    return this.requestService.post<WsRef<WsBed>>(url, bed);
  }

  updateBed(bed: WsBed): Observable<WsRef<WsBed>> {
    const url = this.requestService.buildPlanCulApiUrl(`/bed/${bed.id}`);
    return this.requestService.put<WsRef<WsBed>>(url, bed)
      .pipe(tap(ref => this.clearCachedBed(ref.id)));
  }

  deleteBed(bed: WsBed): Observable<any> {
    const url = this.requestService.buildPlanCulApiUrl(`/bed/${bed.id}`);
    return this.requestService.delete(url)
      .pipe(tap(() => this.clearCachedBed(bed.id)));
  }

  clearCachedBed(id: number) {
    this.cache.removeFromCache(id);
    this.requestCache.clear(id);
  }
}
