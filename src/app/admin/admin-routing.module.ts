import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminAreaComponent} from './admin-area/admin-area.component';
import {LoggedAdminGuard} from '../main/service/logged-admin.guard';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {TenantsListComponent} from './tenants-list/tenants-list.component';
import {UsersListComponent} from './user-list/users-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '_/dashboard',
    pathMatch: 'full',
  },
  {
    path: '_',
    component: AdminAreaComponent,
    canActivate: [LoggedAdminGuard],
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
      },
      {
        path: 'tenant',
        children: [
          {
            path: 'list',
            component: TenantsListComponent,
          },
        ],
      },
      {
        path: 'user',
        children: [
          {
            path: 'list',
            component: UsersListComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {
}
