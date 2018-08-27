import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './main/login/login.component';
import {WelcomeComponent} from './main/welcome/welcome.component';
import {LoggedAdminGuard} from './main/service/logged-admin.guard';
import {ShellComponent} from './main/shell/shell.component';
import {RegisterComponent} from './main/register/register.component';
import {AppInitializedGuard} from './main/service/app-initialized.guard';
import {AdminInitComponent} from './main/admin-init/admin-init.component';
import {NewTenantComponent} from './main/new-tenant/new-tenant.component';
import {AppNotInitializedGuard} from './main/service/app-not-initialized.guard';
import {ActivateAccountComponent} from './main/activate-account/activate-account.component';
import {LoggedUserGuard} from './main/service/logged-user-guard';


const userWithTenantRoutes: Routes = [
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
  },
];


const adminAccountInitializedRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'activate-account',
    component: ActivateAccountComponent,
  },
  {
    path: 'tenant/new',
    component: NewTenantComponent,
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [LoggedUserGuard],
    children: userWithTenantRoutes,
  },
  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule',
    canActivate: [LoggedAdminGuard],
  },
];

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/welcome',
  },
  {
    path: 'init',
    component: AdminInitComponent,
    canActivate: [AppNotInitializedGuard],
  },
  {
    path: '',
    canActivate: [AppInitializedGuard],
    children: adminAccountInitializedRoutes,
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
