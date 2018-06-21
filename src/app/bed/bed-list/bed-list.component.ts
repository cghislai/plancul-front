import {Component, OnInit} from '@angular/core';
import {WsBed, WsBedFilter, WsRef} from '@charlyghislain/plancul-ws-api';
import {BehaviorSubject, combineLatest, forkJoin, Observable, of, ReplaySubject} from 'rxjs';
import {Pagination} from '../../main/domain/pagination';
import {LazyLoadEvent} from 'primeng/api';
import {map, mergeMap, publishReplay, refCount, switchMap, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {BedClientService} from '../../main/service/bed-client.service';
import {myThrottleTime} from '../../main/domain/my-throttle-time';

@Component({
  selector: 'pc-bed-list',
  templateUrl: './bed-list.component.html',
  styleUrls: ['./bed-list.component.scss'],
})
export class BedListComponent implements OnInit {

  private filterSource = new ReplaySubject<WsBedFilter>(1);
  private paginationSource = new ReplaySubject<Pagination>(1);

  bedResults: Observable<WsBed[]>;
  resultCount: Observable<number>;
  resultLoading = new BehaviorSubject<boolean>(false);

  constructor(private bedClient: BedClientService,
              private router: Router) {
  }

  ngOnInit() {
    const searchResults = combineLatest(this.filterSource, this.paginationSource)
      .pipe(
        myThrottleTime(500),
        tap(r => this.setLoading(true)),
        switchMap(results => this.bedClient.searchBeds(results[0], results[1])),
        publishReplay(1), refCount(),
      );
    this.bedResults = searchResults.pipe(
      map(result => result.list),
      mergeMap(list => this.fetchBeds(list)),
      tap(r => this.setLoading(false)),
      publishReplay(1), refCount(),
    );
    this.resultCount = searchResults.pipe(
      map(result => result.count),
      publishReplay(1), refCount(),
    );
  }


  onFilterChanged(filter: WsBedFilter) {
    this.filterSource.next(filter);
  }

  onLazyLoad(event: LazyLoadEvent) {
    this.paginationSource.next({
      offset: event.first,
      length: event.rows,
    });
  }

  onNewBedClicked() {
    this.router.navigate(['/beds/_/new']);
  }

  onRemoveBedClick(bed: WsBed, event: MouseEvent) {
    this.bedClient.deleteBed(bed)
      .pipe(mergeMap(() => this.filterSource))
      .subscribe(filter => this.filterSource.next(filter));
    event.stopImmediatePropagation();
    event.preventDefault();
  }

  private setLoading(value: boolean) {
    this.resultLoading.next(value);
  }

  private fetchBeds(list: WsRef<WsBed>[]): Observable<WsBed[]> {
    const taskList = list.map(ref => this.bedClient.getBed(ref.id));
    return taskList.length === 0 ? of([]) : forkJoin(taskList);
  }

  private createInitialFilter(): WsBedFilter {
    return {};
  }
}
