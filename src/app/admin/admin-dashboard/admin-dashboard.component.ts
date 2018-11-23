import {Component, OnInit} from '@angular/core';
import {AdminService} from '../service/admin.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {concatMap, delay, flatMap, map, mergeMap, publishReplay, refCount, switchMap, tap} from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'pc-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {

  private reloadTrigger = new BehaviorSubject<boolean>(true);
  tenantCount$: Observable<number>;
  userCount$: Observable<number>;

  loadingEventcache: boolean;
  loadingYear: number;
  loadedCount: number;
  loadedProgress: number;

  constructor(private adminService: AdminService) {
  }

  ngOnInit() {
    this.tenantCount$ = this.reloadTrigger.pipe(
      switchMap(() => this.adminService.searchTenants({
        length: 1, offset: 0,
      })),
      map(results => results.count),
      publishReplay(1), refCount(),
    );
    this.userCount$ = this.reloadTrigger.pipe(
      switchMap(() => this.adminService.searchUsers({
        length: 1, offset: 0,
      })),
      map(results => results.count),
      publishReplay(1), refCount(),
    );
  }

  onClearCacheClick() {
    this.adminService.clearAstronomyEventCache()
      .subscribe();
  }

  onPreloadYearsClicked() {
    const thisyear = moment().get('year');
    const yearsToLoad = [];
    for (let y = thisyear - 10; y < thisyear + 10; y++) {
      yearsToLoad.push(y);
    }
    this.loadingEventcache = true;
    this.loadedCount = 0;
    this.loadedProgress = 0;
    const yearsCount = yearsToLoad.length;

    of(...yearsToLoad).pipe(
      delay(0),
      concatMap(y => {
        this.loadingYear = y
        return this.adminService.loadAstronomyEventCache(y)
      }),
      tap(y => {
        this.loadedCount += 1;
        this.loadedProgress = 100.0 * this.loadedCount / yearsCount;
      }, () => {
      }, () => {
        this.loadedProgress = 1;
        this.loadingEventcache = false;
      }),
    ).subscribe();
  }
}
