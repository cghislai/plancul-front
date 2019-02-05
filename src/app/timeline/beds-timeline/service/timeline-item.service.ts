import {Injectable} from '@angular/core';
import {WsCulture, WsCulturePhase, WsCulturePhaseType, WsDateRange} from '@charlyghislain/plancul-api';
import {forkJoin, Observable, of} from 'rxjs';
import {CulturePhaseDataItem} from '../../timeline/domain/culture-phase-data-item';
import {CultureClientService} from '../../../main/service/culture-client.service';
import {DateUtils} from '../../../main/service/util/date-utils';
import {flatMap, map, mergeMap, publishReplay, refCount} from 'rxjs/operators';
import {MessageKeys} from '../../../main/service/util/message-keys';
import {LocalizationService} from '../../../main/service/localization.service';
import {BedDataGroup} from '../../timeline/domain/bed-data-group';
import {NurseryDataGroup} from '../../timeline/domain/nursery-data-group';
import {DateAsString, MoonPhase, MoonPhaseChangeEvent, Zodiac, ZodiakChangeEvent} from '@charlyghislain/astronomy-api';
import {MoonPhaseEventDataItem} from '../../timeline/domain/moon-phase-event-data-item';
import * as vis from 'vis';
import {SingleObservable} from '../../../main/service/util/single-observable';
import {MoonZodiacEventDataItem} from '../../timeline/domain/moon-zodiac-event-data-item';
import {ZodiacElement} from '../../../main/service/util/zodiac-element';
import {MoonZodiacsDataGroup} from '../../timeline/domain/moon-zodiacs-data-group';


@Injectable()
export class TimelineItemService {

  constructor(
    private localizationService: LocalizationService,
    private cultureClient: CultureClientService,
  ) {

  }

  createCulturePhaseItems$(culture: WsCulture): Observable<CulturePhaseDataItem[]> {
    return this.cultureClient.getCulturePhases(culture.id).pipe(
      map(phases => this.filterDisplayedCulturePhases(phases)),
      mergeMap(phases => this.createCulturePhaseItemsForPhases(culture, phases)),
    );
  }

  createMoonPhaseItems$(moonPhases: MoonPhaseChangeEvent[]): Observable<MoonPhaseEventDataItem[]> {
    const eventItems$ = this.createMoonPhaseItems$List(moonPhases);
    return forkJoin(eventItems$);
  }

  createMoonZodiacItems$(zodiacs: ZodiakChangeEvent[]): SingleObservable<MoonZodiacEventDataItem[]> {
    const eventItems$ = this.createMoonZodiacItems$List(zodiacs);
    return forkJoin(eventItems$);
  }

  createMoonZodiacNotRenderedItem(range: WsDateRange): SingleObservable<vis.DataItem> {
    const hiddenMessage$ = this.localizationService.getTranslation(MessageKeys.MOON_ZODIAC_HIDDEN_MESSAGE);
    const detailsMessage$ = this.localizationService.getTranslation(MessageKeys.MOON_ZODIAC_HIDDEN_DETAILS);

    return forkJoin(hiddenMessage$, detailsMessage$).pipe(
      map(results => {
        const hiddenMessage = results[0];
        const detailsMessage = results[1];
        const item: vis.DataItem = {
          id: MoonZodiacEventDataItem.getUnrenderedId(),
          start: range.start,
          end: range.end,
          editable: false,
          content: hiddenMessage,
          title: detailsMessage,
          className: `moon-zodiac moon-zodiac-unrendered`,
          group: MoonZodiacsDataGroup.getGroupId(),
        };
        return item;
      }),
    );
  }

  private createMoonZodiacItems$List(zodiacs: ZodiakChangeEvent[]) {
// Zodiak event point to the time at which the moon entered the contellation quadrant
    let curZodiac = null;
    let curZodiacStartDate = null;
    // and collect them here
    const eventItems$: Observable<MoonZodiacEventDataItem>[] = [];

    for (const zodiacEvent of zodiacs) {
      const zodiac = zodiacEvent.zodiac;
      const curTime = zodiacEvent.dateTime;
      if (curZodiac != null) {
        const midTime = this.getMidDate(curZodiacStartDate, curTime);
        const item$ = this.createMoonZodiacItem$(zodiacEvent, curZodiacStartDate, midTime, curTime);
        eventItems$.push(item$);
      }
      curZodiac = zodiac;
      curZodiacStartDate = curTime;
    }
    return eventItems$;
  }

  private createMoonPhaseItems$List(moonPhases: MoonPhaseChangeEvent[]) {
// Iterate to create one event for each full moon and new moon
    let curPhase = null;
    let curPhaseStartDate = null;
    let curPhaseMidDate = null;
    // and collect them here
    const eventItems$: Observable<MoonPhaseEventDataItem>[] = [];

    for (const phaseEvent of moonPhases) {
      switch (phaseEvent.moonPhase) {
        case MoonPhase.FIRST_QUARTER:
          // Start of full moon / end of new moon
          if (curPhaseStartDate != null) {
            const curPhaseEndDate = phaseEvent.dateTime;
            const item = this.createMoonPhaseItem$(phaseEvent, curPhase, curPhaseStartDate, curPhaseMidDate, curPhaseEndDate);
            eventItems$.push(item);
          }
          curPhase = MoonPhase.FULL_MOON;
          curPhaseStartDate = phaseEvent.dateTime;
          break;
        case MoonPhase.FULL_MOON:
          if (curPhase === MoonPhase.FULL_MOON) {
            curPhaseMidDate = phaseEvent.dateTime;
          }
          break;
        case MoonPhase.THIRD_QUARTER:
          // Start of full moon / end of new moon
          if (curPhaseStartDate != null) {
            const curPhaseEndDate = phaseEvent.dateTime;
            const item = this.createMoonPhaseItem$(phaseEvent, curPhase, curPhaseStartDate, curPhaseMidDate, curPhaseEndDate);
            eventItems$.push(item);
          }
          curPhase = MoonPhase.NEW_MOON;
          curPhaseStartDate = phaseEvent.dateTime;
          break;
        case MoonPhase.NEW_MOON:
          if (curPhase === MoonPhase.NEW_MOON) {
            curPhaseMidDate = phaseEvent.dateTime;
          }
          break;
      }
    }
    return eventItems$;
  }

  private getMidDate(dateA: DateAsString, dateB: DateAsString) {
    const timeA = DateUtils.fromIsoUTCLocalDateTimeString(dateA);
    const timeB = DateUtils.fromIsoUTCLocalDateTimeString(dateB);
    const hourDiff = timeB.diff(timeA, 'hour');
    const midTime = timeA.add(hourDiff / 2, 'hour');
    return DateUtils.toIsoLocalDateTimeString(midTime);
  }

  private createMoonPhaseItem$(event: MoonPhaseChangeEvent, phase: MoonPhase, start: DateAsString, exact: DateAsString, end: DateAsString) {
    // moon event (full or new) does not occur exactly between the half moon events,
    // so the exact time above is not exactly in the middle of start and end...
    // We want to display an event item centered on the full/new moon event so that we can easily display a centered
    // picture. We don't display the other quarter events, so its not issue if the event boundaries do not exactly match those.
    // We don't want to overlap with siblings events as it produces graphical glitches, so we use the min width to center the event.

    const startMoment = DateUtils.fromIsoUTCLocalDateTimeString(start);
    const endMoment = DateUtils.fromIsoUTCLocalDateTimeString(end);
    const exactMoment = DateUtils.fromIsoUTCLocalDateTimeString(exact);
    const startToExactDuration = exactMoment.diff(startMoment, 'hour');
    const exactToEndDuration = endMoment.diff(exactMoment, 'hour');
    const minHalfDuration = Math.min(startToExactDuration, exactToEndDuration);
    const minStartMoment = exactMoment.clone().add(-minHalfDuration, 'hour');
    const minEndMoment = exactMoment.clone().add(minHalfDuration, 'hour');
    const eventItemStart = DateUtils.toIsoLocalDateTimeString(minStartMoment);
    const eventItemEnd = DateUtils.toIsoLocalDateTimeString(minEndMoment);

    const phaseLabel$ = this.localizationService.getMoonPhaseEnumLabel(phase);
    const exactDateLabel = exactMoment.local().format('DD/MM');
    const exactTimeLabel = exactMoment.local().format('HH:mm (Z)');

    const phaseItemTitle$ = phaseLabel$.pipe(
      flatMap(phaseLabel => this.localizationService.getTranslation(MessageKeys.PARAMETRIZED_MESSAGE_KEYS.MOON_PHASE_TITLE, {
        phase: phaseLabel,
        date: exactDateLabel,
        time: exactTimeLabel,
      })),
    );

    return phaseItemTitle$.pipe(
      map(title => new MoonPhaseEventDataItem(event, phase, title, eventItemStart, eventItemEnd)),
    );
  }


  private createMoonZodiacItem$(event: ZodiakChangeEvent, start: any, mid: string, end: DateAsString) {
    const zodiacElement = this.getZodiacElement(event.zodiac);
    const startMoment = DateUtils.fromIsoUTCLocalDateTimeString(start);
    const endMoment = DateUtils.fromIsoUTCLocalDateTimeString(end);

    const startDateLabel = startMoment.local().format('DD/MM');
    const startTimeLabel = startMoment.local().format('HH:mm (Z)');
    const endDateLabel = endMoment.local().format('DD/MM');
    const endTimeLabel = endMoment.local().format('HH:mm (Z)');

    const elementLabel$ = this.getZodiacElemenName$(event.zodiac);
    const zodiacLabel$ = this.localizationService.getZodiacEnumLabel(event.zodiac);
    const itemTitle$ = forkJoin(elementLabel$, zodiacLabel$).pipe(
      mergeMap(results => this.localizationService.getTranslation(MessageKeys.PARAMETRIZED_MESSAGE_KEYS.MOON_ZODIAC_TITLE, {
        zodiac: results[1],
        element: results[0],
        startDate: startDateLabel,
        startTime: startTimeLabel,
        endDate: endDateLabel,
        endTime: endTimeLabel,
      })),
    );

    return itemTitle$.pipe(
      map(title => new MoonZodiacEventDataItem(event, zodiacElement, title, start, end)),
    );
  }


  private filterDisplayedCulturePhases(phases) {
    return phases.filter(phase => phase.phaseType !== WsCulturePhaseType.GERMINATION);
  }

  private createCulturePhaseItem$(culture: WsCulture, phase: WsCulturePhase): Observable<CulturePhaseDataItem> {
    const cultureLabel$ = this.cultureClient.getCultureLabel(culture.id).pipe(
      publishReplay(1), refCount(),
    );
    const cultureTitle$ = cultureLabel$.pipe(
      mergeMap(label => this.getCultureTitle$(label, phase)),
    );
    return forkJoin(cultureLabel$, cultureTitle$).pipe(
      map(results => this.createCulturePhaseItem(culture, phase, results[0], results[1])),
    );
  }

  private createCulturePhaseItem(culture: WsCulture, phase: WsCulturePhase, label, title) {
    const item = new CulturePhaseDataItem(culture, phase, label, title);
    if (phase.phaseType === WsCulturePhaseType.NURSING) {
      item.group = NurseryDataGroup.getGroupId();
    } else {
      const bedGroupId = BedDataGroup.getBedGroupId(culture.bedWsRef);
      item.group = bedGroupId;
    }
    return item;
  }

  private getCultureTitle$(cultureLabel: string, phase: WsCulturePhase): Observable<string> {
    const startMoment = DateUtils.fromIsoUTCLocalDateTimeString(phase.startDate);
    const endMoment = DateUtils.fromIsoUTCLocalDateTimeString(phase.endDate);

    const startDateLabel = startMoment.local().format('DD/MM');
    const endDateLabel = endMoment.local().format('DD/MM');

    return this.localizationService.getCulturePhaseTypeEnumLabel(phase.phaseType).pipe(
      flatMap(phaseLabel => this.localizationService.getTranslation(MessageKeys.PARAMETRIZED_MESSAGE_KEYS.CULTURE_PHASE_TITLE, {
        culture: cultureLabel,
        phase: phaseLabel,
        startDate: startDateLabel,
        endDate: endDateLabel,
      })),
    );
  }

  private createCulturePhaseItemsForPhases(culture: WsCulture, phases: WsCulturePhase[]) {
    const phaseItems$List = phases.map(phase => this.createCulturePhaseItem$(culture, phase));
    const phaseItems$ = phaseItems$List.length === 0 ? of([]) : forkJoin(phaseItems$List);

    return phaseItems$;
  }

  private getZodiacElement(zodiac: Zodiac): ZodiacElement {
    if (zodiac == null) {
      return null;
    }
    switch (zodiac) {
      case Zodiac.ARIES:
      case Zodiac.LEO:
      case Zodiac.SAGITTARIUS:
        return ZodiacElement.FIRE;
      case Zodiac.TAURUS:
      case Zodiac.VIRGO:
      case Zodiac.CAPRICORN:
        return ZodiacElement.EARTH;
      case Zodiac.GEMINI:
      case Zodiac.LIBRA:
      case Zodiac.AQUARIUS:
        return ZodiacElement.AIR;
      case Zodiac.CANCER:
      case Zodiac.SCORPIO:
      case Zodiac.PISCES:
        return ZodiacElement.WATER;
    }
    return null;
  }

  private getZodiacElemenName$(zodiac: Zodiac): Observable<string> {
    const element = this.getZodiacElement(zodiac);
    return this.localizationService.getZodiacElementEnumLabel(element);
  }
}
