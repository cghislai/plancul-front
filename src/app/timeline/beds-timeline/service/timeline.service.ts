import {Injectable} from '@angular/core';
import * as vis from 'vis';
import {WsBed, WsCulture, WsCulturePhaseType, WsDateRange, WsRef} from '@charlyghislain/plancul-api';
import {forkJoin, Observable, of} from 'rxjs';
import {CropClientService} from '../../../main/service/crop-client.service';
import {AgrovocPlantClientService} from '../../../main/service/agrovoc-plant-client.service';
import {BedClientService} from '../../../main/service/bed-client.service';
import {flatMap, map, mergeMap} from 'rxjs/operators';
import {CultureClientService} from '../../../main/service/culture-client.service';
import {AstronomyEvent, AstronomyEventType, MoonPhase, MoonPhaseChangeEvent, ZodiakChangeEvent} from '@charlyghislain/astronomy-api';
import {LocalizationService} from '../../../main/service/localization.service';
import {TimelineGroupService} from './timeline-group.service';
import {BedGroupType} from '../../timeline/domain/bed-group-type';
import {TimelineItemService} from './timeline-item.service';
import {BedDataGroup} from '../../timeline/domain/bed-data-group';
import {MoonPhaseEventDataItem} from '../../timeline/domain/moon-phase-event-data-item';
import {NurseryDataGroup} from '../../timeline/domain/nursery-data-group';
import {CulturePhaseDataItem} from '../../timeline/domain/culture-phase-data-item';

@Injectable()
export class TimelineService {

  constructor(private cropClient: CropClientService,
              private localizationService: LocalizationService,
              private bedClient: BedClientService,
              private cultureClient: CultureClientService,
              private agrovocPlantClient: AgrovocPlantClientService,
              private groupService: TimelineGroupService,
              private itemService: TimelineItemService,
  ) {
  }

  createTimelineGroups(bedRefs: WsRef<WsBed>[], includeMoonZodiac?: boolean): Observable<vis.DataSet<vis.DataGroup>> {
    const groupTypes: BedGroupType[] = this.createGroupTypes(includeMoonZodiac);
    const beds$List = bedRefs.map(ref => this.bedClient.getBed(ref.id));
    const beds$ = beds$List.length === 0 ? of([]) : forkJoin(beds$List);
    return beds$.pipe(
      flatMap(beds => this.groupService.createGroups$(beds, groupTypes)),
      map(groups => this.wrapGroupsInDataset(groups)),
    );
  }

  createCulturePhaseItems$(cultureRefs: WsRef<WsCulture>[]): Observable<CulturePhaseDataItem[]> {
    const phaseItems$List = cultureRefs.map(ref => this.createCultureRefPhasesItems$(ref));
    const phaseItems$ = phaseItems$List.length === 0 ? of([]) : forkJoin(phaseItems$List);
    return phaseItems$.pipe(
      map(itemLists => itemLists.reduce((cur, next) => [...cur, ...next], [])),
    );
  }


  createCultureRefPhasesItems$(ref: WsRef<WsCulture>): Observable<CulturePhaseDataItem[]> {
    return this.cultureClient.getCulture(ref.id).pipe(
      mergeMap(culture => this.itemService.createCulturePhaseItems$(culture)),
    );
  }


  createAstronomyEventItems$(events: AstronomyEvent[], isShowingMoonZodiacs: boolean, range: WsDateRange): Observable<vis.DataItem[]> {
    if (events.length === 0) {
      return of([]);
    }
    const moonPhases = events
      .filter(e => e.type === AstronomyEventType.MOON_PHASE_CHANGE)
      .map(e => <MoonPhaseChangeEvent>e);
    const moonPhaseItems$ = this.itemService.createMoonPhaseItems$(moonPhases);

    let zodiacItems$: Observable<vis.DataItem[]>;
    if (isShowingMoonZodiacs) {
      const zodiacEvents = events
        .filter(e => e.type === AstronomyEventType.MOON_ZODIAK_CHANGE)
        .map(e => <ZodiakChangeEvent>e);
      zodiacItems$ = this.itemService.createMoonZodiacItems$(zodiacEvents);
    } else {
      zodiacItems$ = this.itemService.createMoonZodiacNotRenderedItem(range).pipe(
        map(i => [i]),
      );
    }

    return forkJoin(moonPhaseItems$, zodiacItems$).pipe(
      map(results => [...results[0], ...results[1]]),
    );
  }

  checkMovingItemGroup(movingItem: vis.DataItem, curItem: WsCulture, phaseType: WsCulturePhaseType) {
    const curGroupId = BedDataGroup.getBedGroupId(curItem.bedWsRef);
    const newGroupId = movingItem.group;

    if (phaseType === WsCulturePhaseType.NURSING) {
      movingItem.group = NurseryDataGroup.getGroupId();
    } else if (newGroupId === NurseryDataGroup.getGroupId()) {
      movingItem.group = curGroupId;
    }
  }

  setCultureSubgroupLoading(data: CulturePhaseDataItem[], cultureRef: WsRef<WsCulture>): CulturePhaseDataItem[] {
    const subgroupId = CulturePhaseDataItem.getCultureSubGroupId(cultureRef);
    data.filter(item => CulturePhaseDataItem.isCulturePhaseItem(item))
      .map(item => item as CulturePhaseDataItem)
      .filter(item => item.subgroup === subgroupId)
      .forEach(item => CulturePhaseDataItem.setLoading(item, true));
    return [...data];
  }

  updateCultureSubgroupItems(curData: CulturePhaseDataItem[], newData: CulturePhaseDataItem[], cultureRef: WsRef<WsCulture>): CulturePhaseDataItem[] {
    const subgroupId = CulturePhaseDataItem.getCultureSubGroupId(cultureRef);
    // Remove subgroup elements from data array
    const remainingOldItems = curData
      .filter(item => item.subgroup !== subgroupId);
    newData.forEach(item => CulturePhaseDataItem.setLoading(item, false));

    return [...remainingOldItems, ...newData];
  }

  createItemHtmlTemplate(item: vis.DataItem): string {
    if (MoonPhaseEventDataItem.isMoonPhaseItem(item)) {
      const phaseItem = item as MoonPhaseEventDataItem;
      const phase: MoonPhase = phaseItem.phase;
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
    return `<span>${item.content}</span>`;
  }


  private wrapGroupsInDataset(groups: vis.DataGroup[]): vis.DataSet<vis.DataGroup> {
    const dataSet = new vis.DataSet<vis.DataGroup>();
    groups.forEach(group => dataSet.add(group));
    return dataSet;
  }

  private createGroupTypes(includeMoonZodiac: boolean): BedGroupType[] {
    const groups = [];
    groups.push(BedGroupType.MOON_PHASES);
    if (includeMoonZodiac) {
      groups.push(BedGroupType.MOON_ZODIACS);
    }
    groups.push(BedGroupType.BEDS);
    groups.push(BedGroupType.NURSERY);
    return groups;
  }
}
