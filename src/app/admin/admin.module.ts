import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AdminRoutingModule} from './admin-routing.module';
import {AdminAreaComponent} from './admin-area/admin-area.component';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {CardModule, DataTableModule, InputTextModule, ProgressBarModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {HeaderMenuComponent} from './header-menu/header-menu.component';
import {SharedModule} from '../shared/shared.module';
import {TenantsListComponent} from './tenants-list/tenants-list.component';
import {TableModule} from 'primeng/table';
import {UsersListComponent} from './user-list/users-list.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,

    SharedModule,

    DialogModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TableModule,
    ProgressBarModule,
  ],
  declarations: [
    AdminAreaComponent,
    AdminDashboardComponent,
    HeaderMenuComponent,
    TenantsListComponent,
    UsersListComponent,
  ],
})
export class AdminModule {
}
