import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BedComponent} from './bed/bed.component';
import {CropComponent} from './crop/crop.component';
import {IconsModule} from '../icons/icons.module';

@NgModule({
  imports: [
    CommonModule,
    IconsModule,
  ],
  declarations: [
    BedComponent,
    CropComponent,
  ],
  exports: [
    BedComponent,
    CropComponent,
  ],
})
export class SharedModule {
}
