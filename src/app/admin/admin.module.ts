import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AdminRoutingModule} from './admin-routing.module';
import {AdminAreaComponent} from './admin-area/admin-area.component';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {HeaderMenuComponent} from './header-menu/header-menu.component';
import {NewTenantFormComponent} from './new-tenant-form/new-tenant-form.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,

    SharedModule,

    DialogModule,
    ButtonModule,
    InputTextModule,
  ],
  declarations: [AdminAreaComponent, AdminDashboardComponent, HeaderMenuComponent, NewTenantFormComponent],
})
export class AdminModule {
}
