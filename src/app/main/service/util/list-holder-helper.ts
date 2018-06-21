import {WsDomainEntity, WsRef, WsSearchResult} from '@charlyghislain/plancul-ws-api';
import {BehaviorSubject, combineLatest, EMPTY, forkJoin, Observable, of, ReplaySubject} from 'rxjs';
import {Pagination} from '../../domain/pagination';
import {Sort} from '../../domain/sort';
import {distinctUntilChanged, filter, map, mergeMap, publishReplay, refCount, switchMap, tap} from 'rxjs/operators';
import {PaginationUtils} from './pagination-utils';
import {myThrottleTime} from '../../domain/my-throttle-time';
import {LazyLoadEvent} from 'primeng/api';

export class ListHolderHelper<E extends WsDomainEntity, FILTER> {

  private filterSource = new ReplaySubject<FILTER>(1);
  private paginationSource = new BehaviorSubject<Pagination>(null);
  private resultsLoading = new BehaviorSubject<boolean>(false);
  private reloadTrigger = new BehaviorSubject<any>(false);

  private readonly results: Observable<E[]>;
  private readonly resultCount: Observable<number>;
  private readonly sort: Observable<Sort>;
  private readonly sortField: Observable<string>;
  private readonly sortOrder: Observable<number>;

  constructor(searchFunction: (filter: FILTER, pagination: Pagination) => Observable<WsSearchResult<WsRef<E>>>,
              getFunction: (id: number) => Observable<E>) {
    const nonNullPagination = this.paginationSource.pipe(
      filter(p => PaginationUtils.isValid(p)),
      distinctUntilChanged(PaginationUtils.paginationEqual),
      publishReplay(1), refCount(),
    );
    const distinctFilter = this.filterSource.pipe(
      filter(f => f != null),
      distinctUntilChanged(this.jsonEqual),
      tap(a => console.log('distinct')),
      tap(a => console.log(a)),
      publishReplay(1), refCount(),
    );
    const reloadedFilter = combineLatest(distinctFilter, this.reloadTrigger)
      .pipe(
        map(results => results[0]),
        publishReplay(1), refCount(),
      );
    const searchResults: Observable<WsSearchResult<WsRef<E>>> = combineLatest(reloadedFilter, nonNullPagination)
      .pipe(
        myThrottleTime(500),
        tap(r => this.setLoading(true)),
        switchMap(results => this.searchEntities(results[0], results[1], searchFunction)),
        publishReplay(1), refCount(),
      );
    this.results = searchResults.pipe(
      map(result => result.list),
      mergeMap(list => this.getEntities(list, getFunction)),
      tap(r => this.setLoading(false)),
      publishReplay(1), refCount(),
    );
    this.resultCount = searchResults.pipe(
      map(result => result.count),
      publishReplay(1), refCount(),
    );
    this.sort = nonNullPagination.pipe(
      map(p => PaginationUtils.getFirstSort(p)),
      filter(s => s != null),
      publishReplay(1), refCount(),
    );
    this.sortOrder = this.sort.pipe(
      map(s => PaginationUtils.getPrimengOrder(s)),
      publishReplay(1), refCount(),
    );
    this.sortField = this.sort.pipe(
      map(s => s.field),
      publishReplay(1), refCount(),
    );
  }

  setFilter(searchFilter: FILTER) {
    this.filterSource.next(searchFilter);
  }

  setSort(sort: Sort) {
    const curPagination = this.paginationSource.getValue();
    const newPagination = PaginationUtils.applySort(curPagination, sort);
    this.paginationSource.next(newPagination);
  }

  applyLazyLoad(event: LazyLoadEvent) {
    const curPagination = this.paginationSource.getValue();
    const newPagination = PaginationUtils.applyLazyLoadEvent(curPagination, event);
    this.paginationSource.next(newPagination);
  }

  reload() {
    this.reloadTrigger.next(true);
  }

  getResults(): Observable<E[]> {
    return this.results;
  }

  getResultCount(): Observable<number> {
    return this.resultCount;
  }

  getResultsLoading(): Observable<boolean> {
    return this.resultsLoading;
  }

  getSort(): Observable<Sort> {
    return this.sort;
  }

  getSortField(): Observable<string> {
    return this.sortField;
  }

  getSOrtOrder(): Observable<number> {
    return this.sortOrder;
  }

  getFilter(): Observable<FILTER> {
    return this.filterSource.asObservable();
  }

  private setLoading(value: boolean) {
    this.resultsLoading.next(value);
  }

  private getEntities(list: WsRef<E>[], getFunction: (id) => Observable<E>): Observable<E[]> {
    const taskList = list.map(ref => getFunction(ref.id));
    return taskList.length === 0 ? of([]) : forkJoin(taskList);
  }

  private searchEntities(searchFilter: FILTER, pagination: Pagination,
                         searchFunction: (filter: FILTER, pagination: Pagination) => Observable<WsSearchResult<WsRef<E>>>) {
    if (pagination == null || pagination.offset == null || pagination.length == null) {
      return EMPTY;
    }
    return searchFunction(searchFilter, pagination);
  }

  private jsonEqual(a: any, b: any) {
    const jsonA = JSON.stringify(a);
    const jsonB = JSON.stringify(b);
    return jsonA === jsonB;
  }
}
