import {Injectable} from '@angular/core';
import * as vis from 'vis';
import {
  WsAgrovocPlant,
  WsBed,
  WsCrop,
  WsCulture,
  WsCulturePhase,
  WsCulturePhaseType,
  WsDateRange,
  WsRef,
} from '@charlyghislain/plancul-api';
import {forkJoin, Observable, of} from 'rxjs';
import {CropClientService} from '../../main/service/crop-client.service';
import {AgrovocPlantClientService} from '../../main/service/agrovoc-plant-client.service';
import {BedClientService} from '../../main/service/bed-client.service';
import {flatMap, map, mergeMap, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {CultureClientService} from '../../main/service/culture-client.service';
import {DateUtils} from '../../main/service/util/date-utils';
import {AstronomyClientService} from './astronomy-client.service';
import {
  AstronomyEvent,
  AstronomyEventFilter,
  AstronomyEventType,
  ChronoUnit,
  DateAsString,
  MoonPhase,
  MoonPhaseChangeEvent,
  Zodiac,
  ZodiakChangeEvent,
} from '@charlyghislain/astronomy-api';
import {LocalizationService} from '../../main/service/localization.service';
import {MessageKeys} from '../../main/service/util/message-keys';
import {ZodiacElement} from '../../main/service/util/zodiac-element';
import {SingleObservable} from '../../main/service/util/single-observable';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {

  private readonly PLANT_NURSERY_GROUP_ID = '$$nursery';
  private readonly MOON_PHASE_GROUP_ID = '$$moon-phases';
  private readonly MOON_ZODIAC_GROUP_ID = '$$moon-zodiac';

  constructor(private cropClient: CropClientService,
              private localizationService: LocalizationService,
              private bedClient: BedClientService,
              private cultureClient: CultureClientService,
              private astronomyClient: AstronomyClientService,
              private agrovocPlantClient: AgrovocPlantClientService,
  ) {
  }

  createTimelineGroups(bedRefs: WsRef<WsBed>[], includeMoonZodiac?: boolean): Observable<vis.DataSet<vis.DataGroup>> {
    const taskList = bedRefs.map(ref => this.fetchBed(ref));
    const itemsTask = taskList.length === 0 ? of([]) : forkJoin(taskList);
    return itemsTask.pipe(
      flatMap(beds => this.createGroups$(beds, includeMoonZodiac)),
      map(groups => this.wrapGroupsInDataset(groups)),
    );
  }

  createCulturePhaseItems(cultureRefs: WsRef<WsCulture>[]): Observable<vis.DataItem[]> {
    const taskList = cultureRefs.map(ref => this.createCultureRefPhasesItems$(ref));
    const itemsTask = taskList.length === 0 ? of([]) : forkJoin(taskList);
    return itemsTask.pipe(
      map(items2d => items2d.reduce((cur, next) => [...cur, ...next], [])),
    );
  }

  createAstronomyItems(range: WsDateRange): Observable<vis.DataItem[]> {
    const fromMoment = DateUtils.fromIsoDateString(range.start);
    const toMoment = DateUtils.fromIsoDateString(range.end);
    const fromTimeMoment = fromMoment.add(-2, 'month');
    const toTimeMoment = toMoment.add(2, 'month');
    const fromTimeString = DateUtils.toIsoLocalDateTimeString(fromTimeMoment);
    const toTimeString = DateUtils.toIsoLocalDateTimeString(toTimeMoment);
    const dayDuration = toTimeMoment.diff(fromTimeMoment, 'days');

    const eventTypes = [
      AstronomyEventType.MOON_PHASE_CHANGE,
    ];
    const isShowingMoonZodiacs = this.isShowingMoonZodiacEvents(toTimeMoment, fromTimeMoment);
    if (isShowingMoonZodiacs) {
      eventTypes.push(AstronomyEventType.MOON_ZODIAK_CHANGE);
    }
    const searchFilter: AstronomyEventFilter = {
      timePagination: {
        pageStartTime: fromTimeString,
        pageDuration: dayDuration,
        pageDurationUnit: ChronoUnit.DAYS,
      },
      typeWhiteList: eventTypes,
    };
    return this.astronomyClient.searchEvents(searchFilter).pipe(
      flatMap(events => this.createAstronomyEventItems$(events, isShowingMoonZodiacs, range)),
    );
  }

  checkItemMoving(movingItem: vis.DataItem, curItem: WsCulture, phaseType: WsCulturePhaseType) {
    const curGroup = curItem.bedWsRef.id;
    const newGroup = movingItem.group;

    if (phaseType === WsCulturePhaseType.NURSING) {
      movingItem.group = this.PLANT_NURSERY_GROUP_ID;
    } else if (newGroup === this.PLANT_NURSERY_GROUP_ID) {
      movingItem.group = curGroup;
    }
  }


  getCultureIdFromItemId(suffixedId: string | number): number {
    if (suffixedId as string) {
      const suffixedIdString = suffixedId as string;
      const splitted = suffixedIdString.split(':');
      if (splitted.length < 2) {
        return null;
      }
      return parseInt(splitted[0], 10);
    } else {
      return null;
    }
  }

  getPhaseTypeFromItemId(suffixedId: string | number): WsCulturePhaseType {
    if (suffixedId as string) {
      const suffixedIdString = suffixedId as string;
      const splitted = suffixedIdString.split(':');
      if (splitted.length < 2) {
        return null;
      }
      const typeName = splitted[1];
      return <WsCulturePhaseType>typeName;
    } else {
      return null;
    }
  }

  getBedIdFromGroupId(groupId: string | number): number | null {
    if (typeof groupId !== 'number') {
      return null;
    }
    return <number>groupId;
  }

  createItemHtmlTemplate(item: vis.DataItem): string {
    switch (item.group) {
      case this.MOON_PHASE_GROUP_ID: {
        const phase: MoonPhase = item['phase'];
        const urlParam = `url('assets/icons/moon/moon.svg')`;
        const styleParams = `-webkit-mask-image: ${urlParam}; mask-image: ${urlParam}`;
        if (phase === MoonPhase.FULL_MOON) {
          return `<span class="moon-phase full-moon"  style="${styleParams}"></span>`;
        } else if (phase === MoonPhase.NEW_MOON) {
          return `<span class="moon-phase new-moon"  style="${styleParams}"></span>`;
        } else {
          return '';
        }
      }
      case this.MOON_ZODIAC_GROUP_ID: {
        const zodiac: Zodiac = item['zodiac'];
        if (zodiac != null) {
          const zodiacName = (<string>zodiac).toLowerCase();
          const urlParam = `url('assets/icons/zodiac/${zodiacName}.svg')`;
          const styleParams = `-webkit-mask-image: ${urlParam}; mask-image: ${urlParam}`;
          return `<span class="zodiac ${zodiacName}" style="${styleParams}"></span>`;
        } // Else fallback
        break;
      }
    }
    return `<span>${item.content}</span>`;
  }


  private fetchBed(bedRef: WsRef<WsBed>): Observable<WsBed> {
    return this.bedClient.getBed(bedRef.id);
  }


  private createCultureRefPhasesItems$(ref: WsRef<WsCulture>): Observable<vis.DataItem[]> {
    const labelTask = this.cultureClient.getCultureLabel(ref.id);
    const phasesTask = this.cultureClient.getCulturePhases(ref.id);
    const cultureTsak = this.cultureClient.getCulture(ref.id);
    return forkJoin(phasesTask, cultureTsak, labelTask).pipe(
      mergeMap(results => this.createCulturePhasesItems$(results[0], results[1], results[2])),
    );
  }

  private createCulturePhasesItems$(phases: WsCulturePhase[], culture: WsCulture, label: string): Observable<vis.DataItem[]> {
    const items$ = phases
      .filter(phase => phase.phaseType !== WsCulturePhaseType.GERMINATION)
      .map(phase => this.createCulturePhaseItem$(phase, culture.bedWsRef, label));
    return forkJoin(items$);
  }

  private createAstronomyEventItems$(events: AstronomyEvent[], isShowingMoonZodiacs: boolean, range: WsDateRange): Observable<vis.DataItem[]> {

    const moonPhases = events
      .filter(e => e.type === AstronomyEventType.MOON_PHASE_CHANGE)
      .map(e => <MoonPhaseChangeEvent>e);
    const moonPhaseItems$ = this.createMoonPhaseItems$(moonPhases);

    let zodiacItems$: Observable<vis.DataItem[]>;
    if (isShowingMoonZodiacs) {
      const zodiacEvents = events
        .filter(e => e.type === AstronomyEventType.MOON_ZODIAK_CHANGE)
        .map(e => <ZodiakChangeEvent>e);
      zodiacItems$ = this.createMoonZodiacItems$(zodiacEvents);
    } else {
      zodiacItems$ = this.createMoonZodiacNotRenderedItem(range).pipe(
        map(i => [i]),
      );
    }

    return forkJoin(moonPhaseItems$, zodiacItems$).pipe(
      map(results => [...results[0], ...results[1]]),
    );
  }

  private createCulturePhaseItem$(phase: WsCulturePhase, bedRef: WsRef<WsBed>, cultureLabel: string): Observable<vis.DataItem> {
    const groupId = phase.phaseType === WsCulturePhaseType.NURSING ? this.PLANT_NURSERY_GROUP_ID : bedRef.id;
    const phaseTypeName = <string>phase.phaseType;
    const cultureRef = phase.cultureWsRef;
    const cultureTitle$ = this.getCultureTitle$(cultureLabel, phase);

    return cultureTitle$.pipe(
      map(title => {
        const item: vis.DataItem = {
          id: this.getCultureSuffixedId(cultureRef.id, phase.phaseType),
          content: cultureLabel,
          title: title,
          start: phase.startDate,
          end: phase.endDate,
          group: groupId,
          className: phaseTypeName.toLowerCase(),
          subgroup: `${cultureRef.id}`,
        };
        return item;
      }),
    );
  }


  private createMoonPhaseItems$(moonPhases: MoonPhaseChangeEvent[]): Observable<vis.DataItem[]> {
    // Iterate to create one event for each full moon and new moon
    let curPhase = null;
    let curPhaseStartDate = null;
    let curPhaseMidDate = null;
    // and collect them here
    const eventItems$: Observable<vis.DataItem>[] = [];

    for (const phaseEvent of moonPhases) {
      switch (phaseEvent.moonPhase) {
        case MoonPhase.FIRST_QUARTER:
          // Start of full moon / end of new moon
          if (curPhaseStartDate != null) {
            const curPhaseEndDate = phaseEvent.dateTime;
            const item = this.createMoonPhaseItem$(curPhaseStartDate, curPhaseMidDate, curPhaseEndDate, curPhase);
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
            const item = this.createMoonPhaseItem$(curPhaseStartDate, curPhaseMidDate, curPhaseEndDate, curPhase);
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
    return forkJoin(eventItems$);
  }

  private createMoonZodiacItems$(zodiacs: ZodiakChangeEvent[]): SingleObservable<vis.DataItem[]> {
    // Zodiak event point to the time at which the moon entered the contellation quadrant
    let curZodiac = null;
    let curZodiacStartDate = null;
    // and collect them here
    const eventItems$: Observable<vis.DataItem>[] = [];

    for (const zodiacEvent of zodiacs) {
      const zodiac = zodiacEvent.zodiac;
      const curTime = zodiacEvent.dateTime;
      if (curZodiac != null) {
        const midTime = this.getMidDate(curZodiacStartDate, curTime);
        const item$ = this.createMoonZodiacItem$(curZodiacStartDate, midTime, curTime, curZodiac);
        eventItems$.push(item$);
      }
      curZodiac = zodiac;
      curZodiacStartDate = curTime;
    }

    return forkJoin(eventItems$);
  }


  private createMoonPhaseItem$(start: DateAsString, exact: DateAsString, end: DateAsString, phase: MoonPhase): Observable<vis.DataItem> {
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

    const phaseName = (<string>phase).toLowerCase();
    const phaseLabel$ = this.getMoonPhaseLabel$(phase);
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
      map(title => {
        const item: vis.DataItem = {
          id: this.getEventId(AstronomyEventType.MOON_PHASE_CHANGE, exact),
          start: DateUtils.toIsoLocalDateTimeString(minStartMoment),
          end: DateUtils.toIsoLocalDateTimeString(minEndMoment),
          editable: false,
          content: '',
          title: title,
          className: `moon-phase ${phaseName}`,
          group: this.MOON_PHASE_GROUP_ID,
        };
        item['phase'] = phase;
        return item;
      }),
    );
  }

  private createMoonZodiacItem$(start: DateAsString, exact: DateAsString, end: DateAsString, zodiac: Zodiac): Observable<vis.DataItem> {
    const zodiacName = (<string>zodiac).toLowerCase();
    const elementName = (<string>this.getZodiacElement(zodiac)).toLowerCase();
    const startMoment = DateUtils.fromIsoUTCLocalDateTimeString(start);
    const endMoment = DateUtils.fromIsoUTCLocalDateTimeString(end);

    const startDateLabel = startMoment.local().format('DD/MM');
    const startTimeLabel = startMoment.local().format('HH:mm (Z)');
    const endDateLabel = endMoment.local().format('DD/MM');
    const endTimeLabel = endMoment.local().format('HH:mm (Z)');
    const rangeLabel = `from ${startDateLabel} at ${startTimeLabel} until ${endDateLabel} at ${endTimeLabel}`;

    const elementLabel$ = this.getZodiacElemenName$(zodiac);
    const zodiacLabel$ = this.localizationService.getZodiacEnumLabel(zodiac);
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
      map(itemTitle => {
        const item: vis.DataItem = {
          id: this.getEventId(AstronomyEventType.MOON_ZODIAK_CHANGE, exact),
          start: start,
          end: end,
          editable: false,
          content: '',
          title: `${itemTitle}`,
          className: `moon-zodiac ${zodiacName} ${elementName}`,
          group: this.MOON_ZODIAC_GROUP_ID,
        };
        item['zodiac'] = zodiac;
        return item;
      }),
    );
  }


  private createMoonZodiacNotRenderedItem(range: WsDateRange): Observable<vis.DataItem> {
    const hiddenMessage$ = this.localizationService.getTranslation(MessageKeys.MOON_ZODIAC_HIDDEN_MESSAGE);
    const detailsMessage$ = this.localizationService.getTranslation(MessageKeys.MOON_ZODIAC_HIDDEN_DETAILS);

    return forkJoin(hiddenMessage$, detailsMessage$).pipe(
      map(results => {
        const hiddenMessage = results[0];
        const detailsMessage = results[1];
        const item: vis.DataItem = {
          id: this.getEventId(AstronomyEventType.MOON_ZODIAK_CHANGE, 'unrendered-item'),
          start: range.start,
          end: range.end,
          editable: false,
          content: hiddenMessage,
          title: detailsMessage,
          className: `moon-zodiac moon-zodiac-unrendered`,
          group: this.MOON_ZODIAC_GROUP_ID,
        };
        item['zodiac'] = null;
        return item;
      }),
    );
  }


  private isShowingMoonZodiacEvents(toTimeMoment, fromTimeMoment) {
    return toTimeMoment.diff(fromTimeMoment, 'day') < 300;
  }

  private createMoonPhaseBackgroundItem(startTime: DateAsString, endTime: DateAsString, phase: MoonPhase): vis.DataItem {
    return {
      id: this.getMoonPhaseBackgroundId(phase, startTime),
      start: startTime,
      end: endTime,
      editable: false,
      content: null,
      title: null,
      className: `moon-phase-background ${phase}`,
      group: null,
      type: 'background',
    };
  }

  private getCultureSuffixedId(id: number, phaseType: WsCulturePhaseType) {
    const typeName = <string>phaseType;
    return `${id}:${typeName}`;
  }

  private getEventId(type: AstronomyEventType, uuid: string) {
    const id = `${type}-${uuid}`;
    return id;
  }

  private getMoonPhaseBackgroundId(phase: MoonPhase, startTime: DateAsString) {
    const id = `moon-phase-bg-${phase}-${startTime}`;
    return id;
  }


  private getCultureLabel(cultureRef: WsRef<WsCulture>): Observable<string> {
    return this.cultureClient.getCulture(cultureRef.id)
      .pipe(
        map((culture: WsCulture) => culture.cropWsRef),
        switchMap(ref => this.cropClient.getCrop(ref.id)),
        map((crop: WsCrop) => crop.agrovocPlantWsRef),
        switchMap(ref => this.agrovocPlantClient.getAgrovocPlant(ref.id)),
        map((plant: WsAgrovocPlant) => plant.preferedLabel),
      );
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

  private createGroups$(beds: WsBed[], includeMoonZodiac?: boolean): Observable<vis.DataGroup[]> {
    const moonPhaseGroup$ = this.createMoonPhaseGroup();
    const moonZodiacGroup$ = this.createMoonZodiacGroup();
    const patchGroups = this.createPatchGroups(beds);
    const bedGroups = beds.map(bed => this.createBedGroup(bed));
    const nurseryGroup$ = this.createNurseryGroup();

    return forkJoin(moonPhaseGroup$, moonZodiacGroup$, nurseryGroup$).pipe(
      map(results => {
        const moonPhaseGroup = results[0];
        const moonZodiacGroup = results[1];
        const nurseryGroup = results[2];

        const groups = [moonPhaseGroup];
        if (includeMoonZodiac !== false) {
          groups.push(moonZodiacGroup);
        }
        groups.push(
          ...patchGroups, ...bedGroups, nurseryGroup,
        );
        return groups;
      }),
    );
  }

  private createPatchGroups(items: WsBed[]) {
    const patchBedIdsDict: { [patchName: string]: number[] } = {};
    const patchGroupsDict: { [patchName: string]: vis.DataGroup } = {};

    items.forEach(item => this.appendToPatch(item, patchBedIdsDict, patchGroupsDict));

    const patchGroups: vis.DataGroup[] = [];
    for (const patch in patchGroupsDict) {
      if (typeof patch !== 'string') {
        continue;
      }
      const patchGroup = patchGroupsDict[patch];
      const nestedItems = patchBedIdsDict[patch];
      patchGroup.nestedGroups = nestedItems;
      patchGroups.push(patchGroup);
    }
    return patchGroups;
  }

  private appendToPatch(bed: WsBed, patchItemsDict: { [p: string]: number[] }, patchGroupsDict: { [p: string]: vis.DataGroup }) {
    const patch = bed.patch;
    if (patch == null) {
      return;
    }
    let idList = patchItemsDict[patch];
    if (idList == null) {
      idList = [];
      patchItemsDict[patch] = idList;
    }
    idList.push(bed.id);

    let patchGroup = patchGroupsDict[patch];
    if (patchGroup == null) {
      patchGroup = this.createPatchGroup(patch);
      patchGroupsDict[patch] = patchGroup;
    }
  }

  private createBedGroup(bed: WsBed): vis.DataGroup {
    return {
      id: bed.id,
      content: bed.name,
      title: bed.name,
      subgroupStack: true,
    };
  }

  private createPatchGroup(patch: string): vis.DataGroup {
    return {
      id: patch,
      content: patch,
      className: 'bed-patch-group',
    };
  }

  private createMoonPhaseGroup(): Observable<vis.DataGroup> {
    return this.localizationService.getTranslation(MessageKeys.MOON_PHASE_TITLE).pipe(
      map(label => <vis.DataGroup>{
        id: this.MOON_PHASE_GROUP_ID,
        content: label,
        className: 'moon-phase-group',
      }),
    );
  }


  private createMoonZodiacGroup(): Observable<vis.DataGroup> {
    return this.localizationService.getTranslation(MessageKeys.MOON_ZODIAC_TITLE).pipe(
      map(label => <vis.DataGroup>{
        id: this.MOON_ZODIAC_GROUP_ID,
        content: label,
        className: 'moon-zodiac-group',
      }),
    );
  }

  private createNurseryGroup(): Observable<vis.DataGroup> {
    return this.localizationService.getTranslation(MessageKeys.NURSERY_TITLE).pipe(
      map(label => <vis.DataGroup>{
        id: this.PLANT_NURSERY_GROUP_ID,
        content: label,
        className: 'nursery-group',
      }),
    );
  }

  private getZodiacElemenName$(zodiac: Zodiac): Observable<string> {
    const element = this.getZodiacElement(zodiac);
    return this.localizationService.getZodiacElementEnumLabel(element);
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


  private getMoonPhaseLabel$(phase: MoonPhase): Observable<string> {
    if (phase == null) {
      return of('');
    }
    return this.localizationService.getMoonPhaseEnumLabel(phase);
  }

  private wrapGroupsInDataset(groups: vis.DataGroup[]): vis.DataSet<vis.DataGroup> {
    const dataSet = new vis.DataSet<vis.DataGroup>();
    groups.forEach(group => dataSet.add(group));
    return dataSet;
  }

  private getMidDate(dateA: DateAsString, dateB: DateAsString) {
    const timeA = DateUtils.fromIsoUTCLocalDateTimeString(dateA);
    const timeB = DateUtils.fromIsoUTCLocalDateTimeString(dateB);
    const hourDiff = timeB.diff(timeA, 'hour');
    const midTime = timeA.add(hourDiff / 2, 'hour');
    return DateUtils.toIsoLocalDateTimeString(midTime);
  }

}
