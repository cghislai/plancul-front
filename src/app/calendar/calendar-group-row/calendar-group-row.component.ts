import {Component, Input, OnInit} from '@angular/core';
import {CalendarDurationGroup} from '../domain/calendar-duration-group';
import {Observable} from 'rxjs';
import {SelectItem} from 'primeng/api';
import {publishReplay, refCount} from 'rxjs/operators';
import {CultureCalendarService} from '../culture-calendar-service';

@Component({
  selector: 'pc-calendar-group-row',
  templateUrl: './calendar-group-row.component.html',
  styleUrls: ['./calendar-group-row.component.scss'],
})
export class CalendarGroupRowComponent implements OnInit {

  @Input()
  group: CalendarDurationGroup;

  allEventsSelectItems$: Observable<SelectItem[]>;

  constructor(private calendarService: CultureCalendarService) {
  }

  ngOnInit() {
    this.allEventsSelectItems$ = this.calendarService.createEventTypeSelectItems().pipe(
      publishReplay(1), refCount(),
    );

  }

}
