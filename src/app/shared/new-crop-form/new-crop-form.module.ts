import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NewCropFormComponent} from './new-crop-form.component';
import {FormsModule} from '@angular/forms';
import {AgrovocPlantProductTupleSelectModule} from '../agrovoc-plant-product-tuple-select/agrovoc-plant-product-tuple-select.module';
import {ButtonModule, InputTextModule} from 'primeng/primeng';

@NgModule({
  declarations: [NewCropFormComponent],
  exports: [NewCropFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgrovocPlantProductTupleSelectModule,
    InputTextModule,
    ButtonModule,
  ],
})
export class NewCropFormModule {
}
