import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SeedlingsIconComponent} from './seedlings-icon/seedlings-icon.component';
import {FieldsIconComponent} from './fields-icon/fields-icon.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    SeedlingsIconComponent,
    FieldsIconComponent,
  ],
  exports: [
    SeedlingsIconComponent,
    FieldsIconComponent,
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
  ],
})
export class IconsModule {
}
