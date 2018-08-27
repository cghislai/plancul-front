import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CropListComponent} from './crop-list/crop-list.component';
import {NewCropFormComponent} from './new-crop-form/new-crop-form.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '_/list',
    pathMatch: 'full',
  },
  {
    path: '_',
    children: [
      {
        path: 'list',
        component: CropListComponent,
      },
      {
        path: 'new',
        component: NewCropFormComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CropRoutingModule {
}
