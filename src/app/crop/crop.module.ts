import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CropRoutingModule} from './crop-routing.module';
import {CropListComponent} from './crop-list/crop-list.component';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, CheckboxModule, DropdownModule, InputTextModule} from 'primeng/primeng';
import {DataViewModule} from 'primeng/dataview';
import {AgrovocPlantProductTupleSelectComponent} from './agrovoc-plant-product-tuple-select/agrovoc-plant-product-tuple-select.component';
import {NewCropFormComponent} from './new-crop-form/new-crop-form.component';
import {SharedModule} from '../shared/shared.module';
import {CropSortSelectComponent} from './crop-sort-select/crop-sort-select.component';

@NgModule({
  imports: [
    CommonModule,
    CropRoutingModule,
    FormsModule,

    SharedModule,

    InputTextModule,
    DataViewModule,
    CheckboxModule,
    AutoCompleteModule,
    DropdownModule,
  ],
  declarations: [
    CropListComponent,
    NewCropFormComponent,
    AgrovocPlantProductTupleSelectComponent,
    CropSortSelectComponent],
})
export class CropModule {
}
