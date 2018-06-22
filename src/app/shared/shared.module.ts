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
import {DateSelectComponent} from './date-select/date-select.component';
import {DateRangeSelectComponent} from './date-range-select/date-range-select.component';
import {BedPreparationTypeComponent} from './bed-preparation-type/bed-preparation-type.component';
import {BedPreparationTypeSelectComponent} from './bed-preparation-type-select/bed-preparation-type-select.component';
import {TemplateVarDirective} from './util/template-var-directive';
import { ValidationErrorsComponent } from './validation-errors/validation-errors.component';

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
    DateSelectComponent,
    DateRangeSelectComponent,
    BedPreparationTypeComponent,
    BedPreparationTypeSelectComponent,
    ValidationErrorsComponent,

    TemplateVarDirective,

  ],
  exports: [
    BedComponent,
    BedSelectComponent,
    CropComponent,
    CropFilterComponent,
    CropSearchQueryTypeComponent,
    CropSelectComponent,
    CultureComponent,
    DateSelectComponent,
    DateRangeSelectComponent,
    BedPreparationTypeComponent,
    BedPreparationTypeSelectComponent,
    ValidationErrorsComponent,

    TemplateVarDirective,
  ],
})
export class SharedModule {
}
