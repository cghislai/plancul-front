import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './main/login/login.component';
import {WelcomeComponent} from './main/welcome/welcome.component';
import {LoggedAdminGuard} from './main/service/logged-admin.guard';
import {ShellComponent} from './main/shell/shell.component';
import {RegisterComponent} from './main/register/register.component';
import {AppInitializedGuard} from './main/service/app-initialized.guard';
import {AdminInitComponent} from './main/admin-init/admin-init.component';
import {AppNotInitializedGuard} from './main/service/app-not-initialized.guard';
import {ActivateAccountComponent} from './main/activate-account/activate-account.component';
import {LoggedUserGuard} from './main/service/logged-user-guard';
import {NewPasswordResetComponent} from './main/new-password-reset/new-password-reset.component';
import {PasswordResetComponent} from './main/password-reset/password-reset.component';
import {SelectedTenantGuard} from './main/service/selected-tenant-guard';


const tenantRoutes: Routes = [
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
  {
    path: 'calendar',
    loadChildren: './calendar/calendar.module#CalendarModule',
  },
];

const userWithTenantRoutes: Routes = [
  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: '',
    canActivate: [SelectedTenantGuard],
    children: tenantRoutes,
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
    path: 'password-reset/new',
    component: NewPasswordResetComponent,
  },
  {
    path: 'password-reset',
    component: PasswordResetComponent,
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
  {
    path: '**',
    redirectTo: '/login',
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
    enableTracing: false,
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
