import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainModule} from './main/main.module';
import {ToastModule} from 'primeng/toast';
import {FormsModule} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {SharedModule} from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MainModule,
    SharedModule,
    FormsModule,

    ToastModule,
  ],
  providers: [MessageService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
