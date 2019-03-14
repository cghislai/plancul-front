import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CalendarRoutingModule} from './calendar-routing.module';
import {CultureCalendarComponent} from './culture-calendar/culture-calendar.component';
import {CalendarGroupRowComponent} from './calendar-group-row/calendar-group-row.component';
import {CalendarEventComponent} from './calendar-event/calendar-event.component';
import {SharedModule} from '../shared/shared.module';
import {ProgressSpinnerModule} from 'primeng/primeng';

@NgModule({
  declarations: [CultureCalendarComponent, CalendarGroupRowComponent, CalendarEventComponent],
  imports: [
    CommonModule,
    CalendarRoutingModule,

    SharedModule,

    ProgressSpinnerModule,
  ],
})
export class CalendarModule {
}
