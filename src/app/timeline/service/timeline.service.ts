import {Injectable} from '@angular/core';
import * as vis from 'vis';
import {WsAgrovocPlant, WsBed, WsCrop, WsCulture, WsCulturePhase, WsCulturePhaseType, WsRef} from '@charlyghislain/plancul-ws-api';
import {forkJoin, Observable, of} from 'rxjs';
import {CropClientService} from '../../main/service/crop-client.service';
import {AgrovocPlantClientService} from '../../main/service/agrovoc-plant-client.service';
import {BedClientService} from '../../main/service/bed-client.service';
import {map, switchMap} from 'rxjs/operators';
import {CultureClientService} from '../../main/service/culture-client.service';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {

  private readonly PLANT_NURSERY_GROUP_ID = 'nursery';

  constructor(private cropClient: CropClientService,
              private bedClient: BedClientService,
              private cultureClient: CultureClientService,
              private agrovocPlantClient: AgrovocPlantClientService,
  ) {
  }

  createBedGroups(bedRefs: WsRef<WsBed>[]): Observable<vis.DataGroup[]> {
    const taskList = bedRefs.map(ref => this.createBedRefGroup(ref));
    const itemsTask = taskList.length === 0 ? of([]) : forkJoin(taskList);
    return itemsTask.pipe(
      map(items => [...items, this.createNurseryBedItem()]),
    );
  }

  createCulturePhaseItems(cultureRefs: WsRef<WsCulture>[]): Observable<vis.DataItem[]> {
    const taskList = cultureRefs.map(ref => this.createCultureRefPhasesItems(ref));
    const itemsTask = taskList.length === 0 ? of([]) : forkJoin(taskList);
    return itemsTask.pipe(
      map(items2d => items2d.reduce((cur, next) => [...cur, ...next], [])),
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

  private createBedRefGroup(bedRef: WsRef<WsBed>): Observable<vis.DataGroup> {
    return this.bedClient.getBed(bedRef.id).pipe(
      map(bed => this.createBedGroup(bed)),
    );
  }

  private createBedGroup(bed: WsBed): vis.DataGroup {
    return {
      id: bed.id,
      content: bed.name,
      subgroupStack: true,
    };
  }

  private createCultureRefPhasesItems(ref: WsRef<WsCulture>): Observable<vis.DataItem[]> {
    const labelTask = this.getCultureLabel(ref);
    const phasesTask = this.cultureClient.getCulturePhases(ref.id);
    const cultureTsak = this.cultureClient.getCulture(ref.id);
    return forkJoin(phasesTask, cultureTsak, labelTask).pipe(
      map(results => this.createCulturePhasesItems(results[0], results[1], results[2])),
    );
  }

  private createCulturePhasesItems(phases: WsCulturePhase[], culture: WsCulture, label: string): vis.DataItem[] {
    return phases
      .filter(phase => phase.phaseType !== WsCulturePhaseType.GERMINATION)
      .map(phase => this.createCulturePhaseItem(phase, culture.bedWsRef, label));
  }


  private createCulturePhaseItem(phase: WsCulturePhase, bedRef: WsRef<WsBed>, cultureLabel: string) {
    const groupId = phase.phaseType === WsCulturePhaseType.NURSING ? this.PLANT_NURSERY_GROUP_ID : bedRef.id;
    const phaseTypeName = <string>phase.phaseType;
    const cultureRef = phase.cultureWsRef;

    const item: vis.DataItem = {
      id: this.getSuffixedId(cultureRef.id, phase.phaseType),
      content: cultureLabel,
      start: phase.startDate,
      end: phase.endDate,
      group: groupId,
      className: phaseTypeName.toLowerCase(),
      subgroup: `${cultureRef.id}`,
    };
    return item;
  }

  private getSuffixedId(id: number, phaseType: WsCulturePhaseType) {
    const typeName = <string>phaseType;
    return `${id}:${typeName}`;
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

  private createNurseryBedItem(): vis.DataGroup {
    return {
      id: this.PLANT_NURSERY_GROUP_ID,
      content: 'Nursery',
    };
  }

}
