import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BedsTimelineComponent} from './beds-timeline/beds-timeline.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '_/beds',
    pathMatch: 'full',
  },
  {
    path: '_',
    children: [
      {
        path: 'beds',
        component: BedsTimelineComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimelineRoutingModule {
}
