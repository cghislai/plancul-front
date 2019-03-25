import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {CalendarDurationGroup} from '../domain/calendar-duration-group';
import {filter, map, publishReplay, refCount, switchMap, take, throttleTime} from 'rxjs/operators';
import {CultureCalendarService} from '../culture-calendar-service';
import {GroupingType} from '../domain/grouping-type';
import * as moment from 'moment';
import {DateAsString, WsCultureFilter, WsRef, WsTenant} from '@charlyghislain/plancul-api';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {DateUtils} from '../../main/service/util/date-utils';
import {ContentScrollService} from '../../main/service/content-scroll-service';
import {ScrollEvent} from '../../main/domain/scroll-event';

@Component({
  selector: 'pc-culture-calendar',
  templateUrl: './culture-calendar.component.html',
  styleUrls: ['./culture-calendar.component.scss'],
})
export class CultureCalendarComponent implements OnInit {

  groups: CalendarDurationGroup[] = [];
  groupingType = GroupingType.WEEK;
  startDateString: DateAsString;

  loading$ = new BehaviorSubject<boolean>(false);

  baseCultureFilter$: Observable<WsCultureFilter>;

  private subscription: Subscription;

  constructor(private calendarService: CultureCalendarService,
              private scrollService: ContentScrollService,
              private selectedTenantService: SelectedTenantService) {
  }

  ngOnInit() {
    this.startDateString = DateUtils.toIsoDateString(moment());
    this.baseCultureFilter$ = this.selectedTenantService.getSelectedTenantRef().pipe(
      map(tenant => this.createCultureFilter(tenant)),
      publishReplay(1), refCount(),
    );
    this.loadNextPage();

    this.subscription = this.scrollService.getScrollEvents$().pipe(
      filter(e => !this.loading$.getValue()),
      filter(e => this.hasReachedBottom(e)),
    ).subscribe(() => this.loadNextPage());
  }

  loadNextPage() {
    if (this.loading$.getValue()) {
      return;
    }
    this.loading$.next(true);
    const pageStart = this.getPageStart(this.groups);
    const snappedPageStart = this.calendarService.snapDate(pageStart, this.groupingType);

    this.baseCultureFilter$.pipe(
      take(1),
      switchMap(cultureFilter => this.calendarService.searchCultureEvents$(cultureFilter, snappedPageStart, this.groupingType)),
    ).subscribe(groups => {
      this.groups = [...this.groups, ...groups];
      this.loading$.next(false);
    });
  }

  trackByStartDate(index: number, group: CalendarDurationGroup): string {
    return group.start.toISOString();
  }

  onGroupingTypeChanged(groupingType: GroupingType) {
    this.groupingType = groupingType;
    this.groups = [];
    this.loadNextPage();
  }


  onStartDateChanged(startDate: DateAsString) {
    this.startDateString = startDate;
    this.groups = [];
    this.loadNextPage();
  }

  private getPageStart(groups: CalendarDurationGroup[]) {
    if (groups == null || groups.length === 0) {
      return moment(this.startDateString);
    }
    const lastGroup = groups[groups.length - 1];
    return lastGroup.end;
  }

  private createCultureFilter(ref: WsRef<WsTenant>): WsCultureFilter {
    return {
      tenantWsRef: ref,
    };
  }

  private hasReachedBottom(event: ScrollEvent) {
    const max = event.element.scrollHeight;
    return event.top + 100 > max;
  }
}
