import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {BedRoutingModule} from './bed-routing.module';
import {BedListComponent} from './bed-list/bed-list.component';
import {BedFilterComponent} from './bed-filter/bed-filter.component';
import {BedFormComponent} from './bed-form/bed-form.component';
import {FormsModule} from '@angular/forms';
import {ButtonModule, DropdownModule, InputTextModule, SpinnerModule} from 'primeng/primeng';
import {DataViewModule} from 'primeng/dataview';
import {SharedModule} from '../shared/shared.module';
import {BedSortSelectComponent} from './bed-sort-select/bed-sort-select.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    BedRoutingModule,
    FormsModule,
    TranslateModule.forChild(),

    SharedModule,

    InputTextModule,
    DataViewModule,
    ButtonModule,
    DropdownModule,
    SpinnerModule,
  ],
  declarations: [BedListComponent, BedFilterComponent, BedFormComponent, BedSortSelectComponent],
})
export class BedModule {
}
