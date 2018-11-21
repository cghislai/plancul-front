import {WsLanguage} from '@charlyghislain/plancul-api';

export interface PlanCulApplicationInfo {
  name: string;
  version: string;
  copyleft: string;
  projectUrl: string;
  applicationUrlsByLanguages: {
    [lang: string]: string
  };

}
