import {enableProdMode, StaticProvider} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {PlainRequestUtil} from './app/main/service/util/plain-request-util';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {PlanCulClientConfig} from './app/main/domain/plan-cul-client-config';
import {forkJoin, of} from 'rxjs';
import {fromPromise} from 'rxjs/internal-compatibility';
import * as versionJson from './plancul-info.json';
import {PlanCulApplicationInfo} from './app/main/domain/plan-cul-application-info';
import {PLAN_CUL_APP_INFO} from './app/main/service/util/app-info-token';
import {PLAN_CUL_CLIENT_CONFIG} from './app/main/service/util/client-config.token';

if (environment.production) {
  enableProdMode();
}

const clientConfigObservable = PlainRequestUtil.getAsString('client-config.json')
  .pipe(
    map(configText => <PlanCulClientConfig>JSON.parse(configText)),
    catchError(e => of(environment.defaultClientConfig)),
  );

const planCulApplicationInfo: PlanCulApplicationInfo = (<any>versionJson) as PlanCulApplicationInfo;

forkJoin(
  clientConfigObservable,
).pipe(
  mergeMap(results => {
    const clientConfig: PlanCulClientConfig = results[0];


    const extraProviders: StaticProvider[] = [
      {
        provide: PLAN_CUL_CLIENT_CONFIG,
        useValue: clientConfig,
      },
      {
        provide: PLAN_CUL_APP_INFO,
        useValue: planCulApplicationInfo,
      },
    ];

    return fromPromise(platformBrowserDynamic(extraProviders).bootstrapModule(AppModule));
  }),
).subscribe(
  () => {
  },
  error => console.error(error));
