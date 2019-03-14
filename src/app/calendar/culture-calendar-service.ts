import {Injectable} from '@angular/core';
import {WsBedPreparation, WsCulture, WsCultureFilter, WsSearchResult} from '@charlyghislain/plancul-api';
import {forkJoin, Observable, of} from 'rxjs';
import * as moment from 'moment';
import {GroupingType} from './domain/grouping-type';
import {CalendarDurationGroup} from './domain/calendar-duration-group';
import {DateUtils} from '../main/service/util/date-utils';
import {CultureClientService} from '../main/service/culture-client.service';
import {Pagination} from '../main/domain/pagination';
import {map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {CalendarEvents} from './domain/calendar-events';
import {CalendarEvent} from './domain/calendar-event';
import {CalendarEventType} from './domain/calendar-event-type';
import {SelectItem} from 'primeng/api';
import {LocalizationService} from '../main/service/localization.service';

@Injectable({
  providedIn: 'root',
})
export class CultureCalendarService {

  constructor(private cultureClient: CultureClientService,
              private localizationService: LocalizationService) {
  }

  searchCultureEvents$(filter: WsCultureFilter, startTime: moment.Moment, groupingType: GroupingType): Observable<CalendarDurationGroup[]> {
    const pageStart = this.snapDate(startTime, groupingType);
    const pageEnd = this.getPageEndDate(pageStart, groupingType);
    filter.endDate = {
      notBefore: DateUtils.toIsoDateString(pageStart),
    };
    filter.startDate = {
      notAfter: DateUtils.toIsoDateString(pageEnd),
    };

    const pagination: Pagination = {
      offset: 0,
      length: 100000,
      sorts: [],
    };
    return this.cultureClient.searchCultures(filter, pagination).pipe(
      switchMap(results => this.fetchCultureEvents$(results, pageStart, pageEnd, groupingType)),
    );
  }

  snapDate(startTime: moment.MomentInput, groupingType: GroupingType) {
    switch (groupingType) {
      case GroupingType.DAY:
        return moment(startTime).startOf('day');
      case GroupingType.WEEK:
        return moment(startTime).startOf('week');
      case GroupingType.MONTH:
        return moment(startTime).startOf('month');
    }
    return moment(startTime);
  }

  createGroupingTypeSelectItems$(): Observable<SelectItem[]> {
    const item$List = [GroupingType.DAY, GroupingType.WEEK, GroupingType.MONTH]
      .map(type => this.createGroupingTypeSelectItem$(type));
    return forkJoin(item$List);
  }

  createEventTypeSelectItems(): Observable<SelectItem[]> {
    const items$List = [
      CalendarEventType.SOWING_NURSERY,
      CalendarEventType.SOWING_DIRECT,
      CalendarEventType.TRANSPLATATION,
      CalendarEventType.BED_PREPARATION,
      CalendarEventType.HARVEST,
    ].map(eventType => this.createEventTypeSelectItem$(eventType));
    return forkJoin(items$List);
  }

  private getPageEndDate(startTime: moment.Moment, groupingType: GroupingType) {
    switch (groupingType) {
      case GroupingType.DAY: {
        return startTime.clone().add(90, 'days');
      }
      case GroupingType.WEEK: {
        return startTime.clone().add(15, 'weeks');
      }
      case GroupingType.MONTH: {
        return startTime.clone().add(6, 'months');
      }
    }
    throw new Error(`Unhandled grouping type: ` + groupingType);
  }

  private getGroupEndDate(startTime: moment.Moment, groupingType: GroupingType) {
    switch (groupingType) {
      case GroupingType.DAY: {
        return startTime.clone().add(1, 'days');
      }
      case GroupingType.WEEK: {
        return startTime.clone().add(1, 'weeks');
      }
      case GroupingType.MONTH: {
        return startTime.clone().add(1, 'months');
      }
    }
    throw new Error(`Unhandled grouping type: ` + groupingType);
  }

  private getGroupLabel(startTime: moment.Moment, groupingType: GroupingType): string {
    switch (groupingType) {
      case GroupingType.DAY: {
        return `${startTime.format('DD')}`;
      }
      case GroupingType.WEEK: {
        return `${startTime.format('ww')}`;
      }
      case GroupingType.MONTH: {
        return `${startTime.format('MM')}`;
      }
    }
    throw new Error(`Unhandled grouping type: ` + groupingType);
  }

  private fetchCultureEvents$(results: WsSearchResult<WsCulture>, pageStart: moment.Moment, pageEnd: moment.Moment, groupingType: GroupingType): Observable<CalendarDurationGroup[]> {
    const cultures$List = results.list.map(ref => this.cultureClient.getCulture(ref.id));
    const cultures$ = cultures$List.length === 0 ? of([]) : forkJoin(cultures$List);
    return cultures$.pipe(
      map(cultures => this.createCalendarGroups(cultures, pageStart, pageEnd, groupingType)),
    );
  }

  private createCalendarGroups(cultureList: WsCulture[], pageStart: moment.Moment, pageEnd: moment.Moment, groupingType: GroupingType): CalendarDurationGroup[] {
    let curTime = pageStart.clone();
    const groups = [];

    while (curTime.isBefore(pageEnd)) {
      const calendarDurationGroup = this.createCalendarDurationGroup(curTime, groupingType);
      const events = this.findEventItems(calendarDurationGroup.start, calendarDurationGroup.end, cultureList);
      calendarDurationGroup.items = events;

      groups.push(calendarDurationGroup);
      const groupEnd = this.getGroupEndDate(curTime, groupingType);
      curTime = groupEnd;
      continue;
    }
    return groups;
  }

  private createCalendarDurationGroup(curTime: moment.Moment, groupingType: GroupingType): CalendarDurationGroup {
    const group: CalendarDurationGroup = {
      start: curTime,
      end: this.getGroupEndDate(curTime, groupingType),
      label: this.getGroupLabel(curTime, groupingType),
      items: {},
      groupingType: groupingType,
    };
    return group;
  }

  private findEventItems(start: moment.Moment, end: moment.Moment, cultures: WsCulture[]): CalendarEvents {
    const calendarEvents: CalendarEvents = {};

    for (const culture of cultures) {
      const eventList = this.findCultureEvents(culture, start, end);
      for (const event of eventList) {
        this.appendEvent(calendarEvents, event);
      }
    }

    return calendarEvents;
  }

  private findCultureEvents(culture: WsCulture, start: moment.Moment, end: moment.Moment) {
    const events: CalendarEvent[] = [];

    const sowingDate = moment(culture.sowingDate);
    if (!sowingDate.isBefore(start) && sowingDate.isBefore(end)) {
      const nursery = culture.cultureNursing != null;
      const eventType: CalendarEventType = nursery ? CalendarEventType.SOWING_NURSERY : CalendarEventType.SOWING_DIRECT;
      const event: CalendarEvent = {
        type: eventType,
        date: sowingDate,
        cultureRef: {id: culture.id},
        data: culture,
      };
      events.push(event);
    }

    if (culture.bedPreparation != null) {
      const bedPreparationStartDate = moment(culture.bedPreparation.startDate);
      if (!bedPreparationStartDate.isBefore(start) && bedPreparationStartDate.isBefore(end)) {
        const event: CalendarEvent<WsBedPreparation> = {
          type: CalendarEventType.BED_PREPARATION,
          date: bedPreparationStartDate,
          cultureRef: {id: culture.id},
          data: culture.bedPreparation,
        };
        events.push(event);
      }
    }

    if (culture.cultureNursing != null) {
      const transplantationTime = moment(culture.cultureNursing.endDate);
      if (!transplantationTime.isBefore(start) && transplantationTime.isBefore(end)) {
        const event: CalendarEvent = {
          type: CalendarEventType.TRANSPLATATION,
          date: transplantationTime,
          cultureRef: {id: culture.id},
          data: culture.cultureNursing,
        };
        events.push(event);
      }
    }
    const firstHarvest = moment(culture.firstHarvestDate);
    const lastHarvest = moment(culture.firstHarvestDate);
    if (!firstHarvest.isAfter(start) && !lastHarvest.isAfter(end)) {
      const event: CalendarEvent = {
        type: CalendarEventType.HARVEST,
        date: start,
        cultureRef: {id: culture.id},
        data: culture,
      };
      events.push(event);
    }

    return events;
  }

  private appendEvent(caledarEvents: CalendarEvents, event: CalendarEvent) {
    let eventList = caledarEvents[event.type];
    if (eventList == null) {
      eventList = [];
      caledarEvents[event.type] = eventList;
    }
    eventList.push(event);
  }

  private createGroupingTypeSelectItem$(type: GroupingType) {
    return this.localizationService.getCultureCalendarGroupingTypeLabel(type).pipe(
      map(label => <SelectItem>{
        value: type,
        label: label,
      }),
    );
  }

  private createEventTypeSelectItem$(eventType: CalendarEventType) {
    return this.localizationService.getCultureCalendarEventLabel(eventType).pipe(
      map(label => <SelectItem>{
        value: eventType,
        label: label,
      }),
    );
  }
}
