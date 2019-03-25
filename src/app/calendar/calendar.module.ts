import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CalendarRoutingModule} from './calendar-routing.module';
import {CultureCalendarComponent} from './culture-calendar/culture-calendar.component';
import {CalendarGroupRowComponent} from './calendar-group-row/calendar-group-row.component';
import {CalendarEventComponent} from './calendar-event/calendar-event.component';
import {SharedModule} from '../shared/shared.module';
import {ProgressSpinnerModule, SelectButtonModule} from 'primeng/primeng';
import {GroupingTypeSelectComponent} from './grouping-type-select/grouping-type-select.component';
import {FormsModule} from '@angular/forms';
import {IconsModule} from '../icons/icons.module';

@NgModule({
  declarations: [CultureCalendarComponent, CalendarGroupRowComponent, CalendarEventComponent, GroupingTypeSelectComponent],
  imports: [
    CommonModule,
    CalendarRoutingModule,
    FormsModule,

    SharedModule,
    IconsModule,

    ProgressSpinnerModule,
    SelectButtonModule,
  ],
})
export class CalendarModule {
}
