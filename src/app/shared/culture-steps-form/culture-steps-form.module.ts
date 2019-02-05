import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CultureStepsFormComponent} from './culture-steps-form.component';
import {StepsModule} from 'primeng/steps';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../shared.module';
import {ButtonModule} from 'primeng/button';
import {IconsModule} from '../../icons/icons.module';
import {CheckboxModule, SpinnerModule} from 'primeng/primeng';

@NgModule({
  declarations: [CultureStepsFormComponent],
  exports: [CultureStepsFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,

    StepsModule,
    ButtonModule,
    IconsModule,
    SpinnerModule,
    CheckboxModule,

  ],
})
export class CultureStepsFormModule {
}
