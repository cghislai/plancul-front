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
} from '@charlyghislain/plancul-ws-api';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {filter, map, publishReplay, refCount, switchMap, take} from 'rxjs/operators';
import {TimelineService} from '../service/timeline.service';
import {Pagination} from '../../main/domain/pagination';
import {CultureClientService} from '../../main/service/culture-client.service';
import {TimelineItemCallbackHandler} from '../timeline/timeline-item-callback-handler';

@Component({
  selector: 'pc-beds-timeline',
  templateUrl: './beds-timeline.component.html',
  styleUrls: ['./beds-timeline.component.scss'],
})
export class BedsTimelineComponent implements OnInit {

  timelineData: Observable<vis.DataItem[]>;
  timelineGroups: Observable<vis.DataGroup[]>;
  timelineOptions: Observable<vis.Options>;

  private dateRangeSource = new BehaviorSubject<WsDateRange>(this.createInitialDateRange());
  private bedFilterSource = new ReplaySubject<WsBedFilter>(1);
  private cultureFilter: Observable<WsCultureFilter>;
  private reloadTrigger = new BehaviorSubject<any>(true);

  constructor(private bedClient: BedClientService,
              private cultureClient: CultureClientService,
              private selectedTenantService: SelectedTenantService,
              private timelineService: TimelineService,
  ) {
  }

  ngOnInit() {
    this.createInitialBedFilter();

    const tenantRef = this.selectedTenantService.getSelectedTenantRef()
      .pipe(
        filter(ref => ref != null),
        publishReplay(1), refCount(),
      );

    this.cultureFilter = combineLatest(tenantRef, this.dateRangeSource)
      .pipe(
        map(results => this.createCultureFilter(results[0], results[1])),
        publishReplay(1), refCount(),
      );

    this.timelineGroups = this.bedFilterSource.pipe(
      switchMap(searchFilter => this.searchBedsGroups(searchFilter)),
      publishReplay(1), refCount(),
    );
    this.timelineData = combineLatest(this.cultureFilter, this.reloadTrigger)
      .pipe(
        map(results => results[0]),
        switchMap(searchFilter => this.searchCultureRefs(searchFilter)),
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
    const bedId = <number>event.item.group;

    const startMoment = moment(item.start);
    const endMoment = moment(item.end);

    const startDateString: DateAsString = DateUtils.toIsoDateString(startMoment.toDate());
    const endDateString: DateAsString = DateUtils.toIsoDateString(endMoment.toDate());
    const dateRange: WsDateRange = {
      start: startDateString,
      end: endDateString,
    };

    this.cultureClient.updateCulturePhase(cultureId, phaseType, dateRange)
      .pipe(
        switchMap(ref => this.cultureClient.fetchCulture(ref.id)),
        switchMap(culture => this.setCultureBed(culture, bedId)),
      )
      .subscribe(ref => {
        callback(item);
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
        switchMap(refList => this.timelineService.createBedGroups(refList)),
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

  private setCultureBed(culture: WsCulture, bedId: number) {
    if (bedId == null || typeof bedId !== 'number') {
      return of({id: culture.id});
    }
    const updatedCulture = Object.assign({}, culture, <Partial<WsCulture>>{
      bedWsRef: {id: bedId},
    });
    return this.cultureClient.updateCulture(updatedCulture);
  }
}
