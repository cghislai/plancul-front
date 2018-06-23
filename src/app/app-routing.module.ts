import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './main/login/login.component';
import {WelcomeComponent} from './main/welcome/welcome.component';
import {LoggedUserGuard} from './main/service/logged-user.guard';
import {LoggedAdminGuard} from './main/service/logged-admin.guard';
import {AccountInitComponent} from './main/account-init/account-init.component';
import {ShellComponent} from './main/shell/shell.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/welcome',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'account/init',
    component: AccountInitComponent,
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [LoggedUserGuard],
    children: [
      {
        path: 'welcome',
        component: WelcomeComponent,
      },
      {
        path: 'crops',
        loadChildren: './crop/crop.module#CropModule',
      },
      {
        path: 'beds',
        loadChildren: './bed/bed.module#BedModule',
      },
      {
        path: 'cultures',
        loadChildren: './culture/culture.module#CultureModule',
      },
      {
        path: 'timeline',
        loadChildren: './timeline/timeline.module#TimelineModule',
      }
    ],
  },
  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule',
    canActivate: [LoggedAdminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
