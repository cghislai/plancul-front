import {Injectable} from '@angular/core';
import * as vis from 'vis';
import {WsAgrovocPlant, WsBed, WsCrop, WsCulture, WsCulturePhase, WsCulturePhaseType, WsRef} from '@charlyghislain/plancul-api';
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

  createBedGroups(bedRefs: WsRef<WsBed>[]): Observable<vis.DataSet<vis.DataGroup>> {
    const taskList = bedRefs.map(ref => this.fetchBed(ref));
    const itemsTask = taskList.length === 0 ? of([]) : forkJoin(taskList);
    return itemsTask.pipe(
      map(beds => this.createBedPatchGroups(beds)),
      map(groups => this.wrapGroupsInDataset(groups)),
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

  private fetchBed(bedRef: WsRef<WsBed>): Observable<WsBed> {
    return this.bedClient.getBed(bedRef.id);
  }

  private createBedGroup(bed: WsBed): vis.DataGroup {
    return {
      id: bed.id,
      content: bed.name,
      title: bed.name,
      subgroupStack: true,
    };
  }

  private createCultureRefPhasesItems(ref: WsRef<WsCulture>): Observable<vis.DataItem[]> {
    const labelTask = this.cultureClient.getCultureLabel(ref.id);
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
    const cultureTitle = this.getCultureTitle(cultureLabel, phase);

    const item: vis.DataItem = {
      id: this.getSuffixedId(cultureRef.id, phase.phaseType),
      content: cultureLabel,
      title: cultureTitle,
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

  private getCultureTitle(cultureLabel: string, phase: WsCulturePhase) {
    // TODO: i18n
    const phaseTypeName = <string>phase.phaseType;
    return `${cultureLabel} (${phaseTypeName.toLowerCase()})`;
  }

  private createBedPatchGroups(beds: WsBed[]): vis.DataGroup[] {
    const patchGroups = this.createPatchGroups(beds);
    const bedGroups = beds.map(bed => this.createBedGroup(bed));
    const nursery = this.createNurseryBedItem();
    return [...patchGroups, ...bedGroups, nursery];
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

  private createPatchGroup(patch: string): vis.DataGroup {
    return {
      id: patch,
      content: patch,
      className: 'bed-patch',
    };
  }

  private wrapGroupsInDataset(groups: vis.DataGroup[]): vis.DataSet<vis.DataGroup> {
    const dataSet = new vis.DataSet<vis.DataGroup>();
    groups.forEach(group => dataSet.add(group));
    return dataSet;
  }
}
