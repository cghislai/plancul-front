import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/primeng';
import {HttpClientModule} from '@angular/common/http';
import {WelcomeComponent} from './welcome/welcome.component';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AccountInitComponent } from './account-init/account-init.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,

    BrowserModule,
    BrowserAnimationsModule,

    ButtonModule,
    InputTextModule,
  ],
  declarations: [LoginComponent, WelcomeComponent, AccountInitComponent],
  exports: [
    ButtonModule,
    InputTextModule,
  ],
})
export class MainModule {
}
