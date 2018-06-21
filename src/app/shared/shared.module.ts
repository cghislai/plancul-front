import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BedComponent} from './bed/bed.component';
import {CropComponent} from './crop/crop.component';

@NgModule({
  imports: [
    CommonModule,
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
