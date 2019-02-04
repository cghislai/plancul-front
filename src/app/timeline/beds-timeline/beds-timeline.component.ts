import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, forkJoin, Observable, of} from 'rxjs';
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
import {filter, map, mergeMap, publishReplay, refCount, switchMap, take, tap} from 'rxjs/operators';
import {TimelineService} from './service/timeline.service';
import {Pagination} from '../../main/domain/pagination';
import {CultureClientService} from '../../main/service/culture-client.service';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {LocalizationService} from '../../main/service/localization.service';
import {MessageKeys} from '../../main/service/util/message-keys';
import {TimelineGroupService} from './service/timeline-group.service';
import {TimelineItemService} from './service/timeline-item.service';
import {TimelineDateRangeService} from './service/timeline-date-range.service';
import {AstronomyEventFilter, AstronomyEventType, ChronoUnit} from '@charlyghislain/astronomy-api';
import {AstronomyClientService} from '../astronomy-client.service';
import {TimelineItemMoveEvent} from '../timeline/domain/timeline-item-move-event';

@Component({
  selector: 'pc-beds-timeline',
  templateUrl: './beds-timeline.component.html',
  styleUrls: ['./beds-timeline.component.scss'],
  providers: [TimelineService, TimelineGroupService, TimelineItemService, TimelineDateRangeService],
})
export class BedsTimelineComponent implements OnInit {

  displayedRange$: Observable<WsDateRange>;

  timelineGroups: Observable<vis.DataSet<vis.DataGroup>>;
  timelineData: Observable<vis.DataItem[]>;
  timelineOptions: Observable<vis.Options>;

  loadingBeds$ = new BehaviorSubject<boolean>(false);
  loadingCultures$ = new BehaviorSubject<boolean>(false);
  loadingEvents$ = new BehaviorSubject<boolean>(false);

  private reloadTrigger = new BehaviorSubject<any>(true);
  private maxRangeDayDurationForZodiacRendering = 300;

  constructor(private bedClient: BedClientService,
              private localizationService: LocalizationService,
              private cultureClient: CultureClientService,
              private selectedTenantService: SelectedTenantService,
              private notificationMessageService: NotificationMessageService,
              private timelineService: TimelineService,
              private dateRangeService: TimelineDateRangeService,
              private astronomyClient: AstronomyClientService,
  ) {
  }

  ngOnInit() {
    this.displayedRange$ = this.dateRangeService.getDisplayedRange$();

    const tenantRef = this.selectedTenantService.getSelectedTenantRef().pipe(
      filter(ref => ref != null),
      publishReplay(1), refCount(),
    );

    this.timelineGroups = combineLatest(
      tenantRef, this.reloadTrigger,
    ).pipe(
      map(results => this.createBedFilter(results[0])),
      switchMap(searchFilter => this.searchBedsGroups$(searchFilter)),
      publishReplay(1), refCount(),
    );

    const cultureBedsItems$ = combineLatest(
      tenantRef, this.dateRangeService.getSearchFilterRange$(), this.reloadTrigger,
    ).pipe(
      tap(a => console.log(a)),
      map(results => this.createCultureFilter(results[0], results[1])),
      switchMap(searchFilter => this.searchCultureItems$(searchFilter)),
    );
    const eventItems$ = combineLatest(
      this.dateRangeService.getSearchFilterRange$(), this.reloadTrigger,
    ).pipe(
      map(results => results[0]),
      switchMap(range => this.searchAstronomyEvents$(range)),
    );
    this.timelineData = combineLatest(cultureBedsItems$, eventItems$).pipe(
      map(items => [...items[0], ...items[1]]),
      publishReplay(1), refCount(),
    );

    this.timelineOptions = of({});

    this.dateRangeService.setDisplayRange(this.createInitialDateRange());
  }

  onDisplayRangeChanged(range: WsDateRange) {
    this.dateRangeService.setDisplayRange(range);
  }

  onItemMoving(event: TimelineItemMoveEvent) {
    const item = event.item;
    const callback = event.callback;

    if (event.culture != null && event.culturePhase != null) {
      this.timelineService.checkMovingItemGroup(item, event.culture, event.culturePhase.phaseType);
      callback(item);
    }
  }

  onItemMoved(event: TimelineItemMoveEvent) {
    const item = event.item;
    const callback = event.callback;
    if (event.culture == null) {
      callback(item);
      return;
    }
    const culture = event.culture;

    const startMoment = moment(item.start);
    const endMoment = moment(item.end);

    const startDateString: DateAsString = DateUtils.toIsoDateString(startMoment.toDate());
    const endDateString: DateAsString = DateUtils.toIsoDateString(endMoment.toDate());
    const dateRange: WsDateRange = {
      start: startDateString,
      end: endDateString,
    };

    let updatedBed$ = of(null);
    if (event.bed != null) {
      const cultureBedRef = event.culture.bedWsRef;
      if (cultureBedRef.id !== event.bed.id) {
        updatedBed$ = this.updateCultureBed(event.culture, event.bed.id);
      }
    }

    let updatePhases$ = of(null);
    if (event.culturePhase != null) {
      updatePhases$ = this.cultureClient.updateCulturePhase(event.culture.id, event.culturePhase.phaseType, dateRange);
    }
    const cultureUpdates$ = forkJoin(updatedBed$, updatePhases$);

    // Accept event directly
    callback(item);
    this.timelineData.pipe(
      take(1),
      tap(data => this.timelineService.setCultureSubgroupLoading(data, culture, true)),
      mergeMap(() => cultureUpdates$),
      mergeMap(() => this.timelineService.createCultureRefPhasesItems$({id: culture.id})),
      mergeMap(newItems => this.setTimelineNewItems$(newItems, culture)),
    ).subscribe(() => {
    }, error => {
      this.localizationService.getTranslation(MessageKeys.ERROR_UPDATING_CULTURE_TITLE)
        .subscribe(msg => this.notificationMessageService.addError(msg, error));
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

  private createBedFilter(tenantRef: WsRef<WsTenant>): WsBedFilter {
    return {
      tenantWsRef: tenantRef,
    };
  }

  private searchBedsGroups$(searchFilter: WsBedFilter) {
    const pagination: Pagination = {
      offset: 0,
      length: 100,
      sorts: [{
        field: WsBedSortField.NAME,
        order: WsSortOrder.ASC,
      }],
    };

    this.loadingBeds$.next(true);
    return this.bedClient.searchBeds(searchFilter, pagination).pipe(
      map(results => results.list),
      mergeMap(refList => this.timelineService.createTimelineGroups(refList, true)),
      tap(() => this.loadingBeds$.next(false)),
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

  private searchCultureItems$(searchFilter: WsCultureFilter): Observable<vis.DataItem[]> {
    const pagination: Pagination = {
      offset: 0,
      length: 100,
      sorts: [{
        field: WsCultureSortField.BED_OCCUPANCY_START_DATE,
        order: WsSortOrder.ASC,
      }],
    };
    this.loadingCultures$.next(true);
    return this.cultureClient.searchCultures(searchFilter, pagination).pipe(
      map(results => results.list),
      mergeMap(refList => this.timelineService.createCulturePhaseItems$(refList)),
      tap(() => this.loadingCultures$.next(false)),
    );
  }

  private searchAstronomyEvents$(range: WsDateRange): Observable<vis.DataItem[]> {
    const dayDuration = moment(range.end).diff(moment(range.start), 'days');

    const eventTypes = [
      AstronomyEventType.MOON_PHASE_CHANGE,
    ];
    const isShowingMoonZodiacs = dayDuration < this.maxRangeDayDurationForZodiacRendering;
    if (isShowingMoonZodiacs) {
      eventTypes.push(AstronomyEventType.MOON_ZODIAK_CHANGE);
    }
    const searchFilter: AstronomyEventFilter = {
      timePagination: {
        pageStartTime: DateUtils.toIsoLocalDateTimeString(range.start),
        pageDuration: dayDuration,
        pageDurationUnit: ChronoUnit.DAYS,
      },
      typeWhiteList: eventTypes,
    };

    this.loadingEvents$.next(true);
    return this.astronomyClient.searchEvents(searchFilter).pipe(
      mergeMap(events => this.timelineService.createAstronomyEventItems$(events, isShowingMoonZodiacs, range)),
      tap(() => this.loadingEvents$.next(false)),
    );
  }

  private setTimelineNewItems$(newItems: vis.DataItem[], culture: WsCulture) {
    return this.timelineData.pipe(
      map(data => this.timelineService.updateCultureSubggroupItems(data, newItems, culture)),
    );
  }
}
