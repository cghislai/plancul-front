import {Injectable} from '@angular/core';
import {RequestService} from '../../main/service/request.service';
import {TenantClientService} from '../../main/service/tenant-client.service';
import {Pagination} from '../../main/domain/pagination';
import {UserService} from '../../main/service/user.service';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {EMPTY, forkJoin, Observable, of} from 'rxjs';
import {WsRef, WsSearchResult, WsTenant, WsUser} from '@charlyghislain/plancul-api';
import {TenantStats} from '../tenants-list/tenant-stats';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  constructor(private requestService: RequestService,
              private notificationService: NotificationMessageService,
              private tenantService: TenantClientService,
              private userService: UserService) {
  }

  searchTenants(pagination: Pagination) {
    return this.tenantService.searchTenants(pagination).pipe(
      catchError(e => {
        this.notificationService.addError(`Could not load tenants`, e);
        return of(this.createErroredSearchResult());
      }),
    );
  }

  searchTenantStat(ref: WsRef<WsTenant>): Observable<TenantStats> {
    const tenant$ = this.tenantService.getTenant(ref.id);
    const stats$ = this.tenantService.fetchTenantStat(ref.id);
    return forkJoin(tenant$, stats$).pipe(
      map(results => <TenantStats>{
        tenant: results[0],
        stats: results[1],
      }),
    );
  }

  searchUsers(pagination: Pagination) {
    return this.userService.searchUsers(pagination).pipe(
      catchError(e => {
        this.notificationService.addError(`Could not load users`, e);
        return of(this.createErroredSearchResult<WsUser>());
      }),
    );
  }


  removeUser(id: number): Observable<any> {
    return this.userService.removeUser(id);
  }

  clearAstronomyEventCache(year?: number) {
    let url = this.requestService.buildAstronomuApiUrl(`/admin/event/cache/clear/`);
    if (year != null) {
      url += `?year=${year}`;
    }
    return this.requestService.post(url, null).pipe(
      tap({
        error: e => {
          this.notificationService.addError(`Could not clear cache`, e);
        },
        next: () => {
          this.notificationService.addInfo('Cache cleared');
        },
      }),
    );
  }

  loadAstronomyEventCache(year: number) {
    const url = this.requestService.buildAstronomuApiUrl(`/admin/event/cache/preload/${year}`);
    return this.requestService.post(url, null).pipe(
      tap({
        error: e => {
          this.notificationService.addError(`Could not preload events`, e);
        },
        next: () => {
          this.notificationService.addInfo('Events preloaded for ' + year);
        },
      }),
    );
  }

  private createErroredSearchResult<T>(): WsSearchResult<T> {
    return {
      count: -1,
      list: [],
    };
  }


}
