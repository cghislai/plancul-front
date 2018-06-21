import {Injectable} from '@angular/core';
import {RequestService} from './request.service';
import {WsAgrovocPlant, WsPlantProductResult, WsPlantProductTupleFilter, WsRef} from '@charlyghislain/plancul-ws-api';
import {Pagination} from '../domain/pagination';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {RequestCache} from './util/request-cache';
import {IdResourceCache} from './util/id-resource-cache';

@Injectable({
  providedIn: 'root',
})
export class AgrovocPlantClientService {

  private cache = new IdResourceCache<WsAgrovocPlant>();
  private requestCache = new RequestCache<WsAgrovocPlant>();


  constructor(private requestService: RequestService) {
  }


  searchPlantProductTuple(filter: WsPlantProductTupleFilter, pagination: Pagination): Observable<WsPlantProductResult[]> {
    return this.requestService.post('/plantProductTuple/search', filter, pagination);
  }


  fetchAgrovocPlant(id: number): Observable<WsAgrovocPlant> {
    const fetchTask = this.requestService.get<WsAgrovocPlant>(`/agrovocPlant/${id}`)
      .pipe(tap(e => this.cache.putInCache(e)));
    const cachedTask = this.requestCache.shareInCache(id, fetchTask);
    return cachedTask;
  }

  getAgrovocPlant(id: number): Observable<WsAgrovocPlant> {
    const cachedAgrovocPlant = this.cache.getFromCache(id);
    if (cachedAgrovocPlant != null) {
      return of(cachedAgrovocPlant);
    }
    const cachedRequest = this.requestCache.getFromCache(id);
    if (cachedRequest != null) {
      return cachedRequest;
    }
    return this.fetchAgrovocPlant(id);
  }

  saveAgrovocPlant(agrovocPlant: WsAgrovocPlant): Observable<WsRef<WsAgrovocPlant>> {
    if (agrovocPlant.id == null) {
      return this.createAgrovocPlant(agrovocPlant);
    } else {
      return this.updateAgrovocPlant(agrovocPlant);
    }
  }

  createAgrovocPlant(agrovocPlant: WsAgrovocPlant): Observable<WsRef<WsAgrovocPlant>> {
    return this.requestService.post<WsRef<WsAgrovocPlant>>(`/agrovocPlant`, agrovocPlant);
  }

  updateAgrovocPlant(agrovocPlant: WsAgrovocPlant): Observable<WsRef<WsAgrovocPlant>> {
    return this.requestService.put<WsRef<WsAgrovocPlant>>(`/agrovocPlant/${agrovocPlant.id}`, agrovocPlant)
      .pipe(tap(ref => this.clearCachedAgrovocPlant(ref.id)));
  }

  clearCachedAgrovocPlant(id: number) {
    this.cache.removeFromCache(id);
    this.requestCache.clear(id);
  }

}
