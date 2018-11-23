import {PlanCulClientConfig} from '../app/main/domain/plan-cul-client-config';

export const environment = {
  production: true,
  defaultClientConfig: <PlanCulClientConfig>{
    apiUrl: 'https://plancul.charlyghislain.com/ws',
    astronomyApiUrl: 'https://plancul.charlyghislain.com/astronomy-ws',
    authenticatorApiUrl: 'https://auth.charlyghislain.com/ws',
    authenticatorApplicationName: 'plancul',
    applicationUrlsByLanguages: {
      french: 'https://plancul.charlyghislain.com/fr/',
      english: 'https://plancul.charlyghislain.com/en/',
    },
  },
};
