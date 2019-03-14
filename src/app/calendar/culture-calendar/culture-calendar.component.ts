import {Component, HostListener, OnInit} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {CalendarDurationGroup} from '../domain/calendar-duration-group';
import {map, publishReplay, refCount, switchMap, take} from 'rxjs/operators';
import {CultureCalendarService} from '../culture-calendar-service';
import {GroupingType} from '../domain/grouping-type';
import * as moment from 'moment';
import {WsCultureFilter, WsRef, WsTenant} from '@charlyghislain/plancul-api';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';

@Component({
  selector: 'pc-culture-calendar',
  templateUrl: './culture-calendar.component.html',
  styleUrls: ['./culture-calendar.component.scss'],
})
export class CultureCalendarComponent implements OnInit {

  groups: CalendarDurationGroup[] = [];
  groupingType = GroupingType.WEEK;

  loading$ = new BehaviorSubject<boolean>(false);

  baseCultureFilter$: Observable<WsCultureFilter>;


  constructor(private calendarService: CultureCalendarService,
              private selectedTenantService: SelectedTenantService) {
  }

  ngOnInit() {
    this.baseCultureFilter$ = this.selectedTenantService.getSelectedTenantRef().pipe(
      map(tenant => this.createCultureFilter(tenant)),
      publishReplay(1), refCount(),
    );
    this.loadNextPage();
  }

  loadNextPage() {
    if (this.loading$.getValue()) {
      return;
    }
    this.loading$.next(true);
    const pageStart = this.getPageStart(this.groups);
    const snappedPageStart = this.calendarService.snapDate(pageStart, this.groupingType);
    console.log('loading from ' + pageStart.toISOString());

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

  onScroll(event: any) {
    // In chrome and some browser scroll is given to body tag
    const element = event.target;
    const pos = (element.scrollTop || document.body.scrollTop) + element.offsetHeight;
    const max = element.scrollHeight;
// pos/max will give you the distance between scroll bottom and and bottom of screen in percentage.
    if (pos + 100 > max && this.loading$.getValue() === false) {
      this.loadNextPage();
    }
  }

  private getPageStart(groups: CalendarDurationGroup[]) {
    if (groups == null || groups.length === 0) {
      return moment();
    }
    const lastGroup = groups[groups.length - 1];
    return lastGroup.end;
  }

  private createCultureFilter(ref: WsRef<WsTenant>): WsCultureFilter {
    return {
      tenantWsRef: ref,
    };
  }
}
