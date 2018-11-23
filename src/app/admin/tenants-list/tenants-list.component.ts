import {Component, OnInit} from '@angular/core';
import {AdminService} from '../service/admin.service';
import {BehaviorSubject, forkJoin, Observable, ReplaySubject, Subject, Subscription} from 'rxjs';
import {WsTenant} from '@charlyghislain/plancul-api';
import {Pagination} from '../../main/domain/pagination';
import {filter, map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {TenantClientService} from '../../main/service/tenant-client.service';
import {LazyLoadEvent} from 'primeng/api';

@Component({
  selector: 'pc-tenants-list',
  templateUrl: './tenants-list.component.html',
  styleUrls: ['./tenants-list.component.scss'],
})
export class TenantsListComponent implements OnInit {

  pagination$ = new BehaviorSubject<Pagination>({
    offset: 0, length: 50,
  });
  tenants$: Observable<WsTenant[]>;
  curPageOffset$: Observable<number>;
  curPageLength$: Observable<number>;
  totalCount$: Observable<number>;

  constructor(private adminService: AdminService,
              private tenantService: TenantClientService) {
  }

  ngOnInit() {
    const tenantResults = this.pagination$.pipe(
      filter(p => p != null),
      switchMap(p => this.adminService.searchTenants(p)),
      publishReplay(1), refCount(),
    );
    this.tenants$ = tenantResults.pipe(
      map(r => r.list),
      map(refs => refs.map(ref => this.tenantService.getTenant(ref.id))),
      switchMap(refTasks$ => forkJoin(refTasks$)),
      publishReplay(1), refCount(),
    );
    this.curPageOffset$ = this.pagination$.pipe(
      map(p => p.offset),
      publishReplay(1), refCount(),
    );
    this.curPageLength$ = this.pagination$.pipe(
      map(p => p.length),
      publishReplay(1), refCount(),
    );
    this.totalCount$ = tenantResults.pipe(
      map(r => r.count),
      publishReplay(1), refCount(),
    );
  }

  onLazyLoad(event: LazyLoadEvent) {
    if (event.first == null || event.rows == null) {
      return;
    }
    this.pagination$.next({
      offset: event.first,
      length: event.rows,
    });
  }

}
