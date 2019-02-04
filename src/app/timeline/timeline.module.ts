import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TimelineComponent} from './timeline/timeline.component';
import {BedsTimelineComponent} from './beds-timeline/beds-timeline.component';
import {TimelineRoutingModule} from './timeline-routing.module';
import {DialogModule} from 'primeng/dialog';
import {CultureStepsFormModule} from '../shared/culture-steps-form/culture-steps-form.module';

@NgModule({
  imports: [
    CommonModule,
    TimelineRoutingModule,


    DialogModule,
    CultureStepsFormModule,
  ],
  declarations: [
    TimelineComponent,
    BedsTimelineComponent,
  ],
  exports: [],
})
export class TimelineModule {
}
