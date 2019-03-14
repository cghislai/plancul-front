import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CultureCalendarComponent} from './culture-calendar/culture-calendar.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '_/culture',
    pathMatch: 'full',
  },
  {
    path: '_',
    children: [
      {
        path: 'culture',
        component: CultureCalendarComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarRoutingModule {
}
