import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SeedlingsIconComponent} from './seedlings-icon/seedlings-icon.component';
import {FieldsIconComponent} from './fields-icon/fields-icon.component';
import {SingleSeedlingsIconComponent} from './single-seedlings-icon/single-seedlings-icon.component';
import {SeedlingsOpenIconComponent} from './seedlings-open-icon/seedlings-open-icon.component';
import {SowingIconComponent} from './sowing-icon/sowing-icon.component';
import {TransplantingIconComponent} from './transplanting-icon/transplanting-icon.component';
import {HarvestIconComponent} from './harvest-icon/harvest-icon.component';
import {GroundCoverIconComponent} from './ground-cover-icon/ground-cover-icon.component';
import {NursingIconComponent} from './nursing-icon/nursing-icon.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    SeedlingsIconComponent,
    SingleSeedlingsIconComponent,
    SeedlingsOpenIconComponent,
    FieldsIconComponent,
    SowingIconComponent,
    TransplantingIconComponent,
    HarvestIconComponent,
    GroundCoverIconComponent,
    NursingIconComponent,
  ],
  exports: [
    SeedlingsIconComponent,
    SingleSeedlingsIconComponent,
    SeedlingsOpenIconComponent,
    FieldsIconComponent,
    SowingIconComponent,
    TransplantingIconComponent,
    HarvestIconComponent,
    GroundCoverIconComponent,
    NursingIconComponent,
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
  ],
})
export class IconsModule {
}
