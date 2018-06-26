import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CultureRoutingModule} from './culture-routing.module';
import {CultureFilterComponent} from './culture-filter/culture-filter.component';
import {CultureFormComponent} from './culture-form/culture-form.component';
import {CultureListComponent} from './culture-list/culture-list.component';
import {CultureSortSelectComponent} from './culture-sort-select/culture-sort-select.component';
import {ButtonModule, CheckboxModule, DropdownModule, EditorModule, InputTextModule, MessagesModule, SpinnerModule} from 'primeng/primeng';
import {SharedModule} from '../shared/shared.module';
import {DataViewModule} from 'primeng/dataview';
import {FormsModule} from '@angular/forms';
import {IconsModule} from '../icons/icons.module';

@NgModule({
  imports: [
    CommonModule,
    CultureRoutingModule,
    FormsModule,

    SharedModule,
    IconsModule,

    InputTextModule,
    DataViewModule,
    ButtonModule,
    DropdownModule,
    EditorModule,
    SpinnerModule,
    CheckboxModule,
    MessagesModule,
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
