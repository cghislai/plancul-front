import {Injectable} from '@angular/core';
import {RequestService} from './request.service';
import {WsAgrovocProduct} from '@charlyghislain/plancul-ws-api';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {RequestCache} from './util/request-cache';
import {IdResourceCache} from './util/id-resource-cache';

@Injectable({
  providedIn: 'root',
})
export class AgrovocProductClientService {

  private cache = new IdResourceCache<WsAgrovocProduct>();
  private requestCache = new RequestCache<WsAgrovocProduct>();


  constructor(private requestService: RequestService) {
  }


  fetchAgrovocProduct(id: number): Observable<WsAgrovocProduct> {
    const fetchTask = this.requestService.get<WsAgrovocProduct>(`/agrovocProduct/${id}`)
      .pipe(tap(e => this.cache.putInCache(e)));
    const cachedTask = this.requestCache.shareInCache(id, fetchTask);
    return cachedTask;
  }

  getAgrovocProduct(id: number): Observable<WsAgrovocProduct> {
    const cachedAgrovocProduct = this.cache.getFromCache(id);
    if (cachedAgrovocProduct != null) {
      return of(cachedAgrovocProduct);
    }
    const cachedRequest = this.requestCache.getFromCache(id);
    if (cachedRequest != null) {
      return cachedRequest;
    }
    return this.fetchAgrovocProduct(id);
  }

  clearCachedAgrovocProduct(id: number) {
    this.cache.removeFromCache(id);
    this.requestCache.clear(id);
  }

}
