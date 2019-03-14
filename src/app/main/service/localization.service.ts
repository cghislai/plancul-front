import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Observable, of} from 'rxjs';
import {SelectItem} from 'primeng/api';
import {UntranslatedSelectItem} from './util/untranslated-select-item';
import {concatMap, map, toArray} from 'rxjs/operators';
import {WsCulturePhaseType} from '@charlyghislain/plancul-api';
import {MessageKeys} from './util/message-keys';
import {ZodiacElement} from './util/zodiac-element';
import {MoonPhase, Zodiac} from '@charlyghislain/astronomy-api';
import {CultureStep} from '../../shared/culture-steps-form/culture-step';
import {CalendarEventType} from '../../calendar/domain/calendar-event-type';
import {GroupingType} from '../../calendar/domain/grouping-type';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {


  constructor(private translateService: TranslateService,
              @Inject(LOCALE_ID) private localeId: string,
  ) {
    translateService.setDefaultLang('en');
    const localeLangPart = localeId.replace(/-.*$/, '');
    translateService.use(localeLangPart);
  }

  getTranslation(key: string, params?: any): Observable<string> {
    return this.translateService.get(key, params);
  }

  getTranslationNow(key: string, params?: any): string {
    return this.translateService.instant(key, params);
  }

  getSelectItemTranslations(items: UntranslatedSelectItem[]): Observable<SelectItem[]> {
    return of(...items).pipe(
      concatMap(item => {
        return this.getTranslation(item.label_key).pipe(
          map(label => Object.assign({}, item, {
            label: label,
          })),
        );
      }),
      toArray(),
    );
  }

  getCulturePhaseTypeEnumLabel(phase: WsCulturePhaseType): Observable<string> {
    const msgKey = `${MessageKeys.ENUM_CULTURE_PHASE_MESSAGE_KEYS._PREFIX}${phase}`;
    return this.getTranslation(msgKey);
  }

  getZodiacElementEnumLabel(element: ZodiacElement): Observable<string> {
    const msgKey = `${MessageKeys.ENUM_ZODIAC_ELEMENTS_MESSAGE_KEYS._PREFIX}${element}`;
    return this.getTranslation(msgKey);
  }

  getMoonPhaseEnumLabel(phase: MoonPhase): Observable<string> {
    const msgKey = `${MessageKeys.ENUM_MOON_PHASES_KEYS._PREFIX}${phase}`;
    return this.getTranslation(msgKey);
  }

  getZodiacEnumLabel(zodiac: Zodiac): Observable<string> {
    const msgKey = `${MessageKeys.ENUM_ZODIAC_NAMES__KEYS._PREFIX}${zodiac}`;
    return this.getTranslation(msgKey);
  }

  getCultureStepLabel(step: CultureStep): Observable<string> {
    const msgKey = `${MessageKeys.ENUM_CULTURE_STEPS_NAMES__KEYS._PREFIX}${step}`;
    return this.getTranslation(msgKey);
  }

  getCultureCalendarEventLabel(eventType: CalendarEventType): Observable<string> {
    const msgKey = `${MessageKeys.ENUM_CULTURE_CALENDAR_EVENTS__KEYS._PREFIX}${eventType}`;
    return this.getTranslation(msgKey);
  }

  getCultureCalendarGroupingTypeLabel(groupingType: GroupingType): Observable<string> {
    const msgKey = `${MessageKeys.ENUM_CULTURE_CALENDAR_GROUPING_TYPES__KEYS._PREFIX}${groupingType}`;
    return this.getTranslation(msgKey);
  }

}
