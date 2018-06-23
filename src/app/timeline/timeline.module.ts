import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TimelineComponent} from './timeline/timeline.component';
import {BedsTimelineComponent} from './beds-timeline/beds-timeline.component';
import {TimelineRoutingModule} from './timeline-routing.module';

@NgModule({
  imports: [
    CommonModule,
    TimelineRoutingModule,
  ],
  declarations: [
    TimelineComponent,
    BedsTimelineComponent,
  ],
  exports: [],
})
export class TimelineModule {
}
