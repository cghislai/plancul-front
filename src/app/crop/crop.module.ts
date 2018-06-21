import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CropRoutingModule} from './crop-routing.module';
import {CropListComponent} from './crop-list/crop-list.component';
import {CropFilterComponent} from './crop-filter/crop-filter.component';
import {CropSearchQueryTypeComponent} from './crop-search-query-type/crop-search-query-type.component';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, ButtonModule, CheckboxModule, InputTextModule, SelectButtonModule} from 'primeng/primeng';
import {DataViewModule} from 'primeng/dataview';
import {AgrovocPlantProductTupleSelectComponent} from './agrovoc-plant-product-tuple-select/agrovoc-plant-product-tuple-select.component';
import {NewCropFormComponent} from './new-crop-form/new-crop-form.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    CropRoutingModule,
    FormsModule,

    SharedModule,

    InputTextModule,
    SelectButtonModule,
    CheckboxModule,
    DataViewModule,
    ButtonModule,
    AutoCompleteModule,
  ],
  declarations: [
    CropListComponent,
    CropFilterComponent,
    CropSearchQueryTypeComponent,
    NewCropFormComponent,
    AgrovocPlantProductTupleSelectComponent],
})
export class CropModule {
}
