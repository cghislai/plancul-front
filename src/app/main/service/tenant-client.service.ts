import {Injectable} from '@angular/core';
import {WsRef, WsTenant} from '@charlyghislain/plancul-api';
import {Observable, of} from 'rxjs';
import {RequestService} from '../../main/service/request.service';
import {IdResourceCache} from './util/id-resource-cache';
import {RequestCache} from './util/request-cache';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TenantClientService {

  private cache = new IdResourceCache<WsTenant>();
  private requestCache = new RequestCache<WsTenant>();

  constructor(private requestService: RequestService) {
  }


  fetchTenant(id: number): Observable<WsTenant> {
    const url = this.requestService.buildPlanCulApiUrl(`/tenant/${id}`);
    const fetchTask = this.requestService.get<WsTenant>(url)
      .pipe(tap(e => this.cache.putInCache(e)));
    const cachedTask = this.requestCache.shareInCache(id, fetchTask);
    return cachedTask;
  }

  getTenant(id: number): Observable<WsTenant> {
    const cachedTenant = this.cache.getFromCache(id);
    if (cachedTenant != null) {
      return of(cachedTenant);
    }
    const cachedRequest = this.requestCache.getFromCache(id);
    if (cachedRequest != null) {
      return cachedRequest;
    }
    return this.fetchTenant(id);
  }

  saveTenant(tenant: WsTenant): Observable<WsRef<WsTenant>> {
    if (tenant.id == null) {
      return this.createTenant(tenant);
    } else {
      return this.updateTenant(tenant);
    }
  }

  createTenant(tenant: WsTenant): Observable<WsRef<WsTenant>> {
    const url = this.requestService.buildPlanCulApiUrl('/tenant');
    return this.requestService.post<WsRef<WsTenant>>(url, tenant);
  }

  updateTenant(tenant: WsTenant): Observable<WsRef<WsTenant>> {
    const url = this.requestService.buildPlanCulApiUrl(`/tenant/${tenant.id}`);
    return this.requestService.put<WsRef<WsTenant>>(url, tenant)
      .pipe(tap(ref => this.clearCachedTenant(ref.id)));
  }

  clearCachedTenant(id: number) {
    this.cache.removeFromCache(id);
    this.requestCache.clear(id);
  }
}
