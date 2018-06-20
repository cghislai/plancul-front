import {enableProdMode, StaticProvider} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {API_URL} from './app/main/service/api-url.token';

if (environment.production) {
  enableProdMode();
}

const extraProviders: StaticProvider[] = [
  {
    provide: API_URL,
    useValue: environment.apiUrl,
  },
];

platformBrowserDynamic(extraProviders).bootstrapModule(AppModule)
  .catch(err => console.log(err));
