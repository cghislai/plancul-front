import {Component, Inject} from '@angular/core';
import {PlanCulApplicationInfo} from './main/domain/plan-cul-application-info';
import {PLAN_CUL_APP_INFO} from './main/service/util/app-info-token';
import {WsLanguage} from '@charlyghislain/plancul-api';
import {ApplicationLanguageService} from './main/service/application-language.service';
import {Router} from '@angular/router';
import {PLAN_CUL_CLIENT_CONFIG} from './main/service/util/client-config.token';
import {PlanCulClientConfig} from './main/domain/plan-cul-client-config';

@Component({
  selector: 'pc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  currentLanguage: WsLanguage;
  languages: WsLanguage[];

  constructor(@Inject(PLAN_CUL_CLIENT_CONFIG)
              public clientConfig: PlanCulClientConfig,
              @Inject(PLAN_CUL_APP_INFO)
              public appInfo: PlanCulApplicationInfo,
              private router: Router,
              private appLanguageService: ApplicationLanguageService,
  ) {
    this.languages = appLanguageService.getAllLanguages();
    this.currentLanguage = appLanguageService.getCurrentLanguage();
  }

  onLanguageChanged(lang: WsLanguage) {
    if (lang == null) {
      return;
    }
    const url = this.clientConfig.applicationUrlsByLanguages[lang.toLowerCase()];
    if (url == null) {
      return;
    }
    window.location.assign(url);
  }
}
