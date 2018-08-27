import {Injectable} from '@angular/core';
import {RequestService} from './request.service';
import {WsAgrovocPlant, WsAgrovocPlantData, WsAgrovocPlantProduct, WsPlantProductTupleFilter} from '@charlyghislain/plancul-api';
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

  searchPlantProductTuple(filter: WsPlantProductTupleFilter, pagination: Pagination): Observable<WsAgrovocPlantProduct[]> {
    const url = this.requestService.buildPlanCulApiUrl('/agrovoc/plantProductTuple/search');
    return this.requestService.post(url, filter, pagination);
  }


  searchPlantData(plantUri: string): Observable<WsAgrovocPlantData> {
    const url = this.requestService.buildPlanCulApiUrl('/agrovoc/plantData/search');
    return this.requestService.post(url, plantUri);
  }


  fetchAgrovocPlant(id: number): Observable<WsAgrovocPlant> {
    const url = this.requestService.buildPlanCulApiUrl(`/agrovocPlant/${id}`);
    const fetchTask = this.requestService.get<WsAgrovocPlant>(url)
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


  clearCachedAgrovocPlant(id: number) {
    this.cache.removeFromCache(id);
    this.requestCache.clear(id);
  }

}
