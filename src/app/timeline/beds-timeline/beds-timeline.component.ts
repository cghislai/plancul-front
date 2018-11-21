import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, ReplaySubject} from 'rxjs';
import * as vis from 'vis';
import moment from 'moment-es6';
import {DateUtils} from '../../main/service/util/date-utils';
import {BedClientService} from '../../main/service/bed-client.service';
import {
  DateAsString,
  WsBedFilter,
  WsBedSortField,
  WsCulture,
  WsCultureFilter,
  WsCultureSortField,
  WsDateRange,
  WsRef,
  WsSortOrder,
  WsTenant,
} from '@charlyghislain/plancul-api';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {debounceTime, delay, filter, map, mergeMap, publishReplay, refCount, switchMap, take, tap} from 'rxjs/operators';
import {TimelineService} from '../service/timeline.service';
import {Pagination} from '../../main/domain/pagination';
import {CultureClientService} from '../../main/service/culture-client.service';
import {TimelineItemCallbackHandler} from '../timeline/timeline-item-callback-handler';
import {NotificationMessageService} from '../../main/service/notification-message.service';

@Component({
  selector: 'pc-beds-timeline',
  templateUrl: './beds-timeline.component.html',
  styleUrls: ['./beds-timeline.component.scss'],
})
export class BedsTimelineComponent implements OnInit {

  timelineData: Observable<vis.DataItem[]>;
  timelineGroups: Observable<vis.DataSet<vis.DataGroup>>;
  timelineOptions: Observable<vis.Options>;
  dateRange: Observable<WsDateRange>;
  loading = new BehaviorSubject<boolean>(false);

  private dateRangeSource = new BehaviorSubject<WsDateRange>(this.createInitialDateRange());
  private bedFilterSource = new ReplaySubject<WsBedFilter>(1);
  private cultureFilter: Observable<WsCultureFilter>;
  private reloadTrigger = new BehaviorSubject<any>(true);

  constructor(private bedClient: BedClientService,
              private cultureClient: CultureClientService,
              private selectedTenantService: SelectedTenantService,
              private notificationMessageService: NotificationMessageService,
              private timelineService: TimelineService,
  ) {
  }

  ngOnInit() {
    this.createInitialBedFilter();
    this.dateRange = this.dateRangeSource.asObservable().pipe(
      delay(0),
      tap(a => this.loading.next(true)),
      publishReplay(1), refCount(),
    );

    const tenantRef = this.selectedTenantService.getSelectedTenantRef()
      .pipe(
        filter(ref => ref != null),
        publishReplay(1), refCount(),
      );

    this.cultureFilter = combineLatest(tenantRef, this.dateRange)
      .pipe(
        map(results => this.createCultureFilter(results[0], results[1])),
        publishReplay(1), refCount(),
      );

    this.timelineGroups = this.bedFilterSource.pipe(
      switchMap(searchFilter => this.searchBedsGroups(searchFilter)),
      publishReplay(1), refCount(),
    );
    const cultureBedsItems$ = combineLatest(this.cultureFilter, this.reloadTrigger).pipe(
      map(results => results[0]),
      switchMap(searchFilter => this.searchCultureRefs(searchFilter)),
      publishReplay(1), refCount(),
    );
    const eventItems$ = combineLatest(this.dateRange, this.reloadTrigger).pipe(
      map(results => results[0]),
      switchMap(range => this.searchAstronomyEvents$(range)),
      publishReplay(1), refCount(),
    );
    this.timelineData = combineLatest(cultureBedsItems$, eventItems$)
      .pipe(
        map(items => [...items[0], ...items[1]]),
        debounceTime(300),
        tap(a => this.loading.next(false)),
        publishReplay(1), refCount(),
      );

    this.timelineOptions = of({});
  }

  onRangeChanged(range: WsDateRange) {
    this.dateRangeSource.next(range);
  }

  onItemMoving(event: TimelineItemCallbackHandler) {
    const item = event.item;
    const callback = event.callback;
    const cultureId = this.timelineService.getCultureIdFromItemId(item.id);
    const phaseType = this.timelineService.getPhaseTypeFromItemId(item.id);
    this.cultureClient.getCulture(cultureId)
      .subscribe(culture => {
        this.timelineService.checkItemMoving(item, culture, phaseType);
        callback(item);
      });
  }

  onItemMoved(event: TimelineItemCallbackHandler) {
    const item = event.item;
    const callback = event.callback;
    const cultureId = this.timelineService.getCultureIdFromItemId(item.id);
    const phaseType = this.timelineService.getPhaseTypeFromItemId(item.id);
    const bedId = this.timelineService.getBedIdFromGroupId(item.group);

    const startMoment = moment(item.start);
    const endMoment = moment(item.end);

    const startDateString: DateAsString = DateUtils.toIsoDateString(startMoment.toDate());
    const endDateString: DateAsString = DateUtils.toIsoDateString(endMoment.toDate());
    const dateRange: WsDateRange = {
      start: startDateString,
      end: endDateString,
    };

    const updateBedTask: (culture: WsCulture) => Observable<any>
      = bedId == null ? () => of(null) : (culture) => this.updateCultureBed(culture, bedId);

    this.loading.next(true);
    this.cultureClient.getCulture(cultureId).pipe(
      mergeMap(culture => updateBedTask(culture)),
      mergeMap(ref => this.cultureClient.updateCulturePhase(cultureId, phaseType, dateRange)),
    )
      .subscribe(ref => {
        this.loading.next(false);
        callback(item);
        this.reloadTrigger.next(true);
      }, error => {
        // TODO i18n
        callback(null);
        this.loading.next(false);
        this.notificationMessageService.addError('Error while updating culture');
        this.reloadTrigger.next(true);
      });
  }

  private createInitialDateRange(): WsDateRange {
    const now = moment();
    const startOfWeek = now.startOf('week');
    const sixWeeksLater = startOfWeek.add(6, 'week');
    return {
      start: DateUtils.toIsoDateString(startOfWeek.toDate()),
      end: DateUtils.toIsoDateString(sixWeeksLater.toDate()),
    };
  }

  private createInitialBedFilter() {
    this.selectedTenantService.getSelectedTenantRef()
      .pipe(
        filter(ref => ref != null),
        take(1),
        map(tenantRef => this.createBedFilter(tenantRef)),
      ).subscribe(searchFilter => this.bedFilterSource.next(searchFilter));
  }

  private createBedFilter(tenantRef: WsRef<WsTenant>): WsBedFilter {
    return {
      tenantWsRef: tenantRef,
    };
  }

  private searchBedsGroups(searchFilter: WsBedFilter) {
    const pagination: Pagination = {
      offset: 0,
      length: 100,
      sorts: [{
        field: WsBedSortField.NAME,
        order: WsSortOrder.ASC,
      }],
    };
    return this.bedClient.searchBeds(searchFilter, pagination)
      .pipe(
        map(results => results.list),
        switchMap(refList => this.timelineService.createTimelineGroups(refList)),
      );
  }

  private createCultureFilter(tenantRef: WsRef<WsTenant>, dateRange: WsDateRange): WsCultureFilter {
    return {
      tenantWsRef: tenantRef,
      bedOccupancyStartDate: {
        notAfter: dateRange.end,
      },
      bedOccupancyEndDate: {
        notBefore: dateRange.start,
      },
    };
  }

  private searchCultureRefs(searchFilter: WsCultureFilter): Observable<vis.DataItem[]> {
    const pagination: Pagination = {
      offset: 0,
      length: 100,
      sorts: [{
        field: WsCultureSortField.BED_OCCUPANCY_START_DATE,
        order: WsSortOrder.ASC,
      }],
    };
    return this.cultureClient.searchCultures(searchFilter, pagination)
      .pipe(
        map(results => results.list),
        switchMap(refList => this.timelineService.createCulturePhaseItems(refList)),
      );
  }

  private updateCultureBed(culture: WsCulture, bedId: number | string): Observable<WsRef<WsCulture>> {
    if (typeof bedId !== 'number') {
      return of({id: culture.id});
    }
    if (culture.bedWsRef.id === bedId) {
      return of({id: culture.id});
    }
    const updatedCulture = Object.assign({}, culture, <Partial<WsCulture>>{
      bedWsRef: {id: bedId},
    });
    return this.cultureClient.updateCulture(updatedCulture);
  }

  private searchAstronomyEvents$(range: WsDateRange): Observable<vis.DataItem[]> {
    return this.timelineService.createAstronomyItems(range);
  }
}
