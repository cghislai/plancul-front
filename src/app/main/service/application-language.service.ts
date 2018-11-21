import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {LoggedUserService} from './logged-user.service';
import {map, publishReplay, refCount, take} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {WsLanguage} from '@charlyghislain/plancul-api';
import {SingleObservable} from './util/single-observable';

@Injectable({
  providedIn: 'root',
})
export class ApplicationLanguageService {

  private loggedUserLanguage$: Observable<WsLanguage | null>;
  private applicationLanguage: WsLanguage;
  private allLanguages: WsLanguage[];

  constructor(@Inject(LOCALE_ID) private applicationLocale: string,
              private loggedUserService: LoggedUserService) {
    this.loggedUserLanguage$ = loggedUserService.getUserObservable().pipe(
      map(user => user == null ? null : user.language),
      publishReplay(1), refCount(),
    );
    this.applicationLanguage = this.parseWsLanguage(applicationLocale);
    this.allLanguages = [WsLanguage.ENGLISH, WsLanguage.FRENCH];
  }

  getAllLanguages(): WsLanguage[] {
    return this.allLanguages;
  }

  getCurrentLanguage(): WsLanguage {
    return this.applicationLanguage;
  }


  isUserPreferredLanguage(): SingleObservable<boolean> {
    return this.loggedUserLanguage$.pipe(
      take(1),
      map(lang => lang === this.applicationLanguage),
    );
  }


  private parseWsLanguage(value: string) {
    if (value == null) {
      return WsLanguage.ENGLISH;
    }
    switch (value) {
      case 'fr':
        return WsLanguage.FRENCH;
      default:
        return WsLanguage.ENGLISH;
    }
  }
}
