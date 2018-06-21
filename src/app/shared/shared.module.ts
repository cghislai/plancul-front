import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BedComponent} from './bed/bed.component';
import {CropComponent} from './crop/crop.component';
import {IconsModule} from '../icons/icons.module';
import {CultureComponent} from './culture/culture.component';
import {CropFilterComponent} from './crop-filter/crop-filter.component';
import {ButtonModule, CheckboxModule, InputTextModule, SelectButtonModule} from 'primeng/primeng';
import {CropSearchQueryTypeComponent} from './crop-search-query-type/crop-search-query-type.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IconsModule,
    FormsModule,

    SelectButtonModule,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
  ],
  declarations: [
    BedComponent,
    CropComponent,
    CropFilterComponent,
    CropSearchQueryTypeComponent,
    CultureComponent,
  ],
  exports: [
    BedComponent,
    CropComponent,
    CropFilterComponent,
    CropSearchQueryTypeComponent,
    CultureComponent,
  ],
})
export class SharedModule {
}
