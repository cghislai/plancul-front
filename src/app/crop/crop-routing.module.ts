import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CropListComponent} from './crop-list/crop-list.component';
import {NewCropRouteComponent} from './new-crop-route/new-crop-route.component';

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
        component: NewCropRouteComponent,
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
