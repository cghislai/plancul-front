import {Component, OnInit} from '@angular/core';
import {WsCrop, WsCropFilter, WsRef} from '@charlyghislain/plancul-ws-api';
import {BehaviorSubject, combineLatest, forkJoin, Observable, of, ReplaySubject} from 'rxjs';
import {Pagination} from '../../main/domain/pagination';
import {LazyLoadEvent} from 'primeng/api';
import {map, mergeMap, publishReplay, refCount, switchMap, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {CropClientService} from '../../main/service/crop-client.service';
import {myThrottleTime} from '../../main/domain/my-throttle-time';

@Component({
  selector: 'pc-crop-list',
  templateUrl: './crop-list.component.html',
  styleUrls: ['./crop-list.component.scss'],
})
export class CropListComponent implements OnInit {

  private filterSource = new ReplaySubject<WsCropFilter>(1);
  private paginationSource = new ReplaySubject<Pagination>(1);

  cropResults: Observable<WsCrop[]>;
  resultCount: Observable<number>;
  resultLoading = new BehaviorSubject<boolean>(false);


  constructor(private cropClient: CropClientService,
              private router: Router) {
  }

  ngOnInit() {
    const searchResults = combineLatest(this.filterSource, this.paginationSource)
      .pipe(
        myThrottleTime(500),
        tap(r => this.setLoading(true)),
        switchMap(results => this.cropClient.searchCrops(results[0], results[1])),
        publishReplay(1), refCount(),
      );
    this.cropResults = searchResults.pipe(
      map(result => result.list),
      mergeMap(list => this.fetchCrops(list)),
      tap(r => this.setLoading(false)),
      publishReplay(1), refCount(),
    );
    this.resultCount = searchResults.pipe(
      map(result => result.count),
      publishReplay(1), refCount(),
    );
    this.filterSource.next({});
  }

  onFilterChanged(filter: WsCropFilter) {
    this.filterSource.next(filter);
  }

  onLazyLoad(event: LazyLoadEvent) {
    this.paginationSource.next({
      offset: event.first,
      length: event.rows,
    });
  }

  onNewCropClicked() {
    this.router.navigate(['/crops/_/new']);
  }

  private setLoading(value: boolean) {
    this.resultLoading.next(value);
  }

  private fetchCrops(list: WsRef<WsCrop>[]): Observable<WsCrop[]> {
    const taskList = list.map(ref => this.cropClient.getCrop(ref.id));
    return taskList.length === 0 ? of([]) : forkJoin(taskList);
  }
}
