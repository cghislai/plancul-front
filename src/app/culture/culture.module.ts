import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CultureRoutingModule} from './culture-routing.module';
import {CultureFilterComponent} from './culture-filter/culture-filter.component';
import {CultureFormComponent} from './culture-form/culture-form.component';
import {CultureListComponent} from './culture-list/culture-list.component';
import {CultureSortSelectComponent} from './culture-sort-select/culture-sort-select.component';
import {ButtonModule, DropdownModule, InputTextModule} from 'primeng/primeng';
import {SharedModule} from '../shared/shared.module';
import {DataViewModule} from 'primeng/dataview';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    CultureRoutingModule,
    FormsModule,

    SharedModule,

    InputTextModule,
    DataViewModule,
    ButtonModule,
    DropdownModule,
  ],
  declarations: [
    CultureFilterComponent,
    CultureFormComponent,
    CultureListComponent,
    CultureSortSelectComponent,
  ],
})
export class CultureModule {
}
