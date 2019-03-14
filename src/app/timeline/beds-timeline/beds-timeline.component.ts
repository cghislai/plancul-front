import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, forkJoin, merge, Observable, of, pipe, ReplaySubject, Subject} from 'rxjs';
import * as vis from 'vis';
import moment from 'moment-es6';
import {DateUtils} from '../../main/service/util/date-utils';
import {BedClientService} from '../../main/service/bed-client.service';
import {
  DateAsString,
  WsBed,
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
import {delay, filter, map, mergeMap, publishReplay, refCount, switchMap, take, tap} from 'rxjs/operators';
import {TimelineService} from './service/timeline.service';
import {Pagination} from '../../main/domain/pagination';
import {CultureClientService} from '../../main/service/culture-client.service';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {LocalizationService} from '../../main/service/localization.service';
import {MessageKeys} from '../../main/service/util/message-keys';
import {TimelineGroupService} from './service/timeline-group.service';
import {TimelineItemService} from './service/timeline-item.service';
import {TimelineDateRangeService} from './service/timeline-date-range.service';
import {AstronomyEvent, AstronomyEventFilter, AstronomyEventType, ChronoUnit} from '@charlyghislain/astronomy-api';
import {AstronomyClientService} from '../astronomy-client.service';
import {TimelineItemMoveEvent} from '../timeline/domain/timeline-item-move-event';
import {CulturePhaseDataItem} from '../timeline/domain/culture-phase-data-item';
import {TimelineBackgroundClickEvent} from '../timeline/domain/timeline-background-click-event';
import {NurseryDataGroup} from '../timeline/domain/nursery-data-group';
import {BedDataGroup} from '../timeline/domain/bed-data-group';

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

  editingCulture: WsCulture = null;

  private cultureItems$: Observable<CulturePhaseDataItem[]>;
  private cultureDataItemsUpdates$ = new Subject<CulturePhaseDataItem[]>();
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

    const fetchedCultureItems$ = combineLatest(
      tenantRef, this.dateRangeService.getSearchFilterRange$(), this.reloadTrigger,
    ).pipe(
      map(results => this.createCultureFilter(results[0], results[1])),
      switchMap(searchFilter => this.searchCultureItems$(searchFilter)),
    );
    this.cultureItems$ = merge(fetchedCultureItems$, this.cultureDataItemsUpdates$).pipe(
      publishReplay(1), refCount(),
    );
    const events$ = combineLatest(
      this.dateRangeService.getSearchFilterRange$(), this.reloadTrigger,
    ).pipe(
      switchMap(results => this.searchAstronomyEvents$(results[0])),
    );
    const eventItems$ = combineLatest(events$, this.dateRangeService.getDisplayedRange$()).pipe(
      switchMap(results => this.createAstronomyEventItems$(results[0], results[1])),
    );
    this.timelineData = combineLatest(this.cultureItems$, eventItems$).pipe(
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
    const cultureRef = {id: culture.id};

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
    this.cultureItems$.pipe(
      take(1),
      tap(data => this.setCultureSubgroupLoading(data, cultureRef)),
      mergeMap(() => cultureUpdates$),
      mergeMap(() => this.timelineService.createCultureRefPhasesItems$(cultureRef)),
      mergeMap(newItems => this.setTimelineNewItems$(newItems, cultureRef)),
    ).subscribe(() => {
    }, error => {
      this.localizationService.getTranslation(MessageKeys.ERROR_UPDATING_CULTURE_TITLE)
        .subscribe(msg => this.notificationMessageService.addError(msg, error));
      this.reloadTrigger.next(true);
    });
  }


  onBackgroundClick(event: TimelineBackgroundClickEvent) {
    const time = event.time;
    const bedRefOptional$ = this.getGroupBedRef$(event.groupId);
    const nursery = event.groupId === NurseryDataGroup.getGroupId();
    const tenantRef$ = this.selectedTenantService.getSelectedTenantRef();
    combineLatest(bedRefOptional$, tenantRef$).pipe(
      take(1),
      map(results => this.createNewCulture(results[1], results[0], time, nursery)),
    ).subscribe(culture => this.editingCulture = culture);

  }


  onEditingCultureSave(culture: WsCulture) {
    this.editingCulture = null;
    this.cultureClient.saveCulture(culture).subscribe(
      ref => this.onNewCultureSaveSuccess(ref),
      error => this.onNewCultureSaveError(error),
    );
  }

  onEditingCultureClose() {
    this.editingCulture = null;
  }

  onEditingCultureVisibilityChange(visible: boolean) {
    if (!visible) {
      this.editingCulture = null;
    }
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

  private searchCultureItems$(searchFilter: WsCultureFilter): Observable<CulturePhaseDataItem[]> {
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

  private searchAstronomyEvents$(searchRange: WsDateRange): Observable<AstronomyEvent[]> {
    const dayDuration = moment(searchRange.end).diff(moment(searchRange.start), 'days');

    const eventTypes = [
      AstronomyEventType.MOON_PHASE_CHANGE,
      AstronomyEventType.MOON_ZODIAK_CHANGE,
    ];
    const searchFilter: AstronomyEventFilter = {
      timePagination: {
        pageStartTime: DateUtils.toIsoLocalDateTimeString(searchRange.start),
        pageDuration: dayDuration,
        pageDurationUnit: ChronoUnit.DAYS,
      },
      typeWhiteList: eventTypes,
    };

    this.loadingEvents$.next(true);
    return this.astronomyClient.searchEvents(searchFilter).pipe(
      tap(() => this.loadingEvents$.next(false)),
    );
  }

  private createAstronomyEventItems$(events: AstronomyEvent[], displayRange: WsDateRange) {
    const dayDuration = moment(displayRange.end).diff(moment(displayRange.start), 'days');
    const isShowingMoonZodiacs = dayDuration < this.maxRangeDayDurationForZodiacRendering;
    return this.timelineService.createAstronomyEventItems$(events, isShowingMoonZodiacs, displayRange);

  }

  private setCultureSubgroupLoading(data, cultureRef) {
    const newData = this.timelineService.setCultureSubgroupLoading(data, cultureRef);
    this.cultureDataItemsUpdates$.next(newData);
  }

  private setTimelineNewItems$(newItems: CulturePhaseDataItem[], cultureRef: WsRef<WsCulture>) {
    return this.cultureItems$.pipe(
      take(1),
      map(data => this.timelineService.updateCultureSubgroupItems(data, newItems, cultureRef)),
      tap(newData => this.cultureDataItemsUpdates$.next(newData)),
    );
  }

  private getGroupBedRef$(groupId: string): Observable<WsRef<WsBed> | WsBed> {
    if (BedDataGroup.isBedGroup(groupId)) {
      return this.timelineGroups.pipe(
        take(1),
        map(groups => groups.get(groupId)),
        map(group => group as BedDataGroup),
        map(group => group.bed),
      );
    } else {
      return of(null);
    }
  }

  private createNewCulture(tenantRef: WsRef<WsTenant>, bedRef: WsBed | WsRef<WsBed> | null, time: moment.MomentInput, nursery: boolean) {
    const culture: WsCulture = <WsCulture>{
      tenantWsRef: tenantRef,
      bedWsRef: bedRef == null ? null : {id: bedRef.id},
      sowingDate: DateUtils.toIsoDateString(time),
    };
    if (nursery) {
      culture.cultureNursing = {
        dayDuration: 14,
        startDate: DateUtils.toIsoDateString(time),
        endDate: DateUtils.toIsoDateString(moment(time).add(14, 'day')),
      };
    }
    return culture;
  }

  private onNewCultureSaveSuccess(ref: WsRef<WsCulture>) {
    const newItems$ = this.timelineService.createCultureRefPhasesItems$(ref);
    combineLatest(this.cultureItems$, newItems$).pipe(
      take(1),
      map(itemLists => this.timelineService.updateCultureSubgroupItems(itemLists[0], itemLists[1], ref)),
    ).subscribe(newData => this.cultureDataItemsUpdates$.next(newData));
  }

  private onNewCultureSaveError(error: any) {
    this.notificationMessageService.addError(`Could not save new culture`, error);
    this.reloadTrigger.next(true);
  }
}
