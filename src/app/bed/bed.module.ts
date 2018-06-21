import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {BedRoutingModule} from './bed-routing.module';
import {BedListComponent} from './bed-list/bed-list.component';
import {BedFilterComponent} from './bed-filter/bed-filter.component';
import {BedFormComponent} from './bed-form/bed-form.component';
import {FormsModule} from '@angular/forms';
import {ButtonModule, InputTextModule} from 'primeng/primeng';
import {DataViewModule} from 'primeng/dataview';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    BedRoutingModule,
    FormsModule,

    SharedModule,

    InputTextModule,
    DataViewModule,
    ButtonModule,
  ],
  declarations: [BedListComponent, BedFilterComponent, BedFormComponent],
})
export class BedModule {
}
