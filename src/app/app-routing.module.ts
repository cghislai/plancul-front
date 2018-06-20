import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './main/login/login.component';
import {WelcomeComponent} from './main/welcome/welcome.component';
import {LoggedUserGuard} from './main/service/logged-user.guard';
import {LoggedAdminGuard} from './main/service/logged-admin.guard';
import {AccountInitComponent} from './main/account-init/account-init.component';

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
    path: 'welcome',
    component: WelcomeComponent,
    canActivate: [LoggedUserGuard],
  },
  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule',
    canActivate: [LoggedAdminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: true,
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
