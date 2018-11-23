import {Injectable} from '@angular/core';
import {RequestService} from '../../main/service/request.service';
import {TenantClientService} from '../../main/service/tenant-client.service';
import {Pagination} from '../../main/domain/pagination';
import {UserService} from '../../main/service/user.service';
import {catchError, tap} from 'rxjs/operators';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {EMPTY, of} from 'rxjs';
import {WsSearchResult, WsUser} from '@charlyghislain/plancul-api';

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

  searchUsers(pagination: Pagination) {
    return this.userService.searchUsers(pagination).pipe(
      catchError(e => {
        this.notificationService.addError(`Could not load users`, e);
        return of(this.createErroredSearchResult<WsUser>());
      }),
    );
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
