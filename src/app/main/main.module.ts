import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {CheckboxModule, InputTextModule, OverlayPanelModule} from 'primeng/primeng';
import {HttpClientModule} from '@angular/common/http';
import {WelcomeComponent} from './welcome/welcome.component';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AccountInitComponent} from './account-init/account-init.component';
import {ShellComponent} from './shell/shell.component';
import {MenuComponent} from './menu/menu.component';
import {IconsModule} from '../icons/icons.module';
import {RegisterComponent} from './register/register.component';
import {AdminInitComponent} from './admin-init/admin-init.component';
import {FieldEqualityValidator} from './service/util/field-equality-validator';
import { NewTenantComponent } from './new-tenant/new-tenant.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,

    BrowserModule,
    BrowserAnimationsModule,

    IconsModule,

    ButtonModule,
    InputTextModule,
    OverlayPanelModule,
    CheckboxModule,
  ],
  declarations: [
    LoginComponent,
    WelcomeComponent,
    AccountInitComponent,
    ShellComponent,
    MenuComponent,
    RegisterComponent,
    AdminInitComponent,

    FieldEqualityValidator,

    NewTenantComponent,

    ActivateAccountComponent,
  ],
  exports: [
    ButtonModule,
    InputTextModule,
  ],
})
export class MainModule {
}
