import {Component, Input, OnInit} from '@angular/core';
import {CalendarDurationGroup} from '../domain/calendar-duration-group';
import {forkJoin, Observable} from 'rxjs';
import {CalendarEventType} from '../domain/calendar-event-type';
import {SelectItem} from 'primeng/api';
import {LocalizationService} from '../../main/service/localization.service';
import {map, publishReplay, refCount} from 'rxjs/operators';

@Component({
  selector: 'pc-calendar-group-row',
  templateUrl: './calendar-group-row.component.html',
  styleUrls: ['./calendar-group-row.component.scss'],
})
export class CalendarGroupRowComponent implements OnInit {

  @Input()
  group: CalendarDurationGroup;

  allEventsSelectItems$: Observable<SelectItem[]>;

  constructor(private localizationService: LocalizationService) {
  }

  ngOnInit() {
    const items$List = [
      CalendarEventType.SOWING_NURSERY,
      CalendarEventType.SOWING_DIRECT,
      CalendarEventType.TRANSPLATATION,
      CalendarEventType.BED_PREPARATION,
      CalendarEventType.HARVEST,
    ].map(eventType => this.createSelectItem$(eventType));
    this.allEventsSelectItems$ = forkJoin(items$List).pipe(
      publishReplay(1), refCount(),
    );
  }

  private createSelectItem$(eventType: CalendarEventType) {
    return this.localizationService.getCultureCalendarEventLabel(eventType).pipe(
      map(label => <SelectItem>{
        value: eventType,
        label: label,
      }),
    );
  }
}
