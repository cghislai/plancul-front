import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoggedUserGuard} from '../main/service/logged-user.guard';
import {BedListComponent} from './bed-list/bed-list.component';
import {BedFormComponent} from './bed-form/bed-form.component';
import {BedResolver} from './service/bed-resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: '_/list',
    pathMatch: 'full',
  },
  {
    path: '_',
    canActivate: [LoggedUserGuard],
    children: [
      {
        path: 'list',
        component: BedListComponent,
      },
      {
        path: ':id',
        component: BedFormComponent,
        resolve: {
          bed: BedResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BedRoutingModule {
}
