// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {PlanCulClientConfig} from '../app/main/domain/plan-cul-client-config';

export const environment = {
  production: false,
  defaultClientConfig: <PlanCulClientConfig>{
    apiUrl: 'https://localhost:8183/plancul-ws',
    astronomyApiUrl: 'https://localhost:8183/astronomy-ws',
    authenticatorApiUrl: 'https://localhost:8443',
    authenticatorApplicationName: 'plancul',
    applicationUrlsByLanguages: {
      french: 'http://localhost:4200/fr',
      english: 'http://localhost:4200/en',
    },
  },
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
