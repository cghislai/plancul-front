import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoggedUserGuard} from '../main/service/logged-user.guard';
import {CultureResolver} from './service/culture-resolver';
import {CultureFormComponent} from './culture-form/culture-form.component';
import {CultureListComponent} from './culture-list/culture-list.component';

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
        component: CultureListComponent,
      },
      {
        path: ':id',
        component: CultureFormComponent,
        resolve: {
          culture: CultureResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CultureRoutingModule {
}
