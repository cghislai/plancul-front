import {Injectable} from '@angular/core';
import {WsBed} from '@charlyghislain/plancul-api';
import {BedDataGroup} from '../../timeline/domain/bed-data-group';
import {PatchDataGroup} from '../../timeline/domain/patch-data-group';
import {LocalizationService} from '../../../main/service/localization.service';
import {forkJoin, Observable, of} from 'rxjs';
import {MessageKeys} from '../../../main/service/util/message-keys';
import {map} from 'rxjs/operators';
import {MoonPhasesDataGroup} from '../../timeline/domain/moon-phases-data-group';
import {MoonZodiacsDataGroup} from '../../timeline/domain/moon-zodiacs-data-group';
import {NurseryDataGroup} from '../../timeline/domain/nursery-data-group';
import {BedGroupType} from '../../timeline/domain/bed-group-type';
import * as vis from 'vis';

@Injectable()
export class TimelineGroupService {

  constructor(
    private localizationService: LocalizationService,
  ) {
  }

  createGroups$(beds: WsBed[], groups: BedGroupType[]): Observable<vis.DataGroup[]> {
    const groupsTaskList = groups.map(groupType => this.createGroupsOfType$(groupType, beds));
    const groupsList$ = groupsTaskList.length === 0 ? of([]) : forkJoin(groupsTaskList);
    return groupsList$.pipe(
      map(groupList => groupList.reduce((cur, next) => [...cur, ...next], [])),
    );
  }


  private createBedGroup$(bed: WsBed): BedDataGroup {
    return new BedDataGroup(bed);
  }


  private createPatchGroup(patch: string): PatchDataGroup {
    return new PatchDataGroup(patch, []);
  }


  private createMoonPhasesGroup$(): Observable<MoonPhasesDataGroup> {
    return this.localizationService.getTranslation(MessageKeys.MOON_PHASE_TITLE).pipe(
      map(label => new MoonPhasesDataGroup(label)),
    );
  }

  private createMoonZodiacGroup$(): Observable<MoonZodiacsDataGroup> {
    return this.localizationService.getTranslation(MessageKeys.MOON_ZODIAC_TITLE).pipe(
      map(label => new MoonZodiacsDataGroup(label)),
    );
  }

  private createNurseryGroup$(): Observable<NurseryDataGroup> {
    return this.localizationService.getTranslation(MessageKeys.NURSERY_TITLE).pipe(
      map(label => new NurseryDataGroup(label)),
    );
  }

  private createGroupsOfType$(groupType: BedGroupType, beds: WsBed[]): Observable<vis.DataGroup[]> {
    switch (groupType) {
      case BedGroupType.BEDS:
        return this.createPatchBedsGroup$(beds);
      case BedGroupType.MOON_PHASES:
        return this.createMoonPhasesGroup$()
          .pipe(map(group => [group]));
      case BedGroupType.MOON_ZODIACS:
        return this.createMoonZodiacGroup$()
          .pipe(map(group => [group]));
      case BedGroupType.NURSERY:
        return this.createNurseryGroup$()
          .pipe(map(group => [group]));
      default:
        throw new Error(`Unhandled group type: ${groupType}`);
    }
  }

  private createPatchBedsGroup$(beds: WsBed[]): Observable<vis.DataGroup[]> {
    const patchGroupsDict: { [patchName: string]: PatchDataGroup } = {};
    beds.forEach(bed => this.appendBedToPatchGroup(bed, patchGroupsDict));

    const patchGroups = Object.getOwnPropertyNames(patchGroupsDict)
      .map(patchName => patchGroupsDict[patchName]);
    patchGroups.forEach(patchGroup => this.setNestedBedsToPatchGroup(patchGroup));

    const bedGroups = beds.map(bed => this.createBedGroup$(bed));
    return of([...patchGroups, ...bedGroups]);
  }

  private appendBedToPatchGroup(bed: WsBed, patchGroupsDict: { [p: string]: PatchDataGroup }) {
    const patch = bed.patch;
    if (patch == null) {
      return;
    }
    const group = patchGroupsDict[patch];
    if (group == null) {
      const newGroup = this.createPatchGroup(patch);
      newGroup.beds.push(bed);
      patchGroupsDict[patch] = newGroup;
    } else {
      group.beds.push(bed);
    }
  }

  private setNestedBedsToPatchGroup(patchGroup: PatchDataGroup) {
    const ids = patchGroup.beds.map(bed => BedDataGroup.getBedGroupId(bed));
    // FIXME: wrong typings in @types/vis
    patchGroup.nestedGroups = ids as any as number[];
  }
}
