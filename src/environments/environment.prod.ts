import {PlanCulClientConfig} from '../app/main/domain/plan-cul-client-config';

export const environment = {
  production: true,
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
