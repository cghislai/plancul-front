import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AgrovocPlantProductTupleSelectComponent} from './agrovoc-plant-product-tuple-select.component';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule} from 'primeng/primeng';

@NgModule({
  declarations: [AgrovocPlantProductTupleSelectComponent],
  exports: [AgrovocPlantProductTupleSelectComponent],
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
  ],
})
export class AgrovocPlantProductTupleSelectModule {
}
