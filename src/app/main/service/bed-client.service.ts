import {Injectable} from '@angular/core';
import {WsBed, WsBedFilter, WsRef, WsSearchResult} from '@charlyghislain/plancul-ws-api';
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
    return this.requestService.post<WsSearchResult<WsBed>>('/bed/search', filter, pagination);
  }

  fetchBed(id: number): Observable<WsBed> {
    const fetchTask = this.requestService.get<WsBed>(`/bed/${id}`)
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
    return this.requestService.post<WsRef<WsBed>>(`/bed`, bed);
  }

  updateBed(bed: WsBed): Observable<WsRef<WsBed>> {
    return this.requestService.put<WsRef<WsBed>>(`/bed/${bed.id}`, bed)
      .pipe(tap(ref => this.clearCachedBed(ref.id)));
  }

  deleteBed(bed: WsBed): Observable<any> {
    return this.requestService.delete(`/bed/${bed.id}`)
      .pipe(tap(() => this.clearCachedBed(bed.id)));
  }

  clearCachedBed(id: number) {
    this.cache.removeFromCache(id);
    this.requestCache.clear(id);
  }
}
