import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import {CropRoutingModule} from './crop-routing.module';
import {CropListComponent} from './crop-list/crop-list.component';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, ButtonModule, CheckboxModule, DropdownModule, InputTextModule} from 'primeng/primeng';
import {DataViewModule} from 'primeng/dataview';
import {SharedModule} from '../shared/shared.module';
import {CropSortSelectComponent} from './crop-sort-select/crop-sort-select.component';
import {NewCropFormModule} from '../shared/new-crop-form/new-crop-form.module';
import {NewCropRouteComponent} from './new-crop-route/new-crop-route.component';

@NgModule({
  imports: [
    CommonModule,
    CropRoutingModule,
    FormsModule,
    TranslateModule.forChild(),

    SharedModule,
    NewCropFormModule,

    InputTextModule,
    DataViewModule,
    CheckboxModule,
    AutoCompleteModule,
    DropdownModule,
    ButtonModule,
  ],
  declarations: [
    CropListComponent,
    NewCropRouteComponent,
    CropSortSelectComponent,
  ],
})
export class CropModule {
}
