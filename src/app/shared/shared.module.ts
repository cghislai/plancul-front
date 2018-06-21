import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BedComponent} from './bed/bed.component';
import {CropComponent} from './crop/crop.component';
import {IconsModule} from '../icons/icons.module';
import {CultureComponent} from './culture/culture.component';
import {CropFilterComponent} from './crop-filter/crop-filter.component';
import {AutoCompleteModule, ButtonModule, CheckboxModule, InputTextModule, SelectButtonModule} from 'primeng/primeng';
import {CropSearchQueryTypeComponent} from './crop-search-query-type/crop-search-query-type.component';
import {FormsModule} from '@angular/forms';
import {CropSelectComponent} from './crop-select/crop-select.component';
import {BedSelectComponent} from './bed-select/bed-select.component';

@NgModule({
  imports: [
    CommonModule,
    IconsModule,
    FormsModule,

    SelectButtonModule,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
    AutoCompleteModule,
  ],
  declarations: [
    BedComponent,
    BedSelectComponent,
    CropComponent,
    CropFilterComponent,
    CropSearchQueryTypeComponent,
    CropSelectComponent,
    CultureComponent,
  ],
  exports: [
    BedComponent,
    BedSelectComponent,
    CropComponent,
    CropFilterComponent,
    CropSearchQueryTypeComponent,
    CropSelectComponent,
    CultureComponent,
  ],
})
export class SharedModule {
}
