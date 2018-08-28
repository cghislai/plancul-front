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
import {ShellComponent} from './shell/shell.component';
import {MenuComponent} from './menu/menu.component';
import {IconsModule} from '../icons/icons.module';
import {RegisterComponent} from './register/register.component';
import {AdminInitComponent} from './admin-init/admin-init.component';
import {FieldEqualityValidator} from './service/util/field-equality-validator';
import { NewTenantComponent } from './new-tenant/new-tenant.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { NewPasswordResetComponent } from './new-password-reset/new-password-reset.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';

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
    ShellComponent,
    MenuComponent,
    RegisterComponent,
    AdminInitComponent,
    NewTenantComponent,
    ActivateAccountComponent,
    NewPasswordResetComponent,
    PasswordResetComponent,

    FieldEqualityValidator,

  ],
  exports: [
    ButtonModule,
    InputTextModule,
  ],
})
export class MainModule {
}
