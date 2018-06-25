import {WsLanguage} from '@charlyghislain/plancul-ws-api';

export class LanguageUtil {

  static getLanguageFromLocaleId(localeId: string): WsLanguage {
    switch (localeId) {
      case 'en':
        return WsLanguage.ENGLISH;
      case 'fr':
        return WsLanguage.FRENCH;
    }
    return WsLanguage.ENGLISH;
  }
}
